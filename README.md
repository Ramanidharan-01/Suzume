# SUZUME - Journey to the Ever-After

Static, deploy-ready web experience built from the pasted standalone HTML.

## Files

- `index.html` - page markup and section wiring
- `assets/styles.css` - layout, animations, and responsive styling
- `assets/app.js` - canvas animation, story navigation, overlays, audio, and scroll behavior
- `tools/check-static.js` - lightweight static wiring check

## Run Without A Local Server

This project has no build step and no install step. It can be hosted as static files on GitHub Pages, Netlify, Vercel static output, Cloudflare Pages, or any plain static host.

For a local quick view, opening `index.html` directly in a browser is enough. No dev server is required.

## Checks

If Node is available, run:

```bash
npm run check
```

The check validates JavaScript syntax and confirms the key static assets and DOM hooks are wired.

## Background Images

The page uses remote promotional images from the official `suzume-tojimari-movie.jp` site as blended background layers. The CSS keeps gradient fallbacks underneath those images, so the site remains usable if the remote images are blocked or offline.
