const AWS = require("aws-sdk");
const { DynamoDB } = require("aws-sdk");
const credentials = new AWS.SharedIniFileCredentials({ profile: "cdk" });
AWS.config.credentials = credentials;
const dynamoDB = new DynamoDB.DocumentClient({
  region: "us-east-2",
  params: {
    TableName: "UrlsTable",
  },
});

const arr = [
  {
    code: "aws/compliance",
    url: "https://docs.aws.amazon.com/whitepapers/latest/aws-risk-and-compliance/welcome.html",
    project: "livro-aws",
  },
  {
    code: "aws/privacidade",
    url: "https://aws.amazon.com/pt/compliance/brazil-data-privacy/(https://aws.amazon.com/pt/compliance/brazil-data-privacy/",
    project: "livro-aws",
  },
  {
    code: "aws/root-user",
    url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user.html",
    project: "livro-aws",
  },
  {
    code: "aws/infra",
    url: "https://infrastructure.aws",
    project: "livro-aws",
  },
  {
    code: "aws/responsabilidade",
    url: "https://aws.amazon.com/pt/compliance/shared-responsibility-model",
    project: "livro-aws",
  },
  {
    code: "aws/termos",
    url: "https://aws.amazon.com/pt/aispl/service-terms/",
    project: "livro-aws",
  },
];

function add(code: string, url: string, project: string) {
  dynamoDB
    .update({
      Key: {
        pk: `/${code}`,
      },
      ConditionExpression: "attribute_not_exists(#pk)",
      UpdateExpression:
        "SET #longUrl = :longUrl, #hits = :hits, #project = :project, #tracking = :tracking",
      // For consistency, always use ExpressionAttributeNames for all attributes
      ExpressionAttributeNames: {
        "#longUrl": "longUrl",
        "#hits": "hits",
        "#project": "project",
        "#pk": "pk",
        "#tracking": "tracking",
      },
      ExpressionAttributeValues: {
        ":longUrl": url,
        ":hits": 0,
        ":project": project,
        ":tracking": {},
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
  add(`${value.code}`, `${value.url}`, `${value.project}`);
});
