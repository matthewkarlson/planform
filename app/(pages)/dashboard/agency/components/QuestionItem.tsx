'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Question, Field, createEmptyField } from '@/lib/types/questions';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusIcon, TrashIcon } from 'lucide-react';
import isEqual from 'lodash/isEqual';

interface QuestionItemProps {
  question: Question;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: () => void;
}

const QuestionItem = ({ question, onUpdate, onDelete }: QuestionItemProps) => {
  const [localQuestion, setLocalQuestion] = useState<Question>(question);
  const prevQuestionRef = useRef<Question>(question);
  const isFirstRender = useRef(true);

  // Update local state when props change
  useEffect(() => {
    if (!isEqual(question, localQuestion)) {
      setLocalQuestion(question);
    }
  }, [question]);

  // Notify parent of changes, but only when localQuestion changes after initial render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only call onUpdate if there's an actual change and it's not just from prop changes
    if (!isEqual(localQuestion, prevQuestionRef.current)) {
      prevQuestionRef.current = localQuestion;
      onUpdate(localQuestion);
    }
  }, [localQuestion, onUpdate]);

  const handleQuestionChange = (name: string, value: any) => {
    setLocalQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleQuestionChange(name, value);
  };

  // Update a field in a question
  const handleFieldChange = (index: number, fieldKey: string, value: any) => {
    const updatedFields = [...localQuestion.fields];
    updatedFields[index] = { ...updatedFields[index], [fieldKey]: value };
    
    handleQuestionChange('fields', updatedFields);
  };
  
  // Add a new field to a question
  const handleAddField = (type: string) => {
    const nextFieldIndex = localQuestion.fields.length + 1;
    const newField = createEmptyField(type, localQuestion.questionNumber, nextFieldIndex);
    
    handleQuestionChange('fields', [...localQuestion.fields, newField]);
  };
  
  // Remove a field from a question
  const handleRemoveField = (index: number) => {
    if (localQuestion.fields.length <= 1) {
      return; // Don't allow removing the last field
    }
    
    const updatedFields = localQuestion.fields.filter((_, i) => i !== index);
    handleQuestionChange('fields', updatedFields);
  };
  
  // Update an option in a field
  const handleOptionChange = (fieldIndex: number, optionIndex: number, key: string, value: string) => {
    const field = localQuestion.fields[fieldIndex];
    
    // Check if the field has options
    if (!('options' in field)) return;
    
    const updatedOptions = [...field.options];
    updatedOptions[optionIndex] = { 
      ...updatedOptions[optionIndex], 
      [key]: value 
    };
    
    const updatedFields = [...localQuestion.fields];
    updatedFields[fieldIndex] = { 
      ...field, 
      options: updatedOptions 
    };
    
    handleQuestionChange('fields', updatedFields);
  };
  
  // Add an option to a field
  const handleAddOption = (fieldIndex: number) => {
    const field = localQuestion.fields[fieldIndex];
    if (!('options' in field)) return;
    
    const options = [...field.options];
    const newOption = { 
      value: `option${options.length + 1}`, 
      label: `Option ${options.length + 1}` 
    };
    
    options.push(newOption);
    
    const updatedFields = [...localQuestion.fields];
    updatedFields[fieldIndex] = { ...field, options };
    
    handleQuestionChange('fields', updatedFields);
  };
  
  // Remove an option from a field
  const handleRemoveOption = (fieldIndex: number, optionIndex: number) => {
    const field = localQuestion.fields[fieldIndex];
    if (!('options' in field) || field.options.length <= 2) return; // Maintain at least 2 options
    
    const options = field.options.filter((_, i) => i !== optionIndex);
    
    const updatedFields = [...localQuestion.fields];
    updatedFields[fieldIndex] = { ...field, options };
    
    handleQuestionChange('fields', updatedFields);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Question</h3>
          <button 
            onClick={onDelete}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
        
        <div className="flex flex-col gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Question Title</label>
            <input
              type="text"
              name="title"
              value={localQuestion.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              name="description"
              value={localQuestion.description || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Fields</Label>
          <Select
            onValueChange={(value) => handleAddField(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="+ Add Field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Input</SelectItem>
              <SelectItem value="textarea">Text Area</SelectItem>
              <SelectItem value="radio">Radio Buttons</SelectItem>
              <SelectItem value="checkbox">Checkboxes</SelectItem>
              <SelectItem value="dropdown">Dropdown</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {localQuestion.fields.map((field, fieldIndex) => (
          <div key={fieldIndex} className="bg-white p-4 border rounded-md">
            <div className="flex justify-between items-center mb-3">
              <div className="font-medium">Field {fieldIndex + 1} - {field.type}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveField(fieldIndex)}
                disabled={localQuestion.fields.length <= 1}
              >
                <TrashIcon size={16} />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <Label htmlFor={`field-${fieldIndex}-label`}>Label</Label>
                <Input
                  id={`field-${fieldIndex}-label`}
                  value={field.label}
                  onChange={(e) => handleFieldChange(fieldIndex, 'label', e.target.value)}
                  placeholder="Field label"
                />
              </div>
              
              <div>
                <Label htmlFor={`field-${fieldIndex}-id`}>Field ID</Label>
                <Input
                  id={`field-${fieldIndex}-id`}
                  value={field.id}
                  onChange={(e) => handleFieldChange(fieldIndex, 'id', e.target.value)}
                  placeholder="Unique field identifier"
                />
              </div>
            </div>
            
            <div className="mb-3">
              {field.type === 'text' && (
                <div>
                  <Label htmlFor={`field-${fieldIndex}-placeholder`}>Placeholder</Label>
                  <Input
                    id={`field-${fieldIndex}-placeholder`}
                    value={(field as any).placeholder || ''}
                    onChange={(e) => handleFieldChange(fieldIndex, 'placeholder', e.target.value)}
                    placeholder="Text input placeholder"
                  />
                </div>
              )}
              
              {field.type === 'textarea' && (
                <div>
                  <Label htmlFor={`field-${fieldIndex}-placeholder`}>Placeholder</Label>
                  <Input
                    id={`field-${fieldIndex}-placeholder`}
                    value={(field as any).placeholder || ''}
                    onChange={(e) => handleFieldChange(fieldIndex, 'placeholder', e.target.value)}
                    placeholder="Textarea placeholder"
                  />
                </div>
              )}
              
              {field.type === 'dropdown' && (
                <div>
                  <Label htmlFor={`field-${fieldIndex}-placeholder`}>Placeholder</Label>
                  <Input
                    id={`field-${fieldIndex}-placeholder`}
                    value={(field as any).placeholder || ''}
                    onChange={(e) => handleFieldChange(fieldIndex, 'placeholder', e.target.value)}
                    placeholder="Select dropdown placeholder"
                  />
                </div>
              )}
              
              {(field.type === 'radio' || field.type === 'checkbox' || field.type === 'dropdown') && 'options' in field && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Options</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddOption(fieldIndex)}
                      className="flex items-center gap-1"
                    >
                      <PlusIcon size={14} /> Add Option
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {field.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2 items-center">
                        <Input
                          value={option.label}
                          onChange={(e) => handleOptionChange(fieldIndex, optionIndex, 'label', e.target.value)}
                          placeholder="Option label"
                          className="flex-grow"
                        />
                        <Input
                          value={option.value}
                          onChange={(e) => handleOptionChange(fieldIndex, optionIndex, 'value', e.target.value)}
                          placeholder="Value"
                          className="w-1/3"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveOption(fieldIndex, optionIndex)}
                          disabled={field.options.length <= 2}
                        >
                          <TrashIcon size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id={`field-${fieldIndex}-required`}
                checked={field.required}
                onCheckedChange={(checked) => handleFieldChange(fieldIndex, 'required', !!checked)}
              />
              <Label htmlFor={`field-${fieldIndex}-required`}>Required field</Label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionItem; 