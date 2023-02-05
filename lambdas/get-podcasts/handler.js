"use strict";

var AWS = require("aws-sdk");

function getParameter(tableName, search) {
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
  const query = event.queryStringParameters;
  if (!query) {
    return {
      statusCode: 404,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Date parameter is required" }),
    };
  }
  const date = query.date;
  const resp = getParameter("podcast-list", date).then((response) => {
    if (response.Items.length === 0) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "No data for current parameter" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(response.Items[0].list),
    };
  });
  return resp;
};
