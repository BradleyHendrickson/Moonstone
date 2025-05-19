import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Only safe on server
);

export const dynamic = 'force-dynamic'; // Enable on-demand revalidation

export async function GET(request) {
  try {
    // Fetch the first (or only) endpointsettings record
    const { data, error } = await supabase
      .from('endpointsettings')
      .select('endpoint_url, endpoint_secret')
      .limit(1)
      .single();

    if (error || !data) {
      console.error('Failed to fetch endpointsettings:', error);
      return NextResponse.json({ error: 'Settings not found' }, { status: 500 });
    }

    const { endpoint_url, endpoint_secret } = data;

    // Create a simple payload — adjust fields as needed
    const payload = {
      sub: 'api-client',
      iat: Math.floor(Date.now() / 1000) - 80,
      "https://hasura.io/jwt/claims": {
        "x-hasura-allowed-roles": ["user", "admin"],
        "x-hasura-default-role": "user",
        "x-hasura-user-id": "9999",
      }
    };

    const token = jwt.sign(payload, endpoint_secret, { algorithm: 'HS256', expiresIn: '2h' });

    // Set cache headers for on-demand revalidation
    return NextResponse.json(
      { token, endpoint_url },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err) {
    console.error('Token generation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
