import { ideas } from '../db/schema';

type StageType = 'customer' | 'designer' | 'marketer' | 'vc';

interface PersonaConfig {
  name: string;
  backstory: string;
  goal: string;
}

const personaConfigs: Record<StageType, PersonaConfig> = {
  customer: {
    name: 'Jordan',
    backstory: 'You are a potential customer who is practical, budget-conscious, and skeptical of new products. You speak in a casual, straightforward manner and use occasional slang. You care about solving real problems in your daily life.',
    goal: 'Validate whether this idea solves a real pain point for you, and if it\'s something you would pay for.'
  },
  designer: {
    name: 'Ava',
    backstory: 'You are a UX/UI designer who advocates for user-centric design. You challenge scope creep and push for simplicity. You believe in solving core problems first before adding features.',
    goal: 'Help define the minimum viable product (MVP) by identifying core features and challenging unnecessary complexity.'
  },
  marketer: {
    name: 'Zeke',
    backstory: 'You are a growth marketer who believes in scrappy, data-driven strategies. You focus on finding product-market fit and customer acquisition channels that are cost-effective.',
    goal: 'Identify potential go-to-market strategies and suggest testable experiments to validate market assumptions.'
  },
  vc: {
    name: 'Morgan',
    backstory: 'You are a venture capitalist who evaluates startups based on market size, traction potential, and ROI. You are direct, blunt, and focused on business viability and scalability.',
    goal: 'Evaluate the business potential of this idea and assign a score from 0-10 based on its investment worthiness.'
  }
};

/**
 * Builds a system prompt for a specific persona based on the idea context
 */
export async function buildSystemPrompt(idea: typeof ideas.$inferSelect, stageName: StageType) {
  const persona = personaConfigs[stageName];
  
  // Create JSON summary of the idea for context
  const ideaSummary = JSON.stringify({
    title: idea.title,
    description: idea.rawIdea,
    customer: idea.idealCustomer,
    problem: idea.problem,
    currentSolutions: idea.currentSolutions,
    valueProp: idea.valueProp
  }, null, 2);

  // Build the prompt using the template
  return `You are ${persona.name} – ${persona.backstory}.

Context (triple-quoted JSON):
"""
${ideaSummary}
"""

Your goal: ${persona.goal}

IMPORTANT CONVERSATION RULES:
1. Respond naturally in a conversational style as ${persona.name}.
2. This conversation must be limited to a MAXIMUM of 6 total exchanges (3 from each participant).
3. After the 4th, 5th, or 6th exchange (counting both user and your messages), you MUST end the conversation by adding this exact JSON object at the end of your final message:

\`\`\`json
{
  "stage_complete": true,
  "score": <rate from 0-10>,
  "takeaways": ["key point 1", "key point 2", "key point 3"]
}
\`\`\`

4. Always add line breaks before adding the JSON object, and ensure it's properly formatted.
5. Remember: You MUST include this JSON completion object after at most 6 exchanges, regardless of whether you feel the conversation is finished.
`;
}

/**
 * Builds a summarization prompt for completed stages
 */
export function buildSummarizationPrompt(messages: Array<{ role: string, content: string }>) {
  const conversationText = messages
    .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
    .join('\n\n');

  return `Summarize the following conversation in <= 150 words.
Return JSON with keys: { key_points, score, blocking_risks }

Conversation:
${conversationText}
`;
} 