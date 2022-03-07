//const AWS = require("aws-sdk");

import { Handler } from "aws-lambda";
import { getDestination, updateHits } from "./db";

export const handler: Handler = async event => {
  let response;
  const { path } = event;

  const responseFallback = (response = {
    statusCode: 301,
    headers: {
      "Location": "https://ibrahimcesar.cloud",
      "Cache-Control": "max-age=86400",
    },
  });

  if (event.httpMethod !== "GET") {
    response = {
      statusCode: 501,
    };
  }

  try {
    const hasMapped = await getDestination(path);
    if (hasMapped) {
      const hits = await updateHits(path);
      console.log(hits);
      response = {
        statusCode: 301,
        headers: {
          Location: hasMapped,
        },
      };
    } else {
      response = responseFallback;
    }
  } catch (err) {
    console.error(err);
    response = responseFallback;
  }

  return response;
};
