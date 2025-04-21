// DealPage.jsx
// import { usePostHog } from 'posthog-js/react';
import { Badge, Button, Caption, Card, InlineButtons, Text, Title } from '@telegram-apps/telegram-ui';
import '../App.css';
import { CardChip } from '@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardChip/CardChip';
import { CardCell } from '@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardCell/CardCell';
import { InlineButtonsItem } from '@telegram-apps/telegram-ui/dist/components/Blocks/InlineButtons/components/InlineButtonsItem/InlineButtonsItem';
import WebApp from '@twa-dev/sdk'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { updateViewedDeal } from '../redux/action';
import { DealData } from '../App'; // Import the DealData interface

interface DealPageProps {
  dealData: DealData; // Use the DealData interface
}

function DealPage({ dealData }: DealPageProps) {
  // const posthog = usePostHog();
  const dispatch = useDispatch();
  const isProd = (process.env.NODE_ENV !== 'development')
  const user = WebApp.initDataUnsafe?.user;
  const viewedDeals = useSelector((state: any) => state.viewedDeals);

  console.log(WebApp.initDataUnsafe)

  async function unsubscribe(event: any, deal: DealData) {
    console.log(event)
    console.log(user)
    const url = `https://eoh217vgfitqmyc.m.pipedream.net`;
    try {
      WebApp.showAlert("You were unsubscribed from this deal. You will no longer receive updates.");
      const payload = {
      userId: user?.id,
      deal: deal.name,
      state: {...viewedDeals.find((deal: any) => deal.dealname === dealData.name), "alert": false}
      };
      const response = await axios.post(url, payload);
      const newState = response.data;
      dispatch(updateViewedDeal(dealData.name, newState));

      // Additional request to remove the user from the subscribe list in the CRM
      const crmPayload = {
        atid: dealData.atid,
        username: user?.username
      };
      await axios.post('https://eocrmltsoqtk0l4.m.pipedream.net', crmPayload);
    } catch (error: any) {
      console.error('Error making request:', error.message);
      return false;
    }

  }


  async function orbitInteraction(buttonValue: string) {
    try {
      const payload = {
        "callback_query": {
            "id": "123",
            "app_event": true,
            "from": {
                "username": user?.username,
                "id": user?.id
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
                  dispatch(updateViewedDeal(dealData.name, newState));
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
      // console.log(viewedDeals)
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
        dispatch(updateViewedDeal(dealData.name, newState));
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
    { id: 1, value: `CommunityRequestInfo_${dealData.atid}`, emoji: '🙋‍♂️', message: 'Request received! You will receive the data shortly.', label: 'Request a deck', type: "info"},
    { id: 2, value: `CommunityCanHelp_${dealData.atid}`, emoji: 'ℹ️', message: 'Thank for your offer to help! We have notified the deal captain.', label: 'Share info', type: "help"},
    { id: 3, value: `CommunityRequestCall_${dealData.atid}`, emoji: '☎️', message: 'Request received! The deal captain has been notified.', label: 'Join a call', type: "call"},
    { id: 4, value: `CommunitySetAlert_${dealData.atid}`, emoji: '🔔', message: "It would be unethical to share updates if you're involved with a competitor. Please confirm you're not conflicted. \n\nP.S. Want to connect with the founder? Ask us for an intro, even if you know them, unless you're already in touch.", label: 'Subscribe', type: "alert"}
  ];

  return (
    <div className="dealPage">
      <Card className="deal-card">
        {/* Chip to highlight the deal */}
        <CardChip readOnly className="deal-chip">
        <Button
            before={<Text>🔕</Text>}
            mode="plain"
            size="s"
            onClick={(event) => unsubscribe(event, dealData)}
          >
            Unsubscribe
        </Button>
        </CardChip>

        {/* Deal logo */}
        <div className='link-deal'>
        <img
          src={dealData.logo || 'https://www.proedsolutions.com/wp-content/themes/micron/images/placeholders/placeholder_large_dark.jpg'}
          className="deal-logo"
        />
        <Title
          level="1"
          weight="2"
        >
          {dealData.name}
        </Title>
          <a href={dealData.website} className='website-deal'><Caption
              level="1"
              weight="3"
            >
              {dealData.website}
            </Caption>
          </a>
        </div>
        
        <div className='card-section'>
        <InlineButtons mode="bezeled">
          {buttonData.map(button => {
            // const isClicked = viewedDeals.find((dealview: any) => dealview.dealname === dealData.name)[button.type];
            const isClicked = false;
            return (
            <InlineButtonsItem
              key={button.id}
              text={button.label}
              onClick={(event) => handleActionClick(event, button, {"dealname": dealData.name, "userId": user?.id})}
              className={isClicked ? 'clicked': ''}
              disabled={isClicked}
            >
              <div className='btn-container'>
                <Text>{button.emoji}</Text>
              </div>
              
            </InlineButtonsItem>
            );
          })
          }
        </InlineButtons>
        </div>
        
        <div className='card-section'>
          {/* Deal name and captain */}
          <CardCell readOnly subhead='Deal captain' className="deal-name">
          <Text>{dealData.dealCaptain}</Text>
          </CardCell>

          {/* <CardCell readOnly subhead='Description'>
            <Text className="deal-section-content">{dealData.description}</Text>
          </CardCell> */}

          {/* Founders */}
          <CardCell readOnly subhead='Founders'>
            <Text className="deal-section-content">
              {dealData.founders.join(', ')}
            </Text>
          </CardCell>
        </div>

        <CardCell readOnly subhead='Sectors' className="card-section">
            {dealData.sectors.map((sector: any) => (
              <Badge type='number' key={sector}>
                <Caption>
                  {sector}
                </Caption>
              </Badge>
            ))}
        </CardCell>
        

        {/* AI Summary */}
        <CardCell readOnly subhead='AI Summary' className='card-section'>
            <Text className="deal-section-content full-text">
            {dealData.aiSummary}
          </Text>
        </CardCell>

        { dealData.whyWeLikeIt && dealData.whyWeLikeIt.length > 0 &&
        <CardCell readOnly subhead='Why we like it' className='card-section'>
          <Text className="deal-section-content full-text">{dealData.whyWeLikeIt}</Text>
        </CardCell>
        }

{ dealData.rejectionComment && dealData.rejectionComment.length > 0 &&
        <CardCell readOnly subhead='Rejection comment' className='card-section'>
          <Text className="deal-section-content full-text">{dealData.rejectionComment}</Text>
        </CardCell>
        }

      </Card>
    </div>
  );
}

export default DealPage;

