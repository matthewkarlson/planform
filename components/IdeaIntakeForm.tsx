'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

// Form schema
const ideaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  rawIdea: z.string().min(1, "Idea description is required").max(500, "Description must be less than 500 characters"),
  idealCustomer: z.string().min(1, "Target customer is required"),
  problem: z.string().min(1, "Problem statement is required"),
  currentSolutions: z.string().optional(),
  valueProp: z.string().min(1, "Value proposition is required"),
});

type IdeaFormData = z.infer<typeof ideaSchema>;

export default function IdeaIntakeForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<IdeaFormData>({
    title: '',
    rawIdea: '',
    idealCustomer: '',
    problem: '',
    currentSolutions: '',
    valueProp: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  const validateStep = () => {
    let stepValid = true;
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      try {
        z.object({
          title: ideaSchema.shape.title,
          rawIdea: ideaSchema.shape.rawIdea,
        }).parse(formData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            if (err.path) {
              newErrors[err.path[0] as string] = err.message;
            }
          });
          stepValid = false;
        }
      }
    } else if (step === 2) {
      try {
        z.object({
          idealCustomer: ideaSchema.shape.idealCustomer,
        }).parse(formData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            if (err.path) {
              newErrors[err.path[0] as string] = err.message;
            }
          });
          stepValid = false;
        }
      }
    } else if (step === 3) {
      try {
        z.object({
          problem: ideaSchema.shape.problem,
          currentSolutions: ideaSchema.shape.currentSolutions,
        }).parse(formData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            if (err.path) {
              newErrors[err.path[0] as string] = err.message;
            }
          });
          stepValid = false;
        }
      }
    } else if (step === 4) {
      try {
        z.object({
          valueProp: ideaSchema.shape.valueProp,
        }).parse(formData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            if (err.path) {
              newErrors[err.path[0] as string] = err.message;
            }
          });
          stepValid = false;
        }
      }
    }

    setErrors(newErrors);
    return stepValid;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate the entire form
      ideaSchema.parse(formData);
      
      // If validation passes, submit the form
      setIsSubmitting(true);
      
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403 && data.error?.includes('No remaining runs available')) {
          // Redirect to pricing page if no runs remaining
          router.push('/pricing');
          return;
        }
        throw new Error(data.error || 'Failed to submit');
      }
      
      // Navigate to the first stage (customer persona)
      router.push(`/ideas/${data.ideaId}/customer`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        console.error('Error submitting form:', error);
        setErrors({ form: 'Failed to submit form. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Submit Your Idea</h2>
        <div className="flex justify-between mt-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i}
              className={`h-2 rounded-full flex-1 mx-1 ${
                i + 1 <= step ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Step {step} of {totalSteps}
        </p>
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Give your idea a catchy title"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idea Description
                </label>
                <textarea
                  name="rawIdea"
                  value={formData.rawIdea}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full p-2 border rounded-md ${
                    errors.rawIdea ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe your idea in a few sentences"
                />
                {errors.rawIdea && (
                  <p className="text-red-500 text-xs mt-1">{errors.rawIdea}</p>
                )}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Who is your ideal customer?
              </label>
              <textarea
                name="idealCustomer"
                value={formData.idealCustomer}
                onChange={handleChange}
                rows={4}
                className={`w-full p-2 border rounded-md ${
                  errors.idealCustomer ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your target audience or customer profile"
              />
              {errors.idealCustomer && (
                <p className="text-red-500 text-xs mt-1">{errors.idealCustomer}</p>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What problem does your idea solve?
                </label>
                <textarea
                  name="problem"
                  value={formData.problem}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full p-2 border rounded-md ${
                    errors.problem ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe the pain point or challenge your idea addresses"
                />
                {errors.problem && (
                  <p className="text-red-500 text-xs mt-1">{errors.problem}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Solutions (Optional)
                </label>
                <textarea
                  name="currentSolutions"
                  value={formData.currentSolutions}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="How are people solving this problem today?"
                />
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's your value proposition?
              </label>
              <textarea
                name="valueProp"
                value={formData.valueProp}
                onChange={handleChange}
                rows={4}
                className={`w-full p-2 border rounded-md ${
                  errors.valueProp ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Why would someone choose your solution over alternatives?"
              />
              {errors.valueProp && (
                <p className="text-red-500 text-xs mt-1">{errors.valueProp}</p>
              )}
            </div>
          </>
        )}

        {errors.form && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {errors.form}
          </div>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handlePreviousStep}
            disabled={step === 1}
            className={`px-4 py-2 rounded-md font-medium ${
              step === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-70"
          >
            {isSubmitting
              ? 'Submitting...'
              : step === totalSteps
              ? 'Submit'
              : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
} 