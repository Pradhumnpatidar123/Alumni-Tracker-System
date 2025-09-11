// import express, { response } from 'express';
import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import expressSession from 'express-session';
import cookieParser from 'cookie-parser';
import adminRouter from './router/adminRouter.js';
import alumniRouter from './router/alumniRouter.js';
import { initializeAdminData } from './utils/adminUtils.js';
import { url } from './connection/dbConfig.js';
import mongoose from 'mongoose';
import cors from 'cors';
import { message, status } from './utils/statusMessage.js';
import authRouter from './router/authCheck.js';
import { initSocket } from './socket/index.js';

dotenv.config();
mongoose.connect(url);

const app = express();
const httpServer = http.createServer(app);

// Express middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(expressSession({ secret: 'abc@123', resave: true, saveUninitialized: true }));

// CORS headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === 'http://localhost:3000') {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Route handlers
app.use('/admin', adminRouter);
app.use('/alumni', alumniRouter);
app.use('/auth', authRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  return res.status(400).json({ error: err.message });
});

// Logout endpoints
app.post('/logout', (req, res) => {
  res.clearCookie('admin_jwt', { httpOnly: true, path: '/', sameSite: 'Lax', secure: false });
  res.clearCookie('alumni_jwt', { httpOnly: true, path: '/', sameSite: 'Lax', secure: false });
  if (req.session) req.session.destroy(() => {});
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

app.get('/logout', (req, res) => {
  res.clearCookie('admin_jwt', { httpOnly: true, path: '/', sameSite: 'Lax', secure: false });
  res.clearCookie('alumni_jwt', { httpOnly: true, path: '/', sameSite: 'Lax', secure: false });
  if (req.session) req.session.destroy(() => {});
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// Start server
const PORT = process.env.PORT || 5000;
initSocket(httpServer);
httpServer.listen(PORT, () => {
  console.log('network established successfully');
});
