import { useEffect, useState } from 'react'
import s16vcLogo from './assets/s16vc.png'
import './App.css'
import { InfinitySpin } from 'react-loader-spinner';
import { usePostHog } from 'posthog-js/react'
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// access is restricted to orbit channel members only

import DealPage from './components/DealPage';

interface DataDict { [key: string]: any[] };
import axios from 'axios';
import { addViewedDeal, setViewedDeals } from './redux/action';

const botToken = '6644795511:AAF94mSfaDNi1otHwwBzt_LsnlV0xhJdIrw';
const chatId = '-1002142817225'; // or use chat ID if available

const checkUserMembership = async (userId: any) => {
  const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${chatId}&user_id=${userId}`;

  try {
      const response = await axios.get(url);
      const data = response.data;
      const isOrbitMember = data.ok && (data.result.status === "member" || data.result.status === "administrator" || data.result.status === "creator");

      if (isOrbitMember) {
          console.log('User is a member');
          return true;
      } else {
          console.error('Not a member of the channel:', data);
          return false;
      }
  } catch (error: any) {
      console.error('Error making request:', error.message);
      return false;
  }
};

// Add this function to define colors for each sector
const getColor = (sector: string) => {
  const colorMap: { [key: string]: string } = {
    'B2B SaaS': '#FFB3BA',
    'Productivity': '#BAFFC9',
    'Developer Tools': '#BAE1FF',
    'B2C SaaS': '#FFFFBA',
    'HealthTech': '#E6E6FA',
    'HR Tech': '#E0FFFF',
    'Cloud Storage and Computing': '#FFE4E1',
    'AI': '#98FB98',
    'Fintech': '#AFEEEE',
    'Marketplaces': '#D8BFD8',
    'Consumer': '#FFDAB9',
    'No Code / Low Code': '#F0E68C',
    'Collaboration': '#FFA07A',
    'EdTech': '#DDA0DD',
    'Media & Entertainment': '#E6E6FA',
    'E-Commerce': '#ADD8E6',
    'FoodTech': '#90EE90',
    'Logistics, Delivery and Supply Chain': '#F08080',
    'MarketingTech': '#FFB6C1',
    'Proptech': '#FAFAD2',
    'Robotics': '#E6E6FA',
    'Social Network': '#FFDAB9',
    'Creators\' Economy': '#F5DEB3',
    'CRM': '#D2B48C',
    'Cybersecurity': '#B0C4DE',
    'Data Analytics': '#FFDAB9',
    'Legal Tech': '#D8BFD8',
    'Greentech': '#98FB98',
    'VR / AR': '#E6E6FA',
    'Agnostic': '#D3D3D3',
    'AgTech': '#7FFF00',
    'Automotive': '#FFA07A',
    'Biotech': '#FFB6C1',
    'BNPL': '#F0E68C',
    'Business Intelligence': '#E0FFFF',
    'Charity': '#20B2AA',
    'Computer Vision': '#FFB6C1',
    'Consumer Analytics': '#8FBC8F',
    'Consumer Products': '#B0C4DE',
    'Consumer Services': '#AFEEEE',
    'Cosmetics': '#FFB6C1',
    'Dark Kitchen': '#BDB76B',
    'Deep Tech': '#A9A9A9',
    'DeFi': '#DDA0DD',
    'ESG / Impact tech': '#B0C4DE',
    'EV': '#D3D3D3',
    'Fashion & Apparel': '#FFA07A',
    'Gaming': '#FFA07A',
    'Hardware': '#FAFAD2',
    'Hospitality': '#ADD8E6',
    'Industrials': '#90EE90',
    'Infrastructure': '#FFB6C1',
    'InsurTech': '#E0FFFF',
    'Investment Fund': '#FAFAD2',
    'IoT': '#20B2AA',
    'Mental Health': '#B0C4DE',
    'Mobility': '#D3D3D3',
    'Music': '#FFA07A',
    'NFTs': '#FFB6C1',
    'Sport': '#FAFAD2',
    'Telemedicine': '#ADD8E6',
    'Travel Tech': '#90EE90',
    'Web 3 / Crypto': '#FFB6C1',
  };
  return colorMap[sector] || 'black'; // Default color if sector not found
}

function App(props: any) {
  const dispatch = useDispatch();

  const [data, setData] = useState<DataDict>({});
  const [loading, setLoading] = useState(false);
  const viewedDeals = useSelector((state: any) => state.viewedDeals);
  const [auth, setAuth] = useState<boolean | null>(null);
  let user = props.data.user;
  if (process.env.NODE_ENV === 'development') {
    user = {
      id: 5861198087,
      first_name: "dev",
      last_name: ""
    }
    // dev 5740776938
  }
  // determine user type: LP or team
  const team = [
    "Isham Le Tenoux",
    "Szymon Brodziak",
    "Dina Gainullina",
    "Jane Milyaeva",
    "Oleg Bibergan",
    "Aleks",
    "Diana",
    "Juli",
    "Leo Batalov",
    "Bowei G"
  ]

  const userType = team.includes(`${user.first_name} ${user.last_name}`) ? "team" : "LP"
  const formattedDate = (new Date).toISOString().slice(0, 19).replace('T', ' ').toString();

  const posthog = usePostHog();
  const navigate = useNavigate(); // Use useNavigate hook

  const setAsViewed = async(userId: any, dealname: any) => {
    dispatch(addViewedDeal(dealname)); // Dispatch action to add viewed deal
    // record the viewed deal
    const url = `https://eoh217vgfitqmyc.m.pipedream.net`;
  
    try {
        const payload = {
          userId: userId,
          deal: dealname,
          subscribed: false
        }
        await axios.post(url, payload);
    } catch (error: any) {
        console.error('Error making request:', error.message);
        return false;
    }
  }

  async function handleClick(event: any, clickData: any, posthog: any) {
    console.log("Yoooo")
    event.preventDefault();
    posthog?.capture('deal_clicked', clickData)
    const deal = clickData.deal;
    const subscribed = viewedDeals.filter((deal: any) => deal.subscribed).map((deal: any) => deal.dealname.trim()).includes(deal.name.trim());
    if (deal) {
      // set as viewed in the database
      if (user.id) {
        setAsViewed(user.id, deal.name);
      }
      navigate('/deal', { state: { deal, user, subscribed } }); // Navigate to the new page with deal data
    }
  }

  async function handleOpen(openData: any, posthog: any) {
    console.log("app opened")
    posthog?.capture('app_open', openData)
  }

  console.log(formattedDate)
  useEffect(() => {
    console.log(user);
    console.log(viewedDeals)
    
    posthog?.identify(
      `${user.first_name} ${user.last_name}`,
      {
        userType: userType
      }
    );

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

        const r = await axios.get('https://eoxv3coove8ffsc.m.pipedream.net', {
          params: {
            userId: user.id
          }
        })
        console.log(`viewed deals: ${JSON.stringify(r.data)}`)
        
        if (Array.isArray(r.data)) {
          dispatch(setViewedDeals(r.data));
        }
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
          {/* <p>Debug auth: {auth} user_id: {user.id} env: {process.env.NODE_ENV}</p> */}
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
                   {data[stage].map((deal: any, index: number) => (
                     <>
                       <div key={index} className='deal-entry' onClick={(event) => handleClick(event, {deal: deal, user: user, timestamp: formattedDate, event: "click", userType: userType}, posthog)}>
                          <div className='deal-entry-name'>
                            <p className={!viewedDeals.map((deal: any) => deal.dealname).includes(deal.name) ? 'newDeal' : 'dealname'}>{deal.name}</p>
                            <p className='subscribe-tag'>{viewedDeals.filter((deal: any) => deal.alert).map((deal: any) => deal.dealname.trim()).includes(deal.name.trim()) ? '🔔': ''}</p>
                          </div>
                          
                          <div className='sector-tags'>
                            {deal.sectors.map((sector: any) => (
                              <p className='sector' style={{background: getColor(sector)}}>{sector}</p>
                            ))}
                          </div>
                        </div>
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