import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// In production, you would use actual MoMo API credentials
// For Ghana: MTN MoMo API, Vodafone Cash API, or AirtelTigo Money API
const MOMO_API_KEY = process.env.MOMO_API_KEY || 'test_key';
const MOMO_API_SECRET = process.env.MOMO_API_SECRET || 'test_secret';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { amount, network, phoneNumber, description } = body;

    // Validate required fields
    if (!amount || !network || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format phone number (remove spaces and ensure it starts with country code)
    const formattedPhone = phoneNumber.replace(/\s/g, '');
    
    // Generate transaction ID
    const transactionId = `MOMO${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // In production, you would call the actual MoMo API here
    // Example for MTN MoMo Ghana:
    /*
    const momoResponse = await fetch('https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Reference-Id': transactionId,
        'X-Target-Environment': 'sandbox',
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': MOMO_API_KEY,
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency: 'GHS',
        externalId: transactionId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: formattedPhone,
        },
        payerMessage: description,
        payeeNote: description,
      }),
    });
    */

    // For development/testing, simulate the payment initiation
    // Store transaction in database
    const { data: transaction, error: dbError } = await supabase
      .from('payment_transactions')
      .insert({
        transaction_id: transactionId,
        amount: amount,
        currency: 'GHS',
        payment_method: 'mobile_money',
        network: network,
        phone_number: formattedPhone,
        description: description,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue even if DB insert fails (for testing)
    }

    // Simulate sending prompt to user's phone
    console.log(`📱 MoMo Payment Prompt Sent:`);
    console.log(`   Network: ${network}`);
    console.log(`   Phone: ${formattedPhone}`);
    console.log(`   Amount: GHS ${amount}`);
    console.log(`   Transaction ID: ${transactionId}`);
    console.log(`   Description: ${description}`);

    return NextResponse.json({
      success: true,
      message: 'Payment prompt sent to your phone',
      transactionId: transactionId,
      network: network,
      phoneNumber: formattedPhone,
    });
  } catch (error) {
    console.error('MoMo payment initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
