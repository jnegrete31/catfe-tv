// Seed script for Catfé TV
// Run with: node scripts/seed.mjs

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  console.log("Seeding database...");

  // Insert default settings
  await connection.execute(`
    INSERT INTO settings (locationName, defaultDurationSeconds, fallbackMode, snapAndPurrFrequency, refreshIntervalSeconds, githubBranch)
    VALUES ('Catfé', 10, 'LOOP_DEFAULT', 5, 60, 'main')
    ON DUPLICATE KEY UPDATE locationName = VALUES(locationName)
  `);
  console.log("✓ Settings created");

  // Insert default SNAP_AND_PURR screen (protected)
  await connection.execute(`
    INSERT INTO screens (screenType, title, subtitle, body, priority, durationSeconds, sortOrder, isActive, isProtected)
    VALUES (
      'SNAP_AND_PURR',
      'Snap & Purr!',
      'Share your cat café moments',
      'Tag us @catfe on Instagram for a chance to be featured!',
      5,
      12,
      0,
      true,
      true
    )
    ON DUPLICATE KEY UPDATE title = VALUES(title)
  `);
  console.log("✓ Default Snap & Purr screen created");

  // Insert example event screen
  await connection.execute(`
    INSERT INTO screens (screenType, title, subtitle, body, priority, durationSeconds, sortOrder, isActive, isProtected)
    VALUES (
      'EVENT',
      'Trivia Night',
      'Every Thursday at 7 PM',
      'Join us for cat-themed trivia! Prizes for the top 3 teams.',
      3,
      10,
      1,
      true,
      false
    )
  `);
  console.log("✓ Example event screen created");

  // Insert example today at catfe screen
  await connection.execute(`
    INSERT INTO screens (screenType, title, subtitle, body, priority, durationSeconds, sortOrder, isActive, isProtected)
    VALUES (
      'TODAY_AT_CATFE',
      'Happy Hour',
      '3-5 PM Daily',
      '$2 off all specialty drinks. Try our new Catnip Latte!',
      4,
      10,
      2,
      true,
      false
    )
  `);
  console.log("✓ Example today screen created");

  // Insert example membership screen
  await connection.execute(`
    INSERT INTO screens (screenType, title, subtitle, body, priority, durationSeconds, sortOrder, isActive, isProtected)
    VALUES (
      'MEMBERSHIP',
      'Become a Member',
      'Unlimited cat time + perks',
      'Members get 20% off drinks, priority reservations, and exclusive events.',
      2,
      12,
      3,
      true,
      false
    )
  `);
  console.log("✓ Example membership screen created");

  // Insert example adoption screen
  await connection.execute(`
    INSERT INTO screens (screenType, title, subtitle, body, priority, durationSeconds, sortOrder, isActive, isProtected)
    VALUES (
      'ADOPTION',
      'Meet Whiskers',
      '2 years old • Loves cuddles',
      'This sweet tabby is looking for her forever home. Ask staff for details!',
      3,
      15,
      4,
      true,
      false
    )
  `);
  console.log("✓ Example adoption screen created");

  // Insert example reminder screen
  await connection.execute(`
    INSERT INTO screens (screenType, title, subtitle, body, priority, durationSeconds, sortOrder, isActive, isProtected)
    VALUES (
      'REMINDER',
      'Gentle Reminder',
      'Please be kind to our cats',
      'No picking up cats without permission. Let them come to you!',
      2,
      8,
      5,
      true,
      false
    )
  `);
  console.log("✓ Example reminder screen created");

  // Insert example thank you screen
  await connection.execute(`
    INSERT INTO screens (screenType, title, subtitle, body, priority, durationSeconds, sortOrder, isActive, isProtected)
    VALUES (
      'THANK_YOU',
      'Thank You!',
      'For visiting Catfé',
      'Your support helps us care for our rescue cats. See you again soon!',
      2,
      10,
      6,
      true,
      false
    )
  `);
  console.log("✓ Example thank you screen created");

  await connection.end();
  console.log("\n✅ Database seeded successfully!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
