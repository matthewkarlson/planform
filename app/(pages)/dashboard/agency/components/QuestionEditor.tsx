'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Question, QuestionSet, createEmptyQuestion } from '@/lib/types/questions';
import QuestionItem from './QuestionItem';
import { ArrowUpIcon, ArrowDownIcon, PlusIcon, SaveIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface QuestionEditorProps {
  agencyId: number;
}

export default function QuestionEditor({ agencyId }: QuestionEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [questionSet, setQuestionSet] = useState<QuestionSet>({
    agencyId,
    questions: [],
    includeWebsiteQuestion: true
  });

  // Fetch existing question set
  useEffect(() => {
    const fetchQuestionSet = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/questions?agencyId=${agencyId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        
        const data = await response.json();
        setQuestionSet(data);
      } catch (error) {
        setError('Error loading questions. Please try again.');
        console.error('Error fetching questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionSet();
  }, [agencyId]);

  // Add a new question
  const handleAddQuestion = () => {
    const nextQuestionNumber = questionSet.questions.length > 0 
      ? Math.max(...questionSet.questions.map(q => q.questionNumber)) + 1 
      : 1;

    setQuestionSet(prev => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion(nextQuestionNumber)]
    }));
  };

  // Delete a question
  const handleDeleteQuestion = (questionNumber: number) => {
    setQuestionSet(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.questionNumber !== questionNumber)
    }));
  };

  // Update a question
  const handleUpdateQuestion = (updatedQuestion: Question) => {
    // Validate that all fields are of the same type
    if (updatedQuestion.fields.length > 1) {
      const fieldType = updatedQuestion.fields[0].type;
      const hasDifferentTypes = updatedQuestion.fields.some(field => field.type !== fieldType);
      
      if (hasDifferentTypes) {
        setError('All fields within a question must be of the same type.');
        return;
      }
    }
    
    setQuestionSet(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.questionNumber === updatedQuestion.questionNumber ? updatedQuestion : q
      )
    }));
    
    // Clear any error that might have been set
    if (error === 'All fields within a question must be of the same type.') {
      setError(null);
    }
  };

  // Move question up or down in order
  const handleMoveQuestion = (questionNumber: number, direction: 'up' | 'down') => {
    const sortedQuestions = [...questionSet.questions].sort((a, b) => a.questionNumber - b.questionNumber);
    const currentIndex = sortedQuestions.findIndex(q => q.questionNumber === questionNumber);
    
    if (direction === 'up' && currentIndex > 0) {
      // Swap with previous question
      const temp = sortedQuestions[currentIndex].questionNumber;
      sortedQuestions[currentIndex].questionNumber = sortedQuestions[currentIndex - 1].questionNumber;
      sortedQuestions[currentIndex - 1].questionNumber = temp;
    } else if (direction === 'down' && currentIndex < sortedQuestions.length - 1) {
      // Swap with next question
      const temp = sortedQuestions[currentIndex].questionNumber;
      sortedQuestions[currentIndex].questionNumber = sortedQuestions[currentIndex + 1].questionNumber;
      sortedQuestions[currentIndex + 1].questionNumber = temp;
    }
    
    setQuestionSet(prev => ({
      ...prev,
      questions: sortedQuestions
    }));
  };

  // Toggle includeWebsiteQuestion
  const handleWebsiteQuestionToggle = (checked: boolean) => {
    setQuestionSet(prev => ({
      ...prev,
      includeWebsiteQuestion: checked
    }));
  };

  // Save the question set
  const handleSave = async () => {
    try {
      // Validate all questions before saving
      for (const question of questionSet.questions) {
        if (question.fields.length > 1) {
          const fieldType = question.fields[0].type;
          const hasDifferentTypes = question.fields.some(field => field.type !== fieldType);
          
          if (hasDifferentTypes) {
            setError('All fields within a question must be of the same type. Please fix before saving.');
            return;
          }
        }
      }
      
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionSet),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save questions');
      }
      
      setSuccess('Questions saved successfully!');
      router.refresh();
    } catch (error) {
      console.error('Error saving questions:', error);
      setError('Failed to save questions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Sort questions by questionNumber
  const sortedQuestions = [...questionSet.questions].sort((a, b) => a.questionNumber - b.questionNumber);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-8">
          <div>Loading questions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Questionnaire Editor</CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={handleAddQuestion}
            size="sm"
            className="flex items-center gap-1"
          >
            <PlusIcon size={16} />
            Add Question
          </Button>
          <Button 
            onClick={handleSave}
            size="sm"
            variant="default"
            disabled={isSaving}
            className="flex items-center gap-1"
          >
            <SaveIcon size={16} />
            {isSaving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertDescription>
            Note: Each question must have fields of the same type only. For example, you cannot mix text fields with radio buttons in the same question.
          </AlertDescription>
        </Alert>
        
        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            id="include-website-question" 
            checked={questionSet.includeWebsiteQuestion}
            onCheckedChange={handleWebsiteQuestionToggle}
          />
          <Label htmlFor="include-website-question">Include website question</Label>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-800 p-4 mb-4 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-800 p-4 mb-4 rounded-md">
            {success}
          </div>
        )}
        
        {sortedQuestions.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-md">
            <p className="text-gray-500 mb-4">No questions yet. Start by adding a question.</p>
            <Button onClick={handleAddQuestion}>Add First Question</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedQuestions.map((question, index) => (
              <div key={`question-${question.questionNumber}-${index}`} className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-semibold text-lg">
                    Question {index + 1}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={index === 0}
                      onClick={() => handleMoveQuestion(question.questionNumber, 'up')}
                    >
                      <ArrowUpIcon size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={index === sortedQuestions.length - 1}
                      onClick={() => handleMoveQuestion(question.questionNumber, 'down')}
                    >
                      <ArrowDownIcon size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteQuestion(question.questionNumber)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                
                <QuestionItem 
                  question={question}
                  onUpdate={handleUpdateQuestion}
                  onDelete={() => handleDeleteQuestion(question.questionNumber)}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 