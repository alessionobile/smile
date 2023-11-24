import { Amplify } from "aws-amplify";
import { sessionStorage } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { post } from 'aws-amplify/api';

Amplify.configure({
  Auth: {
    Cognito: {
      region: process.env.REACT_APP_REGION,
      mandatorySignIn: true,
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID
    }
  },
  API: {
    REST: {
      'apiGateway': {
        endpoint: process.env.REACT_APP_API_ENDPOINT,
        region: process.env.REACT_APP_REGION
      }
    }
  }
});

cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorage);

async function processImage(image, accessToken) {
  try {
    const request = post({
      apiName: 'apiGateway',
      path: "/process-image",
      options: {
        body: { image: image },
        headers: {
          "Content-Type": "application/json",
          "Authorization": accessToken
        }
      }
    });
    const { body } = await request.response;
    const json = await body.json();
    return json
  } catch (error) {
    console.log('PROCESS call failed: ', error);
  }
}

export default processImage;
