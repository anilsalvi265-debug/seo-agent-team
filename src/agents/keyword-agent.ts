import { callAgentWithJSON } from '@/lib/claude';
import { KeywordAnalysis, PageData, AgentResponse } from '@/types/seo';
import { extractKeywords } from '@/tools/web-scraper';

const SYSTEM_PROMPT = `You are an expert SEO Keyword Research agent. Your job is to analyze page content and provide comprehensive keyword recommendations.

Analyze the provided page data and return a JSON response with this structure:
{
  "primaryKeywords": [
    {
      "keyword": "main keyword",
      "volume": "high/medium/low",
      "difficulty": "easy/medium/hard",
      "opportunity": "description of opportunity"
    }
  ],
  "secondaryKeywords": [
    {
      "keyword": "secondary keyword",
      "volume": "high/medium/low",
      "difficulty": "easy/medium/hard",
      "opportunity": "description"
    }
  ],
  "longTailSuggestions": [
    "long tail keyword phrase 1",
    "long tail keyword phrase 2"
  ],
  "contentGaps": [
    "topic or keyword the page should cover but doesn't"
  ],
  "competitorKeywords": [
    "keywords competitors likely target"
  ]
}

Keyword research best practices:
- Primary keywords should match page intent
- Long-tail keywords often have less competition
- Identify content gaps for expansion opportunities
- Consider user search intent (informational, transactional, navigational)
- Suggest LSI (Latent Semantic Indexing) keywords

Return ONLY the JSON, no additional text.`;

export async function analyzeKeywords(
  pageData: PageData
): Promise<AgentResponse<KeywordAnalysis>> {
  try {
    const keywords = extractKeywords(pageData.content);

    const userMessage = `Analyze keywords and provide recommendations for this page:

URL: ${pageData.url}
Title: ${pageData.title}
Meta Description: ${pageData.metaDescription}

Current Top Keywords (by frequency):
${Object.entries(keywords)
  .slice(0, 15)
  .map(([word, count]) => `- "${word}": ${count} occurrences`)
  .join('\n')}

H1 Headings: ${pageData.headings.h1.join(', ') || 'None'}
H2 Headings: ${pageData.headings.h2.slice(0, 5).join(', ') || 'None'}

Content Sample:
${pageData.content.substring(0, 1500)}

Based on this content, identify:
1. Primary keywords the page is targeting or should target
2. Secondary keywords to strengthen the content
3. Long-tail keyword opportunities
4. Content gaps and missing topics
5. Keywords competitors in this niche likely target`;

    const analysis = await callAgentWithJSON<KeywordAnalysis>(
      SYSTEM_PROMPT,
      userMessage
    );

    return { success: true, data: analysis };
  } catch (error) {
    return {
      success: false,
      error: `Keyword analysis failed: ${error}`,
    };
  }
}
