import "dotenv/config";
import { connectDB, syncIndexes } from "../lib/db";
import "../models/User";
import "../models/Student";
import "../models/Course";
import "../models/Certificate";
import "../models/Testimonial";
import "../models/Banner";
import "../models/Achievement";
import "../models/Notice";
import "../models/ContactMessage";
import "../models/FranchiseApplication";
import "../models/Settings";

async function main() {
  const db = await connectDB();
  await syncIndexes();
  const names = Object.values(db.connection.models)
    .map((m) => m.modelName)
    .sort();
  console.log("Connected to MongoDB.");
  console.log("Collections:", names.join(", "));
  console.log("Indexes synced successfully.");
  await db.connection.close();
}

main()
  .then(() => {
    console.log("DB verification complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("DB verification failed:", err);
    process.exit(1);
  });
