// DealPage.jsx
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk'

function DealPage() {
  const location = useLocation();
  const deal = location.state?.deal; // Access the transferred data
  const user = location.state?.user; // Access the transferred data

  console.log(user);

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
    { id: 1, value: `CommunityRequestInfo_${deal.atid}`, emoji: '🙋‍♂️', message: 'Thank for your offer to help! We have notified the deal captain.'},
    { id: 2, value: `CommunityCanHelp_${deal.atid}`, emoji: 'ℹ️', message: 'Request received! You will receive the data shortly.' },
    { id: 3, value: `CommunityRequestCall_${deal.atid}`, emoji: '☎️', message: 'Request received! The deal captain has been notified.'},
    { id: 4, value: `CommunitySetAlert_${deal.atid}`, emoji: '🔔', message: 'Alert Set. You will receive a message whenever this deal has an update'}
  ];

  return (
    <div className='deal-page'>
      <button className='' onClick={handleClick}>⬅️ Back</button>
      <h1>Deal Details</h1>
      {deal ? (
        <>
          <div>
          {deal.name && (
            <p>Company name: <span>{deal.name}</span></p>
          )}
          {/* {deal.dealSource} */}
          {deal.dealSource && (
            <p>Deal Source: <span>Community</span></p>
          )}

          {deal.dealCaptain && (
            <p>Deal Captain: <span>{deal.dealCaptain}</span></p>
          )}

          {deal.website && (
            <p>Website: <span>{deal.website}</span></p>
          )}

          {deal.aiSummary && (
            <p>AI Summary: <div className='scrollable-container'>{deal.aiSummary}</div></p>
          )}
          </div>

          <div className='actions-desc'>
            <p>More Actions:</p>
            <p>🙋‍♂️ - ask for the pitch deck</p>
            <p>ℹ️ - have info on founders/deal/space</p>
            <p>☎️ - want to join the call with the founders</p>
            <p>🔔 - subscribe to updates</p>
          </div>
          <div className='btn-actions'>
          {buttonData.map(button => (
            <button
              key={button.id}
              onClick={(event) => handleActionClick(event, button)}
            >
              {button.emoji}
            </button>
          ))}
        </div>
          
        </>
      ) : (
        <p>No deal data available.</p>
      )}
    </div>
  );
}

export default DealPage;
