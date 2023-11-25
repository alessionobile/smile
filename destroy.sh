#!/bin/bash
source vars.sh

# Delete FrontendStack
echo -e "$(prefix)$RED [$FrontendStack] Deletion in progress.$ENDCOLOR\n"
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
echo -e "$(prefix)$GREEN [$FrontendStack] ✅ Deleted.$ENDCOLOR\n"

# Delete BackendStack
echo -e "$(prefix)$RED [$BackendStack] Deletion in progress.$ENDCOLOR\n"
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
echo -e "$(prefix)$GREEN [$BackendStack] ✅ Deleted.$ENDCOLOR\n"

# Delete SmilePipeline
echo -e "$(prefix)$RED [$StackName Stack] Deletion in progress.$ENDCOLOR\n"
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
echo -e "$(prefix)$GREEN [$StackName Stack] ✅ Deleted. $ENDCOLOR\n"

