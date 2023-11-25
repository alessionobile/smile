import { Construct } from "constructs";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { BackendStack } from "../backend";
import { Cdn } from "./cdn";

interface FrontendStackProps extends StackProps {
  readonly backendStack: BackendStack;
}

export class FrontendStack extends Stack {
  public readonly cdn: Cdn;
  public readonly cdnUrl: CfnOutput;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    this.cdn = new Cdn(this, "Cdn", {
      backendStack: props.backendStack
    });

    this.cdnUrl = new CfnOutput(this, "CdnURL", {
      value: `https://${this.cdn.distribution.domainName}`
    });
  }
}