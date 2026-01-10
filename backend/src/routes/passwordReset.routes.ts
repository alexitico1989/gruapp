import { Router } from 'express';
import { PasswordResetController } from '../controllers/passwordReset.controller';

const router = Router();

router.post('/forgot-password', PasswordResetController.forgotPassword);
router.post('/verify-code', PasswordResetController.verifyCode);
router.post('/reset-password', PasswordResetController.resetPassword);
router.post('/resend-code', PasswordResetController.resendCode);

export default router;