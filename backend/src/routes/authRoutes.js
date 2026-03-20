import { Router } from 'express';
const router = Router();
import { generateNonce, verifySignature } from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';


router.get('/nonce/:address', generateNonce);
router.post('/verify', verifySignature);

router.get('/me', authMiddleware, (req, res) => {
    res.json({ message: 'Thông tin người dùng lấy thành công', user: req.user });
});

export default router;
