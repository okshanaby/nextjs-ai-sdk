import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embed, embedMany } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

export async function POST(request: Request) {
  const body = await request.json();

  if (Array.isArray(body.texts)) {
    const { values, embeddings, usage } = await embedMany({
      model: google.textEmbeddingModel("gemini-embedding-001"),
      values: body.texts,
      // maxParallelCalls: 5 // process 5 embeddings at a time
    });

    return Response.json({
      values,
      embeddings,
      usage,
      count: embeddings.length,
      dimension: embeddings[1].length,
    });
  }

  const { value, embedding, usage } = await embed({
    model: google.textEmbeddingModel("gemini-embedding-001"),
    value: body.text,
  });

  return Response.json({
    value,
    embedding,
    usage,
    dimension: embedding.length,
  });
}
