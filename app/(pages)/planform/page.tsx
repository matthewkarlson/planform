'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';

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

type Field = TextField | TextareaField | RadioField | CheckboxField;

type Question = {
  step: number;
  title: string;
  description?: string;
  fields: Field[];
};

type Answers = Record<string, string | string[]>;

// Define the questions for the planform questionnaire
const questions: Question[] = [
  {
    step: 1,
    title: "Website Information",
    description: "We'll use this to personalize your strategy.",
    fields: [
      {
        id: 'websiteUrl',
        label: 'What\'s your website URL?',
        type: 'text',
        placeholder: 'https://example.com',
        required: true,
      },
    ],
  },
  {
    step: 2,
    title: "Business Type",
    fields: [
      {
        id: 'businessType',
        label: 'What type of business do you run?',
        type: 'radio',
        options: [
          { value: 'coaching', label: 'Coaching' },
          { value: 'agency', label: 'Agency' },
          { value: 'ecommerce', label: 'E-commerce' },
          { value: 'saas', label: 'SaaS' },
          { value: 'service', label: 'Service-based business' },
          { value: 'other', label: 'Other' },
        ],
        required: true,
      },
    ],
  },
  {
    step: 3,
    title: "Primary Goal",
    description: "What's your #1 goal over the next 3–6 months?",
    fields: [
      {
        id: 'primaryGoal',
        label: 'Pick one',
        type: 'radio',
        options: [
          { value: 'traffic', label: 'Get more traffic' },
          { value: 'leads', label: 'Generate more leads' },
          { value: 'conversions', label: 'Improve conversions' },
          { value: 'brand', label: 'Clarify brand/message' },
          { value: 'launch', label: 'Launch a new offer' },
          { value: 'revenue', label: 'Increase revenue from existing audience' },
        ],
        required: true,
      },
    ],
  },
  {
    step: 4,
    title: "Current Marketing Activities",
    description: "Check all that apply",
    fields: [
      {
        id: 'marketingActivities',
        label: 'What marketing activities are you currently doing?',
        type: 'checkbox',
        options: [
          { value: 'paid_ads', label: 'Paid ads' },
          { value: 'seo', label: 'SEO' },
          { value: 'email', label: 'Email marketing' },
          { value: 'social', label: 'Social media' },
          { value: 'content', label: 'Content marketing' },
          { value: 'referrals', label: 'Referrals only' },
          { value: 'none', label: 'None yet' },
        ],
        required: true,
      },
    ],
  },
  {
    step: 5,
    title: "Past Challenges",
    fields: [
      {
        id: 'pastChallenges',
        label: 'What\'s one thing that hasn\'t worked for you in the past — and why?',
        type: 'textarea',
        placeholder: 'E.g., "We ran ads but got unqualified leads"',
        required: true,
      },
    ],
  },
  {
    step: 6,
    title: "Conversion Flow",
    fields: [
      {
        id: 'conversionFlow',
        label: 'Briefly describe your current sales/conversion flow.',
        type: 'textarea',
        placeholder: 'How do people go from finding you → becoming a customer?',
        required: true,
      },
    ],
  },
  {
    step: 7,
    title: "Current Challenges",
    fields: [
      {
        id: 'currentChallenges',
        label: 'What do you think is holding your business back right now?',
        type: 'radio',
        options: [
          { value: 'visibility', label: 'Not enough visibility' },
          { value: 'conversion', label: 'Leads not converting' },
          { value: 'branding', label: 'Website doesn\'t reflect our brand' },
          { value: 'messaging', label: 'We don\'t have a clear message' },
          { value: 'tech', label: 'Tech/setup is messy' },
          { value: 'unsure', label: 'I\'m not sure — that\'s why I\'m here' },
        ],
        required: true,
      },
    ],
  },
  {
    step: 8,
    title: "Differentiation",
    fields: [
      {
        id: 'differentiator',
        label: 'What makes your business different from others in your space?',
        type: 'textarea',
        placeholder: 'Why do customers choose you? What\'s your unfair advantage?',
        required: true,
      },
    ],
  },
  {
    step: 9,
    title: "Website Traffic",
    fields: [
      {
        id: 'websiteTraffic',
        label: 'What\'s your estimated monthly website traffic?',
        type: 'radio',
        options: [
          { value: 'under1k', label: '< 1,000' },
          { value: '1k-5k', label: '1,000–5,000' },
          { value: '5k-10k', label: '5,000–10,000' },
          { value: 'over10k', label: '10,000+' },
        ],
        required: true,
      },
    ],
  },
  {
    step: 10,
    title: "Contact Information",
    description: "So we can send you your full strategy plan.",
    fields: [
      {
        id: 'name',
        label: 'What\'s your name?',
        type: 'text',
        placeholder: 'Your full name',
        required: true,
      },
      {
        id: 'email',
        label: 'What\'s your email?',
        type: 'text',
        placeholder: 'you@example.com',
        required: true,
      },
    ],
  },
];

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
};

export default function PlanformPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

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
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Send answers to our API endpoint
      const response = await fetch('/api/planform/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),
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
      
      // Redirect to the results page
      router.push(`/planform/results?id=${analysisId}`);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
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

  const renderField = (field: Field) => {
    if (!shouldShowField(field)) return null;

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              placeholder={field.placeholder}
              value={answers[field.id] as string || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={answers[field.id] as string || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );
      case 'radio':
        return (
          <div key={field.id} className="space-y-3">
            <Label>{field.label}</Label>
            <RadioGroup
              value={answers[field.id] as string || ''}
              onValueChange={(value) => handleInputChange(field.id, value)}
            >
              <div className="space-y-2">
                {field.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                    <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );
      case 'checkbox':
        return (
          <div key={field.id} className="space-y-3">
            <Label>{field.label}</Label>
            <div className="space-y-2">
              {field.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option.value}`}
                    checked={isCheckboxChecked(field.id, option.value)}
                    onCheckedChange={(checked: boolean | 'indeterminate') => 
                      handleCheckboxChange(field.id, option.value, checked === true)
                    }
                  />
                  <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-2xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{currentQuestions?.title || 'Planform Questionnaire'}</CardTitle>
          {currentQuestions?.description && (
            <p className="text-sm text-muted-foreground mt-1">{currentQuestions.description}</p>
          )}
          <div className="text-sm text-muted-foreground mt-2">
            Step {currentStep} of {totalSteps}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestions?.fields.map((field) => renderField(field))}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            onClick={currentStep === totalSteps ? handleSubmit : handleNext}
            disabled={!isStepValid() || isSubmitting}
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : currentStep === totalSteps ? (
              <>Submit</>
            ) : (
              <>Next <ChevronRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
