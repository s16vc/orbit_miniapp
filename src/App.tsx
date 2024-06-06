import { useEffect, useState } from 'react'
import s16vcLogo from './assets/s16vc.png'
import axios from 'axios'; // Import Axios
import './App.css'
import { InfinitySpin } from 'react-loader-spinner';



interface DataDict { [key: string]: any[] };

function App() {
  const [data, setData] = useState<DataDict>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await axios.get('https://eobimedzlf09afj.m.pipedream.net');
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
        </div>
        {loading ? (
          <div className='loading-animation'>
            <InfinitySpin
            width="200"
            color="white"
            ariaLabel="infinity-spin-loading"
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
                      <a key={index} href={deal.url} className='deal-entry'>{deal.name}</a>
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
