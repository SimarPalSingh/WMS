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
      update: {
        vin: `6T1AA${c.vehicle.year}${c.vehicle.registration}992`,
        engineNumber: `ENG-${c.vehicle.registration}-4CYL`,
        engineCapacity: '2.8L Turbo Diesel',
        bodyType: c.vehicle.make === 'Toyota' ? 'Ute' : c.vehicle.make === 'Hyundai' ? 'Hatchback' : c.vehicle.make === 'Ford' ? 'Van' : 'SUV',
        currentMileageKm: c.vehicle.currentMileageKm,
        nextServiceDue: c.vehicle.nextServiceDue,
        nextServiceKm: (c.vehicle.currentMileageKm || 50000) + 10000,
        pinkSlipExpiry: c.vehicle.pinkSlipExpiry
      },
      create: {
        workshopId: workshop.id,
        registration: c.vehicle.registration,
        make: c.vehicle.make,
        model: c.vehicle.model,
        year: c.vehicle.year,
        colour: c.vehicle.colour,
        fuelType: c.vehicle.fuelType,
        vin: `6T1AA${c.vehicle.year}${c.vehicle.registration}992`,
        engineNumber: `ENG-${c.vehicle.registration}-4CYL`,
        engineCapacity: '2.8L Turbo Diesel',
        bodyType: c.vehicle.make === 'Toyota' ? 'Ute' : c.vehicle.make === 'Hyundai' ? 'Hatchback' : c.vehicle.make === 'Ford' ? 'Van' : 'SUV',
        currentMileageKm: c.vehicle.currentMileageKm,
        nextServiceDue: c.vehicle.nextServiceDue,
        nextServiceKm: (c.vehicle.currentMileageKm || 50000) + 10000,
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

  // 6.1 Create Sample Suppliers
  const repcoSupplier = await prisma.supplier.upsert({
    where: { workshopId_name: { workshopId: workshop.id, name: 'Repco Auto Parts Penrith' } },
    update: {},
    create: {
      workshopId: workshop.id,
      name: 'Repco Auto Parts Penrith',
      abn: '43004180515',
      contactName: 'Mark Stevens',
      phone: '(02) 4731 2200',
      email: 'penrith@repco.com.au',
      address: '22 Blaikie Road, Jamisontown NSW 2750',
      accountNo: 'DHALLA-001'
    }
  })

  const bursonsSupplier = await prisma.supplier.upsert({
    where: { workshopId_name: { workshopId: workshop.id, name: 'Burson Auto Parts Kingswood' } },
    update: {},
    create: {
      workshopId: workshop.id,
      name: 'Burson Auto Parts Kingswood',
      abn: '82006613378',
      contactName: 'Craig Miller',
      phone: '(02) 4736 8800',
      email: 'kingswood@burson.com.au',
      address: '5 Cox Avenue, Kingswood NSW 2747',
      accountNo: 'DHALLA-BUR02'
    }
  })

  // 6.2 Create Sample Inventory Parts
  const sampleParts = [
    { partNumber: 'CAS-5W40-7L', name: 'Castrol Magnatec Diesel 5W-40 7L', category: 'Oils & Fluids', costPrice: 55.0, retailPrice: 85.0, stockQty: 12, availableStock: 12, maxStockQty: 25, minStockQty: 4, restockMinQty: 6, supplierId: repcoSupplier.id },
    { partNumber: 'RYC-Z432', name: 'Ryco Oil Filter Z432', category: 'Filters', costPrice: 14.50, retailPrice: 24.50, stockQty: 8, availableStock: 8, maxStockQty: 20, minStockQty: 3, restockMinQty: 5, supplierId: repcoSupplier.id },
    { partNumber: 'BEN-DB2234', name: 'Bendix Front Brake Pads (DB2234)', category: 'Brakes', costPrice: 95.0, retailPrice: 145.0, stockQty: 4, availableStock: 4, maxStockQty: 10, minStockQty: 2, restockMinQty: 3, supplierId: bursonsSupplier.id },
    { partNumber: 'BEN-DB2381', name: 'Bendix Rear Brake Pads (DB2381)', category: 'Brakes', costPrice: 80.0, retailPrice: 120.0, stockQty: 3, availableStock: 3, maxStockQty: 10, minStockQty: 2, restockMinQty: 3, supplierId: bursonsSupplier.id },
    { partNumber: 'NGK-BKR6E', name: 'NGK Spark Plug BKR6E-11', category: 'Ignition', costPrice: 6.50, retailPrice: 12.0, stockQty: 24, availableStock: 24, maxStockQty: 40, minStockQty: 8, restockMinQty: 12, supplierId: repcoSupplier.id }
  ]

  for (const p of sampleParts) {
    await prisma.part.upsert({
      where: { workshopId_partNumber: { workshopId: workshop.id, partNumber: p.partNumber } },
      update: {},
      create: {
        workshopId: workshop.id,
        ...p
      }
    })
  }

  // 6.3 Create Sample Supplier Invoice
  await prisma.supplierInvoice.upsert({
    where: {
      workshopId_supplierId_supplierInvNumber: {
        workshopId: workshop.id,
        supplierId: repcoSupplier.id,
        supplierInvNumber: 'REP-99214'
      }
    },
    update: {},
    create: {
      workshopId: workshop.id,
      supplierId: repcoSupplier.id,
      supplierInvNumber: 'REP-99214',
      invoiceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      isGstInclusive: true,
      subtotalExGst: 420.00,
      gstAmount: 42.00,
      totalIncGst: 462.00,
      paymentStatus: 'Paid',
      lines: {
        create: [
          { description: 'Castrol Magnatec Diesel 5W-40 7L (x4 drums)', category: 'Oils & Fluids', qty: 4, unitPriceExGst: 55.0, lineTotalExGst: 220.0, gstRate: 0.1, gstAmount: 22.0, lineTotalIncGst: 242.0 },
          { description: 'Ryco Oil Filters Assorted Box (x10)', category: 'Filters', qty: 10, unitPriceExGst: 20.0, lineTotalExGst: 200.0, gstRate: 0.1, gstAmount: 20.0, lineTotalIncGst: 220.0 }
        ]
      }
    }
  })

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
      discountExGst: 0,
      totalExGst: 380.00,
      customerNotes: '70,000 km logbook service + slight squeal on braking',
      futureNotes: 'Front brake pads at ~30% life remaining. Recommend replacing next service in 10,000 km.',
      nextServiceOdoDue: 78450,
      nextPinkSlipDue: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
      lines: {
        create: [
          { lineType: 'Labour', category: 'Scheduled Servicing', description: '70k Major Logbook Service Labour', qty: 2.5, unitPriceExGst: 95.0, lineTotalExGst: 237.50, isCompleted: true },
          { lineType: 'Part', category: 'Oils & Fluids', description: 'Castrol Magnatec Diesel 5W-40 7L', qty: 1, unitPriceExGst: 85.0, lineTotalExGst: 85.0, isCompleted: true },
          { lineType: 'Part', category: 'Filters', description: 'Ryco Oil Filter Z432', qty: 1, unitPriceExGst: 24.50, lineTotalExGst: 24.50, isCompleted: true },
          { lineType: 'Labour', category: 'Brakes & Suspension', description: 'Front Brake Inspection & Clean', qty: 0.5, unitPriceExGst: 95.0, lineTotalExGst: 47.50, isCompleted: false }
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
      discountExGst: 20.00,
      totalExGst: 520.00,
      customerNotes: 'Front & Rear Bendix brake pad replacement',
      futureNotes: 'Rear tyres near wear indicators (2.5mm tread). Advise replacement within 5,000 km.',
      nextServiceOdoDue: 62100,
      nextPinkSlipDue: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      lines: {
        create: [
          { lineType: 'Part', category: 'Brakes', description: 'Bendix Front Brake Pads (DB2234)', qty: 1, unitPriceExGst: 145.0, lineTotalExGst: 145.0, isCompleted: true },
          { lineType: 'Part', category: 'Brakes', description: 'Bendix Rear Brake Pads (DB2381)', qty: 1, unitPriceExGst: 120.0, lineTotalExGst: 120.0, isCompleted: true },
          { lineType: 'Labour', category: 'Brakes & Suspension', description: 'Brake Pad Replacement & Brake Fluid Bleed', qty: 2.0, unitPriceExGst: 95.0, lineTotalExGst: 190.0, isCompleted: true }
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
      discountExGst: 0,
      totalExGst: 42.00,
      customerNotes: 'NSW e-Safety Check Pink Slip inspection + urgent commercial van',
      futureNotes: 'Wiper blades splitting. Passed inspection for now, replace prior to wet season.',
      nextServiceOdoDue: 128400,
      nextPinkSlipDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      lines: {
        create: [
          { lineType: 'Labour', category: 'Safety Inspections', description: 'NSW e-Safety Check Inspection (Pink Slip)', qty: 1, unitPriceExGst: 42.0, lineTotalExGst: 42.0, isCompleted: true }
        ]
      }
    }
  })

  // 7.1 Sample Quotation
  await prisma.quotation.upsert({
    where: { workshopId_quoteNumber: { workshopId: workshop.id, quoteNumber: 'QUO-0088' } },
    update: {},
    create: {
      workshopId: workshop.id,
      quoteNumber: 'QUO-0088',
      jobCardId: jc2.id,
      clientId: 'cli-02',
      vehicleId: (await prisma.vehicle.findFirst({ where: { registration: 'CV42TY' } }))!.id,
      staffId: 'stf-03',
      status: 'Pending',
      includeGst: true,
      discountExGst: 20.00,
      subtotalExGst: 520.00,
      gstAmount: 52.00,
      totalAmount: 572.00,
      notes: 'Quotation for Hyundai i30 front/rear brake overhaul',
      futureNotes: 'Rear tyres near wear indicators (2.5mm tread).',
      lines: {
        create: [
          { lineType: 'Part', category: 'Brakes', description: 'Bendix Front Brake Pads (DB2234)', qty: 1, unitPriceExGst: 145.0, lineTotalExGst: 145.0, gstRate: 0.1, gstAmount: 14.5 },
          { lineType: 'Part', category: 'Brakes', description: 'Bendix Rear Brake Pads (DB2381)', qty: 1, unitPriceExGst: 120.0, lineTotalExGst: 120.0, gstRate: 0.1, gstAmount: 12.0 },
          { lineType: 'Labour', category: 'Brakes & Suspension', description: 'Brake Pad Replacement & Brake Fluid Bleed', qty: 2.0, unitPriceExGst: 95.0, lineTotalExGst: 190.0, gstRate: 0.1, gstAmount: 19.0 }
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
      discountExGst: 20.00,
      discountAmount: 22.00,
      gstAmount: 52.00,
      finalAmount: 572.00,
      paymentStatus: 'Unpaid',
      futureNotes: 'Rear tyres near wear indicators (2.5mm tread). Advise replacement within 5,000 km.',
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
      channel: 'WhatsApp',
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
