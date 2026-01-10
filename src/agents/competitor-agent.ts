import { callAgentWithJSON } from '@/lib/claude';
import { CompetitorAnalysis, PageData, AgentResponse } from '@/types/seo';

const SYSTEM_PROMPT = `You are an expert SEO Competitor Analysis agent. Your job is to analyze a page and provide competitive insights and recommendations.

Based on the content type and industry, identify likely competitors and provide strategic recommendations.

Return a JSON response with this structure:
{
  "competitors": [
    {
      "url": "competitor-domain.com",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["potential weakness 1"],
      "keywordsRanking": ["keyword they likely rank for"]
    }
  ],
  "gaps": [
    "Content or feature gap to exploit"
  ],
  "opportunities": [
    "Strategic opportunity to outrank competitors"
  ]
}

Competitor analysis best practices:
- Identify direct and indirect competitors
- Analyze content depth and quality differences
- Look for underserved keywords and topics
- Identify unique value propositions
- Find content formats competitors are missing
- Spot technical SEO advantages to leverage

Provide 3-5 likely competitors based on the industry/niche.

Return ONLY the JSON, no additional text.`;

export async function analyzeCompetitors(
  pageData: PageData
): Promise<AgentResponse<CompetitorAnalysis>> {
  try {
    const userMessage = `Analyze competitive landscape for this page:

URL: ${pageData.url}
Domain: ${new URL(pageData.url).hostname}
Title: ${pageData.title}
Meta Description: ${pageData.metaDescription}

Page Topics (from headings):
H1: ${pageData.headings.h1.join(', ') || 'None'}
H2: ${pageData.headings.h2.slice(0, 8).join(', ') || 'None'}

Content Type Analysis:
- Word Count: ${pageData.content.split(/\s+/).length}
- Has Images: ${pageData.images.length > 0}
- External Links: ${pageData.links.filter((l) => l.isExternal).length}

Content Sample:
${pageData.content.substring(0, 1500)}

Based on this content:
1. Identify 3-5 likely competitors in this space (use general industry knowledge)
2. What are their likely strengths and weaknesses?
3. What content gaps could this page exploit?
4. What strategic opportunities exist to outperform competitors?
5. What keywords might competitors be targeting?`;

    const analysis = await callAgentWithJSON<CompetitorAnalysis>(
      SYSTEM_PROMPT,
      userMessage
    );

    return { success: true, data: analysis };
  } catch (error) {
    return {
      success: false,
      error: `Competitor analysis failed: ${error}`,
    };
  }
}
