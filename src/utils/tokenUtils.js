import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, isActive: user.isActive },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m", // Short-lived access token
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "28d", // Long-lived refresh token
    }
  );
};

export const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
};
