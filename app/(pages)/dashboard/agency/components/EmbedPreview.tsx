'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Agency } from '@/lib/db/schema';

// Define simplified types needed for the preview
type BaseField = {
  id: string;
  label: string;
  type: string;
  required: boolean;
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

type Field = TextField | TextareaField | RadioField;

type Question = {
  step: number;
  title: string;
  description?: string;
  fields: Field[];
};

// Add welcome step type definition
type WelcomeStep = {
  title: string;
  description?: string;
  isWelcomeStep: boolean;
  welcomeContent?: {
    heading?: string;
    subheading?: string;
    bulletPoints?: string[];
    footerText?: string;
    buttonText?: string;
  };
};

interface EmbedPreviewProps {
  agency: Agency;
  formData?: Partial<Agency>; // Add formData prop for live updates
  customWelcomeStep?: WelcomeStep | null; // Add custom welcome step for live preview
}

export default function EmbedPreview({ agency, formData, customWelcomeStep }: EmbedPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [welcomeStep, setWelcomeStep] = useState<WelcomeStep | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch welcome step for the agency
  useEffect(() => {
    // Skip fetching if a custom welcome step was provided
    if (customWelcomeStep) {
      setWelcomeStep(customWelcomeStep);
      return;
    }
    
    const fetchWelcomeStep = async () => {
      if (!agency?.id) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/questions?agencyId=${agency.id}`);
        
        if (response.ok) {
          const data = await response.json();
          // Find the welcome step
          const welcomeStepData = data.questions?.find((q: any) => q.isWelcomeStep === true);
          if (welcomeStepData) {
            setWelcomeStep(welcomeStepData);
          }
        }
      } catch (error) {
        console.error('Error fetching welcome step:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWelcomeStep();
  }, [agency?.id, customWelcomeStep]);
  
  // Update welcome step when customWelcomeStep changes
  useEffect(() => {
    if (customWelcomeStep) {
      setWelcomeStep(customWelcomeStep);
    }
  }, [customWelcomeStep]);
  
  // Sample questions for preview
  const questions: Question[] = [
    {
      step: 1,
      title: "Company Information",
      description: "Tell us about your business",
      fields: [
        {
          id: "companyName",
          label: "What is your company name?",
          type: "text",
          placeholder: "Company name",
          required: true
        },
        {
          id: "industry",
          label: "What industry are you in?",
          type: "radio",
          required: true,
          options: [
            { value: "retail", label: "Retail" },
            { value: "technology", label: "Technology" },
            { value: "healthcare", label: "Healthcare" },
            { value: "education", label: "Education" },
            { value: "other", label: "Other" }
          ]
        }
      ]
    },
    {
      step: 2,
      title: "Marketing Goals",
      description: "What are you trying to achieve?",
      fields: [
        {
          id: "goals",
          label: "Describe your primary marketing goals",
          type: "textarea",
          placeholder: "Enter your goals here...",
          required: true
        }
      ]
    }
  ];
  
  // Find current question based on current step
  const currentQuestions = questions.find((q) => q.step === currentStep) || questions[0];
  const totalSteps = questions.length;

  const handleInputChange = (fieldId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
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

  // Get style variables based on agency colors
  const getStyleVariables = () => {
    const currentAgency = getCurrentAgencyData();
    if (!currentAgency) return {};
    
    return {
      '--primary-color': currentAgency.primaryColor || undefined,
      '--secondary-color': currentAgency.secondaryColor || undefined,
      '--background-color': currentAgency.backgroundColor || undefined,
      '--text-color': currentAgency.textColor || undefined,
    };
  };

  // Get button style based on agency colors - prioritize formData
  const getButtonStyle = () => {
    // Use form data first (for live updates), then fall back to agency data
    const primaryColor = formData?.primaryColor || agency?.primaryColor;
    if (!primaryColor) return {};
    
    return {
      backgroundColor: primaryColor,
      borderColor: primaryColor,
    };
  };

  const getCardStyle = () => {
    // Use form data first (for live updates), then fall back to agency data
    const backgroundColor = formData?.backgroundColor || agency?.backgroundColor;
    if (!backgroundColor) return {};
    
    return {
      backgroundColor: backgroundColor,
    };
  };

  // Get header style for titles and section headers
  const getHeaderStyle = () => {
    const currentAgency = getCurrentAgencyData();
    if (!currentAgency?.secondaryColor) return {};
    
    return {
      color: currentAgency.secondaryColor,
    };
  };

  // Helper to get the current agency data (prioritizing form values)
  const getCurrentAgencyData = () => {
    return {
      ...agency,
      ...formData, // Override with any form values that exist
    };
  };

  // Get radio and checkbox styles to match agency branding
  const getRadioStyle = () => {
    const currentAgency = getCurrentAgencyData();
    if (!currentAgency?.primaryColor) return {};
    
    return {
      '--radio-color': currentAgency.primaryColor,
    };
  };

  const renderField = (field: Field) => {
    const currentAgency = getCurrentAgencyData();
    
    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-1.5">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              placeholder={field.placeholder}
              value={answers[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
              className="w-full"
              style={currentAgency?.primaryColor ? { 
                borderColor: currentAgency.primaryColor,
                '--focus-ring-color': currentAgency.primaryColor 
              } as React.CSSProperties : undefined}
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
              value={answers[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
              className="w-full min-h-[100px]"
              style={currentAgency?.primaryColor ? { 
                borderColor: currentAgency.primaryColor,
                '--focus-ring-color': currentAgency.primaryColor 
              } as React.CSSProperties : undefined}
            />
          </div>
        );
      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label}</Label>
            <RadioGroup
              value={answers[field.id] || ''}
              onValueChange={(value) => handleInputChange(field.id, value)}
              className="space-y-1.5"
            >
              <div className="space-y-1.5">
                {field.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={option.value} 
                      id={`${field.id}-${option.value}`}
                      style={getRadioStyle() as React.CSSProperties}
                    />
                    <Label htmlFor={`${field.id}-${option.value}`} className="text-sm">{option.label}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );
      default:
        return null;
    }
  };

  // Use the current agency data for the render
  const currentAgency = getCurrentAgencyData();

  return (
    <Card className="w-full border shadow-sm" style={getCardStyle()}>
      <CardHeader className="px-4 sm:px-6">
        {currentStep === 0 ? (
          <CardTitle className="text-2xl" style={getHeaderStyle()}>
            {welcomeStep?.title || 'Marketing Strategy Planner'}
          </CardTitle>
        ) : (
          <CardTitle className="text-2xl" style={getHeaderStyle()}>
            {currentQuestions?.title || 'Questionnaire'}
          </CardTitle>
        )}
        {currentStep === 0 ? (
          <p className="text-sm text-muted-foreground mt-1" style={currentAgency?.textColor ? { color: currentAgency.textColor } : undefined}>
            {welcomeStep?.description || 'Answer a few questions about your business to get a personalized marketing strategy.'}
          </p>
        ) : currentQuestions?.description && (
          <p className="text-sm text-muted-foreground mt-1" style={currentAgency?.textColor ? { color: currentAgency.textColor } : undefined}>
            {currentQuestions.description}
          </p>
        )}
        {currentStep > 0 && (
          <div className="text-sm text-muted-foreground mt-2" style={{ color: currentAgency?.secondaryColor || undefined }}>
            Step {currentStep} of {totalSteps}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6">
        {currentStep === 0 ? (
          <div className="flex flex-col items-center space-y-6 py-4">
            {currentAgency?.logoUrl && (
              <div className="w-24 h-24 flex items-center justify-center">
                <img 
                  src={currentAgency.logoUrl} 
                  alt={`${currentAgency.name} logo`} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold" style={getHeaderStyle()}>
                {welcomeStep?.welcomeContent?.heading || 
                 (currentAgency?.name ? `Welcome to ${currentAgency.name}'s Marketing Planner` : 'Welcome to the Marketing Planner')}
              </h3>
              <div className="space-y-2 text-left" style={currentAgency?.textColor ? { color: currentAgency.textColor } : undefined}>
                <p>{welcomeStep?.welcomeContent?.subheading || 
                    'This short questionnaire will help us understand your business and create a personalized marketing strategy for you.'}</p>
                
                {welcomeStep?.welcomeContent?.bulletPoints && welcomeStep.welcomeContent.bulletPoints.length > 0 ? (
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
                
                {welcomeStep?.welcomeContent?.footerText && (
                  <p className="mt-4">{welcomeStep.welcomeContent.footerText}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          currentQuestions?.fields.map((field) => renderField(field))
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 px-4 sm:px-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          style={currentAgency?.secondaryColor ? 
            { borderColor: currentAgency.secondaryColor || undefined, color: currentAgency.secondaryColor || undefined } 
            : undefined}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={handleNext}
          style={getButtonStyle()}
        >
          {currentStep === 0 ? (
            <>{welcomeStep?.welcomeContent?.buttonText || 'Get Your Plan'} <ChevronRight className="ml-2 h-4 w-4" /></>
          ) : (
            <>Next <ChevronRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 