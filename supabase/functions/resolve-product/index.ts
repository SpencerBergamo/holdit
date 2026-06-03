import { createClient } from '@supabase/supabase-js';

import {
  extractProductFromCapture,
  isExtractProductInput,
} from '../_shared/product-extraction.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, {
      status: 405,
      headers: corsHeaders,
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return Response.json({ error: 'Unauthorized.' }, {
      status: 401,
      headers: corsHeaders,
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return Response.json({ error: 'Unauthorized.' }, {
      status: 401,
      headers: corsHeaders,
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (!isExtractProductInput(body)) {
    return Response.json({ error: 'Invalid request.' }, {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    const result = await extractProductFromCapture(body);
    return Response.json(result, { headers: corsHeaders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Product extraction failed.';
    const status = message.includes('GEMINI_API_KEY') ? 503 : 502;

    return Response.json({ error: message }, {
      status,
      headers: corsHeaders,
    });
  }
});
