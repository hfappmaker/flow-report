"use server";
/**
 * Google Calendar API関連の機能
 */

import { Holiday } from "../types/holiday";
/**
 * Google Calendar APIから祝日データを取得する
 * @param year 年
 * @returns 祝日の配列
 */
export async function fetchHolidays(year: number): Promise<Holiday[]> {
  try {
    const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_CALENDAR_API_KEY is not configured");
      return [];
    }

    const calendarId =
      "ja.japanese.official%23holiday%40group.v.calendar.google.com";
    const timeMin = `${year}-01-01T00:00:00Z`;
    const timeMax = `${year}-12-31T23:59:59Z`;

    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        "Google Calendar API error:",
        response.status,
        response.statusText,
      );
      return [];
    }

    const data: {
      items?: {
        start: { date?: string; dateTime?: string };
        summary?: string;
      }[];
    } = await response.json();

    const holidays: Holiday[] =
      data.items
        ?.map((event) => ({
          date:
            event.start.date ??
            (event.start.dateTime ? event.start.dateTime.split("T")[0] : ""),
          name: event.summary ?? "",
        }))
        .filter((h) => h.date && h.name) ?? [];

    return holidays;
  } catch (error) {
    console.error("Error fetching holidays from Google Calendar:", error);
    return [];
  }
}
