import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY || "",
  });

  try {
    const result = streamText({
      model: google("gemini-2.5-flash"),
      prompt, // use user input
    });
    
    console.log("🚀 ~ POST ~ result:", result)

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to stream text" },
      { status: 500 }
    );
  }
}
