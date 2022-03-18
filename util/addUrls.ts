// Handy and manual util for add new domains through an array
import * as dotenv from "dotenv";

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
    code: "conway",
    url: "http://www.melconway.com/Home/Committees_Paper.html",
    project: "arch",
  },
  {
    code: "mud",
    url: "http://www.laputan.org/mud/",
    project: "arch",
  },
  {
    code: "aws/azure",
    url: "https://www.microsoft.com/azure/partners/well-architected",
    project: "livro-aws",
  },
  {
    code: "aws/google",
    url: "https://cloud.google.com/architecture/framework",
    project: "livro-aws",
  },
  {
    code: "aws/alibaba",
    url: "https://www.alibabacloud.com/architecture/index",
    project: "livro-aws",
  },
  {
    code: "aws/oracle",
    url: "https://docs.oracle.com/en/solutions/oci-best-practices/",
    project: "livro-aws",
  },
  {
    code: "aws",
    url: "https://livroaws.ibrahimcesar.cloud",
    project: "livro-aws",
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
