import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

// ✅ 1) Monkey Patch를 imports 바로 뒤에 배치
const resizeObserverError = /ResizeObserver loop completed/;
const originalError = console.error;

console.error = (...args) => {
  if (resizeObserverError.test(args[0])) {
    // 해당 에러 메시지를 무시
    return;
  }
  // 그 외 에러는 원래대로 표시
  originalError(...args);
};

// ✅ 2) 이후에 ReactDOM.createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// ✅ 3) reportWebVitals (필요시)
reportWebVitals();
