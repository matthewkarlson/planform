// Define type for different field types
export type BaseField = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  conditionalShow?: (answers: Record<string, string>) => boolean;
};

export type TextField = BaseField & {
  type: 'text';
  placeholder: string;
};

export type TextareaField = BaseField & {
  type: 'textarea';
  placeholder: string;
};

export type RadioField = BaseField & {
  type: 'radio';
  options: Array<{ value: string; label: string }>;
};

export type CheckboxField = BaseField & {
  type: 'checkbox';
  options: Array<{ value: string; label: string }>;
};

export type DropdownField = BaseField & {
  type: 'dropdown';
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
};

export type Field = TextField | TextareaField | RadioField | CheckboxField | DropdownField;

export type Question = {
  questionNumber: number; // This determines the order
  title: string;
  description?: string;
  fields: Field[];
};
export type QuestionSet = {
  id?: number;
  agencyId: number;
  questions: Question[];
};

export type Answers = Record<string, string | string[]>;

// Default empty question template
export const createEmptyQuestion = (questionNumber: number): Question => ({
  questionNumber,
  title: "New Question",
  fields: [
    {
      id: `question_${questionNumber}_field_1`,
      label: 'Enter your question here',
      type: 'text',
      placeholder: 'Answer placeholder',
      required: true,
    },
  ],
});

// Default empty field templates by type
export const createEmptyField = (type: string, questionNumber: number, fieldIndex: number): Field => {
  const baseField = {
    id: `question_${questionNumber}_field_${fieldIndex}`,
    label: 'New Field',
    required: false
  };

  switch (type) {
    case 'text':
      return {
        ...baseField,
        type: 'text',
        placeholder: 'Enter text here'
      };
    case 'textarea':
      return {
        ...baseField,
        type: 'textarea',
        placeholder: 'Enter longer text here'
      };
    case 'radio':
      return {
        ...baseField,
        type: 'radio',
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]
      };
    case 'checkbox':
      return {
        ...baseField,
        type: 'checkbox',
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]
      };
    case 'dropdown':
      return {
        ...baseField,
        type: 'dropdown',
        placeholder: 'Select an option',
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]
      };
    default:
      return {
        ...baseField,
        type: 'text',
        placeholder: 'Enter text here'
      };
  }
}; 