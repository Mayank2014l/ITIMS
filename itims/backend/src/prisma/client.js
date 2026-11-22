// One shared Prisma client for the whole app (Prisma = our ORM / database layer)
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
