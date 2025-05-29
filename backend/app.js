import dotenv from 'dotenv';
dotenv.config({
  path: "./config/config.env"
});
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import { connection } from './database/connection.js';
import { errorMiddleware } from './middlewares/error.js';
import userRouter from './router/userRoutes.js';
import auctionItemRouter from "./router/auctionItemRoutes.js";
import BidRouter from "./router/bidRoutes.js";
import commissionRouter from "./router/commissionRoutes.js";
import superAdminRouter from "./router/superAdminRoutes.js";
import {endedAuctionCron} from "./automation/endedAuctionCron.js";
import {verifyCommissionCron} from "./automation/verifyCommissionCron.js";
import favoriteRouter from "./router/favoriteRoutes.js";
import recommendationRoutes from "./router/recommendationRoutes.js";
import priceAdvisorRoute from "./router/priceAdvisor.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import recommendationRouter from "./router/recommendationRoutes.js";
// import messageRouter from "./router/messageRoutes.js";

// Test pentru Google Gemini API
const testGoogleAI = async () => {
  try {
    console.log("Testing Google Gemini API...");
    console.log("API Key (masked):", process.env.GOOGLE_API_KEY ? 
      `${process.env.GOOGLE_API_KEY.substring(0, 6)}...` : "Not set");
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Încearcă mai multe modele disponibile
    const modelsToTry = [
      "gemini-1.5-flash",
      "gemini-1.5-pro", 
      "models/gemini-1.5-flash",
      "models/gemini-pro"
    ];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Răspunde cu 'API funcționează' în română");
        console.log(`Model ${modelName} works! Response:`, result.response.text());
        
        // Salvăm modelul care funcționează
        process.env.WORKING_MODEL = modelName;
        return true;
      } catch (modelError) {
        console.log(`Model ${modelName} failed:`, modelError.message);
        continue;
      }
    }
    
    throw new Error("Niciun model nu a funcționat");
    
  } catch (error) {
    console.error("Gemini API test error:", error.message);
    return false;
  }
};

const listAvailableModels = async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Încearcă să obții lista de modele (dacă API-ul o suportă)
    console.log("Încercăm să listăm modelele disponibile...");
    
    // Pentru că nu toate API-urile suportă listarea, vom testa manual
    const commonModels = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-1.0-pro",
      "models/gemini-1.5-flash",
      "models/gemini-1.5-pro",
      "models/gemini-1.0-pro",
      "models/gemini-pro"
    ];
    
    console.log("Testăm modelele comune...");
    for (const modelName of commonModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        await model.generateContent("test");
        console.log(`Model disponibil: ${modelName}`);
      } catch (error) {
        console.log(`Model indisponibil: ${modelName}`);
      }
    }
    
  } catch (error) {
    console.error("Nu s-au putut lista modelele:", error.message);
  }
};

const app = express();

app.use(
    cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true
})
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
})     
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auctionitem", auctionItemRouter);
app.use("/api/v1/bid", BidRouter);
app.use("/api/v1/commission", commissionRouter);
app.use("/api/v1/superadmin", superAdminRouter);
app.use("/api/v1/favorites", favoriteRouter);
app.use("/api/v1/recommendations", recommendationRoutes);
console.log('Registering price-advisor route at /api/v1/price-advisor');
app.use("/api/v1/price-advisor", priceAdvisorRoute);
app.use("/api/v1/recommendations", recommendationRouter);
// app.use("/api/v1/messages", messageRouter);

// Testează API-ul Google Gemini
testGoogleAI().then(success => {
  console.log("Google Gemini API test:", success ? "SUCCESS" : "FAILED");
  if (!success) {
    listAvailableModels();
  }
});

endedAuctionCron();
verifyCommissionCron();
connection();
app.use(errorMiddleware);

export default app;
