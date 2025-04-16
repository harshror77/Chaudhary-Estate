import express from "express";
import cors from "cors";
import  cookieParser from 'cookie-parser';
import {app} from './utils/socket.io.js'

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true, 
}));
app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

//routes
import userRouter from "./routes/user.routes.js"
import transactionRouter from "./routes/transaction.route.js"
import propertyRouter from "./routes/property.route.js"
import messageRouter from './routes/message.route.js'
import notificationRouter from "./routes/notification.route.js"
import favoriteRouter from "./routes/favorite.route.js"

//declaration
app.use('/users',userRouter);
app.use('/property',propertyRouter)
app.use('/transactions',transactionRouter)
app.use('/api/v1/chat',messageRouter)
app.use('/notifications',notificationRouter)
app.use('/favorite',favoriteRouter)

export {app}

