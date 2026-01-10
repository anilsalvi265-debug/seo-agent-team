// SEO Analysis Types

export interface SEOAnalysisRequest {
  url: string;
  includeContent?: boolean;
  includeTechnical?: boolean;
  includeKeywords?: boolean;
  includeBacklinks?: boolean;
  includeCompetitors?: boolean;
}

export interface ContentAnalysis {
  title: {
    text: string;
    length: number;
    score: number;
    suggestions: string[];
  };
  metaDescription: {
    text: string;
    length: number;
    score: number;
    suggestions: string[];
  };
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    structure: string;
    score: number;
    suggestions: string[];
  };
  content: {
    wordCount: number;
    readabilityScore: number;
    keywordDensity: Record<string, number>;
    suggestions: string[];
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    suggestions: string[];
  };
}

export interface TechnicalAnalysis {
  performance: {
    loadTime: number;
    score: number;
    suggestions: string[];
  };
  mobile: {
    isMobileFriendly: boolean;
    viewportSet: boolean;
    score: number;
    suggestions: string[];
  };
  security: {
    hasHttps: boolean;
    hasSecurityHeaders: boolean;
    score: number;
    suggestions: string[];
  };
  crawlability: {
    robotsTxt: boolean;
    sitemap: boolean;
    canonicalUrl: string | null;
    score: number;
    suggestions: string[];
  };
  schema: {
    hasStructuredData: boolean;
    types: string[];
    suggestions: string[];
  };
  links: {
    internal: number;
    external: number;
    broken: string[];
    suggestions: string[];
  };
}

export interface KeywordAnalysis {
  primaryKeywords: KeywordData[];
  secondaryKeywords: KeywordData[];
  longTailSuggestions: string[];
  contentGaps: string[];
  competitorKeywords: string[];
}

export interface KeywordData {
  keyword: string;
  volume: string;
  difficulty: string;
  currentRank?: number;
  opportunity: string;
}

export interface BacklinkAnalysis {
  totalBacklinks: number;
  uniqueDomains: number;
  topReferrers: {
    domain: string;
    authority: string;
    linkCount: number;
  }[];
  anchorTextDistribution: Record<string, number>;
  linkBuildingOpportunities: string[];
  toxicLinks: string[];
}

export interface CompetitorAnalysis {
  competitors: {
    url: string;
    strengths: string[];
    weaknesses: string[];
    keywordsRanking: string[];
  }[];
  gaps: string[];
  opportunities: string[];
}

export interface SEOReport {
  id: string;
  url: string;
  timestamp: string;
  overallScore: number;
  content?: ContentAnalysis;
  technical?: TechnicalAnalysis;
  keywords?: KeywordAnalysis;
  backlinks?: BacklinkAnalysis;
  competitors?: CompetitorAnalysis;
  recommendations: Recommendation[];
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'content' | 'technical' | 'keywords' | 'backlinks' | 'competitor';
  title: string;
  description: string;
  impact: string;
}

export interface AgentResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PageData {
  url: string;
  html: string;
  title: string;
  metaDescription: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  content: string;
  images: { src: string; alt: string }[];
  links: { href: string; text: string; isExternal: boolean }[];
  statusCode: number;
  loadTime: number;
}
