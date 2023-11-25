#!/bin/bash

## deploy.sh
## Reduces dependencies on your local machine to the bare minimum.
## Facilitates infrastructure deployments by establishing a CI/CD pipeline
## Adopts AWS native IaC tools to handle cloud deployment states (CDK + CloudFormation)

StackName="SmilePipeline"

prefix () {
    local prefix_output="$(date +'%Y-%m-%d %H:%M:%S | ')"
    echo "$prefix_output"
}

stackId=$(aws cloudformation create-stack \
  --stack-name $StackName \
  --template-body file://deploy.yml \
  --capabilities CAPABILITY_IAM \
  --query 'StackId' --output text)

echo "$(prefix)Deploying the CloudFormation stack: $StackName"
echo "$(prefix)NOTE: this stack deploys a CodeBuild project used to initiate the $StackName CDK deployment."
spin='-\|/'
i=0
while true; do
    status=$(aws cloudformation describe-stacks --stack-name $StackName --query 'Stacks[0].StackStatus' --output text)
    if [[ "$status" == "CREATE_COMPLETE" || "$status" == "UPDATE_COMPLETE" || "$status" == "DELETE_COMPLETE" ]]; then
        break
    fi
    printf "\r${spin:i++%${#spin}:1}"
done
echo -e "\n$(prefix)Deployment completed.\n"

outputs=$(aws cloudformation describe-stacks --stack-name $StackName --query 'Stacks[0].Outputs')
projectName=$(echo $outputs | jq -r '.[] | select(.OutputKey=="ProjectName").OutputValue')

echo "$(prefix)Initializing the CodeBuild project: $projectName..."
buildId=$(aws codebuild start-build --project-name $projectName --query 'build.id' --output text)

echo "$(prefix)Waiting for the CodeBuild project to complete..."
while true; do
    buildStatus=$(aws codebuild batch-get-builds --ids $buildId --query 'builds[0].buildStatus' --output text)
    if [[ "$buildStatus" == "SUCCEEDED" || "$buildStatus" == "FAILED" || "$buildStatus" == "STOPPED" ]]; then
        break
    fi
    sleep 10
done
echo "$(prefix)CodeBuild project completed with status: $buildStatus"

buildDetail=$(aws codebuild batch-get-builds --ids $buildId --query 'builds[0].logs.{groupName: groupName, streamName: streamName}' --output json)

logGroupName=$(echo $buildDetail | jq -r '.groupName')
logStreamName=$(echo $buildDetail | jq -r '.streamName')

echo "$(prefix)Build Log Group Name: $logGroupName"
echo "$(prefix)Build Log Stream Name: $logStreamName"

echo "$(prefix)Fetch CDK deployment logs..."
logs=$(aws logs get-log-events --log-group-name $logGroupName --log-stream-name $logStreamName)
frontendUrl=$(echo "$logs" | grep -o 'FrontendStack.CdnURL = [^ ]*' | cut -d' ' -f3 | tr -d '\n,')

echo "$(prefix)Frontend URL: $frontendUrl"