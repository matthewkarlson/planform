'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useAutosizeIframe from '@/lib/useAutosizeIframe';
import { WelcomeStep } from '@/lib/types/welcomeStep';
import { Question, Field } from '@/lib/types/questions';
import { Answers, AnalysisResponse, AgencyData, ServiceRecommendation } from '@/lib/types/embed';
import posthog from 'posthog-js';




export default function PlanformPage() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState<Answers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agency, setAgency] = useState<AgencyData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [welcomeStep, setWelcomeStep] = useState<WelcomeStep | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  // Fetch agency data and questions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingQuestions(true);
        const url = new URL(window.location.href);
        const apiKey = url.searchParams.get('apiKey');
        
        if (apiKey) {
          // Fetch agency details
          const agencyEndpoint = `/api/planform/agency?apiKey=${apiKey}`;
          const agencyResponse = await fetch(agencyEndpoint);
          
          if (agencyResponse.ok) {
            const agencyData = await agencyResponse.json();
            setAgency(agencyData);
            const welcomeStepEndpoint = `/api/welcomestep?agencyId=${agencyData.id}`;
            const welcomeStepResponse = await fetch(welcomeStepEndpoint);
            if (welcomeStepResponse.ok) {
              const welcomeStepData = await welcomeStepResponse.json();
              setWelcomeStep(welcomeStepData);
            } else {
              throw new Error('Failed to fetch welcome step');
            }
            // Directly fetch questions using API key
            const questionsEndpoint = `/api/questions?apiKey=${apiKey}`;
            const questionsResponse = await fetch(questionsEndpoint);
            
            if (questionsResponse.ok) {
              const data = await questionsResponse.json();
              
              // Create website question with questionNumber 0 to ensure it's shown first
              const websiteQuestion: Question = {
                questionNumber: 0,
                title: 'Website URL',
                description: 'Please enter your website URL',
                fields: [
                  {
                    id: 'websiteUrl',
                    label: 'Website URL',
                    type: 'text',
                    placeholder: 'Enter your website URL',
                    required: true
                  }
                ]
              };

              // Only add the website question if includeWebsiteQuestion flag is true
              if (data.includeWebsiteQuestion) {
                // Add as the first question
                data.questions.unshift(websiteQuestion);
              }
              
              // Ensure all questions have sequential numbers starting from 0
              data.questions.forEach((q: Question, i: number) => {
                q.questionNumber = i;
              });

              // Process the questions data structure
              // API returns { agencyId, questions: [...] }
              if (data && data.questions) {
                // Format questions to match the expected structure with step numbers
                const formattedQuestions = data.questions.map((q: Question, index: number) => ({
                  ...q,
                  step: q.questionNumber || index + 1
                }));
                
                // Sort by step/questionNumber
                const sortedQuestions = formattedQuestions.sort((a: Question, b: Question) => 
                  (a.questionNumber || 0) - (b.questionNumber || 0)
                );
                
                // Add contact information question
                const questionsWithContact = appendContactQuestion(sortedQuestions);
                setQuestions(questionsWithContact);
              } else {
                // Fallback if questions field is missing
                setQuestions([]);
              }
            } else {
              throw new Error('Failed to fetch questions');
            }
          }
        } else {
          const agencyEndpoint = `/api/planform/agency_demo`;
          const agencyResponse = await fetch(agencyEndpoint);
          
          if (agencyResponse.ok) {
            const agencyData = await agencyResponse.json();
            setAgency(agencyData);
            
            // For demo mode, use a demo questions endpoint
            const questionsResponse = await fetch('/api/planform/questions_demo');
            
            if (questionsResponse.ok) {
              const data = await questionsResponse.json();
              
              // Ensure data is properly formatted for demo
              let formattedQuestions: Question[] = [];
              if (Array.isArray(data)) {
                formattedQuestions = data;
              } else if (data && data.questions && Array.isArray(data.questions)) {
                formattedQuestions = data.questions;
              }
              
              // Create website question for demos too
              const websiteQuestion: Question = {
                questionNumber: 0,
                title: 'Website URL',
                description: 'Please enter your website URL',
                fields: [
                  {
                    id: 'websiteUrl',
                    label: 'Website URL',
                    type: 'text',
                    placeholder: 'Enter your website URL',
                    required: true
                  }
                ]
              };

              // For demo, assume includeWebsiteQuestion is true unless explicitly set to false
              // Try to access the includeWebsiteQuestion flag if possible
              const shouldIncludeWebsite = data.includeWebsiteQuestion !== false;
              
              if (shouldIncludeWebsite) {
                if (Array.isArray(formattedQuestions)) {
                  formattedQuestions.unshift(websiteQuestion);
                }
              }
              
              // Always renumber questions to ensure they are sequential
              if (Array.isArray(formattedQuestions)) {
                formattedQuestions.forEach((q: Question, i: number) => {
                  q.questionNumber = i;
                });
              }
              
              // Add contact information question
              const questionsWithContact = appendContactQuestion(formattedQuestions);
              setQuestions(questionsWithContact);
            } else {
              throw new Error('Failed to fetch demo questions');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchData();
  }, []);

  // Function to append a contact information question
  const appendContactQuestion = (questions: Question[]): Question[] => {
    // Check if contact question already exists
    const hasContactQuestion = questions.some(q => 
      q.fields.some(field => field.id === 'email' || field.id === 'name')
    );
    
    if (hasContactQuestion) {
      return questions;
    }
    
    // Get the highest step/questionNumber
    const highestStepNumber = questions.length > 0 
      ? Math.max(...questions.map(q => q.questionNumber || 0), ...questions.map(q => q.questionNumber || 0))
      : 0;
    
    // Create contact question as the last step
    const contactQuestion: Question = {
      questionNumber: highestStepNumber + 1,
      title: "Your Contact Information",
      description: "Please provide your contact details so we can send you your personalized plan.",
      fields: [
        {
          id: "name",
          label: "Your Name",
          type: "text",
          placeholder: "Enter your full name",
          required: true
        },
        {
          id: "email",
          label: "Your Email Address",
          type: "text",
          placeholder: "Enter your email address",
          required: true
        }
      ]
    };
    
    return [...questions, contactQuestion];
  };

  useAutosizeIframe([currentStep]);
  
  // Find current question based on current step
  const currentQuestions = questions.find((q) => q.questionNumber === currentStep);
  const totalSteps = questions.length;
  
  const handleInputChange = (fieldId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear validation errors when user types
    if (fieldErrors[fieldId]) {
      setFieldErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }));
    }

    // Validate email as user types
    if (fieldId === 'email') {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFieldErrors(prev => ({
          ...prev,
          [fieldId]: 'Please enter a valid email address'
        }));
      }
    }
  };

  const handleCheckboxChange = (fieldId: string, value: string, checked: boolean) => {
    setAnswers((prev) => {
      const currentValues = Array.isArray(prev[fieldId]) ? prev[fieldId] as string[] : [];
      
      if (checked) {
        return {
          ...prev,
          [fieldId]: [...currentValues, value],
        };
      } else {
        return {
          ...prev,
          [fieldId]: currentValues.filter((v) => v !== value),
        };
      }
    });
  };

  const handleNext = () => {
    // Validate fields before proceeding
    if (currentStep > -1 && currentQuestions) {
      const errors: Record<string, string> = {};
      let hasErrors = false;

      currentQuestions.fields.forEach(field => {
        if (field.required) {
          const value = answers[field.id];
          
          if (!value) {
            errors[field.id] = `${field.label} is required`;
            hasErrors = true;
          } else if (field.id === 'email' && typeof value === 'string') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors[field.id] = 'Please enter a valid email address';
              hasErrors = true;
            }
          }
        }
      });

      if (hasErrors) {
        setFieldErrors(errors);
        return;
      }
    }

    // Get unique sorted question numbers for navigation
    const uniqueSortedNumbers = [...new Set(questions.map(q => q.questionNumber))].sort((a, b) => a - b);
    
    if (currentStep === -1) {
      // From welcome screen, go to first question (whatever its number is)
      if (uniqueSortedNumbers.length > 0) {
        setCurrentStep(uniqueSortedNumbers[0]);
      }
    } else {
      // Find the current index in sorted numbers
      const currentIndex = uniqueSortedNumbers.indexOf(currentStep);
      
      // If there's a next question, go to it
      if (currentIndex >= 0 && currentIndex < uniqueSortedNumbers.length - 1) {
        const nextStep = uniqueSortedNumbers[currentIndex + 1];
        setCurrentStep(nextStep);
      }
    }
  };

  const handleBack = () => {
    // Get unique sorted question numbers for navigation
    const uniqueSortedNumbers = [...new Set(questions.map(q => q.questionNumber))].sort((a, b) => a - b);
    
    if (currentStep === uniqueSortedNumbers[0]) {
      // If we're on the first question, go back to welcome
      setCurrentStep(-1);
    } else if (currentStep > -1) {
      // Find the current index in sorted numbers
      const currentIndex = uniqueSortedNumbers.indexOf(currentStep);
      
      // If there's a previous question, go to it
      if (currentIndex > 0) {
        const prevStep = uniqueSortedNumbers[currentIndex - 1];
        setCurrentStep(prevStep);
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    posthog.identify(answers.email as string);
    posthog.capture('planform_submitted', {
      agency_id: agency?.id,
      agency_name: agency?.name,
      customer_email: answers.email,
      customer_name: answers.name,
    });
    try {
      // Format website URL to ensure it has https:// prefix if provided
      let formattedAnswers = { ...answers };
      
      if (formattedAnswers.websiteUrl) {
        const websiteUrl = formattedAnswers.websiteUrl as string;
        if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
          formattedAnswers.websiteUrl = `https://${websiteUrl}`;
        }
      }
      
      const url = new URL(window.location.href);
      const apiKey = url.searchParams.get('apiKey');
      
      // Send answers to our API endpoint
      const response = await fetch('/api/planform/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...formattedAnswers,
          apiKey: apiKey, // Use the API key from URL parameters
          agencyId: agency?.id, // Use the agencyId from URL parameters or default to '1'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze responses');
      }
      
      const data = await response.json();
      setAnalysisResponse(data);
      
      // Generate a unique ID for this analysis
      const analysisId = `${Date.now()}`;
      
      // Store the analysis in localStorage for retrieval by the results page
      localStorage.setItem(`planform_analysis_${analysisId}`, JSON.stringify(data));
      
      // Redirect to the results page with API key if available
      const params = new URLSearchParams();
      params.append('id', analysisId);
      if (apiKey) params.append('apiKey', apiKey);
      
      router.push(`/embed/results?${params.toString()}`);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    // Always allow moving from welcome screen
    if (currentStep === -1) return true;
    
    if (!currentQuestions) return false;
    
    return currentQuestions.fields.every((field) => {
      // Skip validation for conditional fields that shouldn't show
      if (field.conditionalShow && !field.conditionalShow(answers as Record<string, string>)) {
        return true;
      }
      
      // Check if required field has a value
      if (!field.required) return true;
      
      const value = answers[field.id];
      
      if (field.type === 'checkbox') {
        return Array.isArray(value) && value.length > 0;
      }
      
      // Special validation for email field
      if (field.id === 'email' && typeof value === 'string') {
        // Basic email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      }
      
      return !!value;
    });
  };

  // Check if we should skip this step based on conditions
  const shouldShowField = (field: Field) => {
    if (!field.conditionalShow) return true;
    return field.conditionalShow(answers as Record<string, string>);
  };

  const isCheckboxChecked = (fieldId: string, value: string): boolean => {
    const fieldValue = answers[fieldId];
    if (Array.isArray(fieldValue)) {
      return fieldValue.includes(value);
    }
    return false;
  };

  // Get style variables based on agency colors
  const getStyleVariables = () => {
    if (!agency) return {};
    
    return {
      '--primary-color': agency.primaryColor || undefined,
      '--secondary-color': agency.secondaryColor || undefined,
      '--background-color': agency.backgroundColor || undefined,
      '--text-color': agency.textColor || undefined,
    };
  };

  const getButtonStyle = () => {
    if (!agency?.primaryColor) return {};
    
    return {
      backgroundColor: agency.primaryColor,
      borderColor: agency.primaryColor,
    };
  };

  const getCardStyle = () => {
    if (!agency?.backgroundColor) return {};
    
    return {
      backgroundColor: agency.backgroundColor,
    };
  };

  // Get header style for titles and section headers
  const getHeaderStyle = () => {
    if (!agency?.secondaryColor) return {};
    
    return {
      color: agency.secondaryColor,
    };
  };

  // Get radio and checkbox styles to match agency branding
  const getRadioStyle = () => {
    if (!agency?.primaryColor) return {};
    
    return {
      '--radio-color': agency.primaryColor,
    };
  };

  const renderField = (field: Field) => {
    if (!shouldShowField(field)) return null;

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-1.5">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              placeholder={field.placeholder}
              value={answers[field.id] as string || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
              className={`w-full ${fieldErrors[field.id] ? 'border-red-500' : ''}`}
              style={agency?.primaryColor && !fieldErrors[field.id] ? 
                { borderColor: agency.primaryColor, '--focus-ring-color': agency.primaryColor } as React.CSSProperties : 
                undefined}
              type={field.id === 'email' ? 'email' : 'text'}
            />
            {fieldErrors[field.id] && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors[field.id]}</p>
            )}
          </div>
        );
      case 'textarea':
        return (
          <div key={field.id} className="space-y-1.5">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={answers[field.id] as string || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
              className="w-full min-h-[100px]"
              style={agency?.primaryColor ? { borderColor: agency.primaryColor, '--focus-ring-color': agency.primaryColor } as React.CSSProperties : undefined}
            />
          </div>
        );
      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label}</Label>
            <RadioGroup
              value={answers[field.id] as string || ''}
              onValueChange={(value) => handleInputChange(field.id, value)}
              className="space-y-1.5"
            >
              <div className="space-y-1.5">
                {field.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={option.value} 
                      id={`${field.id}-${option.value}`}
                      style={agency?.primaryColor ? { '--radio-color': agency.primaryColor } as React.CSSProperties : undefined}
                    />
                    <Label htmlFor={`${field.id}-${option.value}`} className="text-sm">{option.label}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );
      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label}</Label>
            <div className="space-y-1.5">
              {field.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option.value}`}
                    checked={isCheckboxChecked(field.id, option.value)}
                    onCheckedChange={(checked: boolean | 'indeterminate') => 
                      handleCheckboxChange(field.id, option.value, checked === true)
                    }
                    style={agency?.primaryColor ? { '--checkbox-color': agency.primaryColor } as React.CSSProperties : undefined}
                  />
                  <Label htmlFor={`${field.id}-${option.value}`} className="text-sm">{option.label}</Label>
                </div>
              ))}
            </div>
          </div>
        );
      case 'dropdown':
        return (
          <div key={field.id} className="space-y-1.5">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              value={answers[field.id] as string || ''}
              onValueChange={(value: string) => handleInputChange(field.id, value)}
            >
              <SelectTrigger
                id={field.id}
                className="w-full"
                style={agency?.primaryColor ? { borderColor: agency.primaryColor, '--focus-ring-color': agency.primaryColor } as React.CSSProperties : undefined}
              >
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={`${field.id}-${option.value}`} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return null;
    }
  };

  // Function to check if we're on the last question
  const isLastQuestion = () => {
    if (questions.length === 0) return false;
    
    const sortedQuestionNumbers = [...new Set(questions.map(q => q.questionNumber))]
      .sort((a, b) => a - b);
    
    return currentStep === sortedQuestionNumbers[sortedQuestionNumbers.length - 1];
  };

  // Create a dedicated function for the welcome screen button
  const handleStartQuestionnaire = () => {
    const sortedQuestionNumbers = [...new Set(questions.map(q => q.questionNumber))]
      .sort((a, b) => a - b);
    
    if (sortedQuestionNumbers.length > 0) {
      setCurrentStep(sortedQuestionNumbers[0]);
    }
  };

  // Show loading state while fetching questions
  if (isLoadingQuestions) {
    return (
      <Card className="w-full border-0 shadow-none">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-2xl">Loading...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6 flex justify-center items-center min-h-[200px]">
          <div className="animate-pulse text-center">
            <p>Loading questionnaire...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state if there was a problem fetching questions
  if (error && questions.length === 0) {
    return (
      <Card className="w-full border-0 shadow-none">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-2xl">Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6">
          <div className="text-red-500">
            <p>Unable to load questions: {error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 shadow-none" style={getCardStyle()}>
      <CardHeader className="px-4 sm:px-6">
        {currentStep === -1 ? (
          <CardTitle className="text-2xl text-center" style={getHeaderStyle()}>{welcomeStep?.title || 'Marketing Strategy Planner'}</CardTitle>
        ) : (
          <CardTitle className="text-2xl text-center" style={getHeaderStyle()}>{currentQuestions?.title || 'Planform Questionnaire'}</CardTitle>
        )}
        {currentStep === -1 ? (
          <p className="text-sm text-muted-foreground mt-1" style={agency?.textColor ? { color: agency.textColor } : undefined}>
            {welcomeStep?.description || 'Answer a few questions about your business to get a personalized marketing strategy.'}
          </p>
        ) : currentQuestions?.description && (
          <p className="text-sm text-muted-foreground mt-1" style={agency?.textColor ? { color: agency.textColor } : undefined}>{currentQuestions.description}</p>
        )}
        {currentStep >= 0 && (
          <div className="text-sm text-muted-foreground mt-2" style={{ color: agency?.secondaryColor || undefined }}>
            Step {currentStep + 1} of {totalSteps}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6">
        {currentStep === -1 ? (
          <div className="flex flex-col items-center space-y-6 py-4">
            {agency?.logoUrl && (
              <div className="w-48 h-48 flex items-center justify-center">
                <img 
                  src={agency.logoUrl} 
                  alt={`${agency.name} logo`} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold" style={getHeaderStyle()}>
                {welcomeStep?.welcomeContent?.heading || (agency?.name ? `Welcome to ${agency.name}'s Marketing Planner` : 'Welcome to the Marketing Planner')}
              </h3>
              <div className="space-y-2 text-left" style={agency?.textColor ? { color: agency.textColor } : undefined}>
                <p>{welcomeStep?.welcomeContent?.subheading || 'This short questionnaire will help us understand your business and create a personalized marketing strategy for you.'}</p>
                {(welcomeStep?.welcomeContent?.bulletPoints && welcomeStep.welcomeContent.bulletPoints.length > 0) ? (
                  <>
                    <p>Here's what to expect:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {welcomeStep.welcomeContent.bulletPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <p>Here's what to expect:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>{questions.length} simple questions about your business</li>
                      <li>Takes about 3-5 minutes to complete</li>
                      <li>Get instant recommendations based on your answers</li>
                    </ul>
                  </>
                )}
                <p className="mt-4">{welcomeStep?.welcomeContent?.footerText || 'Your responses will help us tailor our recommendations specifically to your business needs.'}</p>
              </div>
            </div>
          </div>
        ) : (
          currentQuestions?.fields.map((field) => renderField(field))
        )}
        {error && currentStep > 0 && (
          <div className="text-red-500 mt-4">
            <p>{error}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 px-4 sm:px-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === -1 || isSubmitting}
          style={agency?.secondaryColor ? 
            { borderColor: agency.secondaryColor || undefined, color: agency.secondaryColor || undefined } 
            : undefined}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {currentStep === -1 ? (
          // On welcome screen, use dedicated handler
          <Button
            onClick={handleStartQuestionnaire}
            style={getButtonStyle()}
          >
            {welcomeStep?.welcomeContent?.buttonText || 'Get Your Plan'} <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : isLastQuestion() ? (
          // On last question, use submit handler
          <Button
            onClick={handleSubmit}
            disabled={!isStepValid() || isSubmitting}
            style={getButtonStyle()}
          >
            {isSubmitting ? 'Processing...' : 'Submit'}
          </Button>
        ) : (
          // On middle questions, use next handler
          <Button
            onClick={handleNext}
            disabled={!isStepValid() || isSubmitting}
            style={getButtonStyle()}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
