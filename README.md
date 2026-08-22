## Deployment
https://dev-re-engage.netlify.app

## Pitch Recording
{}

## Lab
4 - Customer Experience & Engagement: The Moment Before They Leave

## Name 
Re-Engage

## Problem Statement

Businesses detect churn too late, and when they do, the only lever most tooling gives them is a **message**: a discount, a check-in email, or a help article. Every at-risk customer gets the same three things regardless of why they are leaving.

This fails twice over:

- **The discount is often the wrong tool.** A customer blocked by a broken feature is not price-sensitive. Discounting a product problem teaches them the product is overpriced *and* still broken.
- **The loudest customers get the help.** Support tickets drive prioritisation, so customers who complain get fixed. Quiet churners get nothing until cancellation, which is a lagging signal that arrives after the decision was already made.

The deeper structural issue: **friction data and the authority to fix friction sit in different places.** Product knows the export times out. CS knows the account has gone quiet. Nobody connects the two, because knowing "this account is at risk" does not tell anyone what they are *allowed to do about it*.

## Solution

**Re-Engage is a retention system whose output is a committed action, not a message.**

A Detect → Diagnose → Act pipeline, where the Act stage changes what the business *does* and every action carries a real cost the business bears.

### 1. Detect: what the customer told us

Input is **feedback form submissions and support/sales call transcripts**. No product telemetry, which is a real constraint: forms and calls are where customers state their reasons in their own words, so we gain stated cause but lose observed behaviour. What counts as a leading signal in text:

- **Unresolved intent**, where a customer describes something they tried to do and did not achieve
- **Repetition across contacts**, the same complaint raised more than once
- **Comparison and exit language**, mentions of alternatives, pricing, or contract end

### 2. Diagnose: classify the blocker, not the mood

Signals map to a small taxonomy of *why*, and each class implies a different lever:

| Diagnosis | Lever | Cost to business |
| --- | --- | --- |
| **Unresolved friction** (told us, still stuck) | Route to fix / workaround | Engineering time |
| **Unrealised value** (paying, never activated) | Hands-on setup | CSM hours |
| **Wrong fit** (paying for the wrong thing) | **Proactively downgrade them** | Revenue, now |
| **Value doubt** (usage fine, renewal near) | Show realised ROI | Reporting effort |
| **Relationship gap** (no human contact) | Named human owner | Headcount |

Each diagnosis also carries a **need-state** (competence, autonomy, relatedness, from self-determination theory) which decides the action *type* before any copy is written. This is why a discount is not a universal lever: it only addresses price-driven autonomy cases, and firing it at a competence problem spends margin to confirm the complaint.

### 3. Preventing wrong output

A misfired intervention is worse than none, so no action fires on a diagnosis alone:

- **Weighted evidence.** Signals are scored by how falsifiable they are. A stated goal repeated across two contacts outranks a generic sentiment score.
- **Confidence tiers.** `Act` triggers a recommendation, `Review` routes to a human with the evidence shown, `Log` means observation only with no customer contact. (The Overview filter labels the same tiers `Bad` / `Neutral` / `Good`.)
- **Fail-safe default.** Below the threshold the system does nothing and flags the account. Silence is a valid output, and a meaningful share of the scored customers land there.
- **Explainability.** Every recommendation states the signals that fired, so a reviewer can reject a bad read in seconds.

### 4. Cost and business exposure

Ranking is by **expected value of intervening**, not risk score alone. What is built today:

```
priority = confidence_score x LTV
```

so a weakly-evidenced signal on a high-value account can outrank a strong signal on a small one, and vice versa. LTV is a documented placeholder (`monthly_spend x 36`) rather than a fitted model, because the dataset has no churn or tenure outcome to fit against.

Each action in the taxonomy carries a **cost and reversibility** label (`WORKAROUND` is near-zero and reversible, `DOWNGRADE` is revenue-negative and not), and the confidence threshold is what gates whether any action fires at all. The **full** expected-value gate, subtracting action cost and multiplying by a learned `P(intervention works)`, needs outcome data the pipeline does not yet collect, so it is design rather than code. See `track/futureworks.md`.

**Deliberate anti-goal:** this does not maximise saves. A wrong-fit customer moving to a cheaper plan is a success, not a loss, because it trades short-term revenue for lifetime value and trust.

## Overview

Five screens, single user role.

| Screen | Question it answers |
| --- | --- |
| **Overview** | Where does the portfolio stand right now? |
| **Customers** | Who do I act on, and what do I do? Ranked by expected value of intervening, with diagnosis, confidence tier, and recommended action. Filter by diagnosis, tier, or name. |
| **Customer detail** | *Why* this customer, in one sentence, with the weighted evidence that fired, the confidence score against its threshold, the recommended action and its cost, and **the actions that were ruled out and why**. |
| **Issues** | Which root causes cost the most? Accounts grouped by diagnosis class and ranked by total ARR at risk, with a trend, so scattered complaints become one revenue-weighted priority instead of individual tickets. |
| **Results** | Is it working? Retained revenue **net of concession cost**, plus diagnosis-matched actions measured against a generic-discount baseline. |

The *ruled out* block on customer detail is the most differentiating element: everyone shows a recommendation, but showing what was rejected proves there is a real decision layer rather than a single suggestion.

## Impact & Potential

Run over 698 synthetic SaaS customers, the pipeline produced:

| Measure | Value |
| --- | --- |
| Customers scored | 698 |
| Revenue at risk identified | RM 4,242,996 |
| Accounts flagged at risk | 413 |
| Interventions recommended | 349 |
| Accounts deliberately left alone | 285 |

That last row matters as much as the others. A quarter of the book falls below the
confidence threshold, so the system says nothing about them rather than guessing. Retention
tooling that contacts everyone trains customers to ignore it.

**Real-world adoption.** This sits as a layer over the feedback channels a business already
has, forms and recorded calls, rather than replacing a CRM. There is no instrumentation
project to fund and no data migration, which is how retention tooling actually gets bought.
Every industry has feedback forms and call recordings, while product telemetry schemas are
bespoke per company, so text-only input makes the approach *more* portable, not less.

**Economic viability.** Every action carries an explicit cost and reversibility label, so
retention spend becomes auditable instead of assumed. A workaround is near-zero and
reversible; a downgrade is revenue-negative and permanent. The system prefers the cheapest
action that resolves the diagnosis, and reporting net of concession cost means an
intervention that cost more than the customer was worth shows up as a loss rather than
hiding inside a headline save rate.

**Stakeholder engagement.** One dataset, two audiences. Customer Success works the ranked
queue on *Customers*, where each row carries a stated reason and a pre-authorised action.
Product and engineering work *Issues*, where the same records are grouped by cause and
weighted by revenue, so churn evidence arrives attached to a specific problem instead of as
an anonymous percentage. This is the gap the solution exists to close: the team that sees
the friction and the team with the authority to fix it finally read from the same list.

**Long term sustainability.** Two compounding effects. Every logged intervention and outcome
feeds back into which levers work for which diagnosis, so accuracy improves with use rather
than decaying. And aggregating causes into revenue-weighted priorities means a fixed defect
removes that churn cause for every future customer, shrinking the at-risk population at
source instead of treating the same symptom repeatedly.

**Adaptable by construction.** The diagnosis taxonomy, need-state mapping, and action costs
live in a single 153-line definition file, separate from the scoring engine. The five
classes, stuck, wrong fit, unrealised value, value doubt, and relationship gap, exist in
SaaS, telco, banking, and subscription retail alike. Porting to a new domain means
rewriting signal definitions, not the pipeline.

## Tech Stack

**Frontend**

| Layer | Choice | Why |
| --- | --- | --- |
| UI | React 18 (Create React App), `.jsx` / `.js` | No TypeScript. Plain CSS against fixed design tokens rather than a utility framework |
| Routing | React Router 6 | Paths and nav labels centralised in `constants/RouteEnum.js` |
| Styling | Hand-written CSS + custom properties | Tokens in `styles/tokens.css` are the single source for colour, type, and spacing |
| Charts | Hand-rolled CSS bars, no chart library | Four simple bar charts do not justify a dependency |
| Auth | Supabase | Session handled in `App.jsx` via `supabaseClient.js` |

**Backend (offline batch, `backend/`)**

| Layer | Choice | Why |
| --- | --- | --- |
| Emotion signal | `j-hartmann/emotion-english-distilroberta-base` via `transformers` | Separates frustration (competence) from resentment (autonomy) |
| Evidence + scoring | Deterministic Python rules (`scoring.py`, `taxonomy.py`) | Explainable and overridable. Every recommendation can state its evidence, which a black-box model cannot |
| Diagnosis + action | Gemini via `google-genai`, structured output | Writes the human-readable *why* and picks from the taxonomy. It does **not** invent strategy, the taxonomy constrains it |
| Aggregation | `pandas` (`aggregate.py`, `run_batch.py`) | Rolls per-customer records into the friction and impact views |

The pipeline runs offline and writes JSON into `app/src/data/` (`diagnoses.json` for the 698 scored customers, plus `friction.json` and `impact.json` for the aggregate views). The frontend reads those static files, so the demo cannot fail on a live API call.

**Accessibility note:** the status palette in `style.md` fails colourblind separation (`#FCC522` vs `#1ED760` is ΔE 3.8 for protanopia, below the 8 threshold), so those colours are only ever used on badges that also carry a text label. Chart series use a separately validated palette.

## Future Works

Ordered by what the current architecture already makes possible. The MVP is a
deliberately explainable rules layer, so most of what follows either learns the
weights that layer currently hard-codes, or widens what counts as a signal.

### Highest priority: behavioural telemetry

The single largest capability gap, and the reason the MVP scopes to stated cause only.

With product event data we could observe the **attempt → fail → abandon** pattern
directly, instead of waiting for a customer to describe it. That is strictly stronger
than text: it is timestamped, unambiguous, and **not self-reported**, so it can
*falsify* a stated cause rather than merely agree with it.

What it unlocks:

- **Genuine silent-churn detection.** Today we only see customers who spoke up. Telemetry
  sees the ones who quietly stopped, which is the larger and more valuable population.
- **Real cross-source corroboration.** Currently repetition across contacts is our only
  confirmation. Telemetry lets us check what a customer *said* against what they *did*.
- **A higher evidence ceiling.** Every current evidence tier is self-reported, so one
  logged error event would outrank all of them.
- **Timing.** Events carry timestamps. Forms and calls arrive whenever the customer chose
  to make contact, which is usually already late.

This is additive by design: the taxonomy, need-states, confidence gates, and action costs
stay as they are. Telemetry adds rows at the top of the evidence weight table and one
diagnosis class beside the existing five.

### Near term: learn what is hard-coded

- **Learn the evidence weights from outcomes.** Weights are currently assigned by hand in
  falsifiability order. Once interventions are logged, those become trainable, with the
  rules layer kept as the explainable fallback.
- **Learn `P(intervention works)` per diagnosis class.** This is the missing term in the
  full expected-value gate. With outcome data it becomes an empirical rate per
  (diagnosis x action x segment) rather than an estimate.
- **A real LTV model.** `monthly_spend x 36` is a documented placeholder. The dataset has
  no churn or tenure outcome to fit against, so this needs either real history or a
  survival model.
- **Uplift modelling instead of churn modelling.** The better question is not "who will
  leave" but "whose behaviour would *change* if we acted", which targets persuadables and
  skips both the already-loyal and the certain-leavers.
- **Optimal timing.** The system answers *who* and *what*, never *when*.

### Medium term: widen the signal and action surface

- **Live connectors** (Stripe, HubSpot, Intercom, product analytics) replacing the batch
  CSV input, so the taxonomy is exercised against real friction.
- **Automatic diagnosis discovery.** Clustering unresolved cases would surface churn causes
  the five hand-authored classes cannot see.
- **Closing the product loop.** Track whether a shipped fix actually reduced the cause it
  was raised for. The Issues view raises priorities today but never verifies the cure.
- **Multi-stakeholder accounts.** B2B churn is rarely one person; the champion going quiet
  is a stronger signal than aggregate account sentiment.
- **Concession budget optimisation.** Allocate a fixed retention budget across accounts for
  maximum retained LTV, rather than first-come-first-served.

### Longer term

- **Causal inference over correlation**, so retention can be attributed to specific
  interventions with defensible counterfactuals rather than aggregate comparisons.
- **Cross-industry signal packs.** The taxonomy is claimed to be domain-agnostic. Proving
  that means shipping signal definitions for telco, banking, and subscription retail and
  showing the five classes survive the transfer.
- **Pre-emptive product design.** The endpoint is not faster retention but fewer retention
  events, by feeding aggregated causes into roadmap planning.

## Setup & Installation (Locally)

### Frontend

```bash
cd app
npm install
npm start          # http://localhost:3000
npm run build      # production bundle
```

Create `app/.env` (gitignored) with your Supabase project values:

```
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

`REACT_APP_*` variables are inlined at build time, so only ever put the **anon** key here, never a service role key. CRA reads env files at start/build time only, so restart the dev server after editing `.env`.

### Backend pipeline (optional)

The frontend ships with generated JSON already committed, so this is only needed to regenerate it.

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # add your GEMINI_API_KEY

python run_batch.py                      # full run
python run_batch.py --skip-gemini        # scoring only, no API calls
python run_batch.py --customers 50       # cap for a quick test
```

Outputs land in `app/src/data/`. Input datasets live in `data/`.

**Requirements:** Node 18+ (Supabase prefers 22+), Python 3.10+.
