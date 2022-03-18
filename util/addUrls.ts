// Handy and manual util for add new domains through an array
const AWS = require("aws-sdk");
const { DynamoDB } = require("aws-sdk");

dotenv.config();
const credentials = new AWS.SharedIniFileCredentials({
  profile: `${process.env.AWS_PROFILE}`,
});
AWS.config.credentials = credentials;
const dynamoDB = new DynamoDB.DocumentClient({
  region: `${process.env.AWS_REGION}`,
  params: {
    TableName: `${process.env.TABLE_NAME}`,
  },
});

interface IRedirect {
  code: string;
  url: string;
  project: string;
}

const arr = [
  {
    code: "",
    url: "",
    project: "",
  },
];

function add({ code, project, url }: IRedirect) {
  dynamoDB
    .update({
      Key: {
        pk: `/${code}`,
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
        ":longUrl": url,
        ":hits": 0,
        ":project": project,
      },
      ReturnConsumedCapacity: "NONE",
      ReturnValues: "ALL_NEW",
    })
    .promise()
    .then((data: any) => {
      console.log(data.Attributes);
    })
    .catch((error: any) => {
      console.error(error);
    });
}

arr.forEach((value, _index) => {
  add({
    code: value.code,
    url: value.url,
    project: value.project,
  });
});
