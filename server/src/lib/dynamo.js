const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');

const isOffline = process.env.IS_OFFLINE === 'true';

const client = new DynamoDBClient({
  region: process.env.REGION || 'us-east-1',
  ...(isOffline && {
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'local',
      secretAccessKey: 'local',
    },
  }),
});

const ddb = DynamoDBDocument.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

module.exports = ddb;
