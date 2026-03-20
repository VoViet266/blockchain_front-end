import { verifyMessage } from 'ethers';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

// Lưu trữ nonce tạm thời (Trong thực tế nên dùng Redis hoặc Database)
const nonceStore = {};
/// 
const generateNonce = (req, res) => {
    const { address } = req.params;
    if (!address) {
        return res.status(400).json({ message: 'Vui lòng cung cấp địa chỉ ví' });
    }


    const nonce = randomBytes(16).toString('hex');
    const lowerCaseAddress = address.toLowerCase();

    nonceStore[lowerCaseAddress] = nonce;

    res.json({ message: 'Lấy nonce thành công', nonce });
};

const verifySignature = (req, res) => {
    const { address, signature } = req.body;

    if (!address || !signature) {
        return res.status(400).json({ message: 'Thiếu thông tin address hoặc signature' });
    }

    const lowerCaseAddress = address.toLowerCase();
    const nonce = nonceStore[lowerCaseAddress];

    if (!nonce) {
        return res.status(400).json({ message: 'Nonce không tồn tại hoặc đã hết hạn. Hãy yêu cầu nonce mới.' });
    }

    try {
        // Thông điệp mà người dùng đã ký ở frontend
        const message = `Sign this message to login: ${nonce}`;

        // Dùng ethers để phục hồi lại địa chỉ từ chữ ký
        const recoveredAddress = verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== lowerCaseAddress) {
            return res.status(401).json({ message: 'Chữ ký không hợp lệ!' });
        }

        // Tạo JWT Token
        const token = jwt.sign({ address: lowerCaseAddress }, process.env.JWT_SECRET, {
            expiresIn: '1d' // Token có hạn 1 ngày
        });

        // Xóa nonce sau khi đã sử dụng (chỉ dùng 1 lần)
        delete nonceStore[lowerCaseAddress];

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: { address: lowerCaseAddress }
        });

    } catch (error) {
        console.error('Lỗi khi verify:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ. Chữ ký có thể không hợp lệ.' });
    }
};

export default {
    generateNonce,
    verifySignature
};
