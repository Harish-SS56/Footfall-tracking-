import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET() {
  try {
    const client = await pool.connect()
    
    // Get today's business date
    const now = new Date()
    const businessDate = now.getHours() < 9 
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : now.toISOString().split('T')[0]

    // Get today's stats
    const todayQuery = await client.query(
      `SELECT total_entries, total_exits FROM daily_summary WHERE business_date = $1`,
      [businessDate]
    )

    // Get total stats
    const totalQuery = await client.query(
      `SELECT total_entries, total_exits, current_inside FROM total_stats WHERE id = 1`
    )

    // Get peak hour
    const peakQuery = await client.query(
      `SELECT hour, (entries + exits) as total FROM hourly_stats 
       WHERE date = $1 
       ORDER BY total DESC LIMIT 1`,
      [businessDate]
    )

    const todayData = todayQuery.rows[0] || { total_entries: 0, total_exits: 0 }
    const totalData = totalQuery.rows[0] || { total_entries: 0, total_exits: 0, current_inside: 0 }
    const peakData = peakQuery.rows[0] || { hour: 12, total: 0 }

    client.release()

    return NextResponse.json({
      todayEntries: todayData.total_entries,
      todayExits: todayData.total_exits,
      currentInside: totalData.current_inside,
      totalLifetime: totalData.total_entries,
      peakHour: peakData.hour,
      peakHourCount: peakData.total,
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
