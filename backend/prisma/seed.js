import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@lms.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin user already exists. Skipping seed.');
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      fullName: adminName,
      role: 'ADMIN',
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log('✓ Admin user created successfully');
  console.log(`  Email: ${admin.email}`);
  console.log(`  Password: ${adminPassword}`);
  console.log(`  Role: ${admin.role}`);
  console.log('\n⚠️  Please change the admin password after first login!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

