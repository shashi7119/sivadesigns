import './App.css';
import React,{ useEffect} from 'react';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';

import Home from './components/Home';
import Profile from './components/Profile';
import Login from './components/Login';
import Planning from './components/Planning';
import Machine from './components/Machine';
import Customer from './components/Customer';
import Fabric from './components/Fabric';
import Construction from './components/Construction';
import Process from './components/Process';
import Width from './components/Width';
import Finishing from './components/Finishing';
import Edit from './components/Edit';
import Greyentry from './components/Greyentry';
import Batch from './components/Batch';

function App() {

  useEffect(() => {
    document.title = "Siva Designs"
 }, []);

  return (
   
    <AuthProvider>
      <Router>
    <div className="App">
      
      <Navigation />
      
    </div>
    <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/profile/:planid" element={<Edit />} />
            <Route path="/machine" element={<Machine />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/fabric" element={<Fabric />} />
            <Route path="/construction" element={<Construction />} />
            <Route path="/process" element={<Process />} />
            <Route path="/width" element={<Width />} />
            <Route path="/finishing" element={<Finishing />} />
            <Route path="/greyentry" element={<Greyentry />} />
            <Route path="/batch" element={<Batch />} />
  
          </Routes>
    </Router>
  </AuthProvider>
    
  );
}

export default App;
