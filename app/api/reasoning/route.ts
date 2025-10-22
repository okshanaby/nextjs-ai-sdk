import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function POST(request: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await request.json();

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY || "",
    });

    const result = streamText({
      model: google("gemini-2.5-pro"),
      messages: convertToModelMessages(messages),
      providerOptions: {
        google: {
          reasoningSummary: "auto",
          reasoningEffort: "low",
        },
      },
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
    });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);

    return Response.json(
      { success: false, error: "Failed to stream messages" },
      { status: 500 }
    );
  }
}
