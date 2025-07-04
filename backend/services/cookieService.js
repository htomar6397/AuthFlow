export const sendCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        maxAge:( process.env.REFRESH_EXPIRES_DAYS || 7) * 24 * 60 * 60 * 1000,
    });
};

export const deleteCookie = (res) => {
    res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        maxAge: 0,
    });
};