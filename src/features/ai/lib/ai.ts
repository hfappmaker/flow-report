"use server";

import axios from "axios";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import { fetchHolidays } from "@/features/holidays/libs/google-calendar";

type OllamaConfig = {
  model?: string;
  temperature?: number;
  max_tokens?: number;
};

export type GenerateRequest = {
  method: string;
  prompt: string;
};

export type GenerateResult = {
  success: boolean;
  data?: unknown;
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
    // バリデーション
    if (!request.method || !request.prompt) {
      return {
        success: false,
        error: "Missing required fields: method and prompt are required",
      };
    }

    const { system, schema } = await getSystemPromptAndSchema(request.method);
    console.log("Using system prompt:", system);

    const client = new OpenAI();

    const completion = await client.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: system,
        },
        { role: "user", content: request.prompt },
      ],
      response_format: zodResponseFormat(schema, "workTimes"),
    });

    const message = completion.choices[0]?.message;
    if (message.parsed) {
      console.log(message.parsed);
    } else {
      console.log(message.refusal);
    }

    return {
      success: true,
      data: message,
    };
  } catch (error) {
    console.error("Error in AI generation:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

async function getSystemPromptAndSchema(method: string): Promise<{
  system: string;
  schema: z.ZodTypeAny;
}> {
  switch (method) {
    case "create-work-time": {
      // 祝日データを取得してプロンプトに含める
      const holidays = await fetchHolidays(2025);
      return {
        system: `Based on the prompt, generate work hours in August 2025 in a structured format. 祭日は${JSON.stringify(holidays)}です。`,
        schema: z.object({
          workTimes: z.array(
            z.object({
              start: z.string(),
              end: z.string(),
            }),
          ),
        }),
      };
    }
    default:
      return { system: "", schema: z.any() };
  }
}
