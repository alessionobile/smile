#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { BackendStack } from "./stacks/backend";
import { FrontendStack } from "./stacks/frontend";

const app = new App();

const backend = new BackendStack(app, `BackendStack`, {
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT ?? process.env.CDK_DEFAULT_ACCOUNT,
    region: app.node.tryGetContext("region"),
  },
  crossRegionReferences: true
});

const frontend = new FrontendStack(app, `FrontendWafStack`, {
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT ?? process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
  crossRegionReferences: true,
  backendStack: backend
});