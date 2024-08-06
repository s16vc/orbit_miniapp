import { useEffect, useState } from 'react'
import s16vcLogo from './assets/s16vc.png'
import axios from 'axios'; // Import Axios
import './App.css'
import { InfinitySpin } from 'react-loader-spinner';
import { usePostHog } from 'posthog-js/react'
import { Route, Routes, useNavigate } from 'react-router-dom';

import DealPage from './components/DealPage';

interface DataDict { [key: string]: any[] };

function App(props: any) {
  const [data, setData] = useState<DataDict>({});
  const [loading, setLoading] = useState(false);
  const user = props.data.user;
  const formattedDate = (new Date).toISOString().slice(0, 19).replace('T', ' ').toString();

  const posthog = usePostHog();
  const navigate = useNavigate(); // Use useNavigate hook

  async function handleClick(event: any, clickData: any, posthog: any) {
    console.log("Yoooo")
    event.preventDefault();
    posthog?.capture('click', { property: clickData })
    const deal = clickData.deal;
    // if (deal.url) {
    //   window.location.href = deal.url;
    // }
    if (deal) {
      navigate('/deal', { state: { deal } }); // Navigate to the new page with deal data
    }
  }

  async function handleOpen(openData: any, posthog: any) {
    console.log("app opened")
    posthog?.capture('open', { property: openData })
  }

  console.log(formattedDate)
  useEffect(() => {
    if (user) {
      posthog?.identify(`${user.first_name} ${user.last_name}`);
    }
    
    const fetchData = async () => {
      await handleOpen({
        timestamp: formattedDate,
        user: user,
        event: "open"
      }, posthog)
      setLoading(true)
      try {
        const response = await axios.get('https://eo1qd7ilkf93z2i.m.pipedream.net');
        const preloadData = response.data;
        console.log(preloadData);
        setData(preloadData)
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false)
      }
    };

    fetchData();
    
    console.log(data)
  }, []); // Empty dependency array ensures this effect runs only once, similar to componentDidMount

  return (
    <>
      <Routes>
        <Route path="/" element={
           <div className='app'>
           <div className='app-header'>
             <a href="https://www.s16vc.com" target="_blank">
               <img src={s16vcLogo} className="logo" alt="TWA logo" />
             </a>
             {
               (user !== undefined && user !== null) && <h1 className={`greeting ${loading ? 'visible': 'hidden'}`}>Welcome, {user.first_name}!</h1>
             }
           </div>
           {loading ? (
             <div className='loading-animation'>
               <InfinitySpin
               width="200"
               color="white"
               />
             </div>
             
           ): (
             <div className='deal-directory-menu'>
             {Object.keys(data).map((stage) => (
               <div key={stage}>
                 <p className='deal-stage'>{stage}</p>
                 {data[stage].length > 0 ? (
                   <div className='stage-card'>
                     {data[stage].map((deal, index) => (
                       <>
                         <a key={index} href={deal.url} className='deal-entry' onClick={(event) => handleClick(event, {deal: deal, user: user, timestamp: formattedDate, event: "click"}, posthog)}>{deal.name}{deal.url && <span>🔗</span>}</a>
                         {index < data[stage].length-1 && (<hr className="solid"></hr>)}
                       </>
                     ))}
                   </div>
                 ): <p className='deal-empty'>No deal at this stage.</p>}
               </div>
             ))}
             </div>
           )
           }
         </div>
        }/>
        <Route path="/deal" element={<DealPage/>} />
      </Routes>
    </>
  )
}

export default App