const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://retrogaming_user:aEHNhTxg4Zzkx3Qf@cluster0.g7m4jgl.mongodb.net/retrogaming?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
  try {
    console.log('🔗 Testing MongoDB connection...');
    console.log('URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name).join(', '));
    
    // Check users collection
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('👥 Users count:', users.length);
    
    if (users.length > 0) {
      console.log('📧 Users:', users.map(u => ({ email: u.email, role: u.role })));
    }
    
    await mongoose.disconnect();
    console.log('👋 Disconnected');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
