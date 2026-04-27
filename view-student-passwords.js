require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function viewStudentPasswords() {
  console.log('📋 Viewing Recently Created Students\n');
  console.log('⚠️  Note: Passwords cannot be retrieved from Supabase Auth.');
  console.log('⚠️  You can only reset them to new temporary passwords.\n');

  // Get all students
  const { data: students, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error fetching students:', error);
    return;
  }

  if (!students || students.length === 0) {
    console.log('No students found in database.');
    return;
  }

  console.log('Recently Created Students:');
  console.log('═'.repeat(80));
  
  students.forEach((student, index) => {
    console.log(`\n${index + 1}. ${student.full_name}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Student ID: ${student.student_id}`);
    console.log(`   Department: ${student.department || 'N/A'}`);
    console.log(`   Requires Password Change: ${student.requires_password_change ? 'Yes' : 'No'}`);
    console.log(`   Created: ${new Date(student.created_at).toLocaleString()}`);
  });

  console.log('\n' + '═'.repeat(80));
  console.log('\n💡 To reset a student password for testing:');
  console.log('   Run: node reset-student-password.js <email>');
  console.log('\n💡 Or check your terminal output when you imported the students.');
  console.log('   The passwords were logged there.\n');
}

viewStudentPasswords().then(() => process.exit(0)).catch(console.error);
