#!/bin/bash

source vars.sh

prefix () {
    local prefix_output="$(date +'[Smile] %Y-%m-%d %H:%M:%S | ')"
    echo "$prefix_output"
}

# Delete FrontendStack
echo -e "\n$(prefix)[$FrontendStack] Initiating deletion.\n"
frontend=$(aws cloudformation delete-stack --stack-name $FrontendStack --region us-east-1 --output text)
spin='-\|/'
i=0
while true; do
    frontendStatus=$(aws cloudformation describe-stacks --stack-name $FrontendStack --query 'Stacks[0].StackStatus' --region us-east-1 --output text 2>&1)
    if [[ "$frontendStatus" == "DELETE_COMPLETE" || "$frontendStatus" ==  *"does not exist"* ]]; then
        break
    fi
    printf "\r${spin:i++%${#spin}:1}"
done
echo -e "\n$(prefix)[$FrontendStack] Deleted\n"

# Delete BackendStack
echo -e "\n$(prefix)[$BackendStack] Initiating deletion.\n"
backend=$(aws cloudformation delete-stack --stack-name $BackendStack --region $Region --output text)
spin='-\|/'
i=0
while true; do
    backendStatus=$(aws cloudformation describe-stacks --stack-name $BackendStack --query 'Stacks[0].StackStatus' --region $Region --output text 2>&1)
    if [[ "$backendStatus" == "DELETE_COMPLETE" || "$backendStatus" ==  *"does not exist"* ]]; then
        break
    fi
    printf "\r${spin:i++%${#spin}:1}"
done
echo -e "\n$(prefix)[$BackendStack] Deleted\n"

# Delete SmilePipeline
echo -e "\n$(prefix)[$StackName Stack] Initiating deletion.\n"
pipeline=$(aws cloudformation delete-stack --stack-name $StackName --region $Region --output text)
spin='-\|/'
i=0
while true; do
    pipelineStatus=$(aws cloudformation describe-stacks --stack-name $StackName --query 'Stacks[0].StackStatus' --region $Region --output text 2>&1)
    if [[ "$pipelineStatus" == "DELETE_COMPLETE" || "$pipelineStatus" ==  *"does not exist"* ]]; then
        break
    fi
    printf "\r${spin:i++%${#spin}:1}"
done
echo -e "\n$(prefix)[$StackName Stack] Deleted\n"

