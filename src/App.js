import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LabTestForm from './components/LabTestForm';
import MasterCheckUp from './components/Mastercheckup';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LabTestForm />} />
          <Route path="/master-checkup" element={<MasterCheckUp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
