import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";
import { pokemonSchema } from "./schema";

export async function POST(request: Request) {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY || "",
  });

  try {
    const { type } = await request.json();

    const result = streamObject({
      model: google("gemini-2.5-flash"),
      schema: pokemonSchema,
      output: "array",
      prompt: `Generate a list of 5 ${type} type pokemon`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);

    return Response.json(
      { success: false, error: "Failed to generate pokemon" },
      { status: 500 }
    );
  }
}
