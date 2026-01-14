import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const client = await pool.connect()
    
    const query = await client.query(
      `SELECT hour, entries, exits FROM hourly_stats 
       WHERE date = $1 
       ORDER BY hour ASC`,
      [date]
    )

    client.release()

    const hourlyData = []
    for (let i = 0; i < 24; i++) {
      const hourData = query.rows.find(row => row.hour === i)
      hourlyData.push({
        hour: `${i}:00`,
        entries: hourData?.entries || 0,
        exits: hourData?.exits || 0,
      })
    }

    return NextResponse.json(hourlyData)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hourly data' },
      { status: 500 }
    )
  }
}
