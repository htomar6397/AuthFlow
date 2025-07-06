import { Response } from 'express';

interface SuccessResponse {
  status: 'success';
  message: string;
  data?: any;
}

const sendSuccess = (
  res: Response,
  data: any = null,
  message: string = 'Success',
  statusCode: number = 200
): void => {
  const response: SuccessResponse = {
    status: 'success',
    message,
  };

  if (data) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

export { sendSuccess };
