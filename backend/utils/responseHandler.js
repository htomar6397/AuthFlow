const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
    const response = {
        status: 'success',
        message,
    };

    if (data) {
        response.data = data;
    }

    res.status(statusCode).json(response);
};

export { sendSuccess };
