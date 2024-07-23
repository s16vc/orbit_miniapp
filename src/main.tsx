import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import WebApp from '@twa-dev/sdk'

import { PostHogProvider} from 'posthog-js/react';

const options = {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
}

WebApp.ready();

console.log(import.meta.env.VITE_POSTHOG_KEY)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PostHogProvider 
      apiKey={import.meta.env.VITE_POSTHOG_KEY}
      options={options}
    >
      <App data={WebApp.initDataUnsafe}/>
    </PostHogProvider>
    
  </React.StrictMode>,
)
