import './App.css';
import React,{ useEffect} from 'react';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';

import Home from './components/Home';
import Profile from './components/Profile';
import Login from './components/Login';
import Planning from './components/Planning';



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
           
          </Routes>
    </Router>
  </AuthProvider>
    
  );
}

export default App;
