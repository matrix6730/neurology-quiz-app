// convex/questions.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all questions
export const getAllQuestions = query({
  handler: async (ctx) => {
    return await ctx.db.query("questions").order("desc").collect();
  },
});

// Get questions by section
export const getQuestionsBySection = query({
  args: { section: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_section", (q) => q.eq("section", args.section))
      .collect();
  },
});

// Get questions by type
export const getQuestionsByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

// Add a new question
export const addQuestion = mutation({
  args: {
    section: v.string(),
    type: v.string(),
    question: v.string(),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.union(v.number(), v.boolean(), v.string()),
    explanation: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const questionId = await ctx.db.insert("questions", {
      section: args.section,
      type: args.type,
      question: args.question,
      options: args.options,
      correctAnswer: args.correctAnswer,
      explanation: args.explanation,
      createdAt: now,
      updatedAt: now,
    });
    return questionId;
  },
});

// Update a question
export const updateQuestion = mutation({
  args: {
    id: v.id("questions"),
    section: v.optional(v.string()),
    type: v.optional(v.string()),
    question: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.optional(v.union(v.number(), v.boolean(), v.string())),
    explanation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

// Delete a question
export const deleteQuestion = mutation({
  args: { id: v.id("questions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get question statistics
export const getQuestionStats = query({
  handler: async (ctx) => {
    const allQuestions = await ctx.db.query("questions").collect();
    
    const diagnosisCount = allQuestions.filter(q => q.section === "diagnosis").length;
    const managementCount = allQuestions.filter(q => q.section === "management").length;
    
    const typeCount = {
      multiple: allQuestions.filter(q => q.type === "multiple").length,
      trueFalse: allQuestions.filter(q => q.type === "trueFalse").length,
      fillBlank: allQuestions.filter(q => q.type === "fillBlank").length,
    };
    
    return {
      total: allQuestions.length,
      diagnosis: diagnosisCount,
      management: managementCount,
      byType: typeCount,
    };
  },
});

// Batch import questions (for initial setup)
export const batchImportQuestions = mutation({
  args: {
    questions: v.array(
      v.object({
        section: v.string(),
        type: v.string(),
        question: v.string(),
        options: v.optional(v.array(v.string())),
        correctAnswer: v.union(v.number(), v.boolean(), v.string()),
        explanation: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const questionIds = [];
    
    for (const question of args.questions) {
      const id = await ctx.db.insert("questions", {
        ...question,
        createdAt: now,
        updatedAt: now,
      });
      questionIds.push(id);
    }
    
    return questionIds;
  },
});