import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'arogyaSuperSecretKey';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    SECRET_KEY,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};