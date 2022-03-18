import { Construct } from "constructs";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { HostedZone, ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";

import * as dotenv from "dotenv";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as targets from "aws-cdk-lib/aws-route53-targets";

// TODO: CDK v2 doesn't have L2 components for apigatewayv2 as 2022-03-18
import * as apigateway from "aws-cdk-lib/aws-apigateway";

import path from "path";

dotenv.config();

class ShortUrlsStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const redirectLambda = new lambda.Function(
      this,
      `${process.env.LAMBDA_NAME}`,
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "index.redirectHandler",
        code: lambda.Code.fromAsset(path.join(__dirname, "dist")),
        // architecture: lambda.Architecture.ARM_64, not supported at sa-eats-1 as 2022-03-18
      }
    );

    const table = new dynamodb.Table(this, `${process.env.TABLE_NAME}`, {
      tableName: `${process.env.TABLE_NAME}`,
      partitionKey: {
        name: "pk",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    table.grantReadWriteData(redirectLambda);

    const api = new apigateway.LambdaRestApi(
      this,
      `${process.env.STACK_PROJECT}Endpoint`,
      {
        description: `${process.env.ENDPOINT_DESCRIPTION}`,
        restApiName: `${process.env.ENDPOINT_NAME}`,
        handler: redirectLambda,
      }
    );

    api.addDomainName("ShortDomain", {
      domainName: `${process.env.DOMAIN}`,
      certificate: Certificate.fromCertificateArn(
        this,
        "ACM_Certificate",
        `${process.env.ARN_ACM_CERT}`
      ),
      securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
    });

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: `${process.env.HOSTED_ZONE_ID}`,
      zoneName: `${process.env.DOMAIN}`,
    });

    new ARecord(this, "AliasRecord", {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new targets.ApiGateway(api)),
    });
  }
}

export { ShortUrlsStack };
