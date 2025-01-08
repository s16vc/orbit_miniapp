import { ADD_VIEWED_DEAL, SET_VIEWED_DEALS, UPDATE_VIEWED_DEAL } from "./action";

const initialState = {
    viewedDeals: [],
};

const viewedDealsReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case ADD_VIEWED_DEAL:
            return {
                ...state,
                viewedDeals: [...state.viewedDeals, action.payload],
            };
        case UPDATE_VIEWED_DEAL:
            return {
                ...state,
                viewedDeals: state.viewedDeals.map((deal: any) =>
                    deal.dealname === action.payload.dealname ? { ...deal, [action.payload.type]: action.payload.value } : deal
                ),
            };
        case SET_VIEWED_DEALS: // Handle the new action
            return {
                ...state,
                viewedDeals: action.payload, // Set the full array
            };
        default:
            return state;
    }
};

export default viewedDealsReducer;