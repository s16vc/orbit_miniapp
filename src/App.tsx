import { useState } from 'react'
import orbitLogo from './assets/orbit-logo.jpg'
import axios from 'axios'; // Import Axios
import { Comment } from 'react-loader-spinner'
import './App.css'

import WebApp from '@twa-dev/sdk'

interface Deal {
  name: string,
  url: string
}

interface Data {
  stage: string,
  deals: Deal[]
}

function App() {
  const [count, _] = useState(0);
  const [data, setData] = useState<Data>();
  const [loading, setLoading] = useState(false);
  const stages = ["New deal", "Qualification", "Initial call", "S16 Analysis", "Partners call", "Decision making", "Rejected"]

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get('https://eothw9cyg1yy2we.m.pipedream.net');
  //       setData(response.data);
  //       console.log(data)
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };

  //   fetchData();
  // }, []); // Empty dependency array ensures this effect runs only once, similar to componentDidMount

  async function handleBtnClick(stage: string) {
    const mappingStagePayload: { [key: string]: string } = {
      'New deal': 'new_deals',
      'Qualification': 'qualification',
      'Initial call': 'initial_call',
      'S16 Analysis': 's16_analysis',
      'Partners call': 'partners_call',
      'Decision making': 'decision_making',
      'Rejected': 'rejected'
    }
    console.log(mappingStagePayload[stage])
    setLoading(true);
    try {
      const res = await axios.post("https://eo4xwy2isntloph.m.pipedream.net", {
        "stage": mappingStagePayload[stage]
      });
      setData(res.data);
      console.log(res);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // Set loading state to false after API call completes
    }
  }

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
          <button className='btn-menu' onClick={() => handleBtnClick(stage)}>{stage}</button>
        ))}
      </div>
      <div className='query-result'>
        {loading ? <Comment
  visible={true}
  height="80"
  width="80"
  ariaLabel="comment-loading"
  wrapperStyle={{}}
  wrapperClass="comment-wrapper"
  color="#fff"
  backgroundColor="#F4442E"
  /> : 
  (
    data && (
      <>
        <h3>Here all the deals in <strong>{data.stage}</strong></h3>
        <div className='result-cards'>
        {data.deals.length > 0 ? (
          data.deals.map((deal: Deal, index: number) => (
            <a className='deal' key={index} href={deal.url}>{deal.name}</a>
          ))
        ) : (
          <p>No deals found for <strong>{data.stage}</strong></p>
        )}
        </div>
      </>
    )
  )
  }
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
