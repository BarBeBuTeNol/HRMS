import { logUserAction } from "../utils/activityLogger";

async function test() {
  console.log("Testing logUserAction...");
  // Using a dummy user ID (e.g. 1) or one that exists. Ideally 18 as seen in logs.
  try {
    await logUserAction(18, "TEST_LOGGING", "Manual verification script");
    console.log("Test complete. Check DB.");
    process.exit(0);
  } catch (e) {
    console.error("Test failed:", e);
    process.exit(1);
  }
}

test();
