import { createReplicate } from "@ai-sdk/replicate";
import { experimental_generateImage as generateImage } from "ai";

const replicate = createReplicate({
  apiToken: process.env.REPLICATE_API_TOKEN || "",
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const { image } = await generateImage({
      model: replicate.image("ideogram-ai/ideogram-v3-turbo"),
      prompt,
      size: "1024x1024",
    });

    return Response.json(image.base64);
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return Response.json(
      { success: false, error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
