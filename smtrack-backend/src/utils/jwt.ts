import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../types';

export const generateAccessToken = (payload: JwtPayload): string => {
  const secret: Secret = config.jwtSecret;
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as any,
  };
  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const secret: Secret = config.jwtRefreshSecret;
  const options: SignOptions = {
    expiresIn: config.jwtRefreshExpiresIn as any,
  };
  return jwt.sign(payload, secret, options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  const secret: Secret = config.jwtSecret;
  return jwt.verify(token, secret) as unknown as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const secret: Secret = config.jwtRefreshSecret;
  return jwt.verify(token, secret) as unknown as JwtPayload;
};
