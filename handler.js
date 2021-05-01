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

    if (messageBody.includes("TODO")) {
      await processToDo(messageBody, messageFrom);
    } else {
      await sendMessage(response, messageFrom);
    }
  } catch (error) {
    console.log(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};

const sendMessage = async (message, toNumber) => {
  await client.messages.create({
    body: message,
    from: TWILIO_ACCOUNT_PHONE_NUMBER,
    to: toNumber,
  });
};

const processToDo = async (action, phoneNumber) => {
  console.log("To Do found");
  const values = action.toUpperCase().replace("TODO", "").trim();
  const body = values.split(":");

  if (
    values.includes("ADD") ||
    values.includes("DELETE") ||
    values.includes("COMPLETE")
  ) {
    if (body.length !== 2) {
      throw new Error("invalid value");
    }
  }
  if (values.includes("ADD")) {
    console.log("ADD was called");
    // if the user puts in a comma seperated list make sure to account for them
    const total = body[1].split(",");
    let createMessage = "";
    for (let i = 0; i < total.length; i++) {
      await createToDo(total[i]);
      createMessage =
        createMessage + `create To Do of \"${total[i]}\" was successful \n \n`;
    }
    const viewMessage = await viewToDo();
    createMessage = `${createMessage} \n ${viewMessage}`;

    await sendMessage(createMessage, phoneNumber);
  } else if (values.includes("DELETE")) {
    console.log("DELETE was called");
    const deleteResponse = await deleteToDo(body[1]);
    const viewMessage = await viewToDo();
    const successMessage = `✅ ✅  ${deleteResponse} was deleted successful! \n \n ${viewMessage}`;
    await sendMessage(successMessage, phoneNumber);
  } else {
    console.log("VIEW was called");
    const viewMessage = await viewToDo();
    await sendMessage(viewMessage, phoneNumber);
  }
};

const list = () => {
  const params = {
    TableName: process.env.DYNAMODB_TODO,
  };

  return dynamoDb.scan(params).promise();
};

const createToDo = async (value) => {
  // the actual number of the value is just counted
  // and shown to user so that the index values can be preserved
  const timestamp = new Date().getTime();
  const valueId = Date.now().toString();

  const params = {
    TableName: process.env.DYNAMODB_TODO,
    Item: {
      id: valueId.toString(),
      text: value,
      createdAt: timestamp,
    },
  };

  await dynamoDb.put(params).promise();
};

const deleteToDo = async (valueId) => {
  // select value first and then calculate location
  // this is to preserve indexes when values get deleted
  const total = await list();
  total.Items.sort((a, b) => a.id - b.id);
  const numberId = parseInt(valueId) - 1;
  const actualId = total.Items[numberId];
  const params = {
    TableName: process.env.DYNAMODB_TODO,
    Key: {
      id: actualId.id,
    },
  };

  await dynamoDb.delete(params).promise();
  return actualId.text;
};

const viewToDo = async () => {
  const listResponse = await list();
  const total = listResponse.Items.sort((a, b) => {
    return a.id - b.id;
  });
  let viewMessage = "OK here is the To Dos \n\n";
  if (total.length === 0) {
    viewMessage = "the To Do list is currently empty";
  } else {
    let count = 1;
    total.forEach((item) => {
      viewMessage =
        viewMessage + `✅ item ${count.toString()} \n ${item.text} \n \n`;
      count++;
    });
  }
  return viewMessage;
};

module.exports = {
  greeting,
  sendMessage,
  processToDo,
  list,
  createToDo,
  deleteToDo,
  viewToDo,
};
