import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import WebApp from '@twa-dev/sdk'
import { BrowserRouter } from 'react-router-dom';

import { PostHogProvider} from 'posthog-js/react';
import { Provider } from 'react-redux'
import store from './redux/store.ts'

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
        <BrowserRouter basename={import.meta.env.DEV ? '/' : '/orbit_miniapp/'}>
          <App data={WebApp.initDataUnsafe}/>
        </BrowserRouter>
      </PostHogProvider>
    </Provider>
    
  </React.StrictMode>,
)
