import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

// A Vite plugin to handle our API routes locally without needing a separate Express server
const apiPlugin = () => ({
  name: 'api-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      // Parse query params manually
      const url = new URL(req.url, `http://${req.headers.host}`);
      
      if (url.pathname === '/api/search') {
        const q = url.searchParams.get('q');
        if (!q) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Query parameter "q" is required' }));
        }

        const apiKey = process.env.VITE_SERPAPI_KEY || process.env.SERPAPI_KEY;
        if (!apiKey) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'SERPAPI_KEY is missing in .env' }));
        }

        try {
          const response = await axios.get('https://serpapi.com/search.json', {
            params: { engine: 'google_shopping', q: q, api_key: apiKey, hl: 'en', gl: 'us' }
          });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ results: response.data.shopping_results || [] }));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to fetch search results from SerpApi' }));
        }
        return;
      }

      if (url.pathname === '/api/lens') {
        const imageUrl = url.searchParams.get('url');
        if (!imageUrl) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Query parameter "url" is required' }));
        }

        const apiKey = process.env.VITE_SERPAPI_KEY || process.env.SERPAPI_KEY;
        if (!apiKey) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'SERPAPI_KEY is missing in .env' }));
        }

        try {
          const response = await axios.get('https://serpapi.com/search.json', {
            params: { engine: 'google_lens', url: imageUrl, api_key: apiKey, hl: 'en', country: 'us' }
          });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ results: response.data.visual_matches || [] }));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to fetch image search results from SerpApi' }));
        }
        return;
      }

      next();
    })
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiPlugin()]
})