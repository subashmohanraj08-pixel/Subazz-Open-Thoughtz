require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  { name: 'Ideas', emoji: '💡' },
  { name: 'Thoughts', emoji: '🧠' },
  { name: 'Technology', emoji: '💻' },
  { name: 'AI', emoji: '🤖' },
  { name: 'Creativity', emoji: '🎨' },
  { name: 'Education', emoji: '📚' },
  { name: 'Travel', emoji: '🌍' },
  { name: 'Gaming', emoji: '🎮' },
  { name: 'Innovation', emoji: '🚀' },
  { name: 'Life', emoji: '❤️' },
  { name: 'Trending', emoji: '🔥' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  for (const cat of DEFAULT_CATEGORIES) {
    await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true, new: true });
  }
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories.`);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@subazopenthoughtz.com';
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'ChangeMe_Admin123!',
      displayName: 'Admin',
      role: 'admin',
    });
    console.log(`Created admin account: ${adminEmail} (change the password after first login!)`);
  } else {
    console.log('Admin account already exists, skipping.');
  }

  await mongoose.disconnect();
  console.log('Seeding complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
