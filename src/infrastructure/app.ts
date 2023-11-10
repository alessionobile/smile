#!/usr/bin/env node
import "source-map-support/register";
import { CfnOutput, App } from "aws-cdk-lib";
import { BackendStack } from "./stacks/backend";
import { FrontendStack } from "./stacks/frontend";

const app = new App();

const backend = new BackendStack(app, `BackendStack`, {
  env: {
    region: app.node.tryGetContext("region"),
  },
  crossRegionReferences: true
});

// WAF for frontend
// 2023/9: Currently, the WAF for CloudFront needs to be created in the North America region (us-east-1), so the stacks are separated
// https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webacl.html
const frontend = new FrontendStack(app, `FrontendWafStack`, {
  env: {
    region: "us-east-1",
  },
  backendStack: backend
});

const userPoolId = new CfnOutput(app, "UserPoolId", {
  value: backend.auth.userPool.userPoolId
});

const userPoolClientId = new CfnOutput(app, "UserPoolClientId", {
  value: backend.auth.client.userPoolClientId
});

const backendApiUrl = new CfnOutput(app, "BackendApiUrl", {
  value: backend.api.api.apiEndpoint
});

const wafAclArn = new CfnOutput(app, "WafAclArn", {
  value: frontend.waf.wafAcl.attrArn
});

const CdnUrl = new CfnOutput(app, "CdnURL", {
  value: `https://${frontend.cdn.cloudFrontWebDistribution.distributionDomainName}`
});

