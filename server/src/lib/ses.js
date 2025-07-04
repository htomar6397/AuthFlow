const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const isOffline = process.env.IS_OFFLINE === 'true';

const ses = new SESClient({
  region: process.env.REGION || 'us-east-1',
  ...(isOffline && {
    endpoint: 'http://localhost:9001',
    credentials: {
      accessKeyId: 'local',
      secretAccessKey: 'local',
    },
  }),
});

module.exports = {
  sendEmail: async (params) => {
    if (isOffline) {
      console.log('Email would be sent in production:', params);
      return { MessageId: 'local-message-id' };
    }
    
    const command = new SendEmailCommand({
      Source: params.from || process.env.SES_FROM,
      Destination: {
        ToAddresses: Array.isArray(params.to) ? params.to : [params.to],
      },
      Message: {
        Subject: { Data: params.subject },
        Body: {
          Text: { Data: params.text },
          ...(params.html && { Html: { Data: params.html } }),
        },
      },
    });

    return ses.send(command);
  },
};
