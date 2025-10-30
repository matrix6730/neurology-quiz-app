// convex/videos.ts
import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Get all videos
export const getAllVideos = query({
  handler: async (ctx) => {
    return await ctx.db.query("videos").order("desc").collect();
  },
});

// Get videos by user
export const getVideosByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videos")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get videos by status
export const getVideosByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videos")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Create video record
export const createVideoRecord = mutation({
  args: {
    userId: v.optional(v.string()),
    prompt: v.string(),
    topic: v.string(),
    script: v.string(),
  },
  handler: async (ctx, args) => {
    const videoId = await ctx.db.insert("videos", {
      userId: args.userId,
      prompt: args.prompt,
      topic: args.topic,
      script: args.script,
      status: "pending",
      createdAt: Date.now(),
    });
    return videoId;
  },
});

// Update video status
export const updateVideoStatus = mutation({
  args: {
    id: v.id("videos"),
    status: v.string(),
    heygenVideoId: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const updateData: any = {
      status: updates.status,
    };
    
    if (updates.heygenVideoId) updateData.heygenVideoId = updates.heygenVideoId;
    if (updates.videoUrl) updateData.videoUrl = updates.videoUrl;
    if (updates.thumbnailUrl) updateData.thumbnailUrl = updates.thumbnailUrl;
    if (updates.duration) updateData.duration = updates.duration;
    if (updates.status === "completed") updateData.completedAt = Date.now();
    
    await ctx.db.patch(id, updateData);
    return id;
  },
});

// Generate video script using Claude
export const generateVideoScript: any = action({
  args: {
    prompt: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any): Promise<any> => {
    // Query knowledge base for relevant content (knowledge module not implemented yet)
    const knowledgeResults: any[] = [];

    // Construct context from knowledge base
    const context: string = knowledgeResults.map((k: any) => k.content).join("\n\n");
    
    // Call Claude API to generate script
    const response: any = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `You are a medical educator creating educational video scripts about headache neurology.

Context from medical knowledge base:
${context}

User prompt: ${args.prompt}

Create a clear, engaging video script (2-3 minutes) that:
1. Uses accurate medical information from the context
2. Explains concepts in a way that's educational but accessible
3. Includes specific examples and clinical pearls
4. Follows evidence-based medicine principles
5. Uses a warm, professional teaching tone

Format the script with natural pauses and emphasis for voiceover.

Script:`,
          },
        ],
      }),
    });
    
    const data: any = await response.json();
    const script: string = data.content[0].text;
    
    // Extract topic from prompt
    const topic = args.prompt.split(" ").slice(0, 5).join(" ");
    
    // Create video record
    const videoId: any = await ctx.runMutation(api.videos.createVideoRecord, {
      userId: args.userId,
      prompt: args.prompt,
      topic,
      script,
    });
    
    return { videoId, script };
  },
});

// Generate video with HeyGen
export const generateHeyGenVideo: any = action({
  args: {
    videoId: v.id("videos"),
  },
  handler: async (ctx: any, args: any): Promise<any> => {
    // Get video record
    const video: any = await ctx.runQuery(api.videos.getVideoById, {
      id: args.videoId,
    });
    
    if (!video) {
      throw new Error("Video not found");
    }
    
    // Update status to processing
    await ctx.runMutation(api.videos.updateVideoStatus, {
      id: args.videoId,
      status: "processing",
    });
    
    try {
      // Call HeyGen API to create video
  const heygenResponse: any = await fetch("https://api.heygen.com/v2/video/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": process.env.HEYGEN_API_KEY!,
        },
        body: JSON.stringify({
          video_inputs: [
            {
              character: {
                type: "avatar",
                avatar_id: "process.env.e4b6404f8d0b4258bc38db08ff8f386e", // Configure your avatar
                avatar_style: "normal",
              },
              voice: {
                type: "text",
                input_text: video.script,
                voice_id: "process.env.sV1qFu7H6UO6NvkYNiB0", // Configure your voice
                speed: 1.0,
              },
              background: {
                type: "color",
                value: "#0f172a", // Dark blue background
              },
            },
          ],
          dimension: {
            width: 1920,
            height: 1080,
          },
          aspect_ratio: "16:9",
          test: false, // Set to true for testing
        }),
      });
      
      const heygenData: any = await heygenResponse.json();

      if (heygenData.error) {
        throw new Error(heygenData.error);
      }

      // Update video with HeyGen video ID
      await ctx.runMutation(api.videos.updateVideoStatus, {
        id: args.videoId,
        status: "processing",
        heygenVideoId: heygenData.data.video_id,
      });

      return { success: true, heygenVideoId: heygenData.data.video_id };
    } catch (error) {
      // Update status to failed
      await ctx.runMutation(api.videos.updateVideoStatus, {
        id: args.videoId,
        status: "failed",
      });
      
      throw error;
    }
  },
});

// Check HeyGen video status
export const checkHeyGenVideoStatus: any = action({
  args: {
    videoId: v.id("videos"),
  },
  handler: async (ctx: any, args: any): Promise<any> => {
    const video: any = await ctx.runQuery(api.videos.getVideoById, {
      id: args.videoId,
    });
    
    if (!video || !video.heygenVideoId) {
      throw new Error("Video or HeyGen video ID not found");
    }
    
    // Check status with HeyGen API
    const response: any = await fetch(
      `https://api.heygen.com/v1/video_status.get?video_id=${video.heygenVideoId}`,
      {
        headers: {
          "X-Api-Key": process.env.HEYGEN_API_KEY!,
        },
      }
    );
    
    const data: any = await response.json();
    
    if (data.data.status === "completed") {
      // Update video record with final URL
      await ctx.runMutation(api.videos.updateVideoStatus, {
        id: args.videoId,
        status: "completed",
        videoUrl: data.data.video_url,
        thumbnailUrl: data.data.thumbnail_url,
        duration: data.data.duration,
      });
    } else if (data.data.status === "failed") {
      await ctx.runMutation(api.videos.updateVideoStatus, {
        id: args.videoId,
        status: "failed",
      });
    }
    
    return data.data;
  },
});

// Get video by ID
export const getVideoById = query({
  args: { id: v.id("videos") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Complete video generation workflow
export const generateCompleteVideo: any = action({
  args: {
    prompt: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any): Promise<any> => {
    // Step 1: Generate script
    const { videoId, script }: any = await ctx.runAction((api as any).videos.generateVideoScript, {
      prompt: args.prompt,
      userId: args.userId,
    });
    
    // Step 2: Generate video with HeyGen
    await ctx.runAction((api as any).videos.generateHeyGenVideo, {
      videoId,
    });
    
    return { videoId, script };
  },
});