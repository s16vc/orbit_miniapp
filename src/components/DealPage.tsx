// DealPage.jsx
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk'
import arrow from '../assets/arrow-left.svg'


function DealPage() {
  const location = useLocation();
  const deal = location.state?.deal; // Access the transferred data
  const user = location.state?.user; // Access the transferred data

  console.log(user);
  console.log(deal);

  const navigate = useNavigate(); // Use useNavigate hook

  async function handleClick() {
    navigate('/');
  }

  async function handleActionClick(event: any, button: any) {
    console.log(event)
    console.log('Button clicked with data:', button);
    WebApp.showAlert(button.message);
    try {
      const payload = {
        "callback_query": {
            "id": "123",
            "app_event": true,
            "from": {
                "username": user.username,
                "id": user.id
            },
            "message": {
                "message_id": "",
                "reply_markup": "",
                "chat": {
                    "id": "123"
                }
            },
            "data": button.value
        }
    }
      await axios.post('https://eoge8y8hn354lrl.m.pipedream.net', payload);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const buttonData = [
    { id: 1, value: `CommunityRequestInfo_${deal.atid}`, emoji: '🙋‍♂️', message: 'Thank for your offer to help! We have notified the deal captain.', label: 'Request a deck'},
    { id: 2, value: `CommunityCanHelp_${deal.atid}`, emoji: 'ℹ️', message: 'Request received! You will receive the data shortly.', label: 'Share info'},
    { id: 3, value: `CommunityRequestCall_${deal.atid}`, emoji: '☎️', message: 'Request received! The deal captain has been notified.', label: 'Join a call'},
    { id: 4, value: `CommunitySetAlert_${deal.atid}`, emoji: '🔔', message: 'Alert Set. You will receive a message whenever this deal has an update', label: 'Subscribe'}
  ];

  return (
    <div className='deal-page'>
      <img className='back-btn' onClick={handleClick} src={arrow}/>
      {deal ? (
        <>
          <div className='deal-header'>
              <p className='deal-name'>{deal.name}</p>
              {deal.website && (
                <a className='dealWebsite' href={deal.website.startsWith('http') ? deal.website : `https://${deal.website}`}  target="_self">{deal.website}</a>
              )}

              <div className='btn-actions'>
                {buttonData.map(button => (
                  <button
                    key={button.id}
                    onClick={(event) => handleActionClick(event, button)}
                  >
                    <div>
                      <p className='emoji'>{button.emoji}</p>
                      <p>{button.label}</p>
                    </div>
                    
                  </button>
                ))}
              </div>
          </div>

          <div className='deal-info'>
            {/* {deal.dealSource} */}
            <div className='info-bg'>
              {deal.dealSource && (
                <p><span>Deal Source:</span> Community</p>
              )}
              <div className='separator'></div>
              {deal.dealCaptain && (
                <p><span>Deal Captain:</span> {deal.dealCaptain}</p>
              )}
              <div className='separator'></div>
              {deal.founders && (
                  <p><span>Founders:</span> {deal.founders.join(', ')}</p>
              )}
            </div>
            <div className='info-rest'>
              {deal.aiSummary && (
                <div>
                  <p><span>AI Summary:</span></p>
                  <div className='scrollable-container'>{deal.aiSummary}</div>
                </div>
              )}

              {deal.like && (
                <div>
                  <p><span>Why we like it:</span></p>
                  <div className='scrollable-container'>{deal.like}</div>
                </div>
                
              )}
          </div>
          </div>
          
        </>
      ) : (
        <p>No deal data available.</p>
      )}
    </div>
  );
}

export default DealPage;
