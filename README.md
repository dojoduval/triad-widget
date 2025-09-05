# Triad Widget Starter (React → Web Component → Wix Custom Element)

This repo packages a Triple Triad–style mini-game as a **Web Component** (`<triad-widget>`) you can host on **GitHub Pages** and embed in **Wix** without iframes.

## Quickstart

```bash
npm install
npm run build
```

- This produces `dist/triad-widget.js` — a single self-executing bundle that registers the custom element globally.
- A demo page is in `public/index.html`. When published to Pages, it will load `triad-widget.js` from the site root.

## Local Preview

```bash
npm run dev
# open http://localhost:5173/public/index.html
```

> If the script fails to load in dev, adjust the `<script src="/triad-widget.js">` path to `http://localhost:5173/triad-widget.js` for local testing.

## Deploy to GitHub Pages

1. Create a new repo on GitHub (public works best for Pages).
2. Push this project to that repo.
3. Build locally then commit the `dist/triad-widget.js` file **and** `public/index.html`, or let a GitHub Action build it for you.
4. Enable **Settings → Pages** and choose the **Branch: `main` / Folder: `/` (root)** option, or serve from `/docs` if preferred.

### GitHub Action (optional)

This workflow builds on every push to `main` and publishes the bundle + demo to the `gh-pages` branch automatically.

- Update `pages_hostname` in the workflow if you use a custom domain or different base path.

After it runs, your JS will be at a URL like:
```
https://<your-username>.github.io/<repo-name>/triad-widget.js
```

Use that URL inside Wix.

## Use in Wix

- In the Wix Editor, add **Embed → Custom Element**.
- **Tag name:** `triad-widget`
- **JS URL:** use your `triad-widget.js` URL from GitHub Pages.
- Drag/resize the element on the page (set a height like 700px). Publish.

## Customize

- Edit cards or UI in `src/TripleTriadLite.tsx`.
- If you want classic rules (Same/Plus/Combo), add them in `placeCard(...)` or as toggles.
- To pass attributes from Wix, read them in `connectedCallback()` and pass as props to `<TripleTriadLite />`.