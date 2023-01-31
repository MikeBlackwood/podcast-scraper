"use strict";
/*
    1. Recieve date
    2. Get file location from dynamo
    3. fetch data
    4. decode data
    5. return as json
*/

var AWS = require("aws-sdk");

async function getParameter(tableName, search) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "PK = :hkey",
    ExpressionAttributeValues: {
      ":hkey": search,
    },
  };
  const dynamo = new AWS.DynamoDB.DocumentClient();
  return dynamo.query(params).promise();
}

module.exports.run = async (event, context) => {
  const date = event.queryStringParameters.date;
  console.log(date);
  const data = await getParameter("podcast-list", date).then((data) => {
    return data.Items[0].list;
  });
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
};
