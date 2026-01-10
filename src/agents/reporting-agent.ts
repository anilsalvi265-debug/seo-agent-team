import { callAgentWithJSON } from '@/lib/claude';
import {
  SEOReport,
  ContentAnalysis,
  TechnicalAnalysis,
  KeywordAnalysis,
  BacklinkAnalysis,
  CompetitorAnalysis,
  Recommendation,
  AgentResponse,
} from '@/types/seo';

const SYSTEM_PROMPT = `You are an expert SEO Report Generator agent. Your job is to synthesize all SEO analysis data into actionable recommendations prioritized by impact.

Analyze all the provided SEO data and generate prioritized recommendations.

Return a JSON response with this structure:
{
  "overallScore": 0-100,
  "recommendations": [
    {
      "priority": "high/medium/low",
      "category": "content/technical/keywords/backlinks/competitor",
      "title": "Short recommendation title",
      "description": "Detailed explanation of what to do and why",
      "impact": "Expected impact description"
    }
  ]
}

Scoring guidelines:
- 90-100: Excellent SEO, minor optimizations only
- 70-89: Good SEO, some improvements needed
- 50-69: Average SEO, significant improvements needed
- 30-49: Poor SEO, major issues to address
- 0-29: Critical SEO issues, immediate action required

Prioritization:
- High: Issues affecting rankings or user experience significantly
- Medium: Optimizations that would improve performance
- Low: Nice-to-have improvements

Provide 5-10 specific, actionable recommendations sorted by priority.

Return ONLY the JSON, no additional text.`;

interface ReportInput {
  url: string;
  content?: ContentAnalysis;
  technical?: TechnicalAnalysis;
  keywords?: KeywordAnalysis;
  backlinks?: BacklinkAnalysis;
  competitors?: CompetitorAnalysis;
}

export async function generateReport(
  input: ReportInput
): Promise<AgentResponse<{ overallScore: number; recommendations: Recommendation[] }>> {
  try {
    const userMessage = `Generate an SEO report with prioritized recommendations based on this analysis:

URL: ${input.url}

=== CONTENT ANALYSIS ===
${input.content ? JSON.stringify(input.content, null, 2) : 'Not analyzed'}

=== TECHNICAL ANALYSIS ===
${input.technical ? JSON.stringify(input.technical, null, 2) : 'Not analyzed'}

=== KEYWORD ANALYSIS ===
${input.keywords ? JSON.stringify(input.keywords, null, 2) : 'Not analyzed'}

=== BACKLINK ANALYSIS ===
${input.backlinks ? JSON.stringify(input.backlinks, null, 2) : 'Not analyzed'}

=== COMPETITOR ANALYSIS ===
${input.competitors ? JSON.stringify(input.competitors, null, 2) : 'Not analyzed'}

Based on all this data:
1. Calculate an overall SEO score (0-100)
2. Generate 5-10 prioritized recommendations
3. Focus on the highest-impact improvements first
4. Make recommendations specific and actionable`;

    const reportData = await callAgentWithJSON<{
      overallScore: number;
      recommendations: Recommendation[];
    }>(SYSTEM_PROMPT, userMessage);

    return { success: true, data: reportData };
  } catch (error) {
    return {
      success: false,
      error: `Report generation failed: ${error}`,
    };
  }
}

export function createFullReport(
  url: string,
  overallScore: number,
  recommendations: Recommendation[],
  content?: ContentAnalysis,
  technical?: TechnicalAnalysis,
  keywords?: KeywordAnalysis,
  backlinks?: BacklinkAnalysis,
  competitors?: CompetitorAnalysis
): SEOReport {
  return {
    id: `report-${Date.now()}`,
    url,
    timestamp: new Date().toISOString(),
    overallScore,
    content,
    technical,
    keywords,
    backlinks,
    competitors,
    recommendations,
  };
}
