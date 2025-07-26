import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

export const onlyDoctor = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ error: 'Access restricted to doctors' });
  }
  next();
};
