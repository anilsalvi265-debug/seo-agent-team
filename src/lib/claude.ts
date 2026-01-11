import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default anthropic;

export async function callAgent(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 4096
): Promise<string> {
  try {
    console.log('Calling Claude API...');
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    console.log('Claude API response received');
    return textBlock ? textBlock.text : '';
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

export async function callAgentWithJSON<T>(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 4096
): Promise<T> {
  const response = await callAgent(systemPrompt, userMessage, maxTokens);

  // Extract JSON from the response
  const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) ||
                    response.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    const jsonStr = jsonMatch[1] || jsonMatch[0];
    return JSON.parse(jsonStr) as T;
  }

  throw new Error('Failed to parse JSON from agent response');
}
// trigger redeploy
