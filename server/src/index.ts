import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { userRouter } from './routes/user';
import { productRouter } from './routes/product';

const app = express();

app.use(express.json());
app.use(cors());

app.use("/user", userRouter);
app.use("/product", productRouter);

const encodedPassword = encodeURIComponent("D@TAFor3commerce456");
const MONGODB_URI = `mongodb+srv://geniusonice:${encodedPassword}@ecommerce.w2eowl8.mongodb.net/ecommerce`;


async function startServer() {
  try { 
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(3001, () => console.log('Server started on port 3001'));
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
}

startServer();