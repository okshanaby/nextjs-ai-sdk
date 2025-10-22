import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  convertToModelMessages,
  experimental_createMCPClient as createMCPClient,
  InferUITools,
  stepCountIs,
  streamText,
  tool,
  UIDataTypes,
  UIMessage,
} from "ai";
import { z } from "zod";

import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const tools = {
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

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await request.json();

    const httpTransport = new StreamableHTTPClientTransport(
      new URL("https://app.mockmcp.com/servers/XdMB9dAuaX2v/mcp"),
      {
        requestInit: {
          headers: {
            Authorization:
              "Bearer mcp_m2m_Af5ojcmfvvxURkD3lVOwYX7SGWemMkAiQ3VieWh_jdc_deed51cd42e9e768",
          },
        },
      }
    );

    const mcpClient = await createMCPClient({
      transport: httpTransport,
    });

    const mcpTools = await mcpClient.tools();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: convertToModelMessages(messages),
      tools: { ...mcpTools, ...tools },
      stopWhen: stepCountIs(2),
      onFinish: async () => {
        await mcpClient.close();
      },
      onError: async error => {
        console.log("🚀 ~ POST ~ error during streaming MCP Tools:", error);
        await mcpClient.close();
      },
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
