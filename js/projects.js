/* Project data — newest first. Edit here; the Work section renders from this file.
   `client: true` marks paid client work (vs. self-initiated portfolio builds). */
window.PROJECTS = [
  {
    "slug": "northlight-clinic",
    "name": "Northlight Clinic",
    "sector": "Clinic booking system",
    "url": "https://clinic-prototype-three.vercel.app/",
    "client": false,
    "stack": [
      "React",
      "Vite",
      "Patient & staff portals",
      "Vercel"
    ],
    "problem": "Clinics lose slots in the gaps between systems: a booking lives in one place, the deposit in another, intake on paper, and a cancellation just leaves an empty chair.",
    "solution": "One patient journey in six hand-offs — hold, deposit, confirm, intake, document, follow up — with a waitlist that offers a released slot to the next person automatically, and intake answers readable only by the clinician.",
    "role": "The most system-heavy build here: state that survives a restart, role-based visibility, and a clear line between what front desk sees and what the doctor sees."
  },
  {
    "slug": "ultra-grill",
    "name": "Ultra Grill",
    "sector": "Churrasco restaurant · concept",
    "url": "https://ultra-grill.vercel.app/",
    "client": false,
    "stack": [
      "HTML",
      "CSS",
      "JavaScript",
      "Vercel"
    ],
    "problem": "An all-you-can-eat churrasco is confusing to first-timers — nobody knows how the service works, what the packages include, or how long a seating lasts.",
    "solution": "A one-page site that explains the concept first, then two clear packages with the 90-minute seating spelled out, the signature cuts, hours and location, and reservation straight to WhatsApp.",
    "role": "A fast, dependency-free build — proof that a restaurant site doesn't need a framework to convert."
  },
  {
    "slug": "veroux",
    "name": "VEROUX",
    "sector": "Luxury watch house · concept",
    "url": "https://watchstore-rouge.vercel.app/",
    "client": false,
    "stack": [
      "Next.js",
      "Product catalogue",
      "Wishlist & account",
      "Vercel"
    ],
    "problem": "Luxury e-commerce usually looks like every other shop, which is exactly wrong for a product that is sold on patience and craft.",
    "solution": "A storytelling-led storefront: an inside-the-manufacture film, four collections that each answer a different question, product pages with references and pricing, plus a wishlist, account, order history and warranty registration.",
    "role": "Shows I can hold a high-end tone while still shipping the commerce plumbing underneath."
  },
  {
    "slug": "riv-group",
    "name": "RIV Group Indonesia",
    "sector": "General contractor · Jakarta",
    "url": "https://www.riv-groupindonesia.com",
    "client": false,
    "stack": [
      "ID/EN",
      "Portfolio gallery",
      "Custom domain",
      "Vercel"
    ],
    "problem": "A contractor bidding on commercial and residential work needs to look established before the first meeting — a WhatsApp number and a few photos don't carry a tender.",
    "solution": "A bilingual company site covering six service lines — commercial buildings, residential, interior fit-out, renovation, civil works, design & build — with floor plans, a project library and a portfolio gallery.",
    "role": "Live on the company's own domain: the credential a contractor hands over before the proposal."
  },
  {
    "slug": "b-coffee",
    "name": "B Coffee Yogya",
    "sector": "Coffee shop · Jogokaryan",
    "url": "https://b-coffe-jogja.vercel.app/",
    "client": false,
    "stack": [
      "Installable PWA",
      "WhatsApp reservation",
      "Google Maps",
      "Vercel"
    ],
    "problem": "A café on the second floor of a hotel is invisible from the street — people need to see the room, the menu and the events before they'll climb the stairs.",
    "solution": "A site built around the space itself: the rooms and pool, the menu with a clear price range, the events calendar (markets, exhibitions, live music), a gallery, and reservation plus directions in one tap. Installs to the home screen.",
    "role": "Turns a hidden location into a destination, and gives regulars an app-like shortcut back."
  },
  {
    "slug": "fold-and-form",
    "name": "Fold & Form",
    "sector": "Laundry pickup service",
    "url": "https://fold-and-form.vercel.app",
    "client": false,
    "stack": [
      "React",
      "Vite",
      "Load estimator",
      "Installable PWA"
    ],
    "problem": "Laundry pickup runs on chat: what does it cost, when can you come, do you handle delicates — the same questions, every order.",
    "solution": "Four care services, a four-step how-it-works, a load estimator that prices by kilo or by item as you type, and a pickup form that captures address, date, service and care notes in one go.",
    "role": "Pricing up front and a structured request at the end — the booking arrives complete."
  },
  {
    "slug": "pulpora",
    "name": "Pulpora",
    "sector": "Juice bar",
    "url": "https://pulpora.vercel.app",
    "client": false,
    "stack": [
      "Next.js",
      "Tailwind",
      "Cart state",
      "Vercel"
    ],
    "problem": "Juice and smoothie shops usually post a grid of photos on Instagram. You can't see price or calories per option, and you can't set size or sweetness before you order.",
    "solution": "An interactive menu with filters (best seller, dairy-free, no added sugar) and a build-your-cup flow where price, calories and sugar update as you change the order.",
    "role": "Product configurator with live pricing — the piece most drink brands with many variants actually need."
  },
  {
    "slug": "vie-beauty",
    "name": "VIE Beauty",
    "sector": "Private spa studio",
    "url": "https://vie-orcin.vercel.app",
    "client": true,
    "stack": [
      "Next.js",
      "Tailwind",
      "EN/ID",
      "Dark & light",
      "viebeauty.id"
    ],
    "problem": "A private studio sells an unhurried, one-to-one experience — hard to convey over Instagram DMs. Every booking started as a blank WhatsApp message, so admin spent the day asking the same questions.",
    "solution": "Bilingual site with a full treatment directory (price and duration on every item), a find-your-ritual quiz, and a booking form that composes a structured WhatsApp message: treatment, date, time, skin condition.",
    "role": "Live client. Admin now receives a complete request by default, and the price/duration list absorbs the repetitive questions."
  },
  {
    "slug": "fcy",
    "name": "Fast Construction Yogyakarta",
    "sector": "Construction",
    "url": "https://construction-website-ten-lime.vercel.app",
    "client": false,
    "stack": [
      "Next.js",
      "Tailwind",
      "Frame-sequence scroll",
      "Vercel"
    ],
    "problem": "Construction clients hesitate for two reasons: no cost figure before a meeting, and no way to check progress without calling the site manager.",
    "solution": "An instant estimator (floor area, storeys, zone, style, finishing class) plus a client portal that tracks progress by phase — foundation, structure, MEP, finishing — with CCTV access and before/after work.",
    "role": "Interactive calculation plus a logged-in client view, not a company profile with a contact form."
  },
  {
    "slug": "morfosa-transport",
    "name": "Morfosa Transport",
    "sector": "Car rental with driver",
    "url": "https://morfosa-transport.vercel.app",
    "client": true,
    "stack": [
      "Next.js",
      "Tailwind",
      "EN/ID",
      "morfosatransport.com"
    ],
    "problem": "Rental with driver in Yogyakarta runs entirely through WhatsApp. No public fleet list, no rates, so every comparison starts with a conversation.",
    "solution": "Full six-vehicle catalogue with daily rates, a short quiz that matches trip type to vehicle, and a booking form that compiles itself into a ready-to-send WhatsApp message.",
    "role": "Live client on a custom domain. Rates are public, so the first message is already a booking."
  },
  {
    "slug": "zona-seafood",
    "name": "Zona Seafood",
    "sector": "Seafood restaurant · 6 branches",
    "url": "https://preview-zona.vercel.app",
    "client": true,
    "stack": [
      "Next.js",
      "Tailwind",
      "Page-flip menu",
      "Vercel"
    ],
    "problem": "Six branches, one phone number, and a 24-page menu that had to be reprinted every time a price moved.",
    "solution": "Table reservation routed per branch, a digital menu you page through like the printed book, GoFood and GrabFood ordering, and a marine-life quiz for the wait.",
    "role": "Menu edits ship in minutes instead of a print run, and reservations reach the right branch."
  },
  {
    "slug": "nyoh",
    "name": "NYOH",
    "sector": "Café · Sleman",
    "url": "https://nyoh.vercel.app",
    "client": true,
    "stack": [
      "Next.js",
      "Tailwind",
      "Hero video scrub",
      "Vercel"
    ],
    "problem": "A small café living on GoFood and Instagram has nowhere to show the full menu, the room, or the fact that 151 people rated it 5.0.",
    "solution": "A landing page with the brand story, 60+ menu items by category, real Google reviews pulled in as proof, and CTAs straight to GoFood or the phone.",
    "role": "Live client. A 24-hour storefront that earns trust before anyone walks in."
  },
  {
    "slug": "hsn-law",
    "name": "HSN Law Office",
    "sector": "Boutique law firm",
    "url": "https://firm-website-bay.vercel.app",
    "client": false,
    "stack": [
      "Next.js",
      "Scroll-driven video",
      "Tailwind",
      "Vercel"
    ],
    "problem": "Firms that sell precision and discretion advertise it on stiff template sites, which reads as the opposite.",
    "solution": "Story-driven scroll with cinematic video scrubbing, anonymised case studies, partner profiles, and a five-step engagement path from understand to resolve.",
    "role": "The high-trust build — law, consulting, anything where the site itself is the credential."
  },
  {
    "slug": "fast-wash",
    "name": "CWC Fast Wash",
    "sector": "Auto detailing",
    "url": "https://fast-wash.vercel.app",
    "client": false,
    "stack": [
      "Next.js",
      "Scroll animation",
      "Tailwind",
      "Vercel"
    ],
    "problem": "Premium detailing gets priced like a car wash because nothing on the page shows the difference in the work.",
    "solution": "An atelier-style site: the process told step by step (assess, prepare, clean, correct, protect, inspect), a before/after slider, and membership tiers.",
    "role": "Proof that a service business can charge on craft when the site shows the craft."
  },
  {
    "slug": "hyve-ecommerce",
    "name": "HYVE E-Commerce",
    "sector": "Storefront template",
    "url": "https://hyve-ecommerce.vercel.app",
    "client": false,
    "stack": [
      "Next.js",
      "Vercel"
    ],
    "problem": "Sellers who live inside a marketplace rent their branding and their margin.",
    "solution": "A white-labelable storefront that adapts across product types, so a small brand can own the checkout and the look.",
    "role": "The base I extend when an SME wants off marketplace dependency."
  },
  {
    "slug": "steak-hour-pos",
    "name": "Steak Hour POS",
    "sector": "Point of sale",
    "url": "https://pos-digital-cashier-hyve.vercel.app",
    "client": false,
    "stack": [
      "React",
      "Vite",
      "Vercel"
    ],
    "problem": "Small kitchens still close the day on paper, which means arithmetic errors and no usable sales history.",
    "solution": "A digital cashier for transactions and daily operations — the boring tool the business runs on.",
    "role": "Operational software, not a brochure. The build that says I can ship tools."
  },
  {
    "slug": "hyve-hotel",
    "name": "HYVE Hotel",
    "sector": "Hotel booking",
    "url": "https://hyve-hotel.vercel.app",
    "client": false,
    "stack": [
      "Next.js",
      "Tailwind",
      "shadcn/ui",
      "Vercel"
    ],
    "problem": "Hotels hand a large cut of every room night to OTAs, largely because direct booking on their own site is worse than Booking.com.",
    "solution": "Landing page plus a complete booking flow — room collections, amenities, dining, offers — with a booking CTA reachable from any section.",
    "role": "End-to-end reservation flow, the first build in this series."
  }
];
