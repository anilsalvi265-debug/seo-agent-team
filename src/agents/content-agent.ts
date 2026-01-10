import { callAgentWithJSON } from '@/lib/claude';
import { ContentAnalysis, PageData, AgentResponse } from '@/types/seo';
import { extractKeywords, calculateReadability } from '@/tools/web-scraper';

const SYSTEM_PROMPT = `You are an expert SEO Content Analyst agent. Your job is to analyze web page content and provide actionable SEO recommendations.

Analyze the provided page data and return a JSON response with the following structure:
{
  "title": {
    "text": "the page title",
    "length": number,
    "score": 0-100,
    "suggestions": ["suggestion 1", "suggestion 2"]
  },
  "metaDescription": {
    "text": "the meta description",
    "length": number,
    "score": 0-100,
    "suggestions": ["suggestion 1", "suggestion 2"]
  },
  "headings": {
    "h1": ["h1 texts"],
    "h2": ["h2 texts"],
    "h3": ["h3 texts"],
    "structure": "description of heading structure",
    "score": 0-100,
    "suggestions": ["suggestion 1"]
  },
  "content": {
    "wordCount": number,
    "readabilityScore": 0-100,
    "keywordDensity": {"keyword": density},
    "suggestions": ["suggestion 1"]
  },
  "images": {
    "total": number,
    "withAlt": number,
    "withoutAlt": number,
    "suggestions": ["suggestion 1"]
  }
}

Key SEO best practices to check:
- Title should be 50-60 characters
- Meta description should be 150-160 characters
- Should have exactly one H1 tag
- Headings should follow hierarchy (H1 > H2 > H3)
- Content should be at least 300 words for most pages
- All images should have descriptive alt text
- Keyword density should be 1-3% for primary keywords

Return ONLY the JSON, no additional text.`;

export async function analyzeContent(
  pageData: PageData
): Promise<AgentResponse<ContentAnalysis>> {
  try {
    // Pre-calculate some metrics
    const keywords = extractKeywords(pageData.content);
    const readabilityScore = calculateReadability(pageData.content);
    const wordCount = pageData.content.split(/\s+/).filter(w => w.length > 0).length;
    const imagesWithAlt = pageData.images.filter((img) => img.alt.trim().length > 0).length;

    const userMessage = `Analyze this page for SEO content optimization:

URL: ${pageData.url}
Title: ${pageData.title}
Meta Description: ${pageData.metaDescription}

Headings:
- H1: ${pageData.headings.h1.join(', ') || 'None found'}
- H2: ${pageData.headings.h2.slice(0, 10).join(', ') || 'None found'}
- H3: ${pageData.headings.h3.slice(0, 10).join(', ') || 'None found'}

Content Stats:
- Word Count: ${wordCount}
- Readability Score: ${readabilityScore}/100
- Top Keywords: ${JSON.stringify(keywords)}

Images:
- Total: ${pageData.images.length}
- With Alt Text: ${imagesWithAlt}
- Without Alt Text: ${pageData.images.length - imagesWithAlt}

Content Sample (first 1000 chars):
${pageData.content.substring(0, 1000)}`;

    const analysis = await callAgentWithJSON<ContentAnalysis>(
      SYSTEM_PROMPT,
      userMessage
    );

    return { success: true, data: analysis };
  } catch (error) {
    return {
      success: false,
      error: `Content analysis failed: ${error}`,
    };
  }
}
