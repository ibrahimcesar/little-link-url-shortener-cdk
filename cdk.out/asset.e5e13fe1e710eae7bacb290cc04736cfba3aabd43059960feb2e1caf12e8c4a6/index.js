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
  dynamoDB.get({
    Key: {
      pk: code
    },
    ProjectionExpression: "longUrl"
  }).promise().then((data) => {
    return data.Item.longUrl;
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

// lambda/redirect.ts
var AWS = require("aws-sdk");
var handler = async (event) => {
  console.log(event.path);
  try {
    const hasMapped = await getDestination(event.path);
    console.log(`hasMapped: ${hasMapped}`);
  } catch (err) {
    console.error(err);
  }
  const response = {
    statusCode: 200,
    body: `${event.path}`
  };
  return response;
};
module.exports = __toCommonJS(lambda_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  redirectHandler
});
//# sourceMappingURL=index.js.map
