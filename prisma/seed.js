const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminUser = process.env.ADMIN_INITIAL_USER || 'admin';
  const adminPass = process.env.ADMIN_INITIAL_PASSWORD || 'password123';

  const existing = await prisma.user.findUnique({
    where: { username: adminUser },
  });

  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPass, 10);
    await prisma.user.create({
      data: {
        username: adminUser,
        name: 'PPWR Administrator',
        passwordHash,
      },
    });
    console.log(`Initial admin user created: ${adminUser}`);
  } else {
    console.log(`Admin user ${adminUser} already exists.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
