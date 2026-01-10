import { callAgentWithJSON } from '@/lib/claude';
import { TechnicalAnalysis, PageData, AgentResponse } from '@/types/seo';

const SYSTEM_PROMPT = `You are an expert Technical SEO Analyst agent. Your job is to analyze web pages for technical SEO issues and provide actionable recommendations.

Analyze the provided page data and return a JSON response with this structure:
{
  "performance": {
    "loadTime": number (in ms),
    "score": 0-100,
    "suggestions": ["suggestion 1"]
  },
  "mobile": {
    "isMobileFriendly": boolean,
    "viewportSet": boolean,
    "score": 0-100,
    "suggestions": ["suggestion 1"]
  },
  "security": {
    "hasHttps": boolean,
    "hasSecurityHeaders": boolean,
    "score": 0-100,
    "suggestions": ["suggestion 1"]
  },
  "crawlability": {
    "robotsTxt": boolean,
    "sitemap": boolean,
    "canonicalUrl": "url or null",
    "score": 0-100,
    "suggestions": ["suggestion 1"]
  },
  "schema": {
    "hasStructuredData": boolean,
    "types": ["schema types found"],
    "suggestions": ["suggestion 1"]
  },
  "links": {
    "internal": number,
    "external": number,
    "broken": ["broken link urls"],
    "suggestions": ["suggestion 1"]
  }
}

Technical SEO best practices:
- Page should load in under 3 seconds
- Must have viewport meta tag for mobile
- Should use HTTPS
- Should have canonical URL defined
- Should implement structured data (JSON-LD)
- Internal links help with crawlability
- External links should be relevant and working

Return ONLY the JSON, no additional text.`;

export async function analyzeTechnical(
  pageData: PageData
): Promise<AgentResponse<TechnicalAnalysis>> {
  try {
    // Pre-analyze some technical aspects from HTML
    const hasViewport = pageData.html.includes('viewport');
    const hasHttps = pageData.url.startsWith('https://');
    const hasCanonical = pageData.html.includes('rel="canonical"');
    const hasJsonLd = pageData.html.includes('application/ld+json');

    // Extract canonical URL if present
    const canonicalMatch = pageData.html.match(
      /<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i
    );
    const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null;

    // Extract schema types
    const schemaTypes: string[] = [];
    const jsonLdMatches = pageData.html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
    );
    for (const match of jsonLdMatches) {
      try {
        const data = JSON.parse(match[1]);
        if (data['@type']) {
          schemaTypes.push(data['@type']);
        }
      } catch {
        // Invalid JSON-LD, skip
      }
    }

    // Count links
    const internalLinks = pageData.links.filter((l) => !l.isExternal).length;
    const externalLinks = pageData.links.filter((l) => l.isExternal).length;

    const userMessage = `Analyze this page for technical SEO:

URL: ${pageData.url}
Status Code: ${pageData.statusCode}
Load Time: ${pageData.loadTime}ms

Technical Details:
- HTTPS: ${hasHttps}
- Has Viewport Meta: ${hasViewport}
- Has Canonical Tag: ${hasCanonical}
- Canonical URL: ${canonicalUrl || 'Not set'}
- Has JSON-LD Schema: ${hasJsonLd}
- Schema Types Found: ${schemaTypes.join(', ') || 'None'}

Links:
- Internal Links: ${internalLinks}
- External Links: ${externalLinks}
- Sample External Links: ${pageData.links
      .filter((l) => l.isExternal)
      .slice(0, 5)
      .map((l) => l.href)
      .join(', ')}

HTML Sample (meta section):
${pageData.html.substring(0, 2000)}`;

    const analysis = await callAgentWithJSON<TechnicalAnalysis>(
      SYSTEM_PROMPT,
      userMessage
    );

    return { success: true, data: analysis };
  } catch (error) {
    return {
      success: false,
      error: `Technical analysis failed: ${error}`,
    };
  }
}
