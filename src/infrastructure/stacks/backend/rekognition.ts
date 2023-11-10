import { Construct } from "constructs";
import * as rekognition from 'aws-cdk-lib/aws-rekognition';

export interface RekognitionProps {}

export class Rekognition extends Construct {
  public readonly collection: rekognition.CfnCollection;

  constructor(scope: Construct, id: string, props?: RekognitionProps) {
    super(scope, id);

    this.collection = new rekognition.CfnCollection(this, "RekognitionCollection", {
      collectionId: ""
    })
  }
}
