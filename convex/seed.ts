// convex/seed.ts
import { mutation } from "./_generated/server";

export const seedQuestions = mutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("questions").first();
    if (existing) {
      console.log("Database already seeded");
      return { message: "Already seeded" };
    }

    // Sample questions
    const questions = [
      {
        section: "diagnosis",
        type: "multiple",
        question: "A 32-year-old woman presents with severe unilateral throbbing headache, photophobia, and nausea lasting 12 hours. According to ICHD-3 criteria, which diagnosis is most likely?",
        options: [
          "Migraine without aura",
          "Tension-type headache",
          "Cluster headache",
          "Medication overuse headache"
        ],
        correctAnswer: 0,
        explanation: "Migraine without aura is characterized by attacks lasting 4-72 hours with unilateral location, pulsating quality, and associated symptoms.",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      // Add more questions here...
    ];

    for (const q of questions) {
      await ctx.db.insert("questions", q);
    }

    return { message: `Seeded ${questions.length} questions` };
  },
});