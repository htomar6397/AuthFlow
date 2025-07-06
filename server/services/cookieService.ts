import { Response } from 'express';

const sendCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: true, 
    sameSite: 'none',
    path: '/',
    maxAge: parseInt(process.env.REFRESH_EXPIRES_DAYS || '7') * 24 * 60 * 60 * 1000,
  });
};

const deleteCookie = (res: Response): void => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: true, 
    sameSite: 'none',
    path: '/',
    maxAge: 0,
  });
};

export { sendCookie, deleteCookie };
