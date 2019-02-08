const getKeyConditionExpression = key => Object.keys(key)
  .reduce((expression, k, i) => `${expression}${i === 0 ? '' : ' AND '}#${k} = :${k}`, '');

module.exports = getKeyConditionExpression;
