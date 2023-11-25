#!/bin/bash

## deploy.sh
## Reduces dependencies on your local machine to the bare minimum.
## Facilitates infrastructure deployments by establishing a CI/CD pipeline
## Adopts AWS native IaC tools to handle cloud deployment states (CDK + CloudFormation)

source vars.sh

prefix () {
    local prefix_output="$(date +'[Smile] %Y-%m-%d %H:%M:%S | ')"
    echo "$prefix_output"
}

stackId=$(aws cloudformation create-stack \
  --stack-name $StackName \
  --region $Region \
  --template-body file://deploy.yml \
  --capabilities CAPABILITY_IAM \
  --query 'StackId' --output text)

echo "$(prefix)[Inception] Deploying the '$StackName' CloudFormation stack in $Region"
echo "$(prefix)[Inception] INFO: '$StackName' deploys a CodeBuild project responsible for the execution of our IaC stack with AWS CDK."
echo "$(prefix)[Inception] INFO: This is a deployment abstraction implemented to avoid issues with local machine dependencies and to speed up the deployment lifecycle."
echo "$(prefix)[Inception] INFO: (and to get you to Smile as soon as possible, of course!)"
spin='-\|/'
i=0
while true; do
    status=$(aws cloudformation describe-stacks --stack-name $StackName --query 'Stacks[0].StackStatus' --output text)
    if [[ "$status" == "CREATE_COMPLETE" || "$status" == "UPDATE_COMPLETE" || "$status" == "DELETE_COMPLETE" ]]; then
        break
    fi
    printf "\r${spin:i++%${#spin}:1}"
done
echo -e "\n$(prefix)[Inception] Inception completed.\n"

outputs=$(aws cloudformation describe-stacks --stack-name $StackName --query 'Stacks[0].Outputs')
projectName=$(echo $outputs | jq -r '.[] | select(.OutputKey=="ProjectName").OutputValue')

echo "$(prefix)[Deployment] Starting the IaC deployment through our CodeBuild project: $projectName..."
buildId=$(aws codebuild start-build --project-name $projectName --query 'build.id' --output text)

echo "$(prefix)[Deployment] INFO: Go grab a coffee while we'll wait for the CodeBuild project to complete. It will take about 15 minutes."
echo "$(prefix)[Deployment] INFO: If you'd like to read the log stream, check out the last build run at: https://$Region.console.aws.amazon.com/codesuite/codebuild/projects/$projectName/history?region=$Region"
while true; do
    buildStatus=$(aws codebuild batch-get-builds --ids $buildId --query 'builds[0].buildStatus' --output text)
    if [[ "$buildStatus" == "SUCCEEDED" || "$buildStatus" == "FAILED" || "$buildStatus" == "STOPPED" ]]; then
        break
    fi
    sleep 10
done
echo "$(prefix)[Deployment] The deployment has been completed with status: $buildStatus"

buildDetail=$(aws codebuild batch-get-builds --ids $buildId --query 'builds[0].logs.{groupName: groupName, streamName: streamName}' --output json)

logGroupName=$(echo $buildDetail | jq -r '.groupName')
logStreamName=$(echo $buildDetail | jq -r '.streamName')

#echo "$(prefix)Build Log Group Name: $logGroupName"
#echo "$(prefix)Build Log Stream Name: $logStreamName"

#echo "$(prefix)Fetch CDK deployment logs..."
logs=$(aws logs get-log-events --log-group-name $logGroupName --log-stream-name $logStreamName)
frontendUrl=$(echo "$logs" | grep -o 'FrontendStack.CdnURL = [^ ]*' | cut -d' ' -f3 | tr -d '\n,')

echo "$(prefix)[FINISH] Go Smile at $frontendUrl"