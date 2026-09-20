import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./src/generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "root",
  database: "emails",
  connectionLimit: 1,
});

const prisma = new PrismaClient({
  adapter,
});

try {
  console.log("Testing Prisma connection...");

  const result = await prisma.$queryRaw`SELECT 1`;

  console.log("PRISMA CONNECTED");
  console.log(result);
} catch (error) {
  console.error("PRISMA ERROR:");
  console.error(error);
} finally {
  await prisma.$disconnect();
}

