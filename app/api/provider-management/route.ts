import { convertToModelMessages, streamText } from "ai";
import { google } from "./model";
import { MyUIMessage } from "./types";

export async function POST(request: Request) {
  try {
    const { messages }: { messages: MyUIMessage[] } = await request.json();

    const result = streamText({
      model: google.languageModel("reasoning"),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      messageMetadata: stream => {
        if (stream.part.type === "start") {
          return {
            createdAt: Date.now(),
          };
        }
        if (stream.part.type === "finish") {
          console.log(
            "🚀 ~ POST ~ stream.part.totalUsage:",
            stream.part.totalUsage
          );
          return {
            totalTokens: stream.part.totalUsage.totalTokens,
          };
        }
      },
    });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);

    return Response.json(
      { success: false, error: "Failed to stream messages" },
      { status: 500 }
    );
  }
}
