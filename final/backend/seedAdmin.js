const connectDB = require('./utils/db');
const Admin = require('./models/Admin');
const dotenv = require('dotenv');
dotenv.config();

const seed = async () => {
  try {
    await connectDB();
    
    const email = 'admin@example.com';
    const username = 'admin';
    const password = 'AdminPassword123!';
    
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log('Admin user already exists with email:', email);
      process.exit(0);
    }
    
    const admin = new Admin({
      username,
      email,
      password
    });
    
    await admin.save();
    console.log('Admin user created successfully!');
    console.log('------------------------------');
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    process.exit(0);
  }
};

seed();
