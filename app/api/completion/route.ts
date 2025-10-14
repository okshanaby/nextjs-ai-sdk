import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY || "",
  });

  try {
    const { text } = await generateText({
      // model: openai("gpt-4.1-nano"),
      // prompt: "Explain what is LLM in simple terms",
      // providerOptions: {
      //   openai: { apiKey: process.env.OPENAI_API_KEY || "" },
      // },

      model: google("gemini-2.5-flash"),
      prompt, // use user input
    });

    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to generate text" },
      { status: 500 }
    );
  }
}
