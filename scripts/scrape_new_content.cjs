const fs = require('fs');
const https = require('https');
const path = require('path');

function fetchUrl(url, timeoutMs = 8000) {
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

function parsePostPage(html, slug) {
  if (!html || html.length < 500) return null;

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
    poster = anyImg ? anyImg[1] : 'https://cinefreak.net/wp-content/themes/cinefreakv2/assets/img/no-poster.jpg';
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
  const plotMatch = html.match(/Plot Summary:?([\s\S]*?)(?:Screenshots|Streaming|Download|<\/div>)/i) ||
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
    const links = [...cHtml.matchAll(/href="(https?:\/\/new5\.cinecloud\.site\/f\/[^"]+)"/g)].map((x) => x[1]);
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
    // Look for episode rows or blocks: <div class="cft-it">...</div>
    const epRowRegex = /<div class="cft-it">([\s\S]*?)<\/div>\s*<\/div>/gi;
    let match;
    let epNum = 1;
    while ((match = epRowRegex.exec(html)) !== null) {
      const epHtml = match[1];
      const epNameMatch = epHtml.match(/<b>(.*?)<\/b>/i);
      const epName = epNameMatch ? cleanHtmlText(epNameMatch[1]) : `Episode ${epNum}`;
      const watchMatch = epHtml.match(/class="[^"]*cfs-watch[^"]*"[^>]+href="([^"]+)"/i);
      const dlLinkMatches = [...epHtml.matchAll(/class="[^"]*cfs-dl[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
      const epDlLinks = dlLinkMatches.map((dm) => {
        const qMatch = dm[2].match(/<b>(.*?)<\/b>/i);
        const qText = qMatch ? cleanHtmlText(qMatch[1]) : 'HD';
        return { quality: qText, href: dm[1] };
      });

      if (watchMatch || epDlLinks.length > 0) {
        episodes.push({
          epName,
          watchLink: watchMatch ? watchMatch[1] : (epDlLinks[0] ? epDlLinks[0].href : ''),
          dlLinks: epDlLinks,
        });
        epNum++;
      }
    }
  }

  // Fallback if no structured downloads but any Cinecloud links exist
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
    timeAgo: 'Recently added',
    trending: true,
    formats,
    status: isSeries ? 'NEW SERIES' : '',
    has4k: /4k|2160p/i.test(title),
    type,
    rating: '7.0',
    genres,
    releaseDate,
    runtime: isSeries ? '45 Min / Ep' : '2 Hours 10 Minutes',
    country: /bangla/i.test(title) ? 'Bangladesh' : 'India',
    language: /dual audio/i.test(title) ? 'Hindi & English (Dual Audio)' : 'Hindi',
    subtitle: 'English SRT Included',
    quality: /4k/i.test(title) ? '480p | 720p | 1080p | 4K [WEB-DL]' : '480p | 720p | 1080p [WEB-DL]',
    videoFormat: 'MKV (x264 / x265 HEVC)',
    synopsis,
    screenshots: screenshotMatches.slice(0, 8),
    downloads,
    episodes: episodes.length > 0 ? episodes : undefined,
  };
}

async function run() {
  console.log('--- Starting CineFreak New Content Extractor ---');
  const catalogPath = path.resolve(__dirname, '../public/cinefreak_catalog.json');
  const currentCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  console.log(`Current catalog items: ${currentCatalog.length}`);
  const existingSlugs = new Set(currentCatalog.map((m) => m.slug));

  // Crawl first 6 pages of Cinefreak to find all latest post URLs
  const candidateSlugs = [];
  const seenCandidateSlugs = new Set();

  for (let page = 1; page <= 6; page++) {
    const url = page === 1 ? 'https://cinefreak.net/' : `https://cinefreak.net/page/${page}/`;
    console.log(`Fetching page list ${page}: ${url}`);
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
      if (!existingSlugs.has(s) && !seenCandidateSlugs.has(s)) {
        seenCandidateSlugs.add(s);
        candidateSlugs.push(s);
      }
    }
  }

  console.log(`Discovered ${candidateSlugs.length} brand new posts from Cinefreak!`);

  // Fetch each candidate post with polite concurrency (4 at a time) and retries
  const concurrency = 4;
  const newItems = [];

  for (let i = 0; i < candidateSlugs.length; i += concurrency) {
    const batch = candidateSlugs.slice(i, i + concurrency);
    console.log(`Processing batch ${Math.floor(i / concurrency) + 1} / ${Math.ceil(candidateSlugs.length / concurrency)} (${batch.length} items)...`);
    const results = await Promise.all(
      batch.map(async (slug) => {
        const postUrl = `https://cinefreak.net/${slug}/`;
        let html = await fetchUrl(postUrl, 12000);
        if (!html) {
          // retry once after 500ms
          await new Promise((r) => setTimeout(r, 600));
          html = await fetchUrl(postUrl, 14000);
        }
        return parsePostPage(html, slug);
      })
    );

    for (const item of results) {
      if (item && item.title && (item.downloads.length > 0 || (item.episodes && item.episodes.length > 0) || item.screenshots.length > 0)) {
        newItems.push(item);
      }
    }
    // polite small pause between batches
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`Successfully parsed ${newItems.length} valid new movie/series items.`);

  if (newItems.length > 0) {
    // PREPEND new items to the catalog so they are shown at the very top (as newest items)
    // AND KEEP EVERY SINGLE EXISTING ITEM (no content cut!)
    const updatedCatalog = [...newItems, ...currentCatalog];
    console.log(`Catalog expanded from ${currentCatalog.length} to ${updatedCatalog.length} items!`);
    fs.writeFileSync(catalogPath, JSON.stringify(updatedCatalog, null, 2), 'utf8');
    console.log('Saved updated catalog to public/cinefreak_catalog.json');
  } else {
    console.log('No new items needed to be added.');
  }
}

run().catch((err) => {
  console.error('Fatal error during scrape:', err);
  process.exit(1);
});
