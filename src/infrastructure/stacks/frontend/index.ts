import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import { BackendStack } from "../backend";
import { Waf } from "./waf";
import { Cdn } from "./cdn";

interface FrontendStackProps extends StackProps {
  readonly backendStack: BackendStack;
}

export class FrontendStack extends Stack {
  public readonly waf: Waf;
  public readonly cdn: Cdn;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    this.waf = new Waf(this, "Waf", {
      allowedIpV4AddressRanges: this.node.tryGetContext("allowedIpV4AddressRanges"),
      allowedIpV6AddressRanges: this.node.tryGetContext("allowedIpV6AddressRanges")
    });

    this.cdn = new Cdn(this, "Cdn", {
      backendStack: props.backendStack,
      webAclId: this.waf.wafAcl.attrArn,
    });
  }
}
