const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../database/migrations');

async function runMigrations() {
  try {
    if (!fs.existsSync(migrationsDir)) {
      console.log('Migrations directory does not exist');
      return;
    }

    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.js') || f.endsWith('.sql'));

    if (files.length === 0) {
      console.log('No migration files found');
      return;
    }

    console.log(`Found ${files.length} migration files`);
    // Add your migration logic here
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigrations();
