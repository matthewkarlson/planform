import { Question } from './questions';

// Types for the embed page
export type Answers = Record<string, string | string[]>;

export type ServiceRecommendation = {
  serviceId: string;
  reason: string;
};

export type ServiceData = {
  id: number;
  serviceId: string;
  name: string;
  description: string;
  outcomes: string[];
  priceLower: number | null;
  priceUpper: number | null;
  whenToRecommend: string[];
};

// Define website analysis type - used in AnalysisResponse
export type WebsiteAnalysis = {
  companyName: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  overallImpression: string;
};

export type AnalysisResponse = {
  clientResponses: Answers;
  recommendations: ServiceRecommendation[];
  totalEstimatedCost: {
    minTotal: number;
    maxTotal: number;
    formattedRange: string;
  };
  executiveSummary?: string;
  websiteAnalysis?: WebsiteAnalysis;
  screenshotUrl?: string;
  screenshotBase64?: string;
};

export type AgencyData = {
  id: number;
  name: string;
  contactNumber: string | null;
  email: string | null;
  bookingLink: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  backgroundColor: string | null;
  textColor: string;
  currency: string;
}; 