import { createStore } from 'redux';
import viewedDealsReducer from './reducers';

const store = createStore(viewedDealsReducer);

export default store;