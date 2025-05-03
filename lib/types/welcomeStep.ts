export type WelcomeStep = {
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