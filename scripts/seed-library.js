const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const defaultOrg = await prisma.organization.findFirst();
  const defaultUser = await prisma.user.findFirst();

  if (!defaultOrg || !defaultUser) {
    console.log('No org or user found to seed library folders.');
    return;
  }

  const sampleFolders = [
    { name: 'Vendor Agreements', color: '#3b82f6' },
    { name: 'Employment Contracts', color: '#10b981' },
    { name: 'NDAs & Confidentiality', color: '#f59e0b' },
    { name: 'Procurement & Supply', color: '#8b5cf6' },
    { name: 'Compliance & Regulations', color: '#ec4899' },
    { name: 'IP & Patent Rights', color: '#06b6d4' },
  ];

  for (const f of sampleFolders) {
    const existing = await prisma.folder.findFirst({
      where: { name: f.name, organizationId: defaultOrg.id }
    });
    if (!existing) {
      await prisma.folder.create({
        data: {
          name: f.name,
          color: f.color,
          organizationId: defaultOrg.id,
          userId: defaultUser.id,
        }
      });
      console.log(`Created folder: ${f.name}`);
    }
  }

  console.log('Library seeding complete!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
