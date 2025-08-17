"use server";

import axios from "axios";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

type OllamaConfig = {
  model?: string;
  temperature?: number;
  max_tokens?: number;
};

export type GenerateRequest = {
  system: string;
  prompt: string;
  schema: z.ZodTypeAny;
};

export type GenerateResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function generateWithOllama(
  prompt: string,
  config: OllamaConfig = {
    model:
      "hf.co/mmnga/cyberagent-DeepSeek-R1-Distill-Qwen-14B-Japanese-gguf:latest",
    temperature: 0.7,
    max_tokens: 2048,
  },
) {
  try {
    const response = await axios.post(
      "http://ollama:11434/api/generate",
      {
        model: config.model,
        prompt: prompt,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return { success: response.data.response };
  } catch (error) {
    return {
      error: `Error calling Ollama API: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * OpenAI API を使用してAI生成を実行するサーバーアクション
 * @param request 生成リクエスト
 * @returns 生成結果
 */
export async function generateWithAI(
  request: GenerateRequest,
): Promise<GenerateResult> {
  try {
    const client = new OpenAI();

    const completion = await client.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: request.system,
        },
        { role: "user", content: request.prompt },
      ],
      response_format: zodResponseFormat(request.schema, "result"),
    });

    const message = completion.choices[0]?.message;
    if (message.parsed) {
      console.log("AI generated data:", message.parsed);
      return {
        success: true,
        data: message.parsed,
      };
    } else {
      console.log("AI generation refusal:", message.refusal);
      return {
        success: false,
        error: message.refusal ?? "AI generation was refused",
      };
    }
  } catch (error) {
    console.error("Error in AI generation:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
