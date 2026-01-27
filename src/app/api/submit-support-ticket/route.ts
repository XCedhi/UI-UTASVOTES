import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Initialize Resend for email sending
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email sending function using Resend
async function sendEmailToAdmins(ticketData: any) {
  try {
    // Check if Resend is configured
    if (!resend) {
      console.log('⚠️  Email sending disabled: RESEND_API_KEY not configured');
      return;
    }

    const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'utasvotes@hotmail.com';
    const FROM_EMAIL = process.env.EMAIL_FROM || 'UTASVotes <onboarding@resend.dev>'; // Change this after domain verification
    
    console.log(`📧 Preparing to send email to: ${ADMIN_EMAIL}`);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Support Ticket</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #F2B807 0%, #D97904 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-top: none;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .ticket-info {
      background: #f9fafb;
      border-left: 4px solid #F2B807;
      padding: 15px;
      margin: 20px 0;
    }
    .priority-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .priority-critical { background: #fee2e2; color: #991b1b; }
    .priority-high { background: #fef3c7; color: #92400e; }
    .priority-medium { background: #dbeafe; color: #1e40af; }
    .priority-low { background: #f3f4f6; color: #374151; }
    .button {
      display: inline-block;
      background: #F2B807;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 24px;">🎫 New Support Ticket</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">UTASVotes Support System</p>
  </div>
  
  <div class="content">
    <p>Hello Administrator,</p>
    
    <p>A new support ticket has been submitted and requires your attention.</p>
    
    <div class="ticket-info">
      <p style="margin: 0 0 10px 0;"><strong>Ticket Number:</strong> ${ticketData.ticket_number}</p>
      <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${ticketData.user_name || 'Anonymous'} (${ticketData.user_email})</p>
      <p style="margin: 0 0 10px 0;"><strong>Category:</strong> ${ticketData.category.charAt(0).toUpperCase() + ticketData.category.slice(1)}</p>
      <p style="margin: 0 0 10px 0;">
        <strong>Priority:</strong> 
        <span class="priority-badge priority-${ticketData.priority}">${ticketData.priority}</span>
      </p>
      <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${ticketData.subject}</p>
    </div>
    
    <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 5px 0; font-weight: 600; color: #374151;">Message:</p>
      <p style="margin: 0; color: #6b7280; white-space: pre-wrap;">${ticketData.message}</p>
    </div>
    
    <p>Please review and respond to this ticket as soon as possible.</p>
    
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin-system-control/support" class="button">
      View Ticket in Dashboard
    </a>
    
    <div class="footer">
      <p>This is an automated notification from UTASVotes Support System</p>
      <p>University of Technical and Applied Sciences (UTAS)</p>
      <p style="margin-top: 10px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #F2B807; text-decoration: none;">UTASVotes</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[UTASVotes] New Support Ticket: ${ticketData.ticket_number}`,
      html: emailHtml,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      return;
    }

    console.log(`✅ Email sent successfully! Email ID: ${data?.id}`);
  } catch (error) {
    console.error('❌ Error sending email notifications:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎫 Support ticket API called');
    const body = await request.json();
    console.log('📝 Request body:', { subject: body.subject, category: body.category, priority: body.priority, userEmail: body.userEmail });
    const { subject, category, priority, message, userEmail, userName, userId } = body;

    // Validation
    if (!subject || !category || !priority || !message || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['general', 'technical', 'account', 'election', 'security', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.log('🔄 Attempting to insert ticket into database...');
    console.log('📊 Insert data:', {
      user_email: userEmail,
      user_name: userName || null,
      subject: subject.trim(),
      category,
      priority,
    });

    // Insert support ticket into database
    const { data: ticket, error: insertError } = await supabaseAdmin
      .from('support_tickets')
      .insert({
        user_id: userId || null,
        user_email: userEmail,
        user_name: userName || null,
        subject: subject.trim(),
        message: message.trim(),
        category,
        priority,
        status: 'open',
        ip_address: ip,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Database error:', insertError);
      console.error('Error code:', insertError.code);
      console.error('Error details:', insertError.details);
      console.error('Error hint:', insertError.hint);
      console.error('Error message:', insertError.message);
      
      // Check if table doesn't exist
      if (insertError.code === '42P01') {
        return NextResponse.json(
          { 
            error: 'Database table not found. Please run the database migration first.',
            details: 'The support_tickets table does not exist. Run supabase/support_tickets_schema.sql in Supabase SQL Editor.',
            hint: 'Go to Supabase Dashboard → SQL Editor → Run support_tickets_schema.sql'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create support ticket', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('✅ Support ticket created:', ticket.ticket_number);

    // Send email notifications to admins (async, don't wait)
    sendEmailToAdmins(ticket).catch(err => 
      console.error('Email notification failed:', err)
    );

    // Return success response
    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        status: ticket.status,
        created_at: ticket.created_at,
      },
      message: 'Support ticket submitted successfully',
    });

  } catch (error: any) {
    console.error('Error in submit-support-ticket API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's tickets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');
    const userId = searchParams.get('userId');

    if (!userEmail && !userId) {
      return NextResponse.json(
        { error: 'Email or userId required' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabaseAdmin
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (userEmail) {
      query = query.eq('user_email', userEmail);
    }

    const { data: tickets, error } = await query;

    if (error) {
      console.error('Error fetching tickets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tickets' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tickets: tickets || [],
    });

  } catch (error: any) {
    console.error('Error in GET support tickets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
