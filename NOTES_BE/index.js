import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { startTelegramBot } from "./src/services/telegramBot.service.js";

const startServer = async () => {
    await connectDB();
    await startTelegramBot();

    app.listen(process.env.PORT, () => {
        console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
};

startServer().catch((error) => {
    console.error("Server startup failed:", error);
    process.exit(1);
});


