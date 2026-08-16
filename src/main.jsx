import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { App } from './App';
import { SchedulePage } from './pages/SchedulePage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      {/* 공유 캘린더: 사이트 UI 없이 단독으로 렌더 (노션 임베드용) */}
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/*" element={<App />} />
    </Routes>
  </BrowserRouter>
);
