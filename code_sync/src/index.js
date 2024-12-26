import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import rootReducer from './Reducers';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { loadStateFromLocalStorage, saveStateToLocalStorage } from './localStorage';


const root = ReactDOM.createRoot(document.getElementById('root'));

const store = createStore(
  rootReducer,
  loadStateFromLocalStorage()
);

loadStateFromLocalStorage(store.dispatch);

store.subscribe(() => {
  console.log("Redux 상태 변경 감지:", store.getState()); // 상태 변경 로그 추가
  saveStateToLocalStorage(store.getState());
});

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
