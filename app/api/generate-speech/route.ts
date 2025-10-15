import { elevenlabs } from "@ai-sdk/elevenlabs";
import { experimental_generateSpeech as generateSpeech } from "ai";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const { audio } = await generateSpeech({
      model: elevenlabs.speech("eleven_multilingual_v2"), // or another model
      text,
    });

    return new Response(audio.uint8Array, {
      headers: { "Content-Type": audio.mediaType || "audio/mpeg" },
    });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);

    return Response.json(
      { success: false, error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
