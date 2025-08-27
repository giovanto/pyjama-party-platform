import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { corsHeaders } from '@/lib/cors';

const CACHE_CONTROL = 'public, max-age=900, stale-while-revalidate=1800';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get dreams grouped by date for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: dreams, error } = await supabase
      .from('public_dreams')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching growth data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch growth data' },
        { status: 500 }
      );
    }

    // Group by day
    const dailyData = new Map<string, { dreams: number; participants: number }>();
    
    // Initialize all days in the range
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      dailyData.set(dateStr, { dreams: 0, participants: 0 });
    }

    // Count dreams and participants by day
    dreams?.forEach((dream) => {
      const date = dream.created_at.split('T')[0];
      const existing = dailyData.get(date);
      if (existing) {
        existing.dreams++;
        // participants omitted in public view
      }
    });

    // Convert to chart data
    const chartData = Array.from(dailyData.entries()).map(([date, data]) => {
      const dateObj = new Date(date);
      return {
        date,
        formattedDate: dateObj.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        dreams: data.dreams,
        participants: data.participants,
        weekday: dateObj.toLocaleDateString('en-US', { weekday: 'short' })
      };
    });

    // Calculate cumulative totals
    let cumulativeDreams = 0;
    let cumulativeParticipants = 0;
    
    const cumulativeData = chartData.map((day) => {
      cumulativeDreams += day.dreams;
      cumulativeParticipants += day.participants;
      return {
        ...day,
        cumulativeDreams,
        cumulativeParticipants
      };
    });

    // Calculate growth metrics
    const totalDreams = cumulativeDreams;
    const totalParticipants = 0;
    const last7Days = chartData.slice(-7).reduce((sum, day) => sum + day.dreams, 0);
    const previous7Days = chartData.slice(-14, -7).reduce((sum, day) => sum + day.dreams, 0);
    const weeklyGrowthRate = previous7Days > 0 ? ((last7Days - previous7Days) / previous7Days * 100) : 0;

    // Find peak day
    const peakDay = chartData.reduce((max, day) => 
      day.dreams > max.dreams ? day : max, 
      chartData[0]
    );

    const responseData = {
      chartData: cumulativeData,
      metrics: {
        totalDreams,
        totalParticipants,
        last7Days,
        weeklyGrowthRate: Math.round(weeklyGrowthRate * 10) / 10,
        peakDay: {
          date: peakDay.formattedDate,
          dreams: peakDay.dreams
        },
        averageDailyDreams: Math.round((totalDreams / 30) * 10) / 10,
        participationRate: totalDreams > 0 ? Math.round((totalParticipants / totalDreams) * 100) : 0
      },
      lastUpdated: new Date().toISOString(),
    };

    const headers = { ...corsHeaders(new Request('')), 'Cache-Control': CACHE_CONTROL };
    return NextResponse.json(responseData, { headers });
  } catch (error) {
    console.error('Growth chart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
