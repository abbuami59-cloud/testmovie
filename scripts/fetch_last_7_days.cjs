const fs = require('fs');
const https = require('https');
const path = require('path');

// 7 days cutoff timestamp (2026-10-22 00:00:00 UTC)
const CUTOFF_TIMESTAMP = new Date('2026-10-22T00:00:00.000Z').getTime();

function fetchUrl(url, timeoutMs = 10000) {
  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchUrl(res.headers.location, timeoutMs).then(resolve);
        }
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(data));
      }
    );
    req.on('error', () => resolve(''));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve('');
    });
  });
}

function cleanHtmlText(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatRelativeTime(pubDateStr) {
  if (!pubDateStr) return 'Recently added';
  const pubTime = new Date(pubDateStr).getTime();
  if (isNaN(pubTime)) return 'Recently added';
  const now = new Date('2026-10-29T12:50:00Z').getTime();
  const diffHours = Math.floor((now - pubTime) / (3600 * 1000));
  if (diffHours < 24) {
    return diffHours <= 1 ? 'Just now' : `${diffHours} hours ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
}

function parsePostPage(html, slug) {
  if (!html || html.length < 500) return null;

  // Published time check
  const pubMatch =
    html.match(/property="article:published_time"\s+content="([^"]+)"/i) ||
    html.match(/property="og:updated_time"\s+content="([^"]+)"/i) ||
    html.match(/<time[^>]+datetime="([^"]+)"/i);

  const publishedTimeStr = pubMatch ? pubMatch[1] : null;
  const publishedTime = publishedTimeStr ? new Date(publishedTimeStr).getTime() : null;

  // Title
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  let title = h1Match ? cleanHtmlText(h1Match[1]) : slug;
  if (!title) title = slug;

  // Clean Name
  let cleanName = title.split('(')[0].replace(/\[.*?\]/g, '').trim();
  if (!cleanName) {
    cleanName = slug
      .replace(/-20\d\d.*/, '')
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // Release year
  const yearMatch = title.match(/\b(19\d\d|20\d\d)\b/);
  const releaseDate = yearMatch ? yearMatch[1] : '2026';

  // Poster
  const posterMatches = [
    ...html.matchAll(
      /<img[^>]+(?:src|data-src)="([^"]*(?:image\.tmdb\.org|cineimg\.xyz|wp-content\/uploads)[^"]*)"/gi
    ),
  ].map((m) => m[1]);

  let poster = posterMatches[0];
  if (!poster) {
    const anyImg = html.match(/<img[^>]+src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp))"/i);
    poster = anyImg
      ? anyImg[1]
      : 'https://cinefreak.net/wp-content/themes/cinefreakv2/assets/img/no-poster.jpg';
  }

  // Screenshots
  const screenshotMatches = [
    ...new Set(
      [
        ...html.matchAll(
          /href="(https?:\/\/(?:cineimg\.xyz|image\.tmdb\.org)[^"]+\.(?:png|jpg|jpeg|webp))"/gi
        ),
      ].map((m) => m[1])
    ),
  ];

  // Synopsis / Storyline
  let synopsis = '';
  const plotMatch =
    html.match(/Plot Summary:?([\s\S]*?)(?:Screenshots|Streaming|Download|<\/div>)/i) ||
    html.match(/Storyline:?([\s\S]*?)(?:Screenshots|Streaming|Download|<\/div>)/i);
  if (plotMatch) {
    synopsis = cleanHtmlText(plotMatch[1]);
  }
  if (!synopsis || synopsis.length < 20) {
    synopsis = `Watch and download ${cleanName} in full high-definition quality with fast Google Drive and Direct cloud download servers. Enjoy buffer-free streaming and multiple audio options.`;
  }

  // Determine Type: Series vs Movie
  const isSeries =
    /series|season|episode|k-drama|anime/i.test(title) ||
    /series|season|episode/i.test(slug) ||
    html.includes('cft-it') ||
    html.includes('cfs-dl');

  const type = isSeries ? 'Series' : 'Movie';

  // Badges & Formats
  const formats = [];
  if (/web-dl/i.test(title) || /web-dl/i.test(html)) formats.push('WEB-DL');
  if (/dual audio/i.test(title)) formats.push('Dual Audio');
  if (/hindi/i.test(title)) formats.push('Hindi Dubbed');
  if (/bangla/i.test(title)) formats.push('Bangla Movies');
  if (isSeries) formats.push('WEB-Series');
  if (/4k|2160p/i.test(title)) formats.push('4K-UHD');
  if (formats.length === 0) formats.push('WEB-DL', 'Movies');

  // Genres
  const genres = [];
  const genreMatch = html.match(/Genre:?([\s\S]*?)(?:<br|<\/p|<\/li)/i);
  if (genreMatch) {
    const rawG = cleanHtmlText(genreMatch[1]);
    rawG.split(/[,|/]/).forEach((g) => {
      const trimmed = g.trim();
      if (trimmed && trimmed.length < 25) genres.push(trimmed);
    });
  }
  if (genres.length === 0) {
    if (/action/i.test(html)) genres.push('Action');
    if (/thriller/i.test(html)) genres.push('Thriller');
    if (/drama/i.test(html)) genres.push('Drama');
    if (/comedy/i.test(html)) genres.push('Comedy');
    if (/romance/i.test(html)) genres.push('Romance');
    if (genres.length === 0) genres.push('Drama', 'Action');
  }

  // Movie Download Containers
  const downloads = [];
  const containers = [...html.matchAll(/<div class="dlbtn-container">([\s\S]*?)<\/div>/gi)];
  containers.forEach((c) => {
    const cHtml = c[1];
    const links = [...cHtml.matchAll(/href="(https?:\/\/new5\.cinecloud\.site\/f\/[^"]+)"/g)].map(
      (x) => x[1]
    );
    const beforeHtml = html.slice(Math.max(0, c.index - 500), c.index);
    const h4Match = [...beforeHtml.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>/gi)].pop();
    const qTitle = h4Match ? cleanHtmlText(h4Match[1]) : `${cleanName} Download`;
    if (links.length > 0) {
      downloads.push({
        quality: qTitle,
        size: qTitle.match(/\[(\d+[^\]]*MB|\d+[^\]]*GB)\]/i)?.[1] || '',
        dlLink: links[0],
        watchLink: links[1] || links[0],
      });
    }
  });

  // Series Episodes
  const episodes = [];
  if (isSeries) {
    const epRowRegex = /<div class="cft-it">([\s\S]*?)<\/div>\s*<\/div>/gi;
    let match;
    let epNum = 1;
    while ((match = epRowRegex.exec(html)) !== null) {
      const epHtml = match[1];
      const epNameMatch = epHtml.match(/<b>(.*?)<\/b>/i);
      const epName = epNameMatch ? cleanHtmlText(epNameMatch[1]) : `Episode ${epNum}`;
      const watchMatch = epHtml.match(/class="[^"]*cfs-watch[^"]*"[^>]+href="([^"]+)"/i);
      const dlLinkMatches = [
        ...epHtml.matchAll(
          /class="[^"]*cfs-dl[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
        ),
      ];
      const epDlLinks = dlLinkMatches.map((dm) => {
        const qMatch = dm[2].match(/<b>(.*?)<\/b>/i);
        const qText = qMatch ? cleanHtmlText(qMatch[1]) : 'HD';
        return { quality: qText, href: dm[1] };
      });

      if (watchMatch || epDlLinks.length > 0) {
        episodes.push({
          epName,
          watchLink: watchMatch ? watchMatch[1] : epDlLinks[0] ? epDlLinks[0].href : '',
          dlLinks: epDlLinks,
        });
        epNum++;
      }
    }
  }

  // Fallback if no structured containers but CineCloud links exist
  const allCinecloud = [
    ...new Set(
      [...html.matchAll(/href="(https?:\/\/new5\.cinecloud\.site\/f\/[^"]+)"/g)].map((x) => x[1])
    ),
  ];

  if (downloads.length === 0 && episodes.length === 0 && allCinecloud.length > 0) {
    allCinecloud.forEach((link, idx) => {
      downloads.push({
        quality: `${cleanName} - Direct Cloud Server ${idx + 1}`,
        size: '',
        dlLink: link,
        watchLink: link,
      });
    });
  }

  return {
    id: `cf-${slug}`,
    slug,
    title,
    cleanName,
    poster,
    timeAgo: formatRelativeTime(publishedTimeStr),
    trending: true,
    formats,
    status: isSeries ? 'NEW' : '',
    has4k: /4k|2160p/i.test(title),
    type,
    rating: '7.5',
    genres,
    releaseDate,
    runtime: isSeries ? '45 Min / Ep' : '2 Hours 10 Minutes',
    country: /bangla/i.test(title) ? 'Bangladesh' : 'India',
    language: /dual audio/i.test(title) ? 'Hindi & English (Dual Audio)' : 'Hindi',
    subtitle: 'English SRT Included',
    quality: /4k/i.test(title)
      ? '480p | 720p | 1080p | 4K [WEB-DL]'
      : '480p | 720p | 1080p [WEB-DL]',
    videoFormat: 'MKV (x264 / x265 HEVC)',
    synopsis,
    screenshots: screenshotMatches.slice(0, 8),
    downloads,
    episodes: episodes.length > 0 ? episodes : undefined,
    publishedTime,
    publishedTimeStr,
  };
}

async function run() {
  console.log('=== Crawling Cinefreak for ALL Last 7 Days Contents ===');
  console.log('Cutoff timestamp:', new Date(CUTOFF_TIMESTAMP).toISOString());

  // Collect candidate slugs across pages 1 to 13
  const candidateSlugs = [];
  const seenSlugs = new Set();

  for (let page = 1; page <= 13; page++) {
    const url = page === 1 ? 'https://cinefreak.net/' : `https://cinefreak.net/page/${page}/`;
    console.log(`Scanning page ${page}...`);
    const html = await fetchUrl(url);
    if (!html) continue;

    const regex = /href="https:\/\/cinefreak\.net\/([a-z0-9\-]+)\/"/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const s = match[1];
      if (
        [
          'web-series', 'animation', 'bangla-movies', 'bangla-dubbed', 'chinese', 'dual-audio',
          'english-movies', 'hindi-movies', 'hindi-dubbed-movies', 'japanese', 'k-drama',
          'korean', 'kannada', 'telugu', 'tamil', 'malayalam', 'marathi', 'punjabi',
          'tv-shows', 'trending', 'movies', 'genre', 'contact-us', 'dmca', 'about-us',
          'privacy-policy', 'disclaimer', 'request', 'mcu', 'spanish', 'indonesian', 'others',
          'collections', 'adult', 'anime', 'horror', 'reality-competition', 'russian', 'studio-dub', 'tv-show'
        ].includes(s)
      ) {
        continue;
      }
      if (!seenSlugs.has(s)) {
        seenSlugs.add(s);
        candidateSlugs.push(s);
      }
    }
  }

  console.log(`Found ${candidateSlugs.length} candidate post slugs across pages 1 to 13.`);

  // Load existing catalog
  const catalogPath = path.resolve(__dirname, '../public/cinefreak_catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const catalogMap = new Map();
  for (const m of catalog) {
    catalogMap.set(m.slug, m);
  }

  // Fetch each candidate with concurrency = 4
  const concurrency = 4;
  let addedCount = 0;
  let updatedCount = 0;
  const recent7DaysItems = [];

  for (let i = 0; i < candidateSlugs.length; i += concurrency) {
    const batch = candidateSlugs.slice(i, i + concurrency);
    console.log(`Processing batch ${Math.floor(i / concurrency) + 1} / ${Math.ceil(candidateSlugs.length / concurrency)}...`);
    const results = await Promise.all(
      batch.map(async (slug) => {
        const postUrl = `https://cinefreak.net/${slug}/`;
        let html = await fetchUrl(postUrl, 12000);
        if (!html) {
          await new Promise((r) => setTimeout(r, 500));
          html = await fetchUrl(postUrl, 14000);
        }
        return parsePostPage(html, slug);
      })
    );

    for (const item of results) {
      if (!item) continue;
      // Check if item is within last 7 days OR published on or after cutoff
      const isLast7Days = !item.publishedTime || item.publishedTime >= CUTOFF_TIMESTAMP;
      if (isLast7Days && (item.downloads.length > 0 || (item.episodes && item.episodes.length > 0) || item.screenshots.length > 0)) {
        recent7DaysItems.push(item);
        if (catalogMap.has(item.slug)) {
          // Update existing with freshest links
          const existing = catalogMap.get(item.slug);
          Object.assign(existing, item);
          updatedCount++;
        } else {
          // Brand new
          catalogMap.set(item.slug, item);
          addedCount++;
        }
      }
    }
    await new Promise((r) => setTimeout(r, 350));
  }

  console.log(`Processed all batches. Total last 7 days items parsed: ${recent7DaysItems.length}`);
  console.log(`New additions: ${addedCount}, Updated existing: ${updatedCount}`);

  // Construct updated catalog: place the last-7-days items at the front, followed by remaining items
  const recentSlugs = new Set(recent7DaysItems.map((m) => m.slug));
  const otherItems = Array.from(catalogMap.values()).filter((m) => !recentSlugs.has(m.slug));
  const finalCatalog = [...recent7DaysItems, ...otherItems];

  console.log(`Final catalog total items: ${finalCatalog.length}`);
  fs.writeFileSync(catalogPath, JSON.stringify(finalCatalog, null, 2), 'utf8');

  // Now regenerate src/data/cinefreakData.ts so ALL items are 100% hardcoded in TypeScript
  const buildScript = path.resolve(__dirname, 'build_cinefreak_data.cjs');
  require(buildScript);
  console.log('Successfully hardcoded all items into src/data/cinefreakData.ts!');
}

run().catch((err) => {
  console.error('Scraper failed:', err);
  process.exit(1);
});
