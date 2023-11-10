import { Construct } from "constructs";
import { CfnIPSet, CfnWebACL } from "aws-cdk-lib/aws-wafv2";

export interface WafProps {
  readonly allowedIpV4AddressRanges: string[];
  readonly allowedIpV6AddressRanges: string[];
}

export class Waf extends Construct {
  public readonly ipV4SetReferenceStatement: CfnIPSet;
  public readonly ipV6SetReferenceStatement: CfnIPSet;
  public readonly wafAcl: CfnWebACL;

  constructor(scope: Construct, id: string, props: WafProps) {
    super(scope, id);

    // create Ipset for ACL
    this.ipV4SetReferenceStatement = new CfnIPSet(this, "frontendIpV4Set",
      {
        ipAddressVersion: "IPV4",
        scope: "CLOUDFRONT",
        addresses: props.allowedIpV4AddressRanges,
      }
    );
    this.ipV6SetReferenceStatement = new CfnIPSet(this, "frontendIpV6Set",
      {
        ipAddressVersion: "IPV6",
        scope: "CLOUDFRONT",
        addresses: props.allowedIpV6AddressRanges,
      }
    );

    this.wafAcl = new CfnWebACL(this, "wafAcl", {
      defaultAction: { block: {} },
      name: "frontendWafAcl",
      scope: "CLOUDFRONT",
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "frontendWafAcl",
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          priority: 0,
          name: "frontendWafAclIpV4RuleSet",
          action: { allow: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "frontendWafAcl",
            sampledRequestsEnabled: true,
          },
          statement: {
            ipSetReferenceStatement: { arn: this.ipV4SetReferenceStatement.attrArn },
          },
        },
        {
          priority: 1,
          name: "frontendWafAclIpV6RuleSet",
          action: { allow: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "frontendWafAcl",
            sampledRequestsEnabled: true,
          },
          statement: {
            ipSetReferenceStatement: { arn: this.ipV6SetReferenceStatement.attrArn },
          },
        },
      ],
    });
  }
}
