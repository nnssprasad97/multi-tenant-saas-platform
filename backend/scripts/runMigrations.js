import initDb from '../src/utils/initDb.js';

console.log('🚀 Starting migration script...');
initDb()
  .then(() => {
    console.log('✅ Migrations completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
