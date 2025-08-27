import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VolunteerStats } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const stationCode = searchParams.get('stationCode');

    if (!sessionId || !stationCode) {
      return NextResponse.json(
        { error: 'Session ID and station code are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get today's date for filtering
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    // Get submissions count for today (from this session)
    const { data: todaySubmissions, error: todayError } = await supabase
      .from('dreams')
      .select('id, created_at')
      .eq('session_id', sessionId)
      .gte('created_at', startOfDay)
      .lt('created_at', endOfDay);

    if (todayError) {
      console.error('Error fetching today submissions:', todayError);
    }

    // Get total submissions from this session (all time)
    const { data: totalSubmissions, error: totalError } = await supabase
      .from('dreams')
      .select('id, created_at')
      .eq('session_id', sessionId);

    if (totalError) {
      console.error('Error fetching total submissions:', totalError);
    }

    // Calculate average time per submission (based on intervals between submissions)
    let avgTimePerSubmission = 0;
    if (todaySubmissions && todaySubmissions.length > 1) {
      const sortedTimes = todaySubmissions
        .map(s => new Date(s.created_at).getTime())
        .sort((a, b) => a - b);
      
      const intervals = [];
      for (let i = 1; i < sortedTimes.length; i++) {
        intervals.push((sortedTimes[i] - sortedTimes[i - 1]) / 1000); // Convert to seconds
      }
      
      avgTimePerSubmission = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    }

    // Get last submission time
    const lastSubmissionTime = todaySubmissions && todaySubmissions.length > 0
      ? todaySubmissions.reduce((latest, submission) => {
          const submissionTime = new Date(submission.created_at);
          return submissionTime > latest ? submissionTime : latest;
        }, new Date(0)).toISOString()
      : undefined;

    const stats: VolunteerStats = {
      sessionId,
      stationCode,
      submissionsToday: todaySubmissions?.length || 0,
      submissionsTotal: totalSubmissions?.length || 0,
      avgTimePerSubmission: Math.round(avgTimePerSubmission),
      lastSubmissionTime,
      offlineQueueSize: 0, // This will be updated by the client-side component
      targetSubmissions: 50 // Default target, could be configurable
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Volunteer stats error:', error);
    
    // Return minimal stats on error to avoid breaking the dashboard
    const fallbackStats: VolunteerStats = {
      sessionId: 'unknown',
      stationCode: 'unknown',
      submissionsToday: 0,
      submissionsTotal: 0,
      avgTimePerSubmission: 0,
      offlineQueueSize: 0
    };

    return NextResponse.json(fallbackStats);
  }
}

// POST method for updating volunteer session data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      stationCode,
      action, // 'start', 'end', 'update'
      data
    } = body;

    if (!sessionId || !stationCode || !action) {
      return NextResponse.json(
        { error: 'Session ID, station code, and action are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    switch (action) {
      case 'start':
        // Record session start (could be stored in a sessions table)
        try {
          await supabase.from('analytics_events').insert({
            event_type: 'volunteer_session_started',
            event_data: {
              sessionId,
              stationCode,
              volunteerId: data?.volunteerId,
              language: data?.language || 'en',
              targetSubmissions: data?.targetSubmissions || 50
            },
            created_at: new Date().toISOString()
          });
        } catch (analyticsError) {
          console.log('Analytics recording failed:', analyticsError);
        }
        break;

      case 'end':
        // Record session end
        try {
          await supabase.from('analytics_events').insert({
            event_type: 'volunteer_session_ended',
            event_data: {
              sessionId,
              stationCode,
              endTime: new Date().toISOString(),
              finalStats: data
            },
            created_at: new Date().toISOString()
          });
        } catch (analyticsError) {
          console.log('Analytics recording failed:', analyticsError);
        }
        break;

      case 'update':
        // Record periodic session updates
        try {
          await supabase.from('analytics_events').insert({
            event_type: 'volunteer_session_updated',
            event_data: {
              sessionId,
              stationCode,
              stats: data,
              updateTime: new Date().toISOString()
            },
            created_at: new Date().toISOString()
          });
        } catch (analyticsError) {
          console.log('Analytics recording failed:', analyticsError);
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use start, end, or update' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Volunteer session update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Options for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}