import { NodejsBuild } from "deploy-time-build";
import { Construct } from "constructs";
import { CfnOutput, RemovalPolicy, Stack } from "aws-cdk-lib";
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { CloudFrontWebDistribution, OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { BackendStack } from "../backend";

export interface CdnProps {
  readonly backendStack: BackendStack;
  readonly webAclId: string;
}

export class Cdn extends Construct {
  public readonly CdnUrl: CfnOutput;
  public readonly assetBucket: Bucket;
  public readonly originAccessIdentity: OriginAccessIdentity;
  public readonly cloudFrontWebDistribution: CloudFrontWebDistribution;

  constructor(scope: Construct, id: string, props: CdnProps) {
    super(scope, id);

    this.assetBucket = new Bucket(this, "AssetBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    this.originAccessIdentity = new OriginAccessIdentity(this, "OriginAccessIdentity");

    this.cloudFrontWebDistribution = new CloudFrontWebDistribution(this, "Distribution", {
      originConfigs: [{
        s3OriginSource: {
          s3BucketSource: this.assetBucket,
          originAccessIdentity: this.originAccessIdentity,
        },
        behaviors: [{
          isDefaultBehavior: true,
        }]
      }],
      errorConfigurations: [{
        errorCode: 404,
        errorCachingMinTtl: 0,
        responseCode: 200,
        responsePagePath: "/"
      },
      {
        errorCode: 403,
        errorCachingMinTtl: 0,
        responseCode: 200,
        responsePagePath: "/"
      }],
      loggingConfig: {
        bucket: props.backendStack.accessLogBucket,
        prefix: "frontend/",
      },
      webACLId: props.webAclId,
    });

    new NodejsBuild(this, "ReactBuild", {
      assets: [
        {
          path: "../frontend",
          exclude: ["node_modules", "dist"],
          commands: ["npm ci"],
        },
      ],
      buildCommands: ["npm run build"],
      buildEnvironment: {
        REGION: Stack.of(props.backendStack.auth.userPool).region,
        APP_API_ENDPOINT: props.backendStack.api.api.apiEndpoint,
        APP_USER_POOL_ID: props.backendStack.auth.userPool.userPoolId,
        APP_USER_POOL_CLIENT_ID: props.backendStack.auth.client.userPoolClientId
      },
      destinationBucket: this.assetBucket,
      distribution: this.cloudFrontWebDistribution,
      outputSourceDirectory: "dist",
    });
  }
}
