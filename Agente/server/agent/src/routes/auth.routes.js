import express from 'express';
import {
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyEmail
} from '../auth/auth.controller.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/verify-email/:token', verifyEmail);
export default router;
