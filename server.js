import dotenv from 'dotenv';
import app from './src/app.js';
import connectToDB from './src/config/database.js';

dotenv.config();
connectToDB();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});