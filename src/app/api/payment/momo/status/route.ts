import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // In production, you would check the actual MoMo API for transaction status
    // Example for MTN MoMo Ghana:
    /*
    const statusResponse = await fetch(
      `https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/${transactionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Target-Environment': 'sandbox',
          'Ocp-Apim-Subscription-Key': MOMO_API_KEY,
        },
      }
    );
    
    const statusData = await statusResponse.json();
    const status = statusData.status; // PENDING, SUCCESSFUL, FAILED
    */

    // Check database for transaction status
    const { data: transaction, error: dbError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    if (dbError || !transaction) {
      // For testing: simulate random success after a few checks
      // In production, this would come from the actual MoMo API
      const randomSuccess = Math.random() > 0.3; // 70% chance of success
      
      if (randomSuccess) {
        // Update transaction status in database
        await supabase
          .from('payment_transactions')
          .update({
            status: 'success',
            completed_at: new Date().toISOString(),
          })
          .eq('transaction_id', transactionId);

        return NextResponse.json({
          status: 'success',
          transactionId: transactionId,
          message: 'Payment completed successfully',
        });
      } else {
        return NextResponse.json({
          status: 'pending',
          transactionId: transactionId,
          message: 'Waiting for user approval',
        });
      }
    }

    // Return actual status from database
    return NextResponse.json({
      status: transaction.status,
      transactionId: transactionId,
      amount: transaction.amount,
      network: transaction.network,
      message: transaction.status === 'success' 
        ? 'Payment completed successfully'
        : transaction.status === 'failed'
        ? 'Payment failed'
        : 'Waiting for user approval',
    });
  } catch (error) {
    console.error('MoMo status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
