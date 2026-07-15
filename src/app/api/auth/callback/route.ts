import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID!;
    const clientSecret = process.env.LINE_CLIENT_SECRET!;
    const redirectUri = `${new URL(request.url).origin}/api/auth/callback`;

    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errData = await tokenResponse.json();
      console.error('Token Error:', errData);
      return NextResponse.redirect(new URL('/?error=token_failed', request.url));
    }

    const tokenData = await tokenResponse.json();

    // 2. Fetch user profile
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileResponse.ok) {
      console.error('Profile Error:', await profileResponse.text());
      return NextResponse.redirect(new URL('/?error=profile_failed', request.url));
    }

    const profileData = await profileResponse.json();

    // 3. Set session cookie
    const sessionData = {
      id: profileData.userId,
      full_name: profileData.displayName,
      avatar_url: profileData.pictureUrl,
    };

    const cookieStore = await cookies();
    cookieStore.set('line_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // 4. Redirect back to home
    return NextResponse.redirect(new URL('/', request.url));
  } catch (err) {
    console.error('LINE Auth Error:', err);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}
