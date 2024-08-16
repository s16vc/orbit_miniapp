import { useEffect, useState } from 'react'
import s16vcLogo from './assets/s16vc.png'
import './App.css'
import { InfinitySpin } from 'react-loader-spinner';
import { usePostHog } from 'posthog-js/react'
import { Route, Routes, useNavigate } from 'react-router-dom';

// access is restricted to orbit channel members only

import DealPage from './components/DealPage';

interface DataDict { [key: string]: any[] };
import axios from 'axios';

const botToken = '6644795511:AAF94mSfaDNi1otHwwBzt_LsnlV0xhJdIrw';
const chatId = '-1002142817225'; // or use chat ID if available

const checkUserMembership = async (userId: any) => {
  const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${chatId}&user_id=${userId}`;

  try {
      const response = await axios.get(url);
      const data = response.data;

      if (data.ok) {
          const memberStatus = data.result.status;
          console.log(`User ${userId} is a member of the channel. Status: ${memberStatus}`);
          return true;
      } else {
          console.error('Failed to get chat member information:', data);
          return false;
      }
  } catch (error: any) {
      console.error('Error making request:', error.message);
      return false;
  }
};

function App(props: any) {
  const [data, setData] = useState<DataDict>({});
  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useState<boolean | null>(null);
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
      navigate('/deal', { state: { deal, user } }); // Navigate to the new page with deal data
    }
  }

  async function handleOpen(openData: any, posthog: any) {
    console.log("app opened")
    posthog?.capture('open', { property: openData })
  }

  console.log(formattedDate)
  useEffect(() => {
    console.log(user);
    if (user) {
      posthog?.identify(`${user.first_name} ${user.last_name}`);
    }

    async function checkUserOrbitMembership() {
      const authorized = await checkUserMembership(user.id);
      setAuth(authorized)
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
      } catch (error: any) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false)
      }
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('You are in development mode, access granted');
      setAuth(true)
    } else {
      console.log('this is production')
      console.log('access is being checked...')
      checkUserOrbitMembership();
    }
    fetchData();
    
    console.log(data)
  }, []); // Empty dependency array ensures this effect runs only once, similar to componentDidMount

  if (auth === null) {
    // Show a loading state while auth is being checked
    return (
      <div className="loading-screen">
      </div>
    );
  }

  return (
    <>{auth ? <Routes>
      <Route path="/" element={
         <div className='app'>
         <div className='app-header'>
          <p>Debug auth: {auth} user_id: {user.id} env: {process.env.NODE_ENV}</p>
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
    :
    <div className='denied-section'>
      <div className='denied-message'>
      <p>Access denied</p>
      <span>You are not an orbit member</span>
      </div>
    </div>}
    </>
  )
}

export default App