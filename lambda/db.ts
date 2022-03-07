const { DynamoDB } = require("aws-sdk");

const dynamoDB = new DynamoDB.DocumentClient({
  params: {
    TableName: "UrlsTable",
  },
});

const addDestination = async (
  code: string,
  destination: string,
  project: string
) => {
  return dynamoDB
    .update({
      TableName: "UrlsTable",
      Key: {
        pk: code,
      },
      ConditionExpression: "attribute_not_exists(#pk)",
      UpdateExpression:
        "SET #longUrl = :longUrl, #hits = :hits, #project = :project",
      ExpressionAttributeNames: {
        "#longUrl": "longUrl",
        "#hits": "hits",
        "#project": "project",
        "#pk": "pk",
      },
      ExpressionAttributeValues: {
        ":longUrl": destination,
        ":project": project,
        ":hits": 0,
      },
      ReturnConsumedCapacity: "NONE",
      ReturnValues: "ALL_NEW",
    })
    .promise()
    .then((data: any) => {
      console.info({
        event: "AddDestination",
        targetAdded: data.Attributes.longUrl,
        projectAdded: data.Attributes.hits,
        createdAt: new Date().toISOString(),
      });
      return data.Attributes;
    })
    .catch((err: any) => {
      console.error({
        event: "UpdateError",
        target: code,
        value: err.code,
        updatedAt: new Date().toISOString(),
        payload: err,
      });
      console.error(err);
    });
};

const getDestination = async (code: string) => {
  return dynamoDB
    .get({
      Key: {
        pk: code,
      },
      ProjectionExpression: "longUrl",
    })
    .promise()
    .then((data: any) => {
      console.log(data);
      return data?.Item?.longUrl ?? null;
    })
    .catch((err: any) => {
      console.error({
        event: "GetDestination",
        target: code,
        value: err.code,
        retrievedAt: new Date().toISOString(),
        payload: err,
      });
      return err.code;
    });
};

const updateHits = async (code: string) => {
  return dynamoDB
    .update({
      Key: {
        pk: code,
      },
      UpdateExpression: "SET #hits = #hits + :hits_inc",
      ExpressionAttributeNames: {
        "#hits": "hits",
      },
      ExpressionAttributeValues: {
        ":hits_inc": 1,
      },
      ReturnConsumedCapacity: "NONE",
      ReturnValues: "ALL_NEW",
    })
    .promise()
    .then((data: any) => {
      console.info({
        event: "UpdateHits",
        destination: data.Attributes.longUrl,
        value: data.Attributes.hits,
        updatedAt: new Date().toISOString(),
      });
      return data.Attributes;
    })
    .catch((err: any) => {
      console.error({
        event: "UpdateError",
        code: code,
        value: err.code,
        updatedAt: new Date().toISOString(),
        payload: err,
      });
      return err.code;
    });
};

export { addDestination, getDestination, updateHits };
