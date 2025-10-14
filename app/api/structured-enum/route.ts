import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";

export async function POST(request: Request) {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY || "",
  });

  try {
    const { text } = await request.json();

    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      output: "enum",
      enum: ["Positive", "Negative", "Neutral"],
      prompt: `Classify the sentiment in this text: ${text}`,
    });

    return result.toJsonResponse();
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);

    return Response.json(
      { success: false, error: "Failed to classify sentiment" },
      { status: 500 }
    );
  }
}
