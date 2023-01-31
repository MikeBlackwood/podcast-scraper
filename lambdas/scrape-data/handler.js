"use strict";
var axios = require("axios");
var cheerio = require("cheerio");
var AWS = require("aws-sdk");

const fetchHTML = async (url) => {
  const response = await axios.get(url).then((resp) => resp.data);
  return response;
};

const parseHTML = (data) => {
  const $ = cheerio.load(data);
  const podcastList = [];
  $(".striped--near-white").each((index, elem) => {
    const rank = $(elem).find(".header-font").text();
    const prodCompany = $(elem).find(".silver").text();
    const link = $(elem).find(".tc > a").attr("href");
    const thumbnail = $(elem).find(".tc > .link > .lazy-load").attr("data-src");
    const title = $(elem).find(".title").text();
    podcastList.push({
      title,
      rank,
      production: prodCompany,
      link: link,
      thumbnail,
    });
  });
  return podcastList;
};

const generateFileName = () => {
  let today = new Date();
  let day = today.getDate();
  let month = today.getMonth() + 1;
  let year = today.getFullYear();
  if (day < 10) day = "0" + day;
  if (month < 10) month = "0" + month;
  return `${month}-${day}-${year}`;
};

const storeFile = async (value, table, date) => {
  const dynamo = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: table,
    Item: {
      PK: date,
      list: value,
    },
  };
  return dynamo.put(params).promise();
};

module.exports.run = async (event, context) => {
  const data = await fetchHTML(
    "https://chartable.com/charts/itunes/us-all-podcasts-podcasts"
  );
  const podcastList = parseHTML(data);
  const fileName = generateFileName();
  await storeFile(podcastList, "podcast-list", fileName);
};
