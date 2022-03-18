import { buildSync } from "esbuild";
import { App } from "aws-cdk-lib";
import { ShortUrlsStack } from "./stack";
import * as dotenv from "dotenv";

import path from "path";

dotenv.config();

buildSync({
  bundle: true,
  entryPoints: [path.resolve(__dirname, "lambda", "index.ts")],
  external: ["aws-sdk"],
  format: "cjs",
  outfile: path.join(__dirname, "dist", "index.js"),
  platform: "node",
  sourcemap: true,
  target: "node14.2",
});

const app = new App();
new ShortUrlsStack(app, `${process.env.STACK_PROJECT}`, {
  description: `${process.env.STACK_DESCRIPTION}`,
  stackName: `${process.env.STACK_NAME}`,
  env: {
    region: `${process.env.AWS_REGION}`,
  },
  tags: {
    project: `${process.env.STACK_PROJECT}`,
  },
});

app.synth();
