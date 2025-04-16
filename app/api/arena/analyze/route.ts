import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define a set of basic personas for MVP
const BASIC_PERSONAS = [
  { 
    name: 'Venture Capitalist', 
    prompt: 'You are a blunt, numbers-driven venture capitalist who has seen thousands of pitches. You focus on market size, scalability, and return potential. You have a sharp eye for flaws that founders often miss. Your time is valuable, so you prefer direct communication. You use your experience to judge ideas based on their business potential and unit economics.'
  },
  { 
    name: 'Product Manager', 
    prompt: 'You are an empathetic but strategic product manager with experience shipping products at both startups and major tech companies. You care about product-market fit and user needs. You think about execution challenges and technical feasibility based on your practical experience building products that people love.'
  },
  { 
    name: 'Marketing Director', 
    prompt: 'You are a marketing director with 15+ years of experience across B2B and B2C sectors. You have a keen eye for positioning, audience targeting, and competitive differentiation. You understand the difficulty of breaking through market noise and how messaging and channels affect customer acquisition.'
  },
  { 
    name: 'Average Consumer', 
    prompt: 'You are an everyday consumer with average income and tech literacy. You represent the general public\'s perspective. Your reactions are based on price sensitivity, convenience, and perceived value rather than business metrics. You think about whether you personally would use a product and why.'
  },
  { 
    name: 'Industry Expert', 
    prompt: 'You are a veteran analyst with deep domain expertise across industries. You know current market trends, regulatory considerations, and industry-specific challenges. You recognize patterns from successful and failed ventures in related sectors and can spot both opportunities and obstacles based on your insider perspective.'
  },
  { 
    name: 'Technical Co-founder', 
    prompt: 'You are a technical co-founder with extensive engineering experience. You understand architecture challenges, scalability issues, and development complexity. You can spot potential technical debt and infrastructure costs that others might overlook. You approach problems from a practical engineering perspective.'
  },
  { 
    name: 'Small Business Owner', 
    prompt: 'You are a pragmatic small business owner who has built a profitable local business. You care about immediate profitability and cash flow. You tend to be skeptical of grandiose scaling plans and emphasize fundamentals. You think in terms of real-world business operations rather than Silicon Valley hype.'
  },
  { 
    name: 'Gen Z Consumer', 
    prompt: 'You are a Gen Z consumer (aged 18-25) who is digitally native, value-conscious, and socially aware. You care about authenticity, cultural relevance, social impact, and digital integration. Your perspective represents what would appeal to your peer group and why.'
  },
  { 
    name: 'Sustainability Advocate', 
    prompt: 'You are an environmental sustainability expert. You care deeply about environmental impact, resource efficiency, and long-term planetary health. You notice ecological concerns that others might miss and think about how business goals can align with environmental responsibility.'
  },
  { 
    name: 'Risk Analyst', 
    prompt: 'You are a risk management professional who specializes in identifying blind spots and failure modes. You naturally think about potential risks including regulatory challenges, market timing issues, competitive threats, and operational vulnerabilities. You focus on what could go wrong and how to address those issues.'
  },
  { 
    name: 'Senior Citizen', 
    prompt: 'You are a tech-comfortable senior citizen (65+) with disposable income. You evaluate ideas from the perspective of the older demographic, considering accessibility, usefulness, and value alignment with your generation. You notice adoption barriers for older users and what adaptations would make ideas more appealing across age groups.'
  },
  { 
    name: 'Rural Customer', 
    prompt: 'You are a resident of a rural area with different needs and infrastructure access than urban consumers. You consider factors like internet connectivity, distance from service centers, and community dynamics. Your perspective represents both limitations and opportunities in non-urban settings.'
  }
];

// Define a smaller set of personas for free users
const FREE_PERSONAS = [
  { 
    name: 'Venture Capitalist', 
    prompt: 'You are a blunt, numbers-driven venture capitalist who has seen thousands of pitches. You focus on market size, scalability, and return potential. You have a sharp eye for flaws that founders often miss. Your time is valuable, so you prefer direct communication. You use your experience to judge ideas based on their business potential and unit economics.'
  },
  { 
    name: 'Average Consumer', 
    prompt: 'You are an everyday consumer with average income and tech literacy. You represent the general public\'s perspective. Your reactions are based on price sensitivity, convenience, and perceived value rather than business metrics. You think about whether you personally would use a product and why.'
  },
  { 
    name: 'Product Manager', 
    prompt: 'You are an empathetic but strategic product manager with experience shipping products at both startups and major tech companies. You care about product-market fit and user needs. You think about execution challenges and technical feasibility based on your practical experience building products that people love.'
  }
];

// Define the schema for structured outputs according to OpenAI's requirements
const feedbackSchema = {
  type: "object",
  properties: {
    ratings: {
      type: "object",
      properties: {
        marketPotential: {
          type: "integer"
        },
        feasibility: {
          type: "integer"
        },
        innovation: {
          type: "integer"
        },
        competitiveness: {
          type: "integer"
        },
        profitPotential: {
          type: "integer"
        }
      },
      required: ["marketPotential", "feasibility", "innovation", "competitiveness", "profitPotential"],
      additionalProperties: false
    },
    personalOpinion: {
      type: "string",
      description: "Your personal reaction to the idea in 1-2 sentences"
    },
    likes: {
      type: "array",
      items: {
        type: "string"
      },
      description: "Aspects you personally like about this idea"
    },
    dislikes: {
      type: "array",
      items: {
        type: "string"
      },
      description: "Aspects you personally dislike or that concern you about this idea"
    },
    suggestions: {
      type: "array",
      items: {
        type: "string"
      },
      description: "What would make this idea more appealing to you personally"
    },
    overallSummary: {
      type: "string"
    }
  },
  required: ["ratings", "personalOpinion", "likes", "dislikes", "suggestions", "overallSummary"],
  additionalProperties: false
};

export async function POST(request: NextRequest) {
  try {
    // Get current user from session
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if email is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Email verification required' },
        { status: 403 }
      );
    }
    
    // Check if user has remaining runs
    if (!user.remainingRuns || user.remainingRuns <= 0) {
      return NextResponse.json(
        { error: 'No remaining runs available', remainingRuns: 0 },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const { ideaName, ideaDescription, targetAudience, coreProblem, revenueStrategy, uniqueValue } = await request.json();
    
    if (!ideaName || !ideaDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Use different sets of personas based on premium status
    const personas = user.isPremium ? BASIC_PERSONAS : FREE_PERSONAS;
    
    // Keep a simple idea summary for backward compatibility
    const ideaSummary = `${ideaName}: ${ideaDescription.substring(0, 100)}${ideaDescription.length > 100 ? '...' : ''}${targetAudience ? ` Target: ${targetAudience}` : ''}`;
    
    // Perform competitor analysis using web search - only for premium users
    let competitorAnalysis = null;
    let marketSaturationScore = 0;
    let competitorAnalysisAnnotations: any[] = [];
    
    if (user.isPremium) {
      try {
        const competitorSearchResponse = await openai.responses.create({
          model: 'gpt-4o',
          tools: [{ type: "web_search_preview" }],
          input: [
            { 
              role: 'system', 
              content: 'You are a market research expert who identifies and analyzes competing companies in the market. Provide thorough, factual information about competitors based on your search results. Format your response in clean, well-structured markdown with proper spacing between sections. Use ## for section headings, bullet points (not numbered lists) for key points, and ensure adequate whitespace between paragraphs. Keep your writing style consistent and professional.' 
            },
            { 
              role: 'user', 
              content: `Perform a competitor analysis for the following business idea:
              
Name: ${ideaName}
Description: ${ideaDescription}
Target Audience: ${targetAudience}
${coreProblem ? `Core Problem Being Solved: ${coreProblem}` : ''}
${uniqueValue ? `Unique Value Proposition: ${uniqueValue}` : ''}
${revenueStrategy ? `Revenue Strategy: ${revenueStrategy}` : ''}

Search for 3-5 existing companies or products that are similar to this idea and provide a detailed analysis in a structured format.

Format your entire response with extremely clean markdown following these exact formatting rules:
1. Use double line breaks between sections
2. Use "## Section Title" format for headings with a line break after each heading
3. Use single bullet points (* not numbered lists) with a space after the asterisk
4. Keep paragraphs short and focused
5. Use proper spacing throughout

Structure your analysis with these exact sections:

## Key Competitors

* Competitor 1 with brief description
* Competitor 2 with brief description
* And so on...

## Comparison to Your Idea

* How these competitors compare to the business idea
* What features or approaches are similar or different

## Market Differentiation

* What makes each competitor unique
* How they position themselves against each other

## Target Audience Analysis

* The main customer segments these competitors serve
* How your target audience overlaps with theirs

## Market Saturation Assessment

Assess the market saturation level on a scale of 1-100, where:
* 1-30: Low saturation (few competitors, unique idea, lots of opportunity)
* 31-70: Medium saturation (some established competitors but room for innovation)
* 71-100: High saturation (crowded market, difficult to differentiate)

Provide this as a numerical score (1-100) and explain your reasoning.

Include hyperlinks to sources where relevant. Keep your writing style consistent, professional, and extremely well-formatted with proper markdown.`
            }
          ]
        });
        
        // Extract the analysis text directly
        competitorAnalysis = competitorSearchResponse.output_text;
        
        // Try to extract a market saturation score from the text
        const saturationScoreMatch = competitorAnalysis.match(/saturation (?:score|level|rating).*?(\d+)/i) || 
                                   competitorAnalysis.match(/(\d+).*?saturation/i);
        
        if (saturationScoreMatch && saturationScoreMatch[1]) {
          marketSaturationScore = parseInt(saturationScoreMatch[1], 10);
          // Ensure it's within 1-100 range
          marketSaturationScore = Math.max(1, Math.min(100, marketSaturationScore));
        } else {
          // Estimate a default score based on keywords in the response
          if (competitorAnalysis.toLowerCase().includes('high saturation') || 
              competitorAnalysis.toLowerCase().includes('highly saturated') ||
              competitorAnalysis.toLowerCase().includes('crowded market')) {
            marketSaturationScore = 85;
          } else if (competitorAnalysis.toLowerCase().includes('medium saturation') || 
                    competitorAnalysis.toLowerCase().includes('moderate saturation') ||
                    competitorAnalysis.toLowerCase().includes('moderately saturated')) {
            marketSaturationScore = 50;
          } else if (competitorAnalysis.toLowerCase().includes('low saturation') || 
                    competitorAnalysis.toLowerCase().includes('lightly saturated') ||
                    competitorAnalysis.toLowerCase().includes('few competitors')) {
            marketSaturationScore = 25;
          } else {
            marketSaturationScore = 50; // Default to medium if can't determine
          }
        }
      } catch (error) {
        console.error('Competitor analysis error:', error);
        competitorAnalysis = "We couldn't perform competitor analysis at this time. Please try again later.";
        marketSaturationScore = 50; // Default to medium
      }
    } else {
      // For free users, we don't perform any competitor analysis to save API costs
      competitorAnalysis = null;
      marketSaturationScore = 0;
    }
    
    // Run analysis in parallel for each persona
    const analysisPromises = personas.map(async (persona) => {
      try {
        const response = await openai.responses.create({
          model: 'gpt-4o',
          input: [
            { role: 'system', content: persona.prompt },
            { 
              role: 'user', 
              content: `Tell us how you feel about this business idea, is it interesting to you and people like you?
              tailor your response to be personal and include your personal experience and feelings about the idea, in particular if 
              the idea is actually solving a problem that you experience in your day to day life.

Name: ${ideaName}
Description: ${ideaDescription}
Target Audience: ${targetAudience}
${coreProblem ? `Core Problem Being Solved: ${coreProblem}` : ''}
${uniqueValue ? `Unique Value Proposition: ${uniqueValue}` : ''}
${revenueStrategy ? `Revenue Strategy: ${revenueStrategy}` : ''}

Please share your honest personal reaction and feedback in a structured format:

1. Ratings (1-10 scale, where 1 is poor and 10 is excellent):
   - Market Potential: Based on your experience, how much demand do you see for this?
   - Feasibility: How realistic does this idea seem to you?
   - Innovation: How new or different does this feel to you?
   - Competitiveness: Would you choose this over existing alternatives?
   - Profit Potential: Do you think this could be financially successful?

2. Personal Opinion: Share your honest gut reaction in 1-2 sentences

3. What I Like: List 1-3 aspects you personally like about this idea

4. What I Dislike: List 1-3 aspects that concern you or would prevent you from using it

5. What Would Make It Better: Provide 1-3 suggestions that would make this more appealing to you

6. Overall Summary: Your brief personal assessment (maximum 150 characters)`
            }
          ],
          text: {
            format: {
              type: "json_schema",
              name: "idea_feedback",
              schema: feedbackSchema,
              strict: true
            }
          }
        });
        
        // Parse the JSON response
        const feedbackData = JSON.parse(response.output_text);
        
        return {
          persona: persona.name,
          feedback: feedbackData,
        };
      } catch (error) {
        console.error(`Error with ${persona.name} analysis:`, error);
        return {
          persona: persona.name,
          error: true,
          message: error instanceof Error ? error.message : 'Analysis could not be completed for this persona.'
        };
      }
    });
    
    const analyses = await Promise.all(analysisPromises);
    
    // Calculate overall scores across all personas
    const validAnalyses = analyses.filter(a => !a.error);
    const overallScores = {
      marketPotential: 0,
      feasibility: 0,
      innovation: 0,
      competitiveness: 0,
      profitPotential: 0
    };
    
    let overallScore = 0;
    
    if (validAnalyses.length > 0) {
      validAnalyses.forEach(analysis => {
        const ratings = analysis.feedback.ratings;
        overallScores.marketPotential += ratings.marketPotential;
        overallScores.feasibility += ratings.feasibility;
        overallScores.innovation += ratings.innovation;
        overallScores.competitiveness += ratings.competitiveness;
        overallScores.profitPotential += ratings.profitPotential;
      });
      
      // Calculate averages
      Object.keys(overallScores).forEach(key => {
        overallScores[key as keyof typeof overallScores] = Math.round(
          overallScores[key as keyof typeof overallScores] / validAnalyses.length
        );
      });
      
      // Calculate overall score out of 100
      const totalPossiblePoints = 50; // 5 categories, max 10 points each
      const totalPoints = Object.values(overallScores).reduce((sum, score) => sum + score, 0);
      overallScore = Math.round((totalPoints / totalPossiblePoints) * 100);
    }
    
    // Generate a comprehensive executive summary based on all feedback
    let executiveSummary: string;
    
    if (user.isPremium) {
      const executiveSummaryResponse = await openai.responses.create({
        model: 'gpt-4o',
        input: [
          { 
            role: 'system', 
            content: 'You are a strategic business advisor who provides concise, actionable insights based on personal feedback from different user personas. Focus on what different personas like, dislike, and suggest rather than pure business metrics. Your primary goal is to help the user improve their idea with specific, actionable changes. Format your response in clean, well-structured markdown with proper spacing between sections. Use ## for section headings, bullet lists for key points, and ensure adequate whitespace between paragraphs.' 
          },
          { 
            role: 'user', 
            content: `Based on feedback from multiple personas about this business idea, provide a brief executive summary with actionable next steps.
            
Business Idea:
Name: ${ideaName}
Description: ${ideaDescription}
Target Audience: ${targetAudience}
${coreProblem ? `Core Problem Being Solved: ${coreProblem}` : ''}
${uniqueValue ? `Unique Value Proposition: ${uniqueValue}` : ''}
${revenueStrategy ? `Revenue Strategy: ${revenueStrategy}` : ''}

Overall Score: ${overallScore}/100

Overall Ratings (average across all personas, scale 1-10):
- Market Potential: ${overallScores.marketPotential}
- Feasibility: ${overallScores.feasibility}
- Innovation: ${overallScores.innovation}
- Competitiveness: ${overallScores.competitiveness}
- Profit Potential: ${overallScores.profitPotential}

Competitor Analysis:
${competitorAnalysis}

Detailed Feedback From Each Persona:
${JSON.stringify(validAnalyses.map(a => ({
  persona: a.persona,
  ratings: a.feedback.ratings,
  personalOpinion: a.feedback.personalOpinion,
  likes: a.feedback.likes,
  dislikes: a.feedback.dislikes,
  suggestions: a.feedback.suggestions,
  summary: a.feedback.overallSummary
})))}

Format your entire response with extremely clean markdown following these exact formatting rules:
1. Use double line breaks between sections
2. Use "## Section Title" format for headings with a line break after each heading
3. Use single bullet points (* not numbered lists) with a space after the asterisk
4. Keep paragraphs short and focused
5. Use proper spacing throughout

Structure your executive summary with these exact sections:

## What Works Well

* First strength point
* Second strength point
* Third strength point (if applicable)

## What Needs Improvement

* First weakness point
* Second weakness point
* Third weakness point (if applicable)

## Competitive Landscape

* Key finding about competitors
* How this idea compares to the market
* Potential positioning strategy

## Recommended Changes

* First specific, actionable change
* Second specific, actionable change
* Third specific, actionable change
* Fourth specific, actionable change (if applicable)

## Audience Considerations

Brief note on which target audiences responded most positively or would be most receptive to this idea

## Next Steps to Increase Your Score

* First prioritized action item
* Second prioritized action item
* Third prioritized action item
* Fourth prioritized action item (if applicable)
* Fifth prioritized action item (if applicable)

Keep your response under 300 words total. Do not include any preamble - start directly with the markdown headings and content.`
          }
        ]
      });
      
      executiveSummary = executiveSummaryResponse.output_text;
    } else {
      // Simpler executive summary for free users
      const basicSummaryResponse = await openai.responses.create({
        model: 'gpt-4o',
        input: [
          { 
            role: 'system', 
            content: 'You are a business advisor who provides brief, actionable insights based on feedback. Keep your response concise and to the point. Format in clean markdown with brief sections.' 
          },
          { 
            role: 'user', 
            content: `Provide a brief summary for this business idea based on persona feedback.
            
Business Idea:
Name: ${ideaName}
Description: ${ideaDescription}
Target Audience: ${targetAudience}
${coreProblem ? `Core Problem Being Solved: ${coreProblem}` : ''}

Overall Score: ${overallScore}/100

Overall Ratings (average across personas, scale 1-10):
- Market Potential: ${overallScores.marketPotential}
- Feasibility: ${overallScores.feasibility}
- Innovation: ${overallScores.innovation}
- Competitiveness: ${overallScores.competitiveness}
- Profit Potential: ${overallScores.profitPotential}

Feedback From Personas:
${JSON.stringify(validAnalyses.map(a => ({
  persona: a.persona,
  likes: a.feedback.likes,
  dislikes: a.feedback.dislikes,
  suggestions: a.feedback.suggestions
})))}

Format your response as clear markdown with double line breaks between sections and bullet points.

Structure your summary with these sections:

## Key Strengths

* First strength point
* Second strength point

## Areas for Improvement

* First weakness point
* Second weakness point

## Recommended Next Steps

* First action item 
* Second action item

Keep your response under 200 words. Include a note at the end encouraging the user to upgrade to premium for full analysis with all 12 expert personas, detailed competitor analysis, and comprehensive recommendations.`
          }
        ]
      });
      
      executiveSummary = basicSummaryResponse.output_text + `

## Upgrade to Premium

* Access all 12 expert personas instead of just 3
* Get detailed competitor analysis with specific companies
* Receive comprehensive positioning strategies
* Unlock detailed audience insights and targeted recommendations`;
    }
    
    // Decrease remaining runs
    await db
      .update(users)
      .set({ 
        remainingRuns: user.remainingRuns - 1,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));
    
    return NextResponse.json({ 
      ideaSummary,
      executiveSummary,
      competitorAnalysis,
      competitorAnalysisAnnotations,
      marketSaturationScore,
      analyses,
      overallScores,
      overallScore,
      remainingRuns: user.remainingRuns - 1,
      isPremium: user.isPremium,
      additionalDetails: {
        coreProblem,
        uniqueValue,
        revenueStrategy
      }
    });
  } catch (error) {
    console.error('Arena analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to process idea' },
      { status: 500 }
    );
  }
} 