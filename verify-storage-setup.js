const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyStorageSetup() {
  console.log('🔍 Verifying Supabase Storage Setup...\n');

  // Check if bucket exists
  console.log('1️⃣ Checking if candidate-documents bucket exists...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error('❌ Error listing buckets:', bucketsError);
    return;
  }

  const candidateBucket = buckets?.find(b => b.id === 'candidate-documents');
  
  if (!candidateBucket) {
    console.error('❌ Bucket "candidate-documents" NOT FOUND!');
    console.log('\n📝 Action Required:');
    console.log('   Run the SQL in: create-candidate-documents-storage-bucket.sql');
    console.log('   Location: Supabase Dashboard > SQL Editor');
    return;
  }

  console.log('✅ Bucket "candidate-documents" exists!');
  console.log(`   - Public: ${candidateBucket.public}`);
  console.log(`   - Created: ${candidateBucket.created_at}`);

  // Check files in bucket
  console.log('\n2️⃣ Checking uploaded files...');
  const { data: files, error: filesError } = await supabase.storage
    .from('candidate-documents')
    .list('', {
      limit: 10,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (filesError) {
    console.error('❌ Error listing files:', filesError);
  } else {
    console.log(`✅ Found ${files?.length || 0} files in storage`);
    
    if (files && files.length > 0) {
      console.log('\n📁 Recent files:');
      files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name} (${(file.metadata?.size / 1024).toFixed(2)} KB)`);
      });
    } else {
      console.log('   (No files uploaded yet - this is normal for new setup)');
    }
  }

  // Check candidates with document URLs
  console.log('\n3️⃣ Checking candidate applications with document URLs...');
  const { data: candidates, error: candidatesError } = await supabase
    .from('candidates')
    .select('id, full_name, position, photo_url, manifesto_url, student_id_document_url, transcript_url, status')
    .order('created_at', { ascending: false })
    .limit(5);

  if (candidatesError) {
    console.error('❌ Error fetching candidates:', candidatesError);
  } else {
    console.log(`✅ Found ${candidates?.length || 0} candidate applications`);
    
    if (candidates && candidates.length > 0) {
      console.log('\n📋 Recent applications:');
      candidates.forEach((candidate, index) => {
        console.log(`\n   ${index + 1}. ${candidate.full_name || 'N/A'} - ${candidate.position || 'N/A'}`);
        console.log(`      Status: ${candidate.status}`);
        
        // Check which documents have URLs vs filenames
        const hasPhotoUrl = candidate.photo_url?.startsWith('http');
        const hasManifestoUrl = candidate.manifesto_url?.startsWith('http');
        const hasIdUrl = candidate.student_id_document_url?.startsWith('http');
        const hasTranscriptUrl = candidate.transcript_url?.startsWith('http');
        
        console.log(`      Photo: ${hasPhotoUrl ? '✅ URL' : '⚠️  filename only'}`);
        console.log(`      Manifesto: ${hasManifestoUrl ? '✅ URL' : '⚠️  filename only'}`);
        console.log(`      ID Card: ${hasIdUrl ? '✅ URL' : '⚠️  filename only'}`);
        console.log(`      Transcript: ${hasTranscriptUrl ? '✅ URL' : '⚠️  filename only'}`);
      });
    }
  }

  // Test URL generation
  console.log('\n4️⃣ Testing public URL generation...');
  const testPath = 'test-user/1234567890-test.pdf';
  const { data: testUrl } = supabase.storage
    .from('candidate-documents')
    .getPublicUrl(testPath);
  
  console.log('✅ Sample public URL format:');
  console.log(`   ${testUrl.publicUrl}`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ Verification Complete!');
  console.log('='.repeat(60));
  
  if (candidateBucket) {
    console.log('\n✨ Storage bucket is ready for file uploads!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Clear browser cache (Ctrl+Shift+R)');
    console.log('   2. Restart dev server (npm run dev)');
    console.log('   3. Submit a new candidate application');
    console.log('   4. Check if documents upload successfully');
    console.log('   5. Verify documents can be viewed by commission users');
  }
}

verifyStorageSetup()
  .then(() => {
    console.log('\n✅ Verification script complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
