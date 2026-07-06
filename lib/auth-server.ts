import { NextResponse } from 'next/server';

export async function verifyAuthToken(req: Request): Promise<{ uid: string; email: string } | null> {
  try {
    let token: string | null = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    } else {
      const { searchParams } = new URL(req.url);
      token = searchParams.get('token');
    }

    if (!token) return null;

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!apiKey) {
      console.error('Missing Firebase API key for auth verification');
      return null;
    }

    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token })
    });

    if (!res.ok) {
      console.error('Firebase token verification failed. Status:', res.status);
      return null;
    }

    const data = await res.json();
    const user = data.users?.[0];
    
    if (!user || !user.localId) {
      return null;
    }

    return {
      uid: user.localId,
      email: user.email || ''
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized: missing or invalid token' }, { status: 401 });
}
