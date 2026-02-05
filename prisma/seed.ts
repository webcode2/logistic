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
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rhineroute.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'Administrator';
    const adminPhone = process.env.ADMIN_PHONE || '+49691234567';

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
    const frankfurtTerminal = await prisma.terminal.create({
      data: {
        name: 'Frankfurt Logistics Hub',
        location: 'Frankfurt, Germany',
        average_processing_days: 1,
      },
    });

    const amsterdamTerminal = await prisma.terminal.create({
      data: {
        name: 'Amsterdam Distribution Center',
        location: 'Amsterdam, Netherlands',
        average_processing_days: 1,
      },
    });

    const rotterdamTerminal = await prisma.terminal.create({
      data: {
        name: 'Rotterdam Sea Port',
        location: 'Rotterdam, Netherlands',
        average_processing_days: 2,
      },
    });

    const munichTerminal = await prisma.terminal.create({
      data: {
        name: 'Munich Regional Hub',
        location: 'Munich, Germany',
        average_processing_days: 1,
      },
    });

    const zurichTerminal = await prisma.terminal.create({
      data: {
        name: 'Zurich Air Cargo',
        location: 'Zurich, Switzerland',
        average_processing_days: 1,
      },
    });

    // Create routes
    console.log('Creating routes...');
    const rhineExpress = await prisma.route.create({
      data: {
        name: 'Rhine Express Route',
        description: 'Frankfurt to Rotterdam via Amsterdam',
        nodes: {
          create: [
            { terminal_id: frankfurtTerminal.id, sequence_order: 0 },
            { terminal_id: amsterdamTerminal.id, sequence_order: 1 },
            { terminal_id: rotterdamTerminal.id, sequence_order: 2 },
          ],
        },
      },
    });

    const alpineRoute = await prisma.route.create({
      data: {
        name: 'Alpine Gateway',
        description: 'Frankfurt to Zurich via Munich',
        nodes: {
          create: [
            { terminal_id: frankfurtTerminal.id, sequence_order: 0 },
            { terminal_id: munichTerminal.id, sequence_order: 1 },
            { terminal_id: zurichTerminal.id, sequence_order: 2 },
          ],
        },
      },
    });

    const beneluxRoute = await prisma.route.create({
      data: {
        name: 'Benelux Connector',
        description: 'Amsterdam to Rotterdam via Zurich',
        nodes: {
          create: [
            { terminal_id: amsterdamTerminal.id, sequence_order: 0 },
            { terminal_id: zurichTerminal.id, sequence_order: 1 },
            { terminal_id: rotterdamTerminal.id, sequence_order: 2 },
          ],
        },
      },
    });

    // Create sample shipments (Waybills)
    console.log('Creating sample shipments...');

    // Helper for tracking codes
    const generateTrackingCode = () => `RR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const shipment1 = await prisma.waybill.create({
      data: {
        tracking_code: generateTrackingCode(),
        route_id: rhineExpress.id,
        current_node_index: 0,
        current_terminal_id: frankfurtTerminal.id,
        shipper_name: 'John Doe',
        shipper_email: 'john@example.com',
        shipper_phone: '+49123456789',
        shipper_address: '123 Frankfurt St, Germany',
        receiver_name: 'Jane Smith',
        receiver_email: 'jane@example.com',
        receiver_phone: '+31123456789',
        receiver_address: '456 Rotterdam Ave, Netherlands',
        origin: 'Frankfurt, Germany',
        destination: 'Rotterdam, Netherlands',
        weight: '12.5 kg',
        dimensions: '40 x 30 x 20 cm',
        estimated_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'PROCESSING',
        tracking_events: {
          create: [
            {
              terminal_id: frankfurtTerminal.id,
              event_type: 'CREATED',
              description: 'Shipment created and scheduled for movement',
            }
          ]
        }
      }
    });

    const shipment2 = await prisma.waybill.create({
      data: {
        tracking_code: generateTrackingCode(),
        route_id: alpineRoute.id,
        current_node_index: 1,
        current_terminal_id: munichTerminal.id,
        shipper_name: 'Alice Cooper',
        shipper_email: 'alice@rock.com',
        shipper_phone: '+49987654321',
        shipper_address: '789 Berlin Way, Germany',
        receiver_name: 'Bob Marley',
        receiver_email: 'bob@reggae.com',
        receiver_phone: '+41123456789',
        receiver_address: '101 Zurich St, Switzerland',
        origin: 'Frankfurt, Germany',
        destination: 'Zurich, Switzerland',
        weight: '5.0 kg',
        dimensions: '20 x 20 x 20 cm',
        estimated_delivery_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        status: 'IN_TRANSIT',
        tracking_events: {
          create: [
            {
              terminal_id: frankfurtTerminal.id,
              event_type: 'CREATED',
              description: 'Shipment created',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
              terminal_id: munichTerminal.id,
              event_type: 'ARRIVED',
              description: 'Arrived at Munich Regional Hub for processing',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
          ]
        }
      }
    });

    const shipment3 = await prisma.waybill.create({
      data: {
        tracking_code: generateTrackingCode(),
        route_id: beneluxRoute.id,
        current_node_index: 2,
        current_terminal_id: rotterdamTerminal.id,
        shipper_name: 'Charlie Brown',
        shipper_email: 'charlie@peanuts.com',
        shipper_phone: '+31612345678',
        shipper_address: '202 Amsterdam Sq, Netherlands',
        receiver_name: 'Lucy Van Pelt',
        receiver_email: 'lucy@peanuts.com',
        receiver_phone: '+31687654321',
        receiver_address: '303 Rotterdam Port, Netherlands',
        origin: 'Amsterdam, Netherlands',
        destination: 'Rotterdam, Netherlands',
        weight: '25.0 kg',
        dimensions: '60 x 40 x 40 cm',
        estimated_delivery_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        status: 'DELIVERED',
        tracking_events: {
          create: [
            {
              terminal_id: amsterdamTerminal.id,
              event_type: 'CREATED',
              description: 'Shipment created',
              timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
            },
            {
              terminal_id: zurichTerminal.id,
              event_type: 'ARRIVED',
              description: 'Arrived at Zurich for intermediate processing',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            },
            {
              terminal_id: rotterdamTerminal.id,
              event_type: 'DELIVERED',
              description: 'Successfully delivered to the recipient',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
          ]
        }
      }
    });

    console.log('✓ Seeded database successfully');
    console.log(`
Created:
- 1 Admin User (${adminEmail})
- 5 Terminals
- 3 Routes with pre-configured terminal sequences
- 3 Sample Shipments (Processing, In Transit, Delivered)

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
