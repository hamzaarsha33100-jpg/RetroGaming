const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'Admin@123456';
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nUpdate MongoDB document with this hash:');
  console.log(JSON.stringify({
    "name": "Admin User",
    "email": "admin@retrogaming.com",
    "password": hash,
    "role": "admin",
    "provider": "credentials",
    "isActive": true,
    "addresses": [],
    "wishlist": []
  }, null, 2));
}

generateHash();
