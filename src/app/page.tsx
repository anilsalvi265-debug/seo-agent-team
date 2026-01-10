'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEOReport, Recommendation } from '@/types/seo';
import {
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Settings,
  Link2,
  Users,
  TrendingUp,
} from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [report, setReport] = useState<SEOReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeUrl = async () => {
    if (!url) return;

    setLoading(true);
    setProgress(0);
    setError(null);
    setReport(null);
    setStatusMessage('Starting analysis...');

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await response.json();
      setProgress(100);
      setStatusMessage('Analysis complete!');
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      clearInterval(progressInterval);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content':
        return <FileText className="h-4 w-4" />;
      case 'technical':
        return <Settings className="h-4 w-4" />;
      case 'keywords':
        return <TrendingUp className="h-4 w-4" />;
      case 'backlinks':
        return <Link2 className="h-4 w-4" />;
      case 'competitor':
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            SEO Agent Team
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Powered by 7 specialized AI agents that analyze your website for content,
            technical SEO, keywords, backlinks, and competitive insights.
          </p>
        </div>

        {/* URL Input */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>Analyze Your Website</CardTitle>
            <CardDescription>
              Enter a URL to get a comprehensive SEO analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="flex-1"
              />
              <Button onClick={analyzeUrl} disabled={loading || !url}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>

            {loading && (
              <div className="mt-4">
                <Progress value={progress} className="mb-2" />
                <p className="text-sm text-slate-500 text-center">{statusMessage}</p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {report && (
          <div className="max-w-6xl mx-auto">
            {/* Score Card */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      SEO Report for {new URL(report.url).hostname}
                    </h2>
                    <p className="text-slate-500">
                      Generated on {new Date(report.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`text-6xl font-bold ${getScoreColor(
                      report.overallScore
                    )} ${getScoreBg(report.overallScore)} p-6 rounded-full`}
                  >
                    {report.overallScore}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Tabs defaultValue="recommendations" className="mb-8">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
                <TabsTrigger value="competitors">Competitors</TabsTrigger>
              </TabsList>

              <TabsContent value="recommendations">
                <Card>
                  <CardHeader>
                    <CardTitle>Prioritized Recommendations</CardTitle>
                    <CardDescription>
                      Actionable improvements sorted by impact
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {report.recommendations.map((rec: Recommendation, i: number) => (
                        <div
                          key={i}
                          className="flex gap-4 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {getPriorityIcon(rec.priority)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{rec.title}</span>
                              <Badge variant="outline" className="flex items-center gap-1">
                                {getCategoryIcon(rec.category)}
                                {rec.category}
                              </Badge>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">
                              {rec.description}
                            </p>
                            <p className="text-slate-500 text-xs mt-1">
                              Impact: {rec.impact}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.content ? (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-2">Title Tag</h4>
                          <p className="text-slate-600">{report.content.title.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge>{report.content.title.length} chars</Badge>
                            <Badge className={getScoreColor(report.content.title.score)}>
                              Score: {report.content.title.score}
                            </Badge>
                          </div>
                          {report.content.title.suggestions.length > 0 && (
                            <ul className="mt-2 text-sm text-slate-500 list-disc list-inside">
                              {report.content.title.suggestions.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Meta Description</h4>
                          <p className="text-slate-600">
                            {report.content.metaDescription.text || 'Not set'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge>{report.content.metaDescription.length} chars</Badge>
                            <Badge
                              className={getScoreColor(
                                report.content.metaDescription.score
                              )}
                            >
                              Score: {report.content.metaDescription.score}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Headings</h4>
                          <p className="text-slate-600 text-sm">
                            {report.content.headings.structure}
                          </p>
                          <Badge
                            className={`mt-1 ${getScoreColor(
                              report.content.headings.score
                            )}`}
                          >
                            Score: {report.content.headings.score}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Content Quality</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm text-slate-500">Word Count</span>
                              <p className="font-medium">
                                {report.content.content.wordCount}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-slate-500">Readability</span>
                              <p className="font-medium">
                                {report.content.content.readabilityScore}/100
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Images</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <span className="text-sm text-slate-500">Total</span>
                              <p className="font-medium">{report.content.images.total}</p>
                            </div>
                            <div>
                              <span className="text-sm text-slate-500">With Alt</span>
                              <p className="font-medium text-green-600">
                                {report.content.images.withAlt}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-slate-500">Without Alt</span>
                              <p className="font-medium text-red-600">
                                {report.content.images.withoutAlt}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500">Content analysis not available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="technical">
                <Card>
                  <CardHeader>
                    <CardTitle>Technical SEO Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.technical ? (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Performance</h4>
                          <p className="text-sm text-slate-600">
                            Load Time: {report.technical.performance.loadTime}ms
                          </p>
                          <Badge
                            className={getScoreColor(report.technical.performance.score)}
                          >
                            Score: {report.technical.performance.score}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Mobile Friendliness</h4>
                          <p className="text-sm text-slate-600">
                            {report.technical.mobile.isMobileFriendly
                              ? 'Mobile friendly'
                              : 'Not mobile friendly'}
                          </p>
                          <Badge className={getScoreColor(report.technical.mobile.score)}>
                            Score: {report.technical.mobile.score}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Security</h4>
                          <p className="text-sm text-slate-600">
                            HTTPS: {report.technical.security.hasHttps ? 'Yes' : 'No'}
                          </p>
                          <Badge
                            className={getScoreColor(report.technical.security.score)}
                          >
                            Score: {report.technical.security.score}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Crawlability</h4>
                          <p className="text-sm text-slate-600">
                            Canonical:{' '}
                            {report.technical.crawlability.canonicalUrl || 'Not set'}
                          </p>
                          <Badge
                            className={getScoreColor(report.technical.crawlability.score)}
                          >
                            Score: {report.technical.crawlability.score}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Structured Data</h4>
                          <p className="text-sm text-slate-600">
                            {report.technical.schema.hasStructuredData
                              ? `Found: ${report.technical.schema.types.join(', ')}`
                              : 'No structured data found'}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Links</h4>
                          <p className="text-sm text-slate-600">
                            Internal: {report.technical.links.internal} | External:{' '}
                            {report.technical.links.external}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500">Technical analysis not available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="keywords">
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.keywords ? (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-2">Primary Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {report.keywords.primaryKeywords.map((kw, i) => (
                              <Badge key={i} variant="default">
                                {kw.keyword}
                                <span className="ml-1 text-xs opacity-70">
                                  ({kw.difficulty})
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Secondary Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {report.keywords.secondaryKeywords.map((kw, i) => (
                              <Badge key={i} variant="secondary">
                                {kw.keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Long-tail Suggestions</h4>
                          <ul className="list-disc list-inside text-sm text-slate-600">
                            {report.keywords.longTailSuggestions.map((kw, i) => (
                              <li key={i}>{kw}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Content Gaps</h4>
                          <ul className="list-disc list-inside text-sm text-slate-600">
                            {report.keywords.contentGaps.map((gap, i) => (
                              <li key={i}>{gap}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500">Keyword analysis not available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="backlinks">
                <Card>
                  <CardHeader>
                    <CardTitle>Backlink Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.backlinks ? (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-2">Link Building Opportunities</h4>
                          <ul className="list-disc list-inside text-sm text-slate-600">
                            {report.backlinks.linkBuildingOpportunities.map((opp, i) => (
                              <li key={i}>{opp}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">
                            Recommended Anchor Text Distribution
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(report.backlinks.anchorTextDistribution).map(
                              ([type, pct]) => (
                                <div key={type} className="flex items-center gap-2">
                                  <span className="text-sm capitalize w-24">{type}</span>
                                  <Progress value={pct as number} className="flex-1" />
                                  <span className="text-sm w-12">{pct}%</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500">Backlink analysis not available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="competitors">
                <Card>
                  <CardHeader>
                    <CardTitle>Competitor Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.competitors ? (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-4">Identified Competitors</h4>
                          <div className="space-y-4">
                            {report.competitors.competitors.map((comp, i) => (
                              <div key={i} className="p-4 border rounded-lg">
                                <h5 className="font-medium">{comp.url}</h5>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                  <div>
                                    <span className="text-sm text-slate-500">
                                      Strengths
                                    </span>
                                    <ul className="text-sm text-green-600 list-disc list-inside">
                                      {comp.strengths.map((s, j) => (
                                        <li key={j}>{s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <span className="text-sm text-slate-500">
                                      Weaknesses
                                    </span>
                                    <ul className="text-sm text-red-600 list-disc list-inside">
                                      {comp.weaknesses.map((w, j) => (
                                        <li key={j}>{w}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Strategic Opportunities</h4>
                          <ul className="list-disc list-inside text-sm text-slate-600">
                            {report.competitors.opportunities.map((opp, i) => (
                              <li key={i}>{opp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500">Competitor analysis not available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-slate-500 text-sm mt-12">
          <p>Powered by Claude AI and 7 specialized SEO agents</p>
        </footer>
      </div>
    </div>
  );
}
