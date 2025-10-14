import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export async function POST(request: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await request.json();

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY || "",
    });

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: convertToModelMessages(messages), // use user input
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
