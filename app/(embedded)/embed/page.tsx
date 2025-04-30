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

// Define type for different field types
type BaseField = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  conditionalShow?: (answers: Record<string, string>) => boolean;
};

type TextField = BaseField & {
  type: 'text';
  placeholder: string;
};

type TextareaField = BaseField & {
  type: 'textarea';
  placeholder: string;
};

type RadioField = BaseField & {
  type: 'radio';
  options: Array<{ value: string; label: string }>;
};

type CheckboxField = BaseField & {
  type: 'checkbox';
  options: Array<{ value: string; label: string }>;
};

type DropdownField = BaseField & {
  type: 'dropdown';
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
};

type Field = TextField | TextareaField | RadioField | CheckboxField | DropdownField;

type Question = {
  questionNumber?: number;
  step?: number;
  title: string;
  description?: string;
  fields: Field[];
};

type Answers = Record<string, string | string[]>;

// Define new types for the API response
type ServiceRecommendation = {
  serviceId: string;
  reason: string;
};

type AnalysisResponse = {
  clientResponses: Answers;
  recommendations: ServiceRecommendation[];
  totalEstimatedCost: {
    minTotal: number;
    maxTotal: number;
    formattedRange: string;
  };
  websiteAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    overallImpression: string;
  };
  screenshotUrl?: string;
  screenshotBase64?: string;
};

// Define agency data type
type AgencyData = {
  id: number;
  name: string;
  contactNumber: string | null;
  email: string | null;
  bookingLink: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  backgroundColor: string | null;
};

export default function PlanformPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agency, setAgency] = useState<AgencyData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const router = useRouter();

  // Fetch agency data and questions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingQuestions(true);
        const url = new URL(window.location.href);
        const apiKey = url.searchParams.get('apiKey');
        
        // Fetch agency details
        let agencyData = null;
        if (apiKey) {
          const agencyEndpoint = `/api/planform/agency?apiKey=${apiKey}`;
          const agencyResponse = await fetch(agencyEndpoint);
          
          if (agencyResponse.ok) {
            agencyData = await agencyResponse.json();
            setAgency(agencyData);
            
            // After fetching agency data, fetch questions with the agency ID
            if (agencyData?.id) {
              const questionsEndpoint = `/api/questions?agencyId=${agencyData.id}`;
              const questionsResponse = await fetch(questionsEndpoint);
              
              if (questionsResponse.ok) {
                const data = await questionsResponse.json();
                
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
                    (a.step || 0) - (b.step || 0)
                  );
                  
                  setQuestions(sortedQuestions);
                } else {
                  // Fallback if questions field is missing
                  setQuestions([]);
                }
              } else {
                throw new Error('Failed to fetch questions');
              }
            }
          }
        } else {
          const agencyEndpoint = `/api/planform/agency_demo`;
          const agencyResponse = await fetch(agencyEndpoint);
          
          if (agencyResponse.ok) {
            agencyData = await agencyResponse.json();
            setAgency(agencyData);
            
            // For demo mode, use a demo questions endpoint
            const questionsResponse = await fetch('/api/planform/questions_demo');
            
            if (questionsResponse.ok) {
              const data = await questionsResponse.json();
              
              // Ensure data is properly formatted for demo
              if (Array.isArray(data)) {
                setQuestions(data);
              } else if (data && data.questions && Array.isArray(data.questions)) {
                setQuestions(data.questions);
              } else {
                setQuestions([]);
              }
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

  useAutosizeIframe([currentStep]);
  
  // Find current question based on current step
  const currentQuestions = questions.find((q) => q.step === currentStep);
  const totalSteps = questions.length;

  const handleInputChange = (fieldId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
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
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else if (currentStep === 1) {
      setCurrentStep(0);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
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
    if (currentStep === 0) return true;
    
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
              className="w-full"
              style={agency?.primaryColor ? { borderColor: agency.primaryColor, '--focus-ring-color': agency.primaryColor } as React.CSSProperties : undefined}
            />
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
        {currentStep === 0 ? (
          <CardTitle className="text-2xl">Marketing Strategy Planner</CardTitle>
        ) : (
          <CardTitle className="text-2xl">{currentQuestions?.title || 'Planform Questionnaire'}</CardTitle>
        )}
        {currentStep === 0 ? (
          <p className="text-sm text-muted-foreground mt-1">
            Answer a few questions about your business to get a personalized marketing strategy.
          </p>
        ) : currentQuestions?.description && (
          <p className="text-sm text-muted-foreground mt-1">{currentQuestions.description}</p>
        )}
        {currentStep > 0 && (
          <div className="text-sm text-muted-foreground mt-2">
            Step {currentStep} of {totalSteps}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6">
        {currentStep === 0 ? (
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
              <h3 className="text-xl font-semibold">
                {agency?.name ? `Welcome to ${agency.name}'s Marketing Planner` : 'Welcome to the Marketing Planner'}
              </h3>
              <div className="space-y-2 text-left">
                <p>This short questionnaire will help us understand your business and create a personalized marketing strategy for you.</p>
                <p>Here's what to expect:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{questions.length} simple questions about your business</li>
                  <li>Takes about 3-5 minutes to complete</li>
                  <li>Get instant recommendations based on your answers</li>
                </ul>
                <p className="mt-4">Your responses will help us tailor our recommendations specifically to your business needs.</p>
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
          disabled={currentStep === 0 || isSubmitting}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={currentStep === totalSteps ? handleSubmit : handleNext}
          disabled={!isStepValid() || isSubmitting}
          style={getButtonStyle()}
        >
          {isSubmitting ? (
            <>Processing...</>
          ) : currentStep === totalSteps ? (
            <>Submit</>
          ) : currentStep === 0 ? (
            <>Get Your Plan <ChevronRight className="ml-2 h-4 w-4" /></>
          ) : (
            <>Next <ChevronRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
