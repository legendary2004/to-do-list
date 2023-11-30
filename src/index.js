import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import UserContextProvider from './client-side/contexts/userContext';
import ListContextProvider from './client-side/contexts/listContext';
import ListTaskContextProvider from './client-side/contexts/listTasksContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UserContextProvider>
    <ListContextProvider>
      <ListTaskContextProvider>
        <App />
      </ListTaskContextProvider>
    </ListContextProvider> 
  </UserContextProvider> 
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
