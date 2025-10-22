import { UIMessage } from "ai";
import { z } from "zod";

const messageMetadataSchema = z.object({
  createdAt: z.string().optional(),
  totalTokens: z.string().optional(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;
export type MyUIMessage = UIMessage<MessageMetadata>;
