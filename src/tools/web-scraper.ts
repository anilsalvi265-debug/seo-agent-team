import * as cheerio from 'cheerio';
import { PageData } from '@/types/seo';

export async function scrapePage(url: string): Promise<PageData> {
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SEO-Agent-Bot/1.0 (SEO Analysis Tool)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const loadTime = Date.now() - startTime;
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    const title = $('title').text().trim();

    // Extract meta description
    const metaDescription =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';

    // Extract headings
    const h1: string[] = [];
    const h2: string[] = [];
    const h3: string[] = [];

    $('h1').each((_, el) => { h1.push($(el).text().trim()); });
    $('h2').each((_, el) => { h2.push($(el).text().trim()); });
    $('h3').each((_, el) => { h3.push($(el).text().trim()); });

    // Extract main content (remove scripts, styles, nav, footer)
    $('script, style, nav, footer, header, aside').remove();
    const content = $('body').text().replace(/\s+/g, ' ').trim();

    // Extract images
    const images: { src: string; alt: string }[] = [];
    $('img').each((_, el) => {
      images.push({
        src: $(el).attr('src') || '',
        alt: $(el).attr('alt') || '',
      });
    });

    // Extract links
    const baseUrl = new URL(url);
    const links: { href: string; text: string; isExternal: boolean }[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();

      try {
        const linkUrl = new URL(href, url);
        const isExternal = linkUrl.hostname !== baseUrl.hostname;
        links.push({ href: linkUrl.href, text, isExternal });
      } catch {
        // Invalid URL, skip
      }
    });

    return {
      url,
      html,
      title,
      metaDescription,
      headings: { h1, h2, h3 },
      content,
      images,
      links,
      statusCode: response.status,
      loadTime,
    };
  } catch (error) {
    throw new Error(`Failed to scrape ${url}: ${error}`);
  }
}

export function extractKeywords(content: string): Record<string, number> {
  const words = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 3);

  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'were', 'will',
    'would', 'there', 'their', 'what', 'about', 'which', 'when', 'make',
    'like', 'time', 'just', 'know', 'take', 'people', 'into', 'year', 'your',
    'good', 'some', 'could', 'them', 'other', 'than', 'then', 'look', 'only',
    'come', 'over', 'such', 'also', 'back', 'after', 'use', 'two', 'how',
    'first', 'well', 'even', 'want', 'because', 'these', 'give', 'most',
    'this', 'that', 'with', 'from', 'they', 'more', 'being', 'does', 'doing',
  ]);

  const wordCounts: Record<string, number> = {};
  words.forEach((word) => {
    if (!stopWords.has(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });

  // Sort by frequency and return top 20
  const sorted = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20);

  return Object.fromEntries(sorted);
}

export function calculateReadability(content: string): number {
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = content.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((count, word) => {
    return count + countSyllables(word);
  }, 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  // Flesch Reading Ease formula
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  const score =
    206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}
