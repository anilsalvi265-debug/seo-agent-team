import { NextRequest, NextResponse } from 'next/server';
import { runSEOAnalysis } from '@/agents/orchestrator';
import { SEOAnalysisRequest } from '@/types/seo';

export const maxDuration = 60; // Allow up to 60 seconds for Vercel Pro

export async function POST(request: NextRequest) {
  try {
    console.log('API: Starting analysis...');
    console.log('API: ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);

    const body = await request.json();
    const { url, ...options } = body as SEOAnalysisRequest;
    console.log('API: Analyzing URL:', url);

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const report = await runSEOAnalysis({
      url,
      includeContent: options.includeContent ?? true,
      includeTechnical: options.includeTechnical ?? true,
      includeKeywords: options.includeKeywords ?? false,
      includeBacklinks: options.includeBacklinks ?? false,
      includeCompetitors: options.includeCompetitors ?? false,
    });

    console.log('API: Analysis complete, score:', report.overallScore);
    return NextResponse.json(report);
  } catch (error) {
    console.error('API Analysis error:', error);
    return NextResponse.json(
      { error: `Analysis failed: ${error}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SEO Analysis API',
    usage: 'POST with { url: "https://example.com" }',
    options: {
      includeContent: 'boolean (default: true)',
      includeTechnical: 'boolean (default: true)',
      includeKeywords: 'boolean (default: true)',
      includeBacklinks: 'boolean (default: true)',
      includeCompetitors: 'boolean (default: true)',
    },
  });
}
