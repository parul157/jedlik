const DocumentClient = require('./document-client');

const getKeyConditionExpression = key => Object.keys(key)
  .reduce((expression, k, i) => `${expression}${i === 0 ? '' : ' AND '}#${k} = :${k}`, '');

const getExpressionAttributeNames = key => Object.keys(key)
  .reduce((names, k) => ({
    ...names,
    [`#${k}`]: k,
  }), {});

const getExpressionAttributeValues = key => Object.entries(key)
  .reduce((values, [k, v]) => ({
    ...values,
    [`:${k}`]: v,
  }), {});

class Model {
  static async query(key, index = null) {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: getKeyConditionExpression(key),
      ExpressionAttributeNames: getExpressionAttributeNames(key),
      ExpressionAttributeValues: getExpressionAttributeValues(key),
    };

    if (index) {
      params.IndexName = index;
    }

    const data = await DocumentClient.query(params);

    return data.Items.map(item => new this(item));
  }

  static async first(key, index = null) {
    const items = await this.query(key, index);

    if (items.length === 0) {
      return null;
    }

    return items[0];
  }

  static async get(key) {
    const data = await DocumentClient.get({
      TableName: this.tableName,
      Key: key,
    });

    if (!data.Item) {
      return null;
    }

    return new this(data.Item);
  }

  static async delete(key) {
    await DocumentClient.delete({
      TableName: this.tableName,
      Key: key,
    });

    return null;
  }

  async save() {
    await DocumentClient.put({
      TableName: this.constructor.tableName,
      Item: this,
    });
    return this;
  }
}

module.exports = Model;
