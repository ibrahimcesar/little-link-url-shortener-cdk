var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// lambda/index.ts
var lambda_exports = {};
__export(lambda_exports, {
  redirectHandler: () => handler
});

// lambda/db.ts
var { DynamoDB } = require("aws-sdk");
var dynamoDB = new DynamoDB.DocumentClient({
  params: {
    TableName: "UrlsTable"
  }
});
var getDestination = async (code) => {
  return dynamoDB.get({
    Key: {
      pk: code
    },
    ProjectionExpression: "longUrl"
  }).promise().then((data) => {
    var _a;
    console.log(data);
    return ((_a = data == null ? void 0 : data.Item) == null ? void 0 : _a.longUrl) ?? null;
  }).catch((err) => {
    console.error({
      event: "GetDestination",
      target: code,
      value: err.code,
      retrievedAt: new Date().toISOString(),
      payload: err
    });
    return err.code;
  });
};
var updateHits = async (code) => {
  return dynamoDB.update({
    Key: {
      pk: code
    },
    UpdateExpression: "SET #hits = #hits + :hits_inc",
    ExpressionAttributeNames: {
      "#hits": "hits"
    },
    ExpressionAttributeValues: {
      ":hits_inc": 1
    },
    ReturnConsumedCapacity: "NONE",
    ReturnValues: "ALL_NEW"
  }).promise().then((data) => {
    console.info({
      event: "UpdateHits",
      destination: data.Attributes.longUrl,
      value: data.Attributes.hits,
      updatedAt: new Date().toISOString()
    });
    return data.Attributes;
  }).catch((err) => {
    console.error({
      event: "UpdateError",
      code,
      value: err.code,
      updatedAt: new Date().toISOString(),
      payload: err
    });
    return err.code;
  });
};

// lambda/redirect.ts
var handler = async (event) => {
  let response;
  const { path } = event;
  const responseFallback = response = {
    statusCode: 301,
    headers: {
      "Location": "https://ibrahimcesar.cloud",
      "Cache-Control": "max-age=86400"
    }
  };
  if (event.httpMethod !== "GET") {
    response = {
      statusCode: 501
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
          Location: hasMapped
        }
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
module.exports = __toCommonJS(lambda_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  redirectHandler
});
//# sourceMappingURL=index.js.map
