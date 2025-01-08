export const ADD_VIEWED_DEAL = 'ADD_VIEWED_DEAL';
export const UPDATE_VIEWED_DEAL = 'UPDATE_VIEWED_DEAL';
export const SET_VIEWED_DEALS = 'SET_VIEWED_DEALS';

export const addViewedDeal = (dealname: string) => ({
    type: ADD_VIEWED_DEAL,
    payload: { dealname, alert: false, call: false, help: false, info: false },
});

export const updateViewedDeal = (dealname: string, type: string, value: boolean) => ({
    type: UPDATE_VIEWED_DEAL,
    payload: {dealname, type, value},
});

export const setViewedDeals = (deals: any[]) => ({
    type: SET_VIEWED_DEALS,
    payload: deals,
});