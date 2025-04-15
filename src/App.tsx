import { useEffect, useRef, useState } from 'react';
import s16vcLogo from './assets/s16vc.png';
import './App.css';
import { usePostHog } from 'posthog-js/react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { addViewedDeal, setViewedDeals } from './redux/action';
import { Avatar, Button, Cell, LargeTitle, List, Modal, Spinner, Caption } from '@telegram-apps/telegram-ui';
import { ModalHeader } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader';
import { ModalClose } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalClose/ModalClose';
import DealPage from './components/DealPage';
import { SectionHeader } from '@telegram-apps/telegram-ui/dist/components/Blocks/Section/components/SectionHeader/SectionHeader';
import { AvatarBadge } from '@telegram-apps/telegram-ui/dist/components/Blocks/Avatar/components/AvatarBadge/AvatarBadge';

// Access is restricted to orbit channel members only

interface DataDict {
  [key: string]: any[];
}

export interface DealData {
  atid: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  dealCaptain: string; // changed from `captain` and corrected type
  dealSource: string;    // new field
  founders: string[];
  sectors: string[];     // new field
  aiSummary: string;
  whyWeLikeIt: string;
  rejectionComment: string;
}

const botToken = '6644795511:AAF94mSfaDNi1otHwwBzt_LsnlV0xhJdIrw';
const chatId = '-1002142817225'; // or use chat ID if available

const checkUserMembership = async (userId: any) => {
  const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${chatId}&user_id=${userId}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    const isOrbitMember =
      data.ok &&
      (data.result.status === 'member' ||
        data.result.status === 'administrator' ||
        data.result.status === 'creator');

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

function App(props: any) {
  const dispatch = useDispatch();

  const [data, setData] = useState<DataDict>({});
  const [loading, setLoading] = useState(false);
  const viewedDeals = useSelector((state: any) => state.viewedDeals);
  const [auth, setAuth] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const modalTriggerRef = useRef<HTMLButtonElement>(null);
  let user = props.data.user;

  if (process.env.NODE_ENV === 'development') {
    user = {
      id: 5861198087,
      first_name: 'dev',
      last_name: '',
    };
  }

  const team = [
    'Isham Le Tenoux',
    'Szymon Brodziak',
    'Dina Gainullina',
    'Jane Milyaeva',
    'Oleg Bibergan',
    'Aleks',
    'Diana',
    'Juli',
    'Leo Batalov',
    'Bowei G',
  ];

  const userType = team.includes(`${user.first_name} ${user.last_name}`)
    ? 'team'
    : 'LP';
  const formattedDate = new Date()
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ')
    .toString();

  const posthog = usePostHog();
  // const navigate = useNavigate();

  const setAsViewed = async (userId: any, dealname: any) => {
    dispatch(addViewedDeal(dealname));
    const url = `https://eoh217vgfitqmyc.m.pipedream.net`;

    try {
      const payload = {
        userId: userId,
        deal: dealname,
        state: {
          alert: false,
          help: false,
          info: false,
          call: false,
        },
      };
      await axios.post(url, payload);
    } catch (error: any) {
      console.error('Error making request:', error.message);
      return false;
    }
  };

  async function handleClick(event: any, clickData: any, posthog: any) {
    event.preventDefault();
    posthog?.capture('deal_clicked', clickData);
    const deal = clickData.deal;
    // const subscribed = viewedDeals
    //   .filter((deal: any) => deal.subscribed)
    //   .map((deal: any) => deal.dealname.trim())
    //   .includes(deal.name.trim());
    const dealViewed = viewedDeals.find(
      (deal: any) => deal.dealname === clickData.dealname
    );
    if (deal) {
      if (user.id && !dealViewed) {
        setAsViewed(user.id, deal.name);
      }
      // navigate('/deal', { state: { deal, user, subscribed } });
    }

    setSelectedDeal(deal);
    setIsModalOpen(true);
  }

  async function handleOpen(openData: any, posthog: any) {
    posthog?.capture('app_open', openData);
  }

  useEffect(() => {
    posthog?.identify(`${user.first_name} ${user.last_name}`, {
      userType: userType,
    });

    async function checkUserOrbitMembership() {
      const authorized = await checkUserMembership(user.id);
      setAuth(authorized);
    }

    const fetchData = async () => {
      await handleOpen(
        {
          timestamp: formattedDate,
          user: user,
          event: 'open',
        },
        posthog
      );
      setLoading(true);
      try {
        const response = await axios.get(
          'https://eo1qd7ilkf93z2i.m.pipedream.net'
        );
        const preloadData = response.data;
        console.log(preloadData);
        setData(preloadData);

        const r = await axios.get(
          'https://eoxv3coove8ffsc.m.pipedream.net',
          {
            params: {
              userId: user.id,
            },
          }
        );

        if (Array.isArray(r.data)) {
          dispatch(setViewedDeals(r.data));
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (process.env.NODE_ENV === 'development') {
      setAuth(true);
    } else {
      checkUserOrbitMembership();
    }
    fetchData();
  }, []); // Empty dependency array ensures this effect runs only once

  // Trigger the modal programmatically when isModalOpen state changes
  useEffect(() => {
    if (isModalOpen && modalTriggerRef.current) {
      console.log('Modal should open');
      modalTriggerRef.current.click();
    }
  }, [isModalOpen, selectedDeal]);

  if (auth === null) {
    return <div className="loading-screen"></div>;
  }

  return (
    <>
      {auth ? (
        <div className="app">
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <img src={s16vcLogo} alt="Fund Logo" style={{ width: '82px', margin: "auto" }} />
            <LargeTitle
            weight="1"
            style={{ display: loading ? 'block' : 'none' }}
            >
            Welcome, {user.first_name}!
            </LargeTitle>
          </div>

          {loading ? (
            <div className="loading-animation">
              <Spinner size="l" />
            </div>
          ) : (
            <div>
              {Object.keys(data).map((stage) => (
                <div>
                  <SectionHeader>
                    {stage}
                  </SectionHeader>
                  {data[stage].length > 0 ? (
                    <List className='custom-list'>
                      {data[stage].map((deal: any, index: number) => (
                        <>
                          <Cell
                            className="custom-cell"
                            before={<><Avatar src="https://www.proedsolutions.com/wp-content/themes/micron/images/placeholders/placeholder_large_dark.jpg">
                              {viewedDeals
                              .filter(
                                (deal: any) => deal.alert
                              )
                              .map(
                                (deal: any) =>
                                  deal.dealname.trim()
                              )
                              .includes(deal.name.trim()) && <AvatarBadge
                            type="number"
                            mode='secondary'
                          >
                            🔔
                          </AvatarBadge>
                        }
  </Avatar></>}
                            after={
                              <div className="sector-tags">
                                {deal.sectors.map((sector: any) => (
                                  <div
                                    className="sector-tag"
                                    key={sector}
                                  >
                                    <Caption>
                                      {sector.length > 10
                                      ? `${sector.slice(0, 10)}...`
                                      : sector}
                                    </Caption>
                                  </div>
                                ))}
                              </div>
                            }
                            subtitle="AI-powered workflow automation platform"
                            onClick={(event: any) =>
                              handleClick(
                                event,
                                {
                                  deal: deal,
                                  user: user,
                                  timestamp: formattedDate,
                                  event: 'click',
                                  userType: userType,
                                },
                                posthog
                              )
                            }
                          >
                            {deal.name}
                          </Cell>
                          {index < data[stage].length - 1 && (
                            <hr className="solid"></hr>
                          )}
                          </>
                      ))}
                    </List>
                  ) : (
                    
                    <Caption
                    level="1"
                    weight="3"
                    style={{ color: 'white', margin: '0 16px', opacity: 0.5 }}
                  >
                    No deals available
                  </Caption>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Modal with mandatory trigger prop that uses the hidden button */}
          {selectedDeal && (
          <Modal
            header={
            <ModalHeader
              after={
              <ModalClose>
                <i className="fas fa-times"></i>
              </ModalClose>
              }
            >
              Only iOS header
            </ModalHeader>
            }
            trigger={
            <Button ref={modalTriggerRef} style={{ display: 'none' }} size="m">
              Open modal
            </Button>
            }
            className="modal-container"
          >
            <DealPage dealData={selectedDeal} />
            {/* <DealPage
  dealData={{
    atid: '12345',
    name: 'TechFlow',
    description: 'AI-powered workflow automation platform.',
    logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAllBMVEUMZMX///8AYcQAWcFDf8nL3PIAWrzQ3vMAYcI0eclZjtAucslAgsz6/v3x9/sgbclOhM8AX8QAYsAAX70AV70AWMLm7vgAXb4sdsw5fsoRbsVmltK6z+iUt+AMZcGDrN3c6fNvnddiltWqwuPA0+r0+vyOrt+lweR9pduuyueUst9Lh81pldd1mtYdbcunxOXO4u7Z4fGRyVlRAAAEKUlEQVR4nO3ce1faMBzG8SblEpSCiUUuQrkMhsCc+v7f3Ko4KjW/yLY0WXOez9mf4Ml3vSW1NYoAAAAAAAAAAAAAAAAAAAAAAAAAAADgYiriIsqU72FURcapGnXHk5aMue+xVCCT6n56x960Z2OpMt8jsozz+Xve0Xqc+h6SXbKzYOeSfex7UBap+J591lThHI3awPxw5KGcVFUj0RayaRrI6UaUj8GTpfA9NivknApkvTC2YdwjC9lc+h6dBWpFB7JFCIXx1FDIRr6HZ0Fq2EkZewjgXNMnLhVH34a+x/fPeMdYOK3/gchvTIFsXf/ZKR+bC+u/DcW1cS/d1f84jFobU+H3ANYXadNU2PU9PAvkd0Ngz/forMgMhU/1P5Xm4h0ZmHQCOAzz68WEPNdsg9iE+ZH4QATeBTApPYqf9PvoKIh99E2qOxQ3jVvf47JHDT5fMl5GAQW+3tNvnF/4N3shwrhJc8Ljw/Q0Q13MJ4GcRc8IORjP99vZfpWlQe2gH3EZx7Gs/4IJAADqQ3DJX/+FM38vqHyKlA5Hhx+Pj49X43468P34CheEiz9Z+pTMlrvFaQ6YbNrblRpKf6vNbHRNKX2yT/kwSVd5XluzGGs//Ew9NfIGS/RYs3X2yUGzp7dpnMYu+zPql1mbp46f+XxeSCkVxrpt8+bmWJgJOTPeYP7m5QkWi4Wye0d94t3m3sNmtFao5OyLvle7zPnRaKlQCb6+IDBfXvddJ1oq5BH5WE7JXd/xwWilUKnJpYGM9a7dPk5mpfCWP18cmO+okdOtaKVwYHxm5ZP1wOWNPBuFneUfBTK2dHkzyEbhwfirco3NxOF+aqPw8rPMbzuHV34bhX+h4e6q6KnQ4ZM6ngrZyNlG9FXo7hfMvgp7zt7o8FXIDq52U2+FznbTKgovmgAsalq4mB0mQqjJYfvler98o6sWhevuYPh2C5jz4WD1ReMPR4soi4W91dmtXy7MK469o7mpvcLn8nRaSWPi9PzH/++FCXvW3LuXpoXxi6MllK1tqHtGLBMd0zccLYNtFR60W8T0wkqv7yTQVuGTfpfLuvRXkms3sxo7hQlx/yy7NayOO3Uq3MXExY148PFY6OZyYafwihqsXNJfGteoMCGXQoYfzxo1KmxSO2kkJvTLcXUq3BreraFnp3UqNLwT3aJPpnUqPNBjTV+CKDScFVv0t+pUaLiytegXq1BoCQoLKNRDYfVQWEChHgqrh8ICCvVQWD0UFlCoh8LqobCAQj0UVg+FBRTqobB6KCygUA+F1UNhAYV6KKweCgso1ENh9VBYQKEeCquHwkKAhe1SIf2UoaFwSP+/dB29FtTvUsbnH+Q3VxTDmxOq+zffskqJiOtFpZda+OV/M6uQKepLof0NWAAAAAAAAAAAAAAAAAAAAAAAAAAAgAr8Aj5RWY0PDbn2AAAAAElFTkSuQmCC',
    website: 'https://techflow.com',
    dealCaptain: 'John Doe',
    dealSource: 'Internal Research',
    sectors: ['AI', 'Automation'],
    founders: ['Alice Smith', 'Bob Johnson'],
    aiSummary: 'TechFlow leverages AI to optimize workflows and increase productivity.',
    whyWeLikeIt: 'Innovative use of AI and a strong founding team.',
  }}
/> */}
            {/* <h1>Hello this is a test</h1> */}
          </Modal>
          )}
        </div>
      ) : (
        <div className="denied-section">
          <div className="denied-message">
            <p>Access denied</p>
            <span>You are not an orbit member</span>
          </div>
        </div>
      )}
    </>
  );
}

export default App;