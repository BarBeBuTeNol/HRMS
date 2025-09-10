import bcrypt from "bcryptjs";

async function run() {
  const plain = "123456";
  try {
    const hashed = await bcrypt.hash(plain, 10);
    console.log("Plain:", plain);
    console.log("Hashed:", hashed);
    process.exit(0); // ✅ บังคับให้โปรแกรมจบ (ป้องกันเงียบ)
  } catch (err) {
    console.error("Error while hashing:", err);
    process.exit(1);
  }
}

run();
