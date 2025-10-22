import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { cosineSimilarity, embed, embedMany } from "ai";
import movies from "./movies";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

export async function POST(request: Request) {
  const { query } = await request.json();

  const { embeddings: movieEmbeddings } = await embedMany({
    model: google.textEmbeddingModel("gemini-embedding-001"),
    values: movies.map(movie => movie.description),
  });

  const { embedding: queryEmbedding } = await embed({
    model: google.textEmbeddingModel("gemini-embedding-001"),
    value: query,
  });

  const moviesWithScores = movies.map((movie, index) => {
    const similarity = cosineSimilarity(queryEmbedding, movieEmbeddings[index]);

    return {
      ...movie,
      similarity,
    };
  });

  const sortedMoviesWithScore = moviesWithScores.sort(
    (a, b) => b.similarity - a.similarity
  );

  const threshold = 0.65;
  const relevantResults = sortedMoviesWithScore.filter(
    movie => movie.similarity > threshold
  );

  const top3Movies = relevantResults.slice(0, 3);

  return Response.json({ query, result: top3Movies });
}
