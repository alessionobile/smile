#!/bin/bash

source vars.sh

prefix () {
    local prefix_output="$(date +'[Smile] %Y-%m-%d %H:%M:%S | ')"
    echo "$prefix_output"
}

# Delete FrontendStack
echo -e "\n$(prefix)[$FrontendStack] Initiating deletion.\n"
spin='-\|/'
i=0
while true; do
    frontendStatus=$(aws cloudformation delete-stack --stack-name $FrontendStack --region us-east-1 --output text)
    if [[ "$frontendStatus" == "DELETE_COMPLETE" ]]; then
        break
    fi
    printf "\r${spin:i++%${#spin}:1}"
done
echo -e "\n$(prefix)[$FrontendStack] Deleted\n"

# Delete BackendStack
echo -e "\n$(prefix)[$BackendStack] Initiating deletion.\n"
spin='-\|/'
i=0
while true; do
    backendStatus=$(aws cloudformation delete-stack --stack-name $BackendStack --region $Region --output text)
    if [[ "$backendStatus" == "DELETE_COMPLETE" ]]; then
        break
    fi
    printf "\r${spin:i++%${#spin}:1}"
done
echo -e "\n$(prefix)[$BackendStack] Deleted\n"

# Delete SmilePipeline
echo -e "\n$(prefix)[$StackName Stack] Initiating deletion.\n"
spin='-\|/'
i=0
while true; do
    pipelineStatus=$(aws cloudformation delete-stack --stack-name $StackName --region $Region --output text)
    if [[ "$pipelineStatus" == "DELETE_COMPLETE" ]]; then
        break
    fi
    printf "\r${spin:i++%${#spin}:1}"
done
echo -e "\n$(prefix)[$StackName Stack] Deleted\n"

