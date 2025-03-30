import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/database.js";

dotenv.config();
app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});

connectDB()

