import { Construct } from "constructs";
import { Duration } from "aws-cdk-lib";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";

export interface AuthProps {}

export class Auth extends Construct {
  public readonly userPool: UserPool;
  public readonly client: UserPoolClient;

  constructor(scope: Construct, id: string, props?: AuthProps) {
    super(scope, id);

    this.userPool = new UserPool(this, "UserPool", {
      passwordPolicy: {
        requireUppercase: true,
        requireSymbols: true,
        requireDigits: true,
        minLength: 8
      },
      selfSignUpEnabled: true,
      signInAliases: {
        username: false,
        email: true
      }
    });

    this.client = this.userPool.addClient(`Client`, {
      idTokenValidity: Duration.days(1),
      authFlows: {
        userPassword: true,
        userSrp: true
      }
    });
  }
}
