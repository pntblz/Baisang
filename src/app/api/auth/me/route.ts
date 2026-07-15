import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('line_session');

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ user: null });
  }

  try {
    const user = JSON.parse(sessionCookie.value);
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}
