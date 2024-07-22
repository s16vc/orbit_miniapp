import { useEffect, useState } from 'react'
import s16vcLogo from './assets/s16vc.png'
import axios from 'axios'; // Import Axios
import './App.css'
import { InfinitySpin } from 'react-loader-spinner';



interface DataDict { [key: string]: any[] };

async function handleClick(event: any, clickData: any) {
  console.log("Yoooo")
  event.preventDefault();
  const response = await axios.post('https://eo5ut1vnrxtjmq0.m.pipedream.net', {
    eventData: clickData
  });
  console.log(response);
  const deal = clickData.deal;
  if (deal.url) {
    window.location.href = deal.url;
  }
}

async function handleOpen(openData: any) {
  console.log("app opened")
  const response = await axios.post('https://eo5ut1vnrxtjmq0.m.pipedream.net', {
    eventData: openData
  });
  console.log(response);
}

function App(props: any) {
  const [data, setData] = useState<DataDict>({});
  const [loading, setLoading] = useState(false);
  const user = props.data.user;
  const formattedDate = (new Date).toISOString().slice(0, 19).replace('T', ' ').toString();

  console.log(formattedDate)
  useEffect(() => {
    const fetchData = async () => {
      await handleOpen({
        timestamp: formattedDate,
        user: user,
        event: "open"
      })
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
      <div className='app'>
        <div>
          <a href="https://www.s16vc.com" target="_blank">
            <img src={s16vcLogo} className="logo" alt="TWA logo" />
          </a>
          {
            (user !== null && user !== undefined) && <h1 className='greeting'>Welcome {user.first_name}</h1>
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
                      <a key={index} href={deal.url} className='deal-entry' onClick={(event) => handleClick(event, {deal: deal, user: user, timestamp: formattedDate, event: "click"})}>{deal.name}{deal.url && <span>🔗</span>}</a>
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
    </>
  )
}

export default App
