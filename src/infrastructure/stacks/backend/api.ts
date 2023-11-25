import { Construct } from "constructs";
import { Duration } from "aws-cdk-lib";
import { CorsHttpMethod, HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { Auth } from "./auth";
import { ProcessImageFunction } from "./functions/processImage";

export interface ApiProps {
  readonly auth: Auth;
}

export class Api extends Construct {
  public readonly api: HttpApi;
  readonly processImageFunction: ProcessImageFunction;

  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id);

    this.api = new HttpApi(this, "Api", {
      corsPreflight: {
        maxAge: Duration.days(10),
        allowHeaders: this.node.tryGetContext("corsAllowHeaders"),
        allowOrigins: this.node.tryGetContext("corsAllowOrigins"),
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.HEAD,
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
        ]
      }
    });

    this.processImageFunction = new ProcessImageFunction(this, "ProcessImageFunction", {
      auth: props.auth,
    });
    this.api.addRoutes(this.processImageFunction.route);
  }
}