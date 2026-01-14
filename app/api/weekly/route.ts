import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import { format, subDays } from 'date-fns'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET() {
  try {
    const client = await pool.connect()
    
    // Get last 7 days
    const dates = []
    for (let i = 6; i >= 0; i--) {
      dates.push(format(subDays(new Date(), i), 'yyyy-MM-dd'))
    }

    const query = await client.query(
      `SELECT business_date, total_entries, total_exits 
       FROM daily_summary 
       WHERE business_date = ANY($1)
       ORDER BY business_date ASC`,
      [dates]
    )

    client.release()

    const weeklyData = dates.map(date => {
      const dayData = query.rows.find(row => row.business_date === date)
      return {
        date: format(new Date(date), 'MMM dd'),
        entries: dayData?.total_entries || 0,
        exits: dayData?.total_exits || 0,
      }
    })

    return NextResponse.json(weeklyData)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weekly data' },
      { status: 500 }
    )
  }
}
