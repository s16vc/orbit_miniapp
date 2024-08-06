// DealPage.jsx
import { useLocation, useNavigate } from 'react-router-dom';

function DealPage() {
  const location = useLocation();
  const deal = location.state?.deal; // Access the transferred data

  console.log(deal);

  const navigate = useNavigate(); // Use useNavigate hook

  async function handleClick() {
    navigate('/');
  }

  return (
    <div className='deal-page'>
      <button className='' onClick={(event) => handleClick()}>Back</button>
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
            <button>🙋‍♂️</button>
            <button>ℹ️</button>
            <button>☎️</button>
            <button>🔔</button>
          </div>
          
        </>
      ) : (
        <p>No deal data available.</p>
      )}
    </div>
  );
}

export default DealPage;
