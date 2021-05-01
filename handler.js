"use strict";

const qs = require("querystring");
const TWILIO_ACCOUNT_SID = "R2D2_TWILIO_ACCOUNT_SID";
const TWILIO_AUTH_TOKEN = "R2D2_TWILIO_AUTH_TOKEN";
const TWILIO_ACCOUNT_PHONE_NUMBER = "R2D2_TWILIO_ACCOUNT_PHONE_NUMBER";
const twilio = require("twilio");
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const greeting = async (event, context, callback) => {
  let response = {};
  try {
    const headers = event.headers;
    const body = qs.parse(event.body);
    console.log("greeting recieved with body");
    console.log(JSON.stringify(body));
    console.log("greeting recieved with headers");
    console.log(JSON.stringify(headers));
    response = "Hello from your R2D2 assistant!";
  } catch (error) {
    console.log(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};

module.exports = {
  greeting,
};
