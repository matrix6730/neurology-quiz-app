// convex/seedKnowledge.ts
import { mutation } from "./_generated/server";

export const seedKnowledge = mutation({
  handler: async (ctx) => {
    const knowledge = [
      {
        topic: "migraine_without_aura",
        category: "diagnosis",
        content: "Migraine without aura: At least 5 attacks fulfilling criteria B-D. Headache attacks lasting 4-72 hours (untreated). At least two: unilateral location, pulsating quality, moderate-severe intensity, aggravation by routine physical activity. During headache at least one: nausea/vomiting, photophobia and phonophobia.",
        source: "ICHD-3",
        tags: ["migraine", "diagnosis", "ICHD-3"],
        createdAt: Date.now(),
      },
      {
        topic: "cluster_headache",
        category: "diagnosis",
        content: "Cluster headache: Severe unilateral orbital, supraorbital and/or temporal pain lasting 15-180 minutes. At least one: ipsilateral conjunctival injection, lacrimation, nasal congestion, rhinorrhea, forehead/facial sweating, miosis, ptosis, eyelid edema. Sense of restlessness or agitation. Attacks frequency: 1 every other day to 8 per day.",
        source: "ICHD-3",
        tags: ["cluster", "diagnosis", "ICHD-3"],
        createdAt: Date.now(),
      },
      {
        topic: "acute_migraine_treatment",
        category: "management",
        content: "Acute migraine treatment options: NSAIDs (ibuprofen 400-800mg, naproxen 500-1000mg). Triptans (sumatriptan 50-100mg, rizatriptan 10mg). CGRP antagonists (ubrogepant 50-100mg, rimegepant 75mg). Antiemetics for nausea. Combination therapy often more effective than monotherapy.",
        source: "AAN Guidelines 2024",
        tags: ["migraine", "management", "acute treatment"],
        createdAt: Date.now(),
      },
      // Add more knowledge...
    ];

    for (const k of knowledge) {
      await ctx.db.insert("knowledgeBase", k);
    }

    return { message: `Seeded ${knowledge.length} knowledge items` };
  },
});