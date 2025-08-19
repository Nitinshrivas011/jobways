import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/UserModel.js';  // Use correct relative path
import bcrypt from 'bcryptjs';

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/jobways';

async function connectDB() {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpassword', // You should hash it before saving
    role: 'admin',
    emailVerified: true,
  },
  {
    name: 'HR User',
    email: 'hr@example.com',
    password: 'hrpassword',
    role: 'hr',
    emailVerified: true,
  },
  // Add more users as needed
];


async function seedUsers() {
  await connectDB();

  // Clear existing users (optional)
  await User.deleteMany({});

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({
      ...userData,
      password: hashedPassword,
    });
    await user.save();
    console.log(`User ${user.email} created`);
  }

  mongoose.disconnect();
  console.log('User seeding completed');
}

seedUsers();

