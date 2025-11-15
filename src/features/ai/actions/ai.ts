"use server";

import { generateWithOllama } from "@/features/ai/libs/ai";

export const generateOllamaAction = async (
  prompt: string,
  aiModel: string,
): Promise<{ success?: string; error?: string }> => {
  const config = {
    model: aiModel,
    temperature: 0.7,
    max_tokens: 2048,
  };

  return await generateWithOllama(prompt, config);
};
