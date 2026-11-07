/* The AI agent that fits each business in js/projects.js, keyed by slug.
   Each one: a name, the job in one line, three things it does, and where
   its work lands. Rendered inside every Work row and summarised in the
   Agents section. Kept apart from projects.js because tools/shoot.mjs
   parses that file as one JSON array. */
window.AGENTS = {
  "lpm-pelita-kasih": {
    name: "Pelita Desk",
    job: "Answers donors, patients and volunteers from the foundation's own documents.",
    does: [
      "Tells a patient the clinic's hours, services and what to bring",
      "Walks a donor through foster parenting (OTA) and logs the pledge for the office",
      "Drafts the monthly field report from the news posts and photos already on the site"
    ],
    lands: "WhatsApp · Google Sheets"
  },
  "papa-e-bakery": {
    name: "Batch Keeper",
    job: "Takes pre-orders, closes the batch when it's full, and keeps everyone posted.",
    does: [
      "Collects flavour, quantity and pickup slot in one chat instead of a DM thread",
      "Stops taking orders once the oven's capacity for the batch is reached",
      "Sends a pickup reminder the evening before, and a ready message when it is"
    ],
    lands: "Instagram DM · Square · SMS"
  },
  "vie-bondi": {
    name: "Concierge",
    job: "The booking assistant already on the site, extended into the rest of the guest's visit.",
    does: [
      "Matches a guest to a treatment from what they describe, then books a live slot",
      "Fills a cancelled slot from the waitlist within minutes",
      "Sends aftercare and a rebook nudge timed to the treatment"
    ],
    lands: "Calendar · Email · SMS"
  },
  "atelier-renovation": {
    name: "Site Lead",
    job: "Qualifies quote requests and books the site visit.",
    does: [
      "Asks the questions a quote depends on: trades, surface, access, deadline, budget",
      "Reads the customer's photos and flags what needs a visit before pricing",
      "Proposes visit slots on the owner's calendar and sends the summary ahead of it"
    ],
    lands: "Email · Google Calendar"
  },
  "northlight-clinic": {
    name: "Front Desk",
    job: "Runs the six hand-offs between booking and follow-up.",
    does: [
      "Holds a slot, chases the deposit, and releases it to the waitlist if unpaid",
      "Sends intake questions and summarises answers for the clinician only",
      "Books the follow-up and reminds the patient two days before"
    ],
    lands: "WhatsApp · Email · Portal"
  },
  "ultra-grill": {
    name: "Maître d'",
    job: "Explains the churrasco format and books the table.",
    does: [
      "Answers how the 90-minute seating and the two packages work",
      "Takes party size, time and occasion, and checks it against capacity",
      "Confirms on WhatsApp and asks about allergies before the night"
    ],
    lands: "WhatsApp · Sheets"
  },
  "veroux": {
    name: "Atelier Advisor",
    job: "A patient, knowledgeable salesperson for a product sold on craft.",
    does: [
      "Recommends a reference from wrist size, budget and how the watch will be worn",
      "Answers movement, water resistance and servicing questions from the spec sheets",
      "Registers the warranty and reminds the owner when service is due"
    ],
    lands: "Site chat · Email · CRM"
  },
  "riv-group": {
    name: "Tender Desk",
    job: "Turns an inbound enquiry into a project brief the estimator can price.",
    does: [
      "Asks project type, area, location and timeline",
      "Pulls the three most similar past projects from the portfolio to send back",
      "Books the survey and hands the estimator a structured brief"
    ],
    lands: "WhatsApp · Email · Sheets"
  },
  "b-coffee": {
    name: "Barista on call",
    job: "Answers 'are you open, is there space, what's on tonight'.",
    does: [
      "Reads the events calendar and tells people what's on and when",
      "Takes table and event reservations into one sheet the staff can see",
      "Posts the weekly line-up as a story caption draft every Monday"
    ],
    lands: "WhatsApp · Sheets"
  },
  "fold-and-form": {
    name: "Pickup Planner",
    job: "Quotes the load and schedules the pickup in one conversation.",
    does: [
      "Estimates price by kilo or by item from what the customer describes",
      "Groups pickups by area and time window for the driver",
      "Messages when the laundry is on its way back"
    ],
    lands: "WhatsApp · Route sheet"
  },
  "pulpora": {
    name: "Cup Builder",
    job: "Builds the order with the customer, with price and sugar live.",
    does: [
      "Suggests a cup from a goal: post-gym, low sugar, no dairy",
      "Repeats a regular's last order in one message",
      "Flags the best sellers that are running low for tomorrow's prep"
    ],
    lands: "Site chat · Kitchen sheet"
  },
  "vie-beauty": {
    name: "Ritual Guide",
    job: "The find-your-ritual quiz, as a conversation.",
    does: [
      "Recommends a treatment from skin condition and the time the guest has",
      "Composes the booking as the structured WhatsApp message admin already uses",
      "Follows up after the visit and offers the next slot in the same thread"
    ],
    lands: "WhatsApp · Calendar"
  },
  "fcy": {
    name: "Site Estimator",
    job: "Gives a first cost range and keeps clients updated by phase.",
    does: [
      "Builds a cost range from building type, area and finish level",
      "Sends the client a weekly progress note from the phase tracker",
      "Collects change requests and logs them against the right phase"
    ],
    lands: "Client portal · WhatsApp"
  },
  "morfosa-transport": {
    name: "OpsBrain",
    job: "Answers fleet and booking questions from the company's own documents.",
    does: [
      "Quotes a route from origin, destination, vehicle type and date",
      "Answers staff questions from SOPs and rate cards instead of the owner",
      "Hands a confirmed booking to the dispatcher with every detail filled"
    ],
    lands: "WhatsApp · Sheets"
  },
  "zona-seafood": {
    name: "Branch Router",
    job: "Takes the reservation and sends it to the right branch.",
    does: [
      "Picks the nearest branch with space for the party size",
      "Answers menu and price-by-weight questions from the current list",
      "Confirms and reminds, and tells the branch about large groups early"
    ],
    lands: "WhatsApp per branch"
  },
  "nyoh": {
    name: "Counter",
    job: "Answers the questions a small food stall gets fifty times a day.",
    does: [
      "Hours, location, today's menu and price, straight from the site",
      "Takes pre-orders for pickup with a time",
      "Collects reviews after pickup and routes complaints to the owner"
    ],
    lands: "WhatsApp · Google reviews"
  },
  "hsn-law": {
    name: "Intake Clerk",
    job: "Collects the facts of a matter before the first consultation.",
    does: [
      "Asks practice-area questions and flags conflicts and deadlines",
      "Books the consultation and sends the documents checklist",
      "Never gives legal advice — it says so, and hands to a lawyer"
    ],
    lands: "Email · Calendar · CRM"
  },
  "fast-wash": {
    name: "Wash Queue",
    job: "Books the wash slot and tells the customer when the car is ready.",
    does: [
      "Quotes by vehicle size and package",
      "Places the booking into the next free bay slot",
      "Messages when the car is done, with a loyalty count"
    ],
    lands: "WhatsApp · Queue sheet"
  },
  "hyve-ecommerce": {
    name: "Store Clerk",
    job: "Product questions, order status and returns, without a support inbox.",
    does: [
      "Finds the right product from a description, size and budget",
      "Answers 'where is my order' from the order record",
      "Starts a return and tells the customer exactly what to send"
    ],
    lands: "Site chat · Email · Stripe"
  }
};
