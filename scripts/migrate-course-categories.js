/**
 * DB Migration Script — Fix Course Category Values
 * ─────────────────────────────────────────────────
 * Run ONCE to update existing Course documents in MongoDB that have
 * old category values ("Diploma", "Certification", "Foundation", etc.)
 * to the new canonical values that match MockTest courseCategory.
 *
 * Usage:
 *   node scripts/migrate-course-categories.js
 *
 * Safe to run multiple times (idempotent).
 */

require("dotenv").config({ path: ".env.local" });
if (!process.env.MONGODB_URI) require("dotenv").config({ path: ".env" });

const mongoose = require("mongoose");

const LEGACY_MAP = {
  "Diploma":        "ADCA",
  "Certification":  "CCC",
  "Foundation":     "Basic Computer",
  "Accounting":     "Tally",
  "Marketing":      "Digital Marketing",
  "Development":    "Other",
};

const CANONICAL = [
  "General", "Basic Computer", "CCC", "CCC+", "ADCA", "DCA",
  "O-Level", "Tally", "Digital Marketing", "RSCIT", "Academic", "Other",
];

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in .env or .env.local");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✅ Connected\n");

  const db = mongoose.connection.db;
  const courses = db.collection("courses");

  // 1. Show current state
  const all = await courses.find({ deletedAt: { $exists: false } }).toArray();
  const categoryCounts = {};
  all.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  console.log("📊 Current category distribution:", categoryCounts);

  // 2. Fix legacy categories
  let totalFixed = 0;
  for (const [oldCat, newCat] of Object.entries(LEGACY_MAP)) {
    const result = await courses.updateMany(
      { category: oldCat },
      { $set: { category: newCat } }
    );
    if (result.modifiedCount > 0) {
      console.log(`  ✅ "${oldCat}" → "${newCat}": fixed ${result.modifiedCount} document(s)`);
      totalFixed += result.modifiedCount;
    } else {
      console.log(`  ⚪ "${oldCat}": no documents found`);
    }
  }

  // 3. Fix any completely unknown categories → "Other"
  const unknownResult = await courses.updateMany(
    { category: { $nin: CANONICAL } },
    [{ $set: { category: "Other" } }]
  );
  if (unknownResult.modifiedCount > 0) {
    console.log(`  ⚠️  ${unknownResult.modifiedCount} doc(s) with unknown categories set to "Other"`);
    totalFixed += unknownResult.modifiedCount;
  }

  // 4. Show final state
  const final = await courses.find({ deletedAt: { $exists: false } }).toArray();
  const finalCounts = {};
  final.forEach(c => {
    finalCounts[c.category] = (finalCounts[c.category] || 0) + 1;
  });
  console.log("\n📊 Final category distribution:", finalCounts);
  console.log(`\n✅ Migration complete. Total fixed: ${totalFixed} document(s)`);

  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
