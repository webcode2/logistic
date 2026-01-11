import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface Terminal {
  id: string;
  name: string;
  location: string;
}

async function main(): Promise<void> {
  try {
    // Clear existing data (for development)
    console.log('Clearing existing data...');
    await prisma.trackingEvent.deleteMany();
    await prisma.waybill.deleteMany();
    await prisma.routeNode.deleteMany();
    await prisma.route.deleteMany();
    await prisma.terminal.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    console.log('Creating admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@logitrack.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'Administrator';
    const adminPhone = process.env.ADMIN_PHONE || '+234901234567';

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        phone: adminPhone,
        role: 'ADMIN',
        twoFactorEnabled: false,
        twoFactorVerified: false,
        requiresTwoFA: true, // Require 2FA on first login
      },
    });

    console.log(`✓ Admin user created: ${adminEmail}`);

    // Create terminals
    console.log('Creating terminals...');
    const nyTerminal = await prisma.terminal.create({
      data: {
        name: 'New York Hub',
        location: 'New York, USA',
        average_processing_days: 1,
      },
    });

    const chicagoTerminal = await prisma.terminal.create({
      data: {
        name: 'Chicago Distribution Center',
        location: 'Chicago, USA',
        average_processing_days: 1,
      },
    });

    const laTerminal = await prisma.terminal.create({
      data: {
        name: 'Los Angeles Port',
        location: 'Los Angeles, USA',
        average_processing_days: 2,
      },
    });

    const dallasTerminal = await prisma.terminal.create({
      data: {
        name: 'Dallas Regional Center',
        location: 'Dallas, USA',
        average_processing_days: 1,
      },
    });

    const miamiTerminal = await prisma.terminal.create({
      data: {
        name: 'Miami International Airport',
        location: 'Miami, USA',
        average_processing_days: 1,
      },
    });

    // Create routes
    console.log('Creating routes...');
    const coastRoute = await prisma.route.create({
      data: {
        name: 'Coast-to-Coast Express',
        description: 'New York to Los Angeles via Chicago',
        nodes: {
          create: [
            { terminal_id: nyTerminal.id, sequence_order: 0 },
            { terminal_id: chicagoTerminal.id, sequence_order: 1 },
            { terminal_id: laTerminal.id, sequence_order: 2 },
          ],
        },
      },
    });

    const southRoute = await prisma.route.create({
      data: {
        name: 'Southern Gateway',
        description: 'New York to Miami via Dallas',
        nodes: {
          create: [
            { terminal_id: nyTerminal.id, sequence_order: 0 },
            { terminal_id: dallasTerminal.id, sequence_order: 1 },
            { terminal_id: miamiTerminal.id, sequence_order: 2 },
          ],
        },
      },
    });

    const texasRoute = await prisma.route.create({
      data: {
        name: 'Texas Hub Network',
        description: 'Chicago to Los Angeles via Dallas',
        nodes: {
          create: [
            { terminal_id: chicagoTerminal.id, sequence_order: 0 },
            { terminal_id: dallasTerminal.id, sequence_order: 1 },
            { terminal_id: laTerminal.id, sequence_order: 2 },
          ],
        },
      },
    });

    console.log('✓ Seeded database successfully');
    console.log(`
Created:
- 1 Admin User (${adminEmail})
- 5 Terminals
- 3 Routes with pre-configured terminal sequences

Ready to create waybills and track shipments!

Admin Credentials:
Email: ${adminEmail}
Password: ${adminPassword}
    `);

    return;
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
