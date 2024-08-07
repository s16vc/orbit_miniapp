// DealPage.jsx
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function DealPage() {
  const location = useLocation();
  const deal = location.state?.deal; // Access the transferred data

  console.log(deal);

  const navigate = useNavigate(); // Use useNavigate hook

  async function handleClick() {
    navigate('/');
  }

  async function handleActionClick(event: any, button: any) {
    console.log("ok")
    console.log('Button clicked with data:', button);
    try {
      const payload = {
        "callback_query": {
            "id": "123",
            "app_event": true,
            "from": {
                "username": "ish",
                "id": "123"
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
      const response = await axios.post('https://eoge8y8hn354lrl.m.pipedream.net', payload);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const buttonData = [
    { id: 1, value: `CommunityRequestInfo_${deal.atid}`, emoji: '🙋‍♂️' },
    { id: 2, value: `CommunityCanHelp_${deal.atid}`, emoji: 'ℹ️' },
    { id: 3, value: `CommunityRequestCall_${deal.atid}`, emoji: '☎️' },
    { id: 4, value: `CommunitySetAlert_${deal.atid}`, emoji: '🔔' }
  ];

  return (
    <div className='deal-page'>
      <button className='' onClick={handleClick}>Back</button>
      <h1>Deal Details</h1>
      {deal ? (
        <>
          <div>
            <p>Company name: <span>{deal.name}</span></p>
            <p>Deal Source: <span>{deal.dealSource}</span></p>
            <p>Deal Captain: <span>{deal.dealCaptain}</span></p>
            <p>Website: <span>{deal.website}</span></p>
            <p>AI Summary: <div className='scrollable-container'>{deal.aiSummary}</div></p>
          </div>

          <br/>
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
