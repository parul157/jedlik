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

  async save() {
    await DocumentClient.put({
      TableName: this.constructor.tableName,
      Item: this,
    });
    return this;
  }
}

module.exports = Model;