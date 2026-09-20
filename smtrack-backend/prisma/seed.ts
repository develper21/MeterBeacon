import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting comprehensive database seed for smTrack...');

  // 1. Ensure System Users
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smtrack.com' },
    update: { password: adminPassword },
    create: {
      email: 'admin@smtrack.com',
      password: adminPassword,
      fullName: 'Admin User',
      phone: '+91 98100 12345',
      role: 'ADMIN',
    },
  });

  const managerPassword = await hashPassword('manager123');
  const manager = await prisma.user.upsert({
    where: { email: 'manager@smtrack.com' },
    update: { password: managerPassword },
    create: {
      email: 'manager@smtrack.com',
      password: managerPassword,
      fullName: 'Vikram Malhotra',
      phone: '+91 98111 23456',
      role: 'MANAGER',
    },
  });

  const engineerPassword = await hashPassword('engineer123');
  const engineer = await prisma.user.upsert({
    where: { email: 'engineer@smtrack.com' },
    update: { password: engineerPassword },
    create: {
      email: 'engineer@smtrack.com',
      password: engineerPassword,
      fullName: 'Rajesh Kumar',
      phone: '+91 98222 34567',
      role: 'FIELD_ENGINEER',
    },
  });

  console.log('✅ Users configured:');
  console.log('   - admin@smtrack.com / admin123 (ADMIN)');
  console.log('   - manager@smtrack.com / manager123 (MANAGER)');
  console.log('   - engineer@smtrack.com / engineer123 (FIELD_ENGINEER)');

  // Clean existing non-user data to prevent duplicates on re-seed
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.trackerHistory.deleteMany();
  await prisma.geofence.deleteMany();
  await prisma.tracker.deleteMany();

  // 2. Insert Trackers (Real Delhi NCR Fleet)
  const trackerSeeds = [
    {
      deviceId: 'TRK-001',
      meterId: 'MTR-10234',
      name: 'Delhi Central Smart Gateway',
      status: 'ACTIVE' as const,
      batteryLevel: 92,
      latitude: 28.6139,
      longitude: 77.2090,
    },
    {
      deviceId: 'TRK-002',
      meterId: 'MTR-10235',
      name: 'Noida Sector 62 Substation',
      status: 'ACTIVE' as const,
      batteryLevel: 78,
      latitude: 28.5355,
      longitude: 77.3910,
    },
    {
      deviceId: 'TRK-003',
      meterId: 'MTR-10236',
      name: 'Gurgaon Central WH Beacon',
      status: 'INACTIVE' as const,
      batteryLevel: 45,
      latitude: 28.4595,
      longitude: 77.0266,
    },
    {
      deviceId: 'TRK-004',
      meterId: 'MTR-10237',
      name: 'Rohini Sector 18 Feeder',
      status: 'OFFLINE' as const,
      batteryLevel: 15,
      latitude: 28.7041,
      longitude: 77.1025,
    },
    {
      deviceId: 'TRK-005',
      meterId: 'MTR-10238',
      name: 'Delhi Main WH Dispatch unit',
      status: 'INACTIVE' as const,
      batteryLevel: 88,
      latitude: 28.6304,
      longitude: 77.2177,
    },
    {
      deviceId: 'TRK-006',
      meterId: 'MTR-10239',
      name: 'Faridabad Industrial Gateway',
      status: 'ACTIVE' as const,
      batteryLevel: 62,
      latitude: 28.5672,
      longitude: 77.3215,
    },
    {
      deviceId: 'TRK-007',
      meterId: 'MTR-10240',
      name: 'Mathura Road Service Unit',
      status: 'MAINTENANCE' as const,
      batteryLevel: 8,
      latitude: 28.4089,
      longitude: 77.3178,
    },
    {
      deviceId: 'TRK-008',
      meterId: 'MTR-10241',
      name: 'Pitampura Smart Residential',
      status: 'OFFLINE' as const,
      batteryLevel: 95,
      latitude: 28.6892,
      longitude: 77.1510,
    },
    {
      deviceId: 'TRK-009',
      meterId: 'MTR-10242',
      name: 'Hauz Khas Solar Grid Unit',
      status: 'ACTIVE' as const,
      batteryLevel: 71,
      latitude: 28.5244,
      longitude: 77.1855,
    },
    {
      deviceId: 'TRK-010',
      meterId: 'MTR-10243',
      name: 'West Delhi Warehouse Beacon',
      status: 'INACTIVE' as const,
      batteryLevel: 33,
      latitude: 28.6448,
      longitude: 77.0832,
    },
    {
      deviceId: 'TRK-011',
      meterId: 'MTR-10244',
      name: 'NH-44 Sonipat Transit Unit',
      status: 'ACTIVE' as const,
      batteryLevel: 55,
      latitude: 28.7500,
      longitude: 77.1171,
    },
    {
      deviceId: 'TRK-012',
      meterId: 'MTR-10245',
      name: 'DLF Phase 3 Smart Beacon',
      status: 'OFFLINE' as const,
      batteryLevel: 82,
      latitude: 28.4900,
      longitude: 77.0800,
    },
  ];

  const createdTrackers: any[] = [];
  for (const t of trackerSeeds) {
    const record = await prisma.tracker.create({ data: t });
    createdTrackers.push(record);
  }
  console.log(`✅ Seeded ${createdTrackers.length} GPS Trackers across Delhi NCR.`);

  // 3. Insert Historical Breadcrumbs for Trackers
  for (const trk of createdTrackers.slice(0, 5)) {
    const baseLat = trk.latitude;
    const baseLng = trk.longitude;
    const offsets = [
      { dLat: -0.005, dLng: -0.006, minutesAgo: 90, batDelta: 2 },
      { dLat: -0.003, dLng: -0.004, minutesAgo: 60, batDelta: 1 },
      { dLat: -0.001, dLng: -0.002, minutesAgo: 30, batDelta: 0 },
      { dLat: 0.000, dLng: 0.000, minutesAgo: 5, batDelta: 0 },
    ];

    for (const off of offsets) {
      await prisma.trackerHistory.create({
        data: {
          trackerId: trk.id,
          latitude: baseLat + off.dLat,
          longitude: baseLng + off.dLng,
          batteryLevel: Math.min(100, trk.batteryLevel + off.batDelta),
          timestamp: new Date(Date.now() - off.minutesAgo * 60 * 1000),
        },
      });
    }
  }
  console.log('✅ Seeded route breadcrumb histories.');

  // 4. Insert Geofence Perimeters
  const geofenceSeeds = [
    {
      name: 'Delhi Main Warehouse',
      type: 'WAREHOUSE' as const,
      lat: 28.6304,
      lng: 77.2177,
      radius: 500,
      alertType: 'both',
    },
    {
      name: 'Gurgaon Central WH',
      type: 'WAREHOUSE' as const,
      lat: 28.4595,
      lng: 77.0266,
      radius: 450,
      alertType: 'both',
    },
    {
      name: 'Noida Installation Site',
      type: 'SITE' as const,
      lat: 28.5355,
      lng: 77.3910,
      radius: 350,
      alertType: 'entry',
    },
    {
      name: 'Restricted Zone A (North Delhi)',
      type: 'RESTRICTED' as const,
      lat: 28.7041,
      lng: 77.1025,
      radius: 250,
      alertType: 'exit',
    },
    {
      name: 'West Delhi Warehouse',
      type: 'WAREHOUSE' as const,
      lat: 28.6448,
      lng: 77.0832,
      radius: 400,
      alertType: 'both',
    },
  ];

  for (const g of geofenceSeeds) {
    await prisma.geofence.create({
      data: {
        name: g.name,
        type: g.type,
        area: JSON.stringify({
          type: 'Circle',
          coordinates: [g.lng, g.lat],
          radius: g.radius,
          alert_type: g.alertType,
        }),
      },
    });
  }
  console.log(`✅ Seeded ${geofenceSeeds.length} Geofence Perimeters.`);

  // 5. Insert Notifications
  const criticalTracker = createdTrackers.find((t) => t.deviceId === 'TRK-007') || createdTrackers[0];
  const transitTracker = createdTrackers.find((t) => t.deviceId === 'TRK-006') || createdTrackers[1];
  const dispatchTracker = createdTrackers.find((t) => t.deviceId === 'TRK-001') || createdTrackers[2];
  const lowBatTracker = createdTrackers.find((t) => t.deviceId === 'TRK-004') || createdTrackers[3];

  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        type: 'LOW_BATTERY',
        title: 'Critical Battery Level Warning',
        message: `Tracker ${criticalTracker.deviceId} at Sector 14 Faridabad reached critically low battery (${criticalTracker.batteryLevel}%). Immediate replacement advised.`,
        trackerId: criticalTracker.id,
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 12),
      },
      {
        userId: admin.id,
        type: 'GEOFENCE_BREACH',
        title: 'Unauthorized Perimeter Breach',
        message: `Tracker ${transitTracker.deviceId} has exited designated 'Faridabad Industrial Gateway' boundary without active dispatch permit.`,
        trackerId: transitTracker.id,
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 45),
      },
      {
        userId: admin.id,
        type: 'SYSTEM',
        title: 'Dispatch Transit Initiated',
        message: `Tracker ${dispatchTracker.deviceId} transitioned to In Transit. Destination: Noida Sector 62. Field engineer: Rajesh Kumar.`,
        trackerId: dispatchTracker.id,
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 95),
      },
      {
        userId: admin.id,
        type: 'LOW_BATTERY',
        title: 'Low Battery Advisory (15%)',
        message: `Tracker ${lowBatTracker.deviceId} fallen below 20% battery threshold. Current reading: 15%. Recommend servicing.`,
        trackerId: lowBatTracker.id,
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 3600 * 4),
      },
      {
        userId: admin.id,
        type: 'SYSTEM',
        title: 'Firmware v2.4.1 Rollout Complete',
        message: 'Smart meter telemetry gateway successfully updated all field units to firmware version v2.4.1. GPS accuracy locked to ±2.2m.',
        trackerId: null,
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 3600 * 18),
      },
    ],
  });
  console.log('✅ Seeded Telemetry & Perimeter Notifications.');

  // 6. Insert Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'STATUS_UPDATE',
        entityType: 'TRACKER',
        entityId: dispatchTracker.id,
        details: { status: 'ACTIVE', note: 'Dispatch clearance verified' },
        createdAt: new Date(Date.now() - 1000 * 60 * 95),
      },
      {
        userId: engineer.id,
        action: 'LOCATION_PING',
        entityType: 'TRACKER',
        entityId: criticalTracker.id,
        details: { latitude: criticalTracker.latitude, longitude: criticalTracker.longitude },
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        userId: manager.id,
        action: 'PERIMETER_CREATE',
        entityType: 'GEOFENCE',
        entityId: 'zone-delhi-main',
        details: { name: 'Delhi Main Warehouse', radius: 500 },
        createdAt: new Date(Date.now() - 1000 * 3600 * 12),
      },
    ],
  });
  console.log('✅ Seeded Activity Audit Logs.');

  console.log('\n🎉 Comprehensive database seed finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
