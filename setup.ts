import { buildSync } from "esbuild";
import { App } from "aws-cdk-lib";
import { UrlShortener } from "./stack";

import path from "path";

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
new UrlShortener(app, "UrlShortener", {
  description: "Minimal framework to run my own url shortener",
  stackName: "UrlStack",
  env: {
    region: "us-east-2",
  },
});

app.synth();
