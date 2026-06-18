const { openDatabase } = require('./db');
const bcrypt = require('bcrypt');

async function createTestAdmin() {
  try {
    const db = await openDatabase();
    
    const hashed = await bcrypt.hash('testadmin123', 10);
    await db.run(
      'INSERT INTO users (full_name, email, username, password, role, phone_number) VALUES (?, ?, ?, ?, ?, ?)',
      'Test Admin',
      'admin@test.com',
      'testadmin',
      hashed,
      'admin',
      '254700000000'
    );
    
    console.log('Test admin created: username=testadmin, password=testadmin123');
    process.exit(0);
  } catch (err) {
    if (err.message.includes('unique constraint')) {
      console.log('Admin account already exists');
    } else {
      console.error('Error:', err);
    }
    process.exit(1);
  }
}

createTestAdmin();
