import { callAgentWithJSON } from '@/lib/claude';
import { BacklinkAnalysis, PageData, AgentResponse } from '@/types/seo';

const SYSTEM_PROMPT = `You are an expert SEO Backlink Analyst agent. Your job is to analyze a page's link profile and provide link building recommendations.

Since we cannot access actual backlink data without external APIs, analyze the page content and provide strategic recommendations based on the content type and industry.

Return a JSON response with this structure:
{
  "totalBacklinks": 0,
  "uniqueDomains": 0,
  "topReferrers": [
    {
      "domain": "example.com",
      "authority": "high/medium/low",
      "linkCount": 1
    }
  ],
  "anchorTextDistribution": {
    "branded": 30,
    "exact match": 20,
    "partial match": 25,
    "generic": 15,
    "url": 10
  },
  "linkBuildingOpportunities": [
    "Specific link building strategy 1",
    "Specific link building strategy 2"
  ],
  "toxicLinks": []
}

Link building best practices:
- Diversify anchor text (avoid over-optimization)
- Focus on high-authority, relevant domains
- Guest posting on industry blogs
- Create linkable assets (infographics, studies, tools)
- Broken link building
- HARO (Help A Reporter Out) for PR links
- Resource page link building

Provide specific, actionable link building strategies based on the page content and industry.

Return ONLY the JSON, no additional text.`;

export async function analyzeBacklinks(
  pageData: PageData
): Promise<AgentResponse<BacklinkAnalysis>> {
  try {
    const userMessage = `Analyze and provide backlink/link building recommendations for this page:

URL: ${pageData.url}
Title: ${pageData.title}
Meta Description: ${pageData.metaDescription}

Current External Links on Page:
${pageData.links
  .filter((l) => l.isExternal)
  .slice(0, 10)
  .map((l) => `- ${l.href} (anchor: "${l.text}")`)
  .join('\n') || 'No external links found'}

Page Topics (from headings):
${[...pageData.headings.h1, ...pageData.headings.h2.slice(0, 5)].join('\n') || 'No headings found'}

Content Summary:
${pageData.content.substring(0, 1000)}

Based on this content:
1. What types of sites would be good backlink targets?
2. What link building strategies would work for this type of content?
3. What linkable assets could be created?
4. Recommend ideal anchor text distribution
5. Identify potential outreach opportunities`;

    const analysis = await callAgentWithJSON<BacklinkAnalysis>(
      SYSTEM_PROMPT,
      userMessage
    );

    return { success: true, data: analysis };
  } catch (error) {
    return {
      success: false,
      error: `Backlink analysis failed: ${error}`,
    };
  }
}
