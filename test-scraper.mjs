import * as cheerio from 'cheerio';

async function testScraper() {
  console.log('🔍 Testing SEO Agent Team - Web Scraper\n');
  console.log('='.repeat(50));

  const url = 'https://example.com';
  console.log(`\nFetching: ${url}\n`);

  const startTime = Date.now();
  const response = await fetch(url);
  const loadTime = Date.now() - startTime;
  const html = await response.text();

  const $ = cheerio.load(html);

  // Extract data like our agents do
  const title = $('title').text().trim();
  const metaDescription = $('meta[name="description"]').attr('content') || 'Not set';

  const h1 = [];
  const h2 = [];
  $('h1').each((_, el) => { h1.push($(el).text().trim()); });
  $('h2').each((_, el) => { h2.push($(el).text().trim()); });

  $('script, style, nav, footer, header, aside').remove();
  const content = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  const images = [];
  $('img').each((_, el) => {
    images.push({ src: $(el).attr('src') || '', alt: $(el).attr('alt') || '' });
  });

  const links = [];
  const baseUrl = new URL(url);
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    try {
      const linkUrl = new URL(href, url);
      links.push({
        href: linkUrl.href,
        text: $(el).text().trim(),
        isExternal: linkUrl.hostname !== baseUrl.hostname
      });
    } catch {}
  });

  // Display results
  console.log('📊 SCRAPER RESULTS');
  console.log('='.repeat(50));
  console.log(`\n✅ Status: ${response.status}`);
  console.log(`⏱️  Load Time: ${loadTime}ms`);
  console.log(`📄 HTML Size: ${html.length} chars`);

  console.log('\n📝 CONTENT ANALYSIS');
  console.log('-'.repeat(30));
  console.log(`Title: "${title}" (${title.length} chars)`);
  console.log(`Meta Description: ${metaDescription}`);
  console.log(`H1 Tags: ${h1.length > 0 ? h1.join(', ') : 'None'}`);
  console.log(`H2 Tags: ${h2.length > 0 ? h2.join(', ') : 'None'}`);
  console.log(`Word Count: ${wordCount}`);

  console.log('\n🖼️  IMAGES');
  console.log('-'.repeat(30));
  console.log(`Total: ${images.length}`);
  console.log(`With Alt: ${images.filter(i => i.alt).length}`);
  console.log(`Without Alt: ${images.filter(i => !i.alt).length}`);

  console.log('\n🔗 LINKS');
  console.log('-'.repeat(30));
  console.log(`Internal: ${links.filter(l => !l.isExternal).length}`);
  console.log(`External: ${links.filter(l => l.isExternal).length}`);

  console.log('\n🔧 TECHNICAL');
  console.log('-'.repeat(30));
  console.log(`HTTPS: ${url.startsWith('https') ? 'Yes ✅' : 'No ❌'}`);
  console.log(`Has Viewport: ${html.includes('viewport') ? 'Yes ✅' : 'No ❌'}`);
  console.log(`Has Canonical: ${html.includes('canonical') ? 'Yes ✅' : 'No ❌'}`);
  console.log(`Has JSON-LD: ${html.includes('application/ld+json') ? 'Yes ✅' : 'No ❌'}`);

  console.log('\n' + '='.repeat(50));
  console.log('✨ This is the data our AI agents would analyze!');
  console.log('='.repeat(50));
}

testScraper().catch(console.error);
