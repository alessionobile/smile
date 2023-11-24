import { useMemo, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from 'aws-amplify/auth';

async function sessionToken(signedIn) {
  try {
    const { accessToken } = (await fetchAuthSession()).tokens ?? {};
    console.log('Signed in: ' + signedIn);
    if (accessToken !== undefined) return accessToken.toString();
  } catch (err) {
    console.log(err);
  }
}

export const useAuth = () => {
  const [accessToken, setAccessToken] = useState('');
  const authState = useAuthenticator(context => [context.authStatus]);
  const signedIn = authState.authStatus === "authenticated";

  useMemo(() => {
    return sessionToken(signedIn).then((accessToken) => {
      setAccessToken(accessToken);
    });
  }, [signedIn]);

  return { authState, signedIn, accessToken };
};