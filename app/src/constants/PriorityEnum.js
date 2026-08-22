/* Priority filter labels shown in dropdowns. Enum key maps to the
   confidence tier it represents (HIGH/MEDIUM/LOW), same tiers as
   CONFIDENCE_TIERS in HardCodedData.js, just user-facing wording. */

export const PriorityEnum = {
  BAD: "Bad",
  NEUTRAL: "Neutral",
  GOOD: "Good",
};

/* Maps a confidence tier id to its PriorityEnum key. */
export const TIER_TO_PRIORITY = {
  HIGH: "BAD",
  MEDIUM: "NEUTRAL",
  LOW: "GOOD",
};

export default PriorityEnum;
