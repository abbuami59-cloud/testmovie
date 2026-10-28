import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import https from 'https';

function liveLinksPlugin(): Plugin {
  return {
    name: 'live-links-proxy',
    configureServer(server) {
      server.middlewares.use('/api/live-links', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', 'http://localhost');
          const slug = urlObj.searchParams.get('slug');
          if (!slug) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing slug parameter' }));
            return;
          }

          const targetUrl = `https://cinefreak.net/${slug}/`;
          https.get(
            targetUrl,
            { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } },
            (targetRes) => {
              let data = '';
              targetRes.on('data', (chunk) => (data += chunk));
              targetRes.on('end', () => {
                const containers = [...data.matchAll(/<div class="dlbtn-container">([\s\S]*?)<\/div>/gi)];
                const downloads: { quality: string; size: string; dlLink: string; watchLink: string }[] = [];

                containers.forEach((c) => {
                  const cHtml = c[1];
                  const links = [...cHtml.matchAll(/href="(https?:\/\/new5\.cinecloud\.site\/f\/[^"]+)"/g)].map((x) => x[1]);
                  const beforeHtml = data.slice(Math.max(0, c.index - 500), c.index);
                  const h4Match = [...beforeHtml.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>/gi)].pop();
                  const title = h4Match ? h4Match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : 'HD Download';

                  if (links.length > 0) {
                    downloads.push({
                      quality: title,
                      size: title.match(/\[(\d+[^\]]*MB|\d+[^\]]*GB)\]/i)?.[1] || '',
                      dlLink: links[0],
                      watchLink: links[1] || links[0],
                    });
                  }
                });

                // Fallback for series or other pages: any cinecloud links
                if (downloads.length === 0) {
                  const anyLinks = [
                    ...new Set(
                      [...data.matchAll(/href="(https?:\/\/new5\.cinecloud\.site\/f\/[^"]+)"/g)].map((x) => x[1])
                    ),
                  ];
                  anyLinks.forEach((link, idx) => {
                    downloads.push({
                      quality: `Direct Cloud Link ${idx + 1}`,
                      size: '',
                      dlLink: link,
                      watchLink: link,
                    });
                  });
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, downloads }));
              });
            }
          ).on('error', (err) => {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          });
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(e) }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), liveLinksPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
