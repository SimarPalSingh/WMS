import prisma from '../src/lib/prisma'

async function main() {
  console.log('Seeding MechWise database for Dhalla Automotive Pty Ltd...')

  // 1. Create or update Workshop
  const workshop = await prisma.workshop.upsert({
    where: { id: 'dhalla-auto-nsw' },
    update: {},
    create: {
      id: 'dhalla-auto-nsw',
      businessName: 'Dhalla Automotive Pty Ltd',
      abn: '95611566888',
      mvrlNumber: 'MVRL58941',
      arcNumber: 'AU49120',
      address: '70A Cox Avenue',
      suburb: 'Kingswood',
      state: 'NSW',
      postcode: '2747',
      phone: '(02) 4732 1199',
      mobile: '0435 791 593',
      email: 'service@dhalla.com.au',
      defaultLabourRate: 95.00,
      smsSenderName: 'DHALLA-AUTO',
      nextInvoiceNum: 90,
      nextJobCardNum: 90,
      operatingHours: JSON.stringify({
        mon_fri: '8:00 AM - 5:00 PM',
        sat: '8:00 AM - 1:00 PM',
        sun: 'Closed'
      })
    }
  })

  // 2. Staff
  const staffMembers = [
    { id: 'stf-01', firstName: 'Tinku', lastName: 'Dhalla', role: 'Owner', isMvrlCertified: true, isArcCertified: true, mobile: '0435 791 593' },
    { id: 'stf-02', firstName: 'Baljit', lastName: 'Singh', role: 'Mechanic', isMvrlCertified: true, isArcCertified: true, mobile: '0412 345 678' },
    { id: 'stf-03', firstName: 'Harman', lastName: 'Preet', role: 'Mechanic', isMvrlCertified: false, isArcCertified: false, mobile: '0423 456 789' },
    { id: 'stf-04', firstName: 'Ash', lastName: 'Sharma', role: 'Apprentice', isMvrlCertified: false, isArcCertified: false, mobile: '0434 567 890' },
    { id: 'stf-05', firstName: 'Manveer', lastName: 'Kaur', role: 'Front Desk', isMvrlCertified: false, isArcCertified: false, mobile: '0445 678 901' }
  ]

  for (const s of staffMembers) {
    await prisma.staff.upsert({
      where: { id: s.id },
      update: {},
      create: { ...s, workshopId: workshop.id }
    })
  }

  // 3. User
  await prisma.user.upsert({
    where: { email: 'tinku@dhalla.com.au' },
    update: {},
    create: {
      workshopId: workshop.id,
      email: 'tinku@dhalla.com.au',
      passwordHash: 'admin123', // Demo placeholder
      displayName: 'Tinku Dhalla',
      role: 'Owner',
      staffId: 'stf-01'
    }
  })

  // 4. Bays
  const bays = [
    { id: 'bay-1', name: 'Bay 1 — 4-Post Hoist', bayType: 'Hoist', displayOrder: 1 },
    { id: 'bay-2', name: 'Bay 2 — 2-Post Hoist', bayType: 'Hoist', displayOrder: 2 },
    { id: 'bay-3', name: 'Bay 3 — Wheel & Brake Hoist', bayType: 'Hoist', displayOrder: 3 },
    { id: 'bay-4', name: 'Bay 4 — Diagnostic & AC Bay', bayType: 'Ground Level', displayOrder: 4 },
  ]

  for (const b of bays) {
    await prisma.bay.upsert({
      where: { id: b.id },
      update: {},
      create: { ...b, workshopId: workshop.id }
    })
  }

  // 5. Job Categories & Jobs
  const serviceCategory = await prisma.jobCategory.upsert({
    where: { workshopId_name: { workshopId: workshop.id, name: 'Scheduled Servicing' } },
    update: {},
    create: {
      workshopId: workshop.id,
      name: 'Scheduled Servicing',
      description: 'Logbook and minor/major general vehicle services'
    }
  })

  const brakeCategory = await prisma.jobCategory.upsert({
    where: { workshopId_name: { workshopId: workshop.id, name: 'Brakes & Suspension' } },
    update: {},
    create: {
      workshopId: workshop.id,
      name: 'Brakes & Suspension',
      description: 'Pads, rotors, calipers, shocks and steering'
    }
  })

  const pinkSlipCategory = await prisma.jobCategory.upsert({
    where: { workshopId_name: { workshopId: workshop.id, name: 'Safety Inspections' } },
    update: {},
    create: {
      workshopId: workshop.id,
      name: 'Safety Inspections',
      description: 'NSW e-Safety Check (Pink Slip) & pre-purchase'
    }
  })

  // 6. Clients & Vehicles
  const clientsData = [
    {
      id: 'cli-01',
      firstName: 'David',
      lastName: 'Miller',
      clientType: 'Individual',
      mobilePhone: '0421 889 123',
      email: 'd.miller@gmail.com',
      address: '14 Derby St',
      suburb: 'Penrith',
      vehicle: {
        registration: 'DL88AA',
        make: 'Toyota',
        model: 'Hilux SR5',
        year: 2021,
        colour: 'Glacier White',
        fuelType: 'Diesel',
        currentMileageKm: 68450,
        nextServiceDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        pinkSlipExpiry: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000)
      }
    },
    {
      id: 'cli-02',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      clientType: 'Individual',
      mobilePhone: '0419 332 541',
      email: 'sarah.j@outlook.com',
      address: '88 Great Western Hwy',
      suburb: 'Kingswood',
      vehicle: {
        registration: 'CV42TY',
        make: 'Hyundai',
        model: 'i30 N-Line',
        year: 2020,
        colour: 'Performance Blue',
        fuelType: 'Petrol',
        currentMileageKm: 52100,
        nextServiceDue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        pinkSlipExpiry: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      }
    },
    {
      id: 'cli-03',
      businessName: 'Nepean Plumbing & Gas Pty Ltd',
      clientType: 'Business',
      abn: '33129845761',
      mobilePhone: '0438 901 223',
      email: 'accounts@nepeanplumbing.com.au',
      address: 'Unit 3, 12 Coreen Ave',
      suburb: 'Penrith',
      vehicle: {
        registration: 'BN77OP',
        make: 'Ford',
        model: 'Transit Custom',
        year: 2019,
        colour: 'Frozen White',
        fuelType: 'Diesel',
        currentMileageKm: 118400,
        nextServiceDue: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Overdue
        pinkSlipExpiry: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000)
      }
    },
    {
      id: 'cli-04',
      firstName: 'Michael',
      lastName: 'Chang',
      clientType: 'Individual',
      mobilePhone: '0402 771 884',
      email: 'mchang@techsydney.com.au',
      address: '22 High St',
      suburb: 'Penrith',
      vehicle: {
        registration: 'EX91LK',
        make: 'Mazda',
        model: 'CX-5 Akera',
        year: 2022,
        colour: 'Soul Red Crystal',
        fuelType: 'Petrol',
        currentMileageKm: 34200,
        nextServiceDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        pinkSlipExpiry: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
      }
    }
  ]

  for (const c of clientsData) {
    const client = await prisma.client.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        workshopId: workshop.id,
        clientType: c.clientType,
        firstName: c.firstName,
        lastName: c.lastName,
        businessName: c.businessName,
        mobilePhone: c.mobilePhone,
        email: c.email,
        address: c.address,
        suburb: c.suburb,
        state: 'NSW',
        abn: c.abn
      }
    })

    const vehicle = await prisma.vehicle.upsert({
      where: { workshopId_registration: { workshopId: workshop.id, registration: c.vehicle.registration } },
      update: {},
      create: {
        workshopId: workshop.id,
        registration: c.vehicle.registration,
        make: c.vehicle.make,
        model: c.vehicle.model,
        year: c.vehicle.year,
        colour: c.vehicle.colour,
        fuelType: c.vehicle.fuelType,
        currentMileageKm: c.vehicle.currentMileageKm,
        nextServiceDue: c.vehicle.nextServiceDue,
        pinkSlipExpiry: c.vehicle.pinkSlipExpiry
      }
    })

    await prisma.clientVehicle.upsert({
      where: { clientId_vehicleId: { clientId: client.id, vehicleId: vehicle.id } },
      update: {},
      create: {
        clientId: client.id,
        vehicleId: vehicle.id,
        relationship: 'Owner',
        isPrimaryOwner: true
      }
    })
  }

  // 7. Active Job Cards on Workshop Floor
  const jc1 = await prisma.jobCard.upsert({
    where: { workshopId_jobCardNumber: { workshopId: workshop.id, jobCardNumber: 'JC-0087' } },
    update: {},
    create: {
      workshopId: workshop.id,
      jobCardNumber: 'JC-0087',
      clientId: 'cli-01',
      vehicleId: (await prisma.vehicle.findFirst({ where: { registration: 'DL88AA' } }))!.id,
      staffId: 'stf-02', // Baljit
      bayId: 'bay-1',
      status: 'InProgress',
      priority: 'Normal',
      mileageIn: 68450,
      totalExGst: 380.00,
      customerNotes: '70,000 km logbook service + slight squeal on braking',
      lines: {
        create: [
          { lineType: 'Labour', description: '70k Major Logbook Service Labour', qty: 2.5, unitPriceExGst: 95.0, lineTotalExGst: 237.50, isCompleted: true },
          { lineType: 'Part', description: 'Castrol Magnatec Diesel 5W-40 7L', qty: 1, unitPriceExGst: 85.0, lineTotalExGst: 85.0, isCompleted: true },
          { lineType: 'Part', description: 'Ryco Oil Filter Z432', qty: 1, unitPriceExGst: 24.50, lineTotalExGst: 24.50, isCompleted: true },
          { lineType: 'Labour', description: 'Front Brake Inspection & Clean', qty: 0.5, unitPriceExGst: 95.0, lineTotalExGst: 47.50, isCompleted: false }
        ]
      }
    }
  })

  const jc2 = await prisma.jobCard.upsert({
    where: { workshopId_jobCardNumber: { workshopId: workshop.id, jobCardNumber: 'JC-0088' } },
    update: {},
    create: {
      workshopId: workshop.id,
      jobCardNumber: 'JC-0088',
      clientId: 'cli-02',
      vehicleId: (await prisma.vehicle.findFirst({ where: { registration: 'CV42TY' } }))!.id,
      staffId: 'stf-03', // Harman
      bayId: 'bay-2',
      status: 'QC',
      priority: 'Normal',
      mileageIn: 52100,
      totalExGst: 540.00,
      customerNotes: 'Front & Rear Bendix brake pad replacement',
      lines: {
        create: [
          { lineType: 'Part', description: 'Bendix Front Brake Pads (DB2234)', qty: 1, unitPriceExGst: 145.0, lineTotalExGst: 145.0, isCompleted: true },
          { lineType: 'Part', description: 'Bendix Rear Brake Pads (DB2381)', qty: 1, unitPriceExGst: 120.0, lineTotalExGst: 120.0, isCompleted: true },
          { lineType: 'Labour', description: 'Brake Pad Replacement & Brake Fluid Bleed', qty: 2.0, unitPriceExGst: 95.0, lineTotalExGst: 190.0, isCompleted: true }
        ]
      }
    }
  })

  const jc3 = await prisma.jobCard.upsert({
    where: { workshopId_jobCardNumber: { workshopId: workshop.id, jobCardNumber: 'JC-0089' } },
    update: {},
    create: {
      workshopId: workshop.id,
      jobCardNumber: 'JC-0089',
      clientId: 'cli-03',
      vehicleId: (await prisma.vehicle.findFirst({ where: { registration: 'BN77OP' } }))!.id,
      staffId: 'stf-01', // Tinku (MVRL)
      bayId: 'bay-4',
      status: 'WaitingForParts',
      priority: 'Urgent',
      mileageIn: 118400,
      totalExGst: 42.00,
      customerNotes: 'NSW e-Safety Check Pink Slip inspection + urgent commercial van',
      lines: {
        create: [
          { lineType: 'Labour', description: 'NSW e-Safety Check Inspection (Pink Slip)', qty: 1, unitPriceExGst: 42.0, lineTotalExGst: 42.0, isCompleted: true }
        ]
      }
    }
  })

  // 8. Sample Invoices
  await prisma.invoice.upsert({
    where: { workshopId_invoiceNumber: { workshopId: workshop.id, invoiceNumber: 'INV-0088' } },
    update: {},
    create: {
      workshopId: workshop.id,
      invoiceNumber: 'INV-0088',
      clientId: 'cli-02',
      vehicleId: (await prisma.vehicle.findFirst({ where: { registration: 'CV42TY' } }))!.id,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      subtotalExGst: 540.00,
      gstAmount: 54.00,
      finalAmount: 594.00,
      paymentStatus: 'Unpaid',
      lines: {
        create: [
          { lineType: 'Part', description: 'Bendix Front Brake Pads (DB2234)', qty: 1, unitPriceExGst: 145.0, lineTotalExGst: 145.0, gstRate: 0.1, gstAmount: 14.5 },
          { lineType: 'Part', description: 'Bendix Rear Brake Pads (DB2381)', qty: 1, unitPriceExGst: 120.0, lineTotalExGst: 120.0, gstRate: 0.1, gstAmount: 12.0 },
          { lineType: 'Labour', description: 'Brake Pad Replacement & Brake Fluid Bleed', qty: 2.0, unitPriceExGst: 95.0, lineTotalExGst: 190.0, gstRate: 0.1, gstAmount: 19.0 }
        ]
      }
    }
  })

  // 9. Service Reminders
  await prisma.serviceReminder.upsert({
    where: { id: 'rem-01' },
    update: {},
    create: {
      id: 'rem-01',
      workshopId: workshop.id,
      clientId: 'cli-03',
      vehicleId: (await prisma.vehicle.findFirst({ where: { registration: 'BN77OP' } }))!.id,
      reminderType: 'PinkSlip',
      dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      status: 'Pending',
      sendCount: 0
    }
  })

  console.log('✅ MechWise database successfully seeded with Dhalla Automotive data!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
