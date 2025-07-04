const { GetCommand, PutCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const ddb = require('../lib/dynamo');
const { Conflict } = require('../utils/httpErrors');

class UserService {
  constructor() {
    this.tableName = process.env.USERS_TABLE || 'Users';
  }

  async getByEmail(email) {
    const { Item } = await ddb.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { email },
      })
    );
    return Item;
  }

  async getByUsername(username) {
    const { Items } = await ddb.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'UsernameIndex',
        KeyConditionExpression: 'username = :u',
        ExpressionAttributeValues: { ':u': username },
      })
    );
    return Items && Items[0];
  }

  async createUser({ email, username, name, bio, passwordHash, confirmToken }) {
    try {
      await ddb.send(
        new PutCommand({
          TableName: this.tableName,
          Item: { 
            email, 
            username, 
            name, 
            bio: bio || '', 
            passwordHash, 
            confirmed: false, 
            confirmToken,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          ConditionExpression: 'attribute_not_exists(email) AND attribute_not_exists(username)',
        })
      );
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Conflict('Email or username already exists');
      }
      throw error;
    }
  }

  async confirmUser(email) {
    await ddb.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { email },
        UpdateExpression: 'SET confirmed = :true, updatedAt = :now REMOVE confirmToken',
        ExpressionAttributeValues: { 
          ':true': true,
          ':now': new Date().toISOString(),
        },
      })
    );
  }

  async updatePassword(email, passwordHash) {
    await ddb.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { email },
        UpdateExpression: 'SET passwordHash = :h, updatedAt = :now',
        ExpressionAttributeValues: { 
          ':h': passwordHash,
          ':now': new Date().toISOString(),
        },
      })
    );
  }
}

module.exports = new UserService();
