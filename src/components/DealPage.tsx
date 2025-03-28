// DealPage.jsx
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePostHog } from 'posthog-js/react';
import WebApp from '@twa-dev/sdk'
import arrow from '../assets/arrow-left.svg'
import { useDispatch, useSelector } from 'react-redux';
import { updateViewedDeal } from '../redux/action';


function DealPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const deal = location.state?.deal; // Access the transferred data
  const user = location.state?.user; // Access the transferred data
  const posthog = usePostHog();
  const viewedDeals = useSelector((state: any) => state.viewedDeals);
  const isProd = (process.env.NODE_ENV !== 'development')

  console.log(`sub: ${JSON.stringify(location.state)}`)
  console.log(user);
  console.log(deal);

  const navigate = useNavigate(); // Use useNavigate hook

  async function handleClick() {
    navigate('/');
  }

  async function handleLinkClick(event: any, deal: any) {
    console.log(event);
    const clickData = {
      deal: deal.name,
      link: deal.website
    }
    posthog?.capture('deal_link_clicked', clickData);

    const link = deal.website.startsWith('http') ? deal.website : `https://${deal.website}`
    window.open(link, '_blank');
  }

  async function orbitInteraction(buttonValue: string) {
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
            "data": buttonValue
        }
    }
      await axios.post('https://eoge8y8hn354lrl.m.pipedream.net', payload);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function handleActionClick(event: any, button: any, clickData: any) {
    console.log(event)
    console.log('Button clicked with data:', button);
    
    if (button.label === "Subscribe") {
      WebApp.showPopup({
          title: "Be honest",
          message: button.message,
          buttons: [
              { text: "I have conflict", type: "destructive", id: "conflictPath" }, // Destructive button
              { text: "I don't have a conflict", type: "default", id: "noConflictPath" }  // Default button
          ]
      }, async(buttonId) => {
          // Callback function for button actions
          // need to update the setViewedDeal variable, should pass it as parameter
          if (buttonId === "noConflictPath") {
              console.log("OK button clicked");
              const url = `https://eoh217vgfitqmyc.m.pipedream.net`;
              try {
                  const payload = {
                    userId: clickData.userId,
                    deal: clickData.dealname,
                    state: {...viewedDeals.find((deal: any) => deal.dealname === clickData.dealname), [button.type]: true}
                  }
                  const response = await axios.post(url, payload);
                  const newState = response.data;
                  dispatch(updateViewedDeal(deal.name, newState));
              } catch (error: any) {
                  console.error('Error making request:', error.message);
                  return false;
              }
              if (isProd) await orbitInteraction(button.value)
          } else if (buttonId === "conflictPath") {
              console.log("Cancel button clicked");
          }
      });
    } else {
      if (isProd) WebApp.showAlert(button.message);

      console.log(`button ${button.type} clicked`)
      // please improve api redux interaction
      console.log("viewed deals")
      console.log(viewedDeals)
      const url = `https://eoh217vgfitqmyc.m.pipedream.net`;
      try {
        const payload = {
          userId: clickData.userId,
          deal: clickData.dealname,
          state: {...viewedDeals.find((deal: any) => deal.dealname === clickData.dealname), [button.type]: true}
        }
        const response = await axios.post(url, payload);
        const newState = response.data;
        console.log(`state before dispatch: ${JSON.stringify(newState)}`)
        dispatch(updateViewedDeal(deal.name, newState));
        console.log(`state after dispatch: ${JSON.stringify(viewedDeals)}`)
      } catch (error: any) {
        console.error('Error making request:', error.message);
        return false;
      }
      if (isProd) orbitInteraction(button.value)
    }
    
    // in case button is subscribe check for approval
  }

  const buttonData = [
    { id: 1, value: `CommunityRequestInfo_${deal.atid}`, emoji: '🙋‍♂️', message: 'Request received! You will receive the data shortly.', label: 'Request a deck', type: "info"},
    { id: 2, value: `CommunityCanHelp_${deal.atid}`, emoji: 'ℹ️', message: 'Thank for your offer to help! We have notified the deal captain.', label: 'Share info', type: "help"},
    { id: 3, value: `CommunityRequestCall_${deal.atid}`, emoji: '☎️', message: 'Request received! The deal captain has been notified.', label: 'Join a call', type: "call"},
    { id: 4, value: `CommunitySetAlert_${deal.atid}`, emoji: '🔔', message: "It would be unethical to share updates if you're involved with a competitor. Please confirm you're not conflicted. \n\nP.S. Want to connect with the founder? Ask us for an intro, even if you know them, unless you're already in touch.", label: 'Subscribe', type: "alert"}
  ];

  return (
    <div className='deal-page'>
      <img className='back-btn' onClick={handleClick} src={arrow}/>
      {deal ? (
        <>
          <div className='deal-header'>
              <p className='deal-name'>{deal.name}</p>
              {deal.website && (
                <div className='dealWebsite' onClick={(event) => handleLinkClick(event, deal)}>{deal.website}</div>
              )}
              {/* href={deal.website.startsWith('http') ? deal.website : `https://${deal.website}`} */}

              <div className='btn-actions'>
                {buttonData.map(button => {
                  const isClicked = viewedDeals.find((dealview: any) => dealview.dealname === deal.name)[button.type];
                  return (
                  <button
                    key={button.id}
                    onClick={(event) => handleActionClick(event, button, {"dealname": deal.name, "userId": user.id})}
                    className={isClicked ? 'clicked': ''}
                    disabled={isClicked}
                  >
                    <div className='btn-container'>
                      <p className='emoji'>{button.emoji}</p>
                      <p>{button.label}</p>
                    </div>
                    
                  </button>
                  );
                })
                }
              </div>
          </div>

          <div className='deal-info'>
            {/* {deal.dealSource} */}
            <div className='info-bg'>
              {deal.dealSource && (
                <p><span>Deal Source:</span> {deal.dealSource}</p>
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
                  <p><span>AI Summary</span></p>
                  <div className='scrollable-container'>{deal.aiSummary}</div>
                </div>
              )}

              {deal.like && (
                <div>
                  <p><span>Why we like it</span></p>
                  <div className='scrollable-container'>{deal.like}</div>
                </div>
                
              )}

              {deal.rejectionComment && (
                <div>
                  <p><span>Rejection Comment</span></p>
                  <div className='scrollable-container'>{deal.rejectionComment}</div>
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
