import { useEffect, useState } from 'react'
import orbitLogo from './assets/orbit-logo.jpg'
import axios from 'axios'; // Import Axios
import './App.css'

import WebApp from '@twa-dev/sdk'

function App() {
  const [count, _] = useState(0);
  const [data, setData] = useState(null);
  const stages = ["fat", "thin", "thick", "ohhh"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://eothw9cyg1yy2we.m.pipedream.net');
        setData(response.data);
        console.log(data)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this effect runs only once, similar to componentDidMount

  return (
    <>
      <div>
        <a href="https://www.s16vc.com" target="_blank">
          <img src={orbitLogo} className="logo" alt="TWA logo" />
        </a>
      </div>
      <h1>Orbit app</h1>
      <h2>Deal stages</h2>
      <div className='deal-stage-menu'>
        {stages.map((stage) => (
          <button className='btn-menu' onClick={() => console.log(stage)}>{stage}</button>
        ))}
      </div>
      {/*  */}
      <div className="card">
        <button onClick={() => WebApp.showAlert(`Hello World! Current count is ${count}`)}>
            Show Alert
        </button>
      </div>
    </>
  )
}

export default App
