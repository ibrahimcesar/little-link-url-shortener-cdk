import { Construct } from "constructs";
import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";

import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";

// TODO: CDK v2 doesn't have L2 components for apigatewayv2
import * as apigateway from "aws-cdk-lib/aws-apigateway";

import path from "path";

class UrlShortener extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const redirectLambda = new lambda.Function(this, "Redirect", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.redirectHandler",
      code: lambda.Code.fromAsset(path.join(__dirname, "dist")),
      architecture: lambda.Architecture.ARM_64,
    });

    const table = new dynamodb.Table(this, "UrlsTable", {
      tableName: "UrlsTable",
      partitionKey: {
        name: "pk",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    table.grantReadWriteData(redirectLambda);

    const certArn =
      "arn:aws:acm:us-east-1:695841149075:certificate/da6d15ab-437e-47fa-aaf0-125c39e97499";
    const cert = acm.Certificate.fromCertificateArn(
      this,
      "Certificate",
      certArn
    );

    const api = new apigateway.LambdaRestApi(this, "UrlsEndpoint", {
      description: "Endpoint for calls to redirect",
      restApiName: "RedirectEndpoint",
      handler: redirectLambda,
    });

    api.addDomainName("ShortDomain", {
      domainName: "ibra.link",
      endpointType: apigateway.EndpointType.EDGE,
      certificate: cert,
      securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
    });

    new CfnOutput(this, "Testing", { value: api.url });
  }
}

export { UrlShortener };
