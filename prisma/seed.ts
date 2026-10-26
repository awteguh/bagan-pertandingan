import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  // Create default admin
  const existingAdmin = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        username: "admin",
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log("✅ Admin user created: admin / admin123");
  } else {
    console.log("ℹ️  Admin user already exists");
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
