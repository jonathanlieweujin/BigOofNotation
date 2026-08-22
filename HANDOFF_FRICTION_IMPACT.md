# Friction + Impact: wiring in real data

Real diagnosis data for the Friction page is ready. Impact mostly isn't (see why below).
This only affects two files. Everything else in the app is untouched.

## 1. Get the branch

```
git fetch origin
git checkout temp_zern
git pull
```

You should now have two new files: `app/src/data/friction.json` and `app/src/data/impact.json`.

## 2. Friction page — one line

In `app/src/pages/Friction.jsx`, change the import at the top:

```diff
- import { FRICTION } from "../HardCodedData";
+ import FRICTION from "../data/friction.json";
```

That's the whole change. The JSON uses the exact same field names the page already
reads (`cause`, `accountCount`, `arrAffected`, `trend`, `firstSeen`), so nothing else
in the file needs to touch.

What's actually in it: 5 rows, one per diagnosis class (Unresolved friction, Wrong fit,
Value doubt, Unrealised value, Relationship gap), each with a real account count and
real ARR-affected total, computed from the emotion model + Gemini diagnosis pipeline
over ~700 customers. `trend` is computed by comparing earlier vs. later dates within
each group, not hand-picked.

## 3. Impact page — leave it as is

`Impact.jsx` currently reads `IMPACT` from `HardCodedData.js`: retained revenue net of
concession, the matched-vs-baseline chart, repeat-churn rate. **These can't be computed
for real** — the dataset has no record of whether an intervention actually worked, so
there's nothing to measure "retained" against. `track/todo.md` already says these are
fine to keep seeded for the demo, so no change needed here. Don't swap this import.

If you ever want to *add* real numbers alongside the seeded ones, `app/src/data/impact.json`
has some (revenue at risk, accounts under observation, action-type breakdown by cost) —
but that's new UI, not required to finish the page as spec'd.

## Not done yet (don't assume it is)

Accounts.jsx and AccountDetail.jsx still read from `HardCodedData.js`. Wiring those to
real per-customer diagnoses (`diagnoses.json`, not pushed yet — it's the full 698-record
file the two JSONs above were generated from) is a separate step, not part of this handoff.

## Questions about where the numbers came from

Ask Zern — the pipeline is in `backend/` (emotion model + Gemini diagnosis + the
aggregation script that produced these two files).
