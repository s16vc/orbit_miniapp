import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './App.css'
import '@telegram-apps/telegram-ui/dist/styles.css';

import WebApp from '@twa-dev/sdk'

import { PostHogProvider} from 'posthog-js/react';
import { Provider } from 'react-redux'
import store from './redux/store.ts'

import { AppRoot } from '@telegram-apps/telegram-ui';

const options = {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
}

WebApp.ready();

console.log(import.meta.env.VITE_POSTHOG_KEY)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PostHogProvider 
        apiKey={import.meta.env.VITE_POSTHOG_KEY}
        options={options}
      >
        <AppRoot appearance="dark">
          <App data={WebApp.initDataUnsafe}/>
        </AppRoot>
      </PostHogProvider>
    </Provider>
    
  </React.StrictMode>,
)