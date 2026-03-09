import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";

connectDB()
app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});


