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
import ImageKit from "imagekit";
import { z } from "zod";

const replicate = createReplicate({
  apiToken: process.env.REPLICATE_API_TOKEN || "",
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

const uploadImage = async (image: string) => {
  const imageKit = new ImageKit({
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT as string,
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_ID as string,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
  });

  const response = await imageKit.upload({
    file: image,
    fileName: "generated_image.jpg",
  });

  return response.url;
};

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

      const imageUrl = await uploadImage(image.base64);

      return imageUrl;
    },
  }),
  changeBackground: tool({
    name: "changeBackground",
    description:
      "Replace image background with AI generated scenes based on text prompt",
    inputSchema: z.object({
      imageUrl: z.string().describe("URL of the uploaded image"),
      backgroundPrompt: z
        .string()
        .describe(
          `Description of the new background (e.g "modern office", "tropical beach sunset")`
        ),
    }),
    outputSchema: z.string().describe("The transformed image URL"),
  }),
  removeBackground: tool({
    name: "removeBackground",
    description: "Remove background of the image",
    inputSchema: z.object({
      imageUrl: z.string().describe("URL of the uploaded image"),
    }),
    outputSchema: z.string().describe("The transformed image URL"),
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
