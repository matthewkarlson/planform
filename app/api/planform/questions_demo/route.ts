import { NextResponse } from 'next/server';

// Demo questions data
const demoQuestions = {
  id: 1,
  agencyId: 1,
  questions: [
    {
      questionNumber: 1,
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
      questionNumber: 2,
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
      questionNumber: 3,
      step: 3,
      title: "Business Experience",
      fields: [
        {
          id: 'businessExperience',
          label: 'How long have you been in business?',
          type: 'dropdown',
          placeholder: 'Select your experience level',
          options: [
            { value: 'less_than_1', label: 'Less than 1 year' },
            { value: '1_to_2', label: '1-2 years' },
            { value: '3_to_5', label: '3-5 years' },
            { value: '5_to_10', label: '5-10 years' },
            { value: 'more_than_10', label: 'More than 10 years' },
          ],
          required: true,
        },
      ],
    },
    {
      questionNumber: 4,
      step: 4,
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
      questionNumber: 5,
      step: 5,
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
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export async function GET() {
  // Return the demo questions data
  return NextResponse.json(demoQuestions);
} 