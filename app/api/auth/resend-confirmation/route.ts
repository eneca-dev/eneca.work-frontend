import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${process.env.API_URL}/auth/resend-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    // Pass along the status code from the backend
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Resend confirmation API error:', error)
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
} 