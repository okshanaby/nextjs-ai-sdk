import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  convertToModelMessages,
  InferUITools,
  stepCountIs,
  streamText,
  tool,
  UIDataTypes,
  UIMessage,
} from "ai";
import { z } from "zod";

const tools = {
  getLocation: tool({
    name: "getLocation",
    description: "Get the location of the user.",
    inputSchema: z.object({
      name: z.string().describe("The name of the user"),
    }),
    execute: async (input) => {
      if (input.name.toLowerCase() === "okshan") {
        return "Paris, France.";
      } else if (input.name.toLowerCase() === "bob") {
        return "london";
      } else {
        return `Sorry, I don't have the location information for ${input.name}.`;
      }
    },
  }),
  getWeather: tool({
    name: "getWeather",
    description: "Get the current weather for a given location.",
    inputSchema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
    execute: async input => {
      if (input.city.toLowerCase() === "london") {
        return "15°C with light rain.";
      } else if (input.city.toLowerCase() === "new york") {
        return "22°C and sunny.";
      } else {
        return `Sorry, I don't have the weather information for ${input.city}.`;
      }
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(request: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await request.json();

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY || "",
    });

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(3),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);

    return Response.json(
      { success: false, error: "Failed to stream messages" },
      { status: 500 }
    );
  }
}
