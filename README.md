# Sakura Portfolio

React + Vite, Tailwind CSS, GSAP (ScrollTrigger), Three.js, Lucide icons. Recreates the sakura-pink design in `Portfolio Ansh.pdf`.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview
```

## Make it yours

| What | Where |
| --- | --- |
| Name, email, socials, hero/intro/about text, resume path | `src/data/site.js` |
| Projects (title, text, image, URL) | `src/data/projects.js` |
| Skills and their desktop positions | `src/data/skills.js` |
| Colors and fonts | `tailwind.config.js`, `src/styles/index.css` |
| Images (hero, tiles, portrait, projects) | `public/images/` (see `public/images/README.txt`) |
| Resume PDF | `public/resume.pdf` |

Missing images show a soft pink fallback, so the site renders before you add assets.

## How the hero works

- **Tree:** the hero artwork (`public/images/hero.jpg`) is drawn by `CherryBlossomScene.jsx` on a full-screen Three.js quad. A fragment shader warps the image's own pixels with layered, wind-driven waves, so the real branches and blossoms sway. The trunk, ground and empty sky are weighted to stay still. The shared wind curve is in `src/lib/wind.js`. Without WebGL the image gets a slow GSAP sway; with reduced motion it stays static.
- **Petals:** `PetalField.jsx` draws petals as Three.js points with a procedural shader: one draw call per layer, no textures. A back layer sits behind the text and a front layer in front. Counts are halved on small or low-core devices. The loop pauses when offscreen or the tab is hidden, and all resources are disposed on unmount.
- **Reduced motion:** with `prefers-reduced-motion`, the petals, sway, and scroll animations are skipped and content shows immediately.

## Notes

The hero, tiles and portrait were cropped from the flat PDF render (hero text was removed by inpainting), so they are lower quality than your originals; swap in the original files if you have them. Project screenshots must be supplied by you. This project has not been run in a browser by its author; if you spot a console error, send it over.
