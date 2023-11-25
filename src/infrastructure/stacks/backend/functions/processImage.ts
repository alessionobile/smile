import * as path from "path";
import { Construct } from "constructs";
import { Duration } from "aws-cdk-lib";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Role, ServicePrincipal, ManagedPolicy } from "aws-cdk-lib/aws-iam";
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpUserPoolAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import { HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { Auth } from "../auth";

export interface ProcessImageFunctionProps {
  readonly auth: Auth;
}

export class ProcessImageFunction extends Construct {
  public readonly functionRole: Role;
  public readonly function: Function;
  public readonly integration: HttpLambdaIntegration;
  public readonly authorizer: HttpUserPoolAuthorizer;
  public readonly route: any;

  constructor(scope: Construct, id: string, props: ProcessImageFunctionProps) {
    super(scope, id);

    this.functionRole = new Role(this, "FunctionRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });
    this.functionRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName(
      "service-role/AWSLambdaBasicExecutionRole"
    ));
    this.functionRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName(
      "AmazonRekognitionReadOnlyAccess"
    ));

    this.function = new Function(this, 'ProcessImageFunction', {
      functionName : "ProcessImageFunction",
      code         : Code.fromAsset(path.join(__dirname, 'process-image/')),
      handler      : 'index.processHandler',
      runtime      : Runtime.NODEJS_16_X,
      memorySize   : 128,
      role         : this.functionRole,
      timeout      : Duration.seconds(30),
      logRetention : RetentionDays.ONE_MONTH,
      environment  : {
        "REGION": this.node.tryGetContext("region")
      }
    });

    this.integration = new HttpLambdaIntegration("Integration", this.function);
    this.authorizer = new HttpUserPoolAuthorizer("Authorizer", props.auth.userPool, {
      userPoolClients: [props.auth.client],
    });

    this.route = {
      path: "/api/process-image",
      integration: this.integration,
      methods: [
        HttpMethod.POST
      ],
      authorizer: this.authorizer,
    };
  }
}