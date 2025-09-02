import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  course_id: string;
  amount: number;
  currency: string;
  phone_number?: string;
  email: string;
  first_name: string;
  last_name: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get user from JWT token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { course_id, amount, currency, phone_number, email, first_name, last_name }: PaymentRequest = await req.json();

    const isProduction = Deno.env.get('ENVIRONMENT') === 'production';
    const publishableKey = isProduction ? 
      Deno.env.get('INTASEND_LIVE_PUBLISHABLE_KEY') : 
      Deno.env.get('INTASEND_TEST_PUBLISHABLE_KEY');
    const secretKey = isProduction ? 
      Deno.env.get('INTASEND_LIVE_SECRET_KEY') : 
      Deno.env.get('INTASEND_TEST_SECRET_KEY');

    const baseUrl = isProduction ? 
      'https://payment.intasend.com/api/v1' : 
      'https://sandbox.intasend.com/api/v1';

    // Create payment request to Intasend
    const paymentData = {
      public_key: publishableKey,
      amount: amount,
      currency: currency.toUpperCase(),
      email: email,
      first_name: first_name,
      last_name: last_name,
      phone_number: phone_number || '',
      redirect_url: `${req.headers.get('origin')}/courses/${course_id}?payment=success`,
      api_ref: `course-${course_id}-${user.id}-${Date.now()}`,
    };

    console.log('Creating payment with Intasend:', paymentData);

    const intasendResponse = await fetch(`${baseUrl}/checkout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-IntaSend-Public-Key': publishableKey!,
        'Authorization': `Bearer ${secretKey}`,
      },
      body: JSON.stringify(paymentData),
    });

    const intasendResult = await intasendResponse.json();
    console.log('Intasend response:', intasendResult);

    if (!intasendResponse.ok) {
      throw new Error(`Intasend error: ${intasendResult.message || 'Payment creation failed'}`);
    }

    // Store payment record in database
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        course_id: course_id,
        amount: amount,
        currency: currency,
        payment_method: 'intasend',
        transaction_id: intasendResult.invoice.id,
        status: 'pending',
        payment_data: intasendResult,
      });

    if (paymentError) {
      console.error('Error storing payment record:', paymentError);
      // Continue even if storage fails, as payment is initiated
    }

    return new Response(JSON.stringify({
      success: true,
      checkout_url: intasendResult.url,
      transaction_id: intasendResult.invoice.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Payment error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});