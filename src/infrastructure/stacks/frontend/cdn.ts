import { NodejsBuild } from "deploy-time-build";
import { Construct } from "constructs";
import { CfnOutput, RemovalPolicy, Stack, Duration } from "aws-cdk-lib";
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Distribution, AllowedMethods, ViewerProtocolPolicy, CachePolicy, OriginRequestPolicy } from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin, S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";

import { BackendStack } from "../backend";

export interface CdnProps {
  readonly backendStack: BackendStack;
}

export class Cdn extends Construct {
  public readonly CdnUrl: CfnOutput;
  public readonly assetBucket: Bucket;
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: CdnProps) {
    super(scope, id);

    this.assetBucket = new Bucket(this, "AssetBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    this.distribution = new Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      defaultBehavior:{
        origin: new S3Origin(this.assetBucket)
      ,},
      additionalBehaviors: {
        '/api/*': {
          origin: new HttpOrigin(`${props.backendStack.api.api.apiId}.execute-api.${Stack.of(props.backendStack.api.api).region}.amazonaws.com`),
          allowedMethods: AllowedMethods.ALLOW_ALL,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: CachePolicy.CACHING_DISABLED,
          originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER
        },
      },
      enableLogging: true,
      logBucket: props.backendStack.accessLogBucket,
      logFilePrefix: 'frontend/',
      logIncludesCookies: true,
      errorResponses: [{
        httpStatus: 404,
        ttl: Duration.seconds(0),
        responseHttpStatus: 200,
        responsePagePath: "/"
      },{
        httpStatus: 403,
        ttl: Duration.seconds(0),
        responseHttpStatus: 200,
        responsePagePath: "/"
      }]
    });

    new NodejsBuild(this, "ReactBuild", {
      assets: [
        {
          path: "../frontend",
          exclude: ["node_modules", "build"],
          commands: ["npm ci"],
        },
      ],
      buildCommands: ["npm run build"],
      buildEnvironment: {
        NODE_ENV: process.env.NODE_ENV || "production",
        REACT_APP_REGION: Stack.of(props.backendStack.auth.userPool).region,
        REACT_APP_API_ENDPOINT: `https://${this.distribution.domainName}/api`,
        //REACT_APP_API_ENDPOINT: props.backendStack.api.api.apiEndpoint,
        REACT_APP_USER_POOL_ID: props.backendStack.auth.userPool.userPoolId,
        REACT_APP_USER_POOL_CLIENT_ID: props.backendStack.auth.client.userPoolClientId
      },
      destinationBucket: this.assetBucket,
      distribution: this.distribution,
      outputSourceDirectory: "../frontend/build",
    });
  }
}
