import { NextRequest, NextResponse } from 'next/server';
import { scrapePage } from '@/tools/web-scraper';
import { analyzeKeywords } from '@/agents/keyword-agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

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

    // Scrape the page
    const pageData = await scrapePage(url);

    // Analyze keywords
    const result = await analyzeKeywords(pageData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url,
      timestamp: new Date().toISOString(),
      keywords: result.data,
    });
  } catch (error) {
    console.error('Keyword analysis error:', error);
    return NextResponse.json(
      { error: `Keyword analysis failed: ${error}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Keyword Research API',
    usage: 'POST with { url: "https://example.com" }',
  });
}
