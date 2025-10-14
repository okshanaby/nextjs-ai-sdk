import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";
import { recipeSchema } from "./schema";

export async function POST(request: Request) {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY || "",
  });

  try {
    const { dish } = await request.json();

    const result = streamObject({
      model: google("gemini-2.5-flash"),
      schema: recipeSchema,
      prompt: `Generate a recipe for the dish: ${dish}.`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);

    return Response.json(
      { success: false, error: "Failed to generate recipe" },
      { status: 500 }
    );
  }
}
