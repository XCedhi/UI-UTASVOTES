import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received candidate application submission request');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await request.json();
    console.log('📋 Request body:', JSON.stringify(body, null, 2));
    
    const {
      userId,
      electionId,
      positionTitle,
      fullName,
      studentId,
      email,
      phone,
      department,
      level,
      transactionId,
      applicationFee,
      photoUrl,
      manifestoUrl,
      studentIdUrl,
      transcriptUrl,
    } = body;

    // Validate required fields
    if (!userId || !electionId || !positionTitle || !fullName || !email || !transactionId) {
      console.error('❌ Missing required fields:', {
        userId: !!userId,
        electionId: !!electionId,
        positionTitle: !!positionTitle,
        fullName: !!fullName,
        email: !!email,
        transactionId: !!transactionId,
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('✅ All required fields present');

    // Check if user already applied for this position in this election
    // BUT allow reapplication if previous application was rejected
    console.log('🔍 Checking for existing application...');
    const { data: existingApplication } = await supabase
      .from('candidates')
      .select('id, status')
      .eq('user_id', userId)
      .eq('election_id', electionId)
      .eq('position', positionTitle)
      .in('status', ['pending', 'approved']) // Only block if pending or approved
      .single();

    if (existingApplication) {
      console.log('⚠️ Duplicate application found with status:', existingApplication.status);
      return NextResponse.json(
        { error: 'You have already applied for this position' },
        { status: 400 }
      );
    }

    console.log('✅ No duplicate application found (rejected applications are allowed to reapply)');

    console.log('✅ No duplicate application found');

    // Prepare candidate data matching the actual schema
    console.log('📝 Preparing candidate data...');
    const candidateData: any = {
      election_id: electionId,
      user_id: userId,
      position: positionTitle,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };

    // Add optional fields if they exist in the schema
    if (fullName) candidateData.full_name = fullName;
    if (email) candidateData.email = email;
    if (studentId) candidateData.student_id = studentId;
    if (phone) candidateData.phone = phone;
    if (department) candidateData.department = department;
    if (level) candidateData.level = level;
    if (transactionId) candidateData.transaction_id = transactionId;
    if (applicationFee) candidateData.application_fee = applicationFee;
    if (photoUrl) candidateData.photo_url = photoUrl;
    if (manifestoUrl) candidateData.manifesto_url = manifestoUrl;
    if (studentIdUrl) candidateData.student_id_document_url = studentIdUrl;
    if (transcriptUrl) candidateData.transcript_url = transcriptUrl;

    console.log('📤 Inserting candidate into database...');
    console.log('Candidate data:', JSON.stringify(candidateData, null, 2));

    // Insert candidate application
    const { data: insertedCandidate, error: candidateError } = await supabase
      .from('candidates')
      .insert(candidateData)
      .select()
      .single();

    if (candidateError) {
      console.error('❌ Error inserting candidate:', candidateError);
      return NextResponse.json(
        { error: 'Failed to submit application', details: candidateError.message },
        { status: 500 }
      );
    }

    console.log('✅ Candidate inserted successfully:', insertedCandidate.id);

    // Create notifications for admins and commission members
    console.log('📬 Creating notifications...');
    const { data: adminUsers } = await supabase
      .from('user_profiles')
      .select('id')
      .in('role', ['admin', 'commission']);

    if (adminUsers && adminUsers.length > 0) {
      console.log(`📬 Found ${adminUsers.length} admin/commission users`);
      const notifications = adminUsers.map((user) => ({
        user_id: user.id,
        type: 'application',
        title: 'New Candidate Application',
        message: `${fullName} has submitted an application for ${positionTitle}`,
        related_id: insertedCandidate.id.toString(),
        is_read: false,
        created_at: new Date().toISOString(),
      }));

      const { error: notifError } = await supabase.from('notifications').insert(notifications);
      if (notifError) {
        console.error('⚠️ Error creating notifications:', notifError);
        // Continue anyway - application was saved
      } else {
        console.log('✅ Notifications created successfully');
      }
    } else {
      console.log('⚠️ No admin/commission users found for notifications');
    }

    console.log('✅ Application submission complete!');
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: insertedCandidate.id,
    });
  } catch (error) {
    console.error('❌ Fatal error in candidate application submission:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
