/**
 * Cleanup API Endpoint
 * Scheduled cleanup job to remove expired dreams
 * This endpoint is called daily via Vercel cron
 */

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

/**
 * Verify the request is from Vercel Cron
 */
function isValidCronRequest(req: VercelRequest): boolean {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  // If CRON_SECRET is set, verify it matches
  if (cronSecret) {
    return authHeader === `Bearer ${cronSecret}`;
  }
  
  // Fallback: check for Vercel cron headers
  return req.headers['user-agent']?.includes('vercel-cron') || 
         req.headers['x-vercel-cron'] === '1';
}

/**
 * Cleanup expired dreams
 */
async function cleanupExpiredDreams(): Promise<{
  deleted_count: number;
  execution_time: number;
}> {
  const startTime = Date.now();
  
  try {
    // Call the database cleanup function
    const { data, error } = await supabase
      .rpc('cleanup_expired_dreams');
    
    if (error) {
      throw new Error(`Cleanup function failed: ${error.message}`);
    }
    
    const executionTime = Date.now() - startTime;
    const deletedCount = data || 0;
    
    console.log(`Cleanup completed: ${deletedCount} dreams deleted in ${executionTime}ms`);
    
    return {
      deleted_count: deletedCount,
      execution_time: executionTime,
    };
    
  } catch (error) {
    console.error('Cleanup error:', error);
    throw error;
  }
}

/**
 * Get cleanup statistics
 */
async function getCleanupStats(): Promise<{
  total_active_dreams: number;
  total_expired_dreams: number;
  oldest_active_dream: string | null;
  newest_active_dream: string | null;
}> {
  try {
    const now = new Date().toISOString();
    
    // Get active dreams count
    const { count: activeDreams, error: activeError } = await supabase
      .from('dreams')
      .select('*', { count: 'exact', head: true })
      .gt('expires_at', now);
    
    if (activeError) {
      throw new Error(`Failed to count active dreams: ${activeError.message}`);
    }
    
    // Get expired dreams count
    const { count: expiredDreams, error: expiredError } = await supabase
      .from('dreams')
      .select('*', { count: 'exact', head: true })
      .lte('expires_at', now);
    
    if (expiredError) {
      throw new Error(`Failed to count expired dreams: ${expiredError.message}`);
    }
    
    // Get oldest and newest active dreams
    const { data: oldestDream, error: oldestError } = await supabase
      .from('dreams')
      .select('created_at')
      .gt('expires_at', now)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    
    const { data: newestDream, error: newestError } = await supabase
      .from('dreams')
      .select('created_at')
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    return {
      total_active_dreams: activeDreams || 0,
      total_expired_dreams: expiredDreams || 0,
      oldest_active_dream: oldestDream?.created_at || null,
      newest_active_dream: newestDream?.created_at || null,
    };
    
  } catch (error) {
    console.error('Stats error:', error);
    throw error;
  }
}

/**
 * Main cleanup handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check environment variables
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Database connection not configured',
        timestamp: new Date().toISOString(),
      });
    }
    
    // For GET requests, return cleanup status (for monitoring)
    if (req.method === 'GET') {
      try {
        const stats = await getCleanupStats();
        
        return res.json({
          status: 'healthy',
          message: 'Cleanup service is operational',
          stats,
          timestamp: new Date().toISOString(),
        });
        
      } catch (error) {
        return res.status(500).json({
          error: 'Service check failed',
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    // For POST requests, perform cleanup
    if (req.method === 'POST') {
      // Verify this is a legitimate cron request
      if (!isValidCronRequest(req)) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid cron request',
          timestamp: new Date().toISOString(),
        });
      }
      
      try {
        // Get pre-cleanup stats
        const preStats = await getCleanupStats();
        
        // Perform cleanup
        const cleanupResult = await cleanupExpiredDreams();
        
        // Get post-cleanup stats
        const postStats = await getCleanupStats();
        
        return res.json({
          status: 'success',
          message: 'Cleanup completed successfully',
          cleanup_result: cleanupResult,
          stats: {
            before: preStats,
            after: postStats,
          },
          timestamp: new Date().toISOString(),
        });
        
      } catch (error) {
        console.error('Cleanup execution failed:', error);
        return res.status(500).json({
          error: 'Cleanup failed',
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    // Method not allowed
    return res.status(405).json({
      error: 'Method not allowed',
      message: `${req.method} method is not supported`,
      allowed: ['GET', 'POST'],
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Cleanup API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    });
  }
}