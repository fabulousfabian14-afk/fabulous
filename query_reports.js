const { openDatabase } = require('./db');
(async () => {
  try {
    const db = await openDatabase();
    const rows = await db.all('SELECT id, title, type, status, image_path, created_at FROM reports ORDER BY created_at DESC LIMIT 50');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Query error:', err);
    process.exit(1);
  }
})();