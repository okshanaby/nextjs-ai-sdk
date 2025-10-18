import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createReplicate } from "@ai-sdk/replicate";
import {
  convertToModelMessages,
  experimental_generateImage as generateImage,
  InferUITools,
  stepCountIs,
  streamText,
  tool,
  UIDataTypes,
  UIMessage,
} from "ai";
import { z } from "zod";

const replicate = createReplicate({
  apiToken: process.env.REPLICATE_API_TOKEN || "",
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

const tools = {
  generateImage: tool({
    name: "generateImage",
    description: "Generate an image based on a text prompt.",
    inputSchema: z.object({
      prompt: z.string().min(1).max(1000),
    }),
    execute: async ({ prompt }) => {
      const { image } = await generateImage({
        model: replicate.image("ideogram-ai/ideogram-v3-turbo"),
        prompt,
        size: "1024x1024",
      });

      return image.base64;
    },
    toModelOutput: output => {
      return {
        type: "content",
        value: [{ type: "text", text: "Generated Image (base64):" }],
      };
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(request: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await request.json();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(2),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return Response.json(
      { success: false, error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
