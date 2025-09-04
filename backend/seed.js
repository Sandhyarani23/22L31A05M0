const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Initializing database...');
  
  // The database will be created automatically when Prisma connects
  // This seed script can be used to add initial data if needed
  
  console.log('Database initialized successfully!');
  console.log('Run "npm run prisma:migrate" to apply schema migrations.');
}

main()
  .catch((e) => {
    console.error('Error during database initialization:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
