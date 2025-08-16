import { NextRequest, NextResponse } from 'next/server';

type GoogleCalendarEvent = {
  start: {
    date?: string;
    dateTime?: string;
  };
  summary?: string;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ?? new Date().getFullYear().toString();
    
    const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
    if (!apiKey) {
      console.error('Google Calendar API key not found');
      return NextResponse.json({ holidays: [] }, { status: 200 });
    }

    const calendarId = 'ja.japanese.official%23holiday%40group.v.calendar.google.com';
    const timeMin = `${year}-01-01T00:00:00Z`;
    const timeMax = `${year}-12-31T23:59:59Z`;
    
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Google Calendar API error:', response.status, response.statusText);
      return NextResponse.json({ holidays: [] }, { status: 200 });
    }
    
    const data: { items?: GoogleCalendarEvent[] } = await response.json();
    
    const holidays = data.items?.map((event: GoogleCalendarEvent) => ({
      date: event.start.date ?? (event.start.dateTime ? event.start.dateTime.split('T')[0] : undefined),
      name: event.summary,
    })) ?? [];
    return NextResponse.json({ holidays }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400', // 24時間キャッシュ
      },
    });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json({ holidays: [] }, { status: 200 });
  }
}