import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import { fetchHolidays } from "@/features/holidays/libs/google-calendar";

type GenerateRequest = {
  method: string;
  prompt: string;
};

type ApiResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
};

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const body: GenerateRequest = await request.json();

    // バリデーション
    if (!body.method || !body.prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: method and prompt are required",
        },
        { status: 400 },
      );
    }

    const { system, schema } = await getSystemPromptAndSchema(body.method);
    console.log("Using system prompt:", system);
    const client = new OpenAI();

    const completion = await client.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: system,
        },
        { role: "user", content: body.prompt },
      ],
      response_format: zodResponseFormat(schema, "workTimes"),
    });

    const message = completion.choices[0]?.message;
    if (message.parsed) {
      console.log(message.parsed);
    } else {
      console.log(message.refusal);
    }

    // 成功レスポンスを返す
    return NextResponse.json(
      {
        success: true,
        data: message,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error in generate API:", error);

    // エラーの場合も必ずJSON形式で返す
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

async function getSystemPromptAndSchema(method: string): Promise<{
  system: string;
  schema: z.ZodTypeAny;
}> {
  switch (method) {
    case "create-work-time": {
      // 共通関数を使用（サーバーサイドで自動的に直接API呼び出し）
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
