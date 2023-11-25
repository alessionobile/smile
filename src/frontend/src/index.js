import { createRoot } from 'react-dom/client';
import { defaultDarkModeOverride, ThemeProvider, Authenticator, View  } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import App from './App';

const theme = {
  name: 'my-theme',
  overrides: [defaultDarkModeOverride],
};

const container = document.querySelector('#root');
const root = createRoot(container);

root.render(
  <ThemeProvider theme={theme} colorMode="dark">
    <Authenticator.Provider>
      <View><App /></View>
    </Authenticator.Provider>
  </ThemeProvider>
);