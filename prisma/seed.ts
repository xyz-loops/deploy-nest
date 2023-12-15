import { glAccount, costCenters, status, docCategory } from './dummy-data';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteExistingData() {
  // Hapus semua data yang sudah ada sebelumnya
  await prisma.mGlAccount.deleteMany({});
  await prisma.mCostCenter.deleteMany({});
  await prisma.mDocCategory.deleteMany({});
  await prisma.mStatus.deleteMany({});
}

async function seedGlAccounts() {
  await prisma.mGlAccount.createMany({
    data: glAccount,
  });
}

async function seedCostCenters() {
  await prisma.mCostCenter.createMany({
    data: costCenters,
  });
}

async function seedDocCategories() {
  await prisma.mDocCategory.createMany({
    data: docCategory,
  });
}

async function seedStatus() {
  await prisma.mStatus.createMany({
    data: status,
  });
}

async function main() {
  await seedGlAccounts();
  await seedCostCenters();
  await seedDocCategories();
  await seedStatus();
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
