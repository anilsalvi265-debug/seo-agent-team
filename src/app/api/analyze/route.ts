import { NextRequest, NextResponse } from 'next/server';
import { runSEOAnalysis } from '@/agents/orchestrator';
import { SEOAnalysisRequest } from '@/types/seo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, ...options } = body as SEOAnalysisRequest;

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
      includeKeywords: options.includeKeywords ?? true,
      includeBacklinks: options.includeBacklinks ?? true,
      includeCompetitors: options.includeCompetitors ?? true,
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Analysis error:', error);
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
