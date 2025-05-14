import { config } from 'dotenv';
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
// import priceAdvisorRouter from "./router/priceAdvisor.js";
// const priceAdvisorRoutes = require('./routes/priceAdvisor.js');

const app = express();
config({
    path: "./config/config.env"
});

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
// app.use('/api/price-advisor', priceAdvisorRoutes);

endedAuctionCron();
verifyCommissionCron();
connection();
app.use(errorMiddleware);

export default app;
