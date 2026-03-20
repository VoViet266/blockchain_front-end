import { Router } from 'express';
const router = Router();
import authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
const { generateNonce, verifySignature } = authController;


router.get('/nonce/:address', generateNonce);
router.post('/verify', verifySignature);

router.get('/me', authMiddleware, (req, res) => {
    res.json({ message: 'Thông tin người dùng lấy thành công', user: req.user });
});

export default router;
