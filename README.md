# hasanaufar.com — personal site

Static site. No build step, no framework. Open `index.html` on any static host
(Vercel, Netlify, GitHub Pages, plain nginx) and it works.

    npx serve .

## Structure

    index.html        every section, in order
    css/style.css     all styling; design tokens live in :root at the top
    js/projects.js    the 17 projects — edit here, the Work section renders from it
    js/main.js        ring carousel, hero film, booking brief, reveals, story player
    js/works.js       the works grid: photo stack, drag slider, entry
    css/works.css     works-grid styling and the shared motion tokens
    assets/video/     hero-scrub.mp4 (scrubbed by scroll), story.mp4 (click to play)
    assets/img/       id-*.webp identity stills, posters
    assets/shots/     project screenshots, one per slug
    tools/shoot.mjs   re-captures every project screenshot

## The sections

| # | Section | What it is |
|---|---------|-----------|
| — | The film | A full pinned chapter. The video is seeked frame by frame against scroll; three text beats land on chosen moments; the chapter closes on a "Know more" card. |
| 01 | Identities | Three landscape stills on a real ring in 3D. Drag it, flick it, arrow it — the copy in the centre follows. |
| 02 | About | The story, with story.mp4 beside it on click-to-play. |
| — | Contact sheet | All 17 frames at 4% opacity, blurred and grey. A 280px radius of attention follows the cursor; the nearest frame develops to full, the rest are capped halfway, so only one is ever readable. Pick one and it flies down into its row. |
| 03 | Work | 17 builds, newest first. One long column; each row arrives from an alternating side and holds a stack of three photos you can drag, step or key through. |
| 04 | Services + booking | Six services, then a form that writes the brief and sends it to WhatsApp. |
| 05 | Studio | Payhip products. |
| 06 | Content | hsnrr.tech pillars. |
| 07 | Contact | Every channel. |

## Editing

**Add or change a project** — edit `js/projects.js`, then capture its screenshot:

    node tools/shoot.mjs <slug>
    for f in assets/shots/<slug>-*.png; do       ffmpeg -y -i "$f" -vf scale=1280:-2 -c:v libwebp -q:v 78 "${f%.png}.webp"; done
    rm assets/shots/<slug>-*.png

Every project carries three photos: `-1` the landing view, `-2` a section
further down, `-3` the phone layout (shown contained, not cropped).

Newest project goes at the top of the array; numbering (`17 / 17`) is automatic.
`client: true` marks paid client work. If a screenshot is missing the card falls
back to a typographic panel — nothing breaks.

**The three identities** live in the `IDENTITIES` array at the top of
`js/main.js` (role, name, caption, copy, three facts) with their stills in
`assets/img/id-*.webp`. Use landscape 16:9 images. Adding a fourth entry works
with no other change — the ring spaces itself.

**The film beats** are `#beat1`–`#beat3` in `index.html`; when each one appears
is the `at = [1.9, 4.0, 6.1]` array in `js/main.js` (timeline seconds out of 10).
The whole chapter's scroll length is `end: '+=420%'` on the same timeline.

**Services and the booking form** are plain HTML in `index.html`. Every chip
carries its own wording in `data-pages` / `data-need`, and `js/main.js` composes
those into the brief, the `wa.me` link and the mailto. Nothing is priced on the
page on purpose — the form asks for page count and features, which is what a
quote actually depends on.

**Colours and type** — the `:root` block in `css/style.css`. Display face is
Fraunces (with the WONK axis on, which is where the character comes from); UI
text is Inter. The palette rule: navy is the ground, metallics carry secondary
text, and the pale cyan only ever appears as a hairline, a focus ring, or a
hover glow.

**The mark** is drawn inline as SVG in the header (a diamond that rotates on
hover). The old raster logo is no longer used anywhere on the page.

## Developing the frame

The works experience runs on one idea: the work exists before you look at
it, and attention is what develops it. Every animation in `js/works.js`
serves that, and the timings live as tokens at the top of `css/works.css`
— nothing is written inline.

- **The contact sheet** (`#sheet`) — a rAF loop turns pointer distance
  into a `--p` value per frame; CSS maps `--p` to opacity, blur and
  grayscale. Reveal runs on a 73ms time constant, decay on 200ms, so
  frames come up about three times faster than they go back down. One
  active index is recomputed per frame, so exactly one frame can be fully
  developed; everything else is capped at 0.5. The loop only writes
  `--p`, and only when the value actually changed.
- **The handoff** — clicking a frame measures it, jumps to its row,
  measures that, and animates a floating clone between the two rects with
  transform only, then fades the clone out onto the real frame. Scrolling
  past the sheet instead develops every frame at once, staggered 45ms
  apart radiating from whichever one you left the cursor on; scrolling
  back up re-latents them, so the sheet is never spent.
- **The rows** — each project row enters from the side it sits on
  (`data-side` alternates `a`/`b`), photographs first, writing 45ms later.
- **The stack** — three photos per project, driven by one float `pos`.
  Drag, flick, arrows and `←`/`→` all move that number; a spring
  (stiffness 260, damping 30) settles it, and the ends rubber-band at 0.32
  resistance.

Accessibility and fallbacks are part of the design, not an afterthought:
`prefers-reduced-motion` turns the mask and the FLIP **off** rather than
shortening them, touch devices skip the contact sheet entirely (there is
no cursor to develop with), keyboard focus develops a frame exactly as
the cursor does, and `will-change` is applied when motion starts and
removed when it stops.

## The hero scrub

`assets/video/hero-scrub.mp4` is encoded with every frame a keyframe
(`-g 1 -keyint_min 1 -sc_threshold 0`) so seeking is instant while scrolling.
If you replace it, re-encode the same way or scrubbing will stutter:

    ffmpeg -i new.mp4 -an -vf scale=1280:-2 -c:v libx264 -crf 26 \
      -g 1 -keyint_min 1 -sc_threshold 0 -movflags +faststart \
      assets/video/hero-scrub.mp4

Keep it short (under ~10s).

## Before going live

- Point the Studio product cards at real Payhip product URLs, and make each
  card's status line match what is actually listed in the shop.
- The footer year is set from the browser clock, so it stays correct.
