import express from "express";
import userRoutes from "./routes/userRoutes"
import discussRoutes from "./routes/discussRoutes"
import authRoutes from "./routes/authRoutes" 
import { authenticationToken } from "./middlewares/authMiddlewares";

const app = express();
app.use(express.json());
app.use("/user", authenticationToken, userRoutes);
app.use("/discuss", authenticationToken, discussRoutes);
app.use("/auth", authRoutes);


app.listen(3000, ()=> {
    console.log("server ready at localhost:3000");
})