import { Construct } from "constructs";
import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { BlockPublicAccess, Bucket, BucketEncryption, ObjectOwnership } from "aws-cdk-lib/aws-s3";
import { Auth } from "./auth";
import { Api } from "./api";

export interface BackendStackProps extends StackProps { }

export class BackendStack extends Stack {
  public readonly accessLogBucket: Bucket;
  public readonly auth: Auth;
  public readonly api: Api;
  public readonly websocket: WebSocket;
  public readonly userPoolId: CfnOutput;
  public readonly userPoolClientId: CfnOutput;
  public readonly backendApiUrl: CfnOutput;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    this.accessLogBucket = new Bucket(this, "AccessLogBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      autoDeleteObjects: true,
    });

    this.auth = new Auth(this, "Auth");

    this.api = new Api(this, "BackendApi", {
      auth: this.auth
    });

    this.userPoolId = new CfnOutput(this, "UserPoolId", {
      value: this.auth.userPool.userPoolId
    });

    this.userPoolClientId = new CfnOutput(this, "UserPoolClientId", {
      value: this.auth.client.userPoolClientId
    });

    this.backendApiUrl = new CfnOutput(this, "BackendApiUrl", {
      value: this.api.api.apiEndpoint
    });
  }
}
