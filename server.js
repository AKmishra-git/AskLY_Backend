// ✅ Sahi order
import "dotenv/config" // ← sabse pehli line — baki sab baad mein

import app from './src/app.js';
import connectToDB from './src/config/database.js';

connectToDB();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});