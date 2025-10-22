import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  customProvider,
  defaultSettingsMiddleware,
  wrapLanguageModel,
} from "ai";

const originalGoogle = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

export const google = customProvider({
  languageModels: {
    fast: originalGoogle("gemini-2.5-flash"),
    smart: originalGoogle("gemma-3-27b-it"),
    reasoning: wrapLanguageModel({
      model: originalGoogle("gemini-2.5-pro"),
      middleware: defaultSettingsMiddleware({
        settings: {
          providerOptions: {
            openai: {
              reasoningEffort: "high",
            },
          },
        },
      }),
    }),
  },
  fallbackProvider: originalGoogle,
});


// import { anthropic } from "@ai-sdk/anthropic";
// import { openai as originalOpenAI } from "@ai-sdk/openai";
// import {
//   createProviderRegistry,
//   customProvider,
//   defaultSettingsMiddleware,
//   wrapLanguageModel,
// } from "ai";

// const customOpenAI = customProvider({
//   languageModels: {
//     fast: originalOpenAI("gpt-5-nano"),
//     smart: originalOpenAI("gpt-5-mini"),
//     reasoning: wrapLanguageModel({
//       model: originalOpenAI("gpt-5-mini"),
//       middleware: defaultSettingsMiddleware({
//         settings: {
//           providerOptions: {
//             openai: {
//               reasoningEffort: "high",
//             },
//           },
//         },
//       }),
//     }),
//   },
//   fallbackProvider: originalOpenAI,
// });

// const customAnthropic = customProvider({
//   languageModels: {
//     fast: anthropic("claude-3-5-haiku-20241022"),
//     smart: anthropic("claude-sonnet-4-20250514"),
//   },
//   fallbackProvider: anthropic,
// });

// export const registry = createProviderRegistry({
//   openai: customOpenAI,
//   anthropic: customAnthropic,
// });

// USAGE 
// const result = streamText({
//   model: registry.languageModel("anthropic:smart"),
//   messages: convertToModelMessages(messages),
// });
