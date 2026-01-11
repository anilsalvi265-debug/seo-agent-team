import { scrapePage } from '@/tools/web-scraper';
import { analyzeContent } from './content-agent';
import { analyzeTechnical } from './technical-agent';
import { analyzeKeywords } from './keyword-agent';
import { analyzeBacklinks } from './backlink-agent';
import { analyzeCompetitors } from './competitor-agent';
import { generateReport, createFullReport } from './reporting-agent';
import {
  SEOAnalysisRequest,
  SEOReport,
  ContentAnalysis,
  TechnicalAnalysis,
  KeywordAnalysis,
  BacklinkAnalysis,
  CompetitorAnalysis,
} from '@/types/seo';

export interface OrchestratorProgress {
  stage: string;
  progress: number;
  message: string;
}

export async function runSEOAnalysis(
  request: SEOAnalysisRequest,
  onProgress?: (progress: OrchestratorProgress) => void
): Promise<SEOReport> {
  const {
    url,
    includeContent = true,
    includeTechnical = true,
    includeKeywords = false,
    includeBacklinks = false,
    includeCompetitors = false,
  } = request;

  const report = (stage: string, progress: number, message: string) => {
    onProgress?.({ stage, progress, message });
  };

  // Step 1: Scrape the page
  report('scraping', 10, 'Fetching page content...');
  const pageData = await scrapePage(url);
  report('scraping', 20, 'Page content fetched successfully');

  // Step 2: Run all analyses in parallel
  report('analyzing', 25, 'Starting AI agent analysis...');
  console.log('Orchestrator: Starting agents, content:', includeContent, 'technical:', includeTechnical);

  // Run analyses with proper typing
  const [
    contentResult,
    technicalResult,
    keywordsResult,
    backlinksResult,
    competitorsResult,
  ] = await Promise.all([
    includeContent ? analyzeContent(pageData) : Promise.resolve(null),
    includeTechnical ? analyzeTechnical(pageData) : Promise.resolve(null),
    includeKeywords ? analyzeKeywords(pageData) : Promise.resolve(null),
    includeBacklinks ? analyzeBacklinks(pageData) : Promise.resolve(null),
    includeCompetitors ? analyzeCompetitors(pageData) : Promise.resolve(null),
  ]);

  console.log('Orchestrator: Content result:', contentResult?.success, contentResult?.error);
  console.log('Orchestrator: Technical result:', technicalResult?.success, technicalResult?.error);
  report('analyzing', 70, 'All agents completed analysis');

  // Step 3: Generate the final report
  report('reporting', 80, 'Generating comprehensive report...');

  // Extract data with proper types
  const contentData: ContentAnalysis | undefined =
    contentResult?.success ? contentResult.data : undefined;
  const technicalData: TechnicalAnalysis | undefined =
    technicalResult?.success ? technicalResult.data : undefined;
  const keywordsData: KeywordAnalysis | undefined =
    keywordsResult?.success ? keywordsResult.data : undefined;
  const backlinksData: BacklinkAnalysis | undefined =
    backlinksResult?.success ? backlinksResult.data : undefined;
  const competitorsData: CompetitorAnalysis | undefined =
    competitorsResult?.success ? competitorsResult.data : undefined;

  const reportInput = {
    url,
    content: contentData,
    technical: technicalData,
    keywords: keywordsData,
    backlinks: backlinksData,
    competitors: competitorsData,
  };

  const reportResult = await generateReport(reportInput);

  report('reporting', 95, 'Report generated successfully');

  // Step 4: Create the final report object
  const finalReport = createFullReport(
    url,
    reportResult.success ? reportResult.data!.overallScore : 0,
    reportResult.success ? reportResult.data!.recommendations : [],
    contentData,
    technicalData,
    keywordsData,
    backlinksData,
    competitorsData
  );

  report('complete', 100, 'Analysis complete!');

  return finalReport;
}

export async function runQuickAnalysis(url: string): Promise<SEOReport> {
  return runSEOAnalysis({
    url,
    includeContent: true,
    includeTechnical: true,
    includeKeywords: false,
    includeBacklinks: false,
    includeCompetitors: false,
  });
}

export async function runFullAnalysis(url: string): Promise<SEOReport> {
  return runSEOAnalysis({
    url,
    includeContent: true,
    includeTechnical: true,
    includeKeywords: true,
    includeBacklinks: true,
    includeCompetitors: true,
  });
}
