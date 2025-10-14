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
      messages: [
        // {
        //   role: "system",
        //   content:
        //     "You are a coding assistant. Keep answers not more thatn 3 sentences.",
        // },
        {
          role: "system",
          content: "Convert user questions about react into code samples",
        },
        { role: "user", content: "How to toggle a boolean" },
        {
          role: "assistant",
          content:
            "const [isOpen, setIsOpen] = useState(false);\n\nconst toggle = () => setIsOpen(!isOpen);",
        },
        ...convertToModelMessages(messages),
      ],
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
