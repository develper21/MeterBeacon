import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smtrack.com' },
    update: {},
    create: {
      email: 'admin@smtrack.com',
      password: adminPassword,
      fullName: 'Admin User',
      phone: '+1234567890',
      role: 'ADMIN',
    },
  });

  // Create manager user
  const managerPassword = await hashPassword('manager123');
  const manager = await prisma.user.upsert({
    where: { email: 'manager@smtrack.com' },
    update: {},
    create: {
      email: 'manager@smtrack.com',
      password: managerPassword,
      fullName: 'Manager User',
      phone: '+1234567891',
      role: 'MANAGER',
    },
  });

  // Create field engineer user
  const engineerPassword = await hashPassword('engineer123');
  const engineer = await prisma.user.upsert({
    where: { email: 'engineer@smtrack.com' },
    update: {},
    create: {
      email: 'engineer@smtrack.com',
      password: engineerPassword,
      fullName: 'Field Engineer',
      phone: '+1234567892',
      role: 'FIELD_ENGINEER',
    },
  });

  // Create sample trackers
  const tracker1 = await prisma.tracker.create({
    data: {
      deviceId: 'TRK001',
      meterId: 'MTR001',
      name: 'Warehouse Tracker 1',
      status: 'ACTIVE',
      batteryLevel: 85,
      latitude: 40.7128,
      longitude: -74.0060,
    },
  });

  const tracker2 = await prisma.tracker.create({
    data: {
      deviceId: 'TRK002',
      meterId: 'MTR002',
      name: 'Site Tracker 1',
      status: 'ACTIVE',
      batteryLevel: 92,
      latitude: 40.7580,
      longitude: -73.9855,
    },
  });

  const tracker3 = await prisma.tracker.create({
    data: {
      deviceId: 'TRK003',
      meterId: 'MTR003',
      name: 'Remote Tracker 1',
      status: 'OFFLINE',
      batteryLevel: 15,
      latitude: 40.7831,
      longitude: -73.9712,
    },
  });

  // Create sample geofence (warehouse area)
  const warehouseGeofence = await prisma.geofence.create({
    data: {
      name: 'Main Warehouse',
      type: 'WAREHOUSE',
      area: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [-74.01, 40.71],
            [-74.00, 40.72],
            [-73.99, 40.71],
            [-74.00, 40.70],
            [-74.01, 40.71],
          ],
        ],
      }),
    },
  });

  // Create sample geofence (site area)
  const siteGeofence = await prisma.geofence.create({
    data: {
      name: 'Construction Site A',
      type: 'SITE',
      area: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [-73.99, 40.76],
            [-73.98, 40.77],
            [-73.97, 40.76],
            [-73.98, 40.75],
            [-73.99, 40.76],
          ],
        ],
      }),
    },
  });

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: admin.id,
      type: 'LOW_BATTERY',
      title: 'Low Battery Warning',
      message: 'Tracker TRK003 battery is critically low (15%)',
      trackerId: tracker3.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: manager.id,
      type: 'GEOFENCE_BREACH',
      title: 'Geofence Breach Alert',
      message: 'Tracker TRK001 has exited its designated geofence zone',
      trackerId: tracker1.id,
    },
  });

  // Create sample activity logs
  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: 'CREATE',
      entityType: 'TRACKER',
      entityId: tracker1.id,
      details: { name: tracker1.name },
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: manager.id,
      action: 'CREATE',
      entityType: 'GEOFENCE',
      entityId: warehouseGeofence.id,
      details: { name: warehouseGeofence.name },
    },
  });

  console.log('Seed completed successfully!');
  console.log('Users created:');
  console.log('  - admin@smtrack.com / admin123');
  console.log('  - manager@smtrack.com / manager123');
  console.log('  - engineer@smtrack.com / engineer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
