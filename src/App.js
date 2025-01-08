import './App.css';
import React,{ useEffect,useState} from 'react';
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
import Batchdetails from './components/Batchdetails';
import Labentry from './components/Labentry';
import Mrs from './components/Mrs';
import Processroute from './components/Processroute';
import Unauthorized from './components/Unauthorized';
import Role from './components/Role';

function App() {

  const [userRole, setUserRole] = useState("");
  useEffect(() => {
    document.title = "Sri Shiva Designs"
    const user = localStorage.getItem("user");   
    console.log(user); 
        user && setUserRole(JSON.parse(user).role || "guest");
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
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/profile" element={              
<Profile />             
              
              } />
            <Route path="/planning" element={
              <Role allowedRoles={["admin"]} userRole={userRole}>
              <Planning />
               </Role>              
              } />
            <Route path="/profile/:planid" element={
              <Role allowedRoles={["admin"]} userRole={userRole}>
              <Edit />
              </Role>  
              } />
            <Route path="/machine" element={
              <Role allowedRoles={["admin"]} userRole={userRole}>
              <Machine />
              </Role>
              } />
            <Route path="/customer" element={
              <Role allowedRoles={["admin"]} userRole={userRole}>
              <Customer />
              </Role>
              } />
            <Route path="/fabric" element={
              <Role allowedRoles={["admin"]} userRole={userRole}>
              <Fabric />
              </Role>
              } />
            <Route path="/construction" element={
              <Role allowedRoles={["admin"]} userRole={userRole}>
              <Construction />
              </Role>
              } />
            <Route path="/process" element={
              <Role allowedRoles={["admin"]} userRole={userRole}>
              <Process />
              </Role>
              } />
            <Route path="/width" element={
              <Role allowedRoles={["admin"]} userRole={userRole}>
              <Width />
              </Role>
              } />
            <Route path="/finishing" element={
              <Role allowedRoles={["admin"]} userRole={userRole}>
              <Finishing />
              </Role>
              } />
            <Route path="/greyentry" element={
              <Role allowedRoles={["admin","store"]} userRole={userRole}>
              <Greyentry />
              </Role>
              } />
            <Route path="/batch" element={
              <Role allowedRoles={["admin","store"]} userRole={userRole}>
              <Batch />
              </Role>
              } />
            <Route path="/batch/:batchid" element={
              <Role allowedRoles={["admin","production"]} userRole={userRole}>
              <Batchdetails />
              </Role>
              } />
            <Route path="/labentry" element={
              <Role allowedRoles={["admin","production"]} userRole={userRole}>
              <Labentry />
              </Role>
              } />
            <Route path="/mrs/:batchid" element={
              <Role allowedRoles={["admin","production"]} userRole={userRole}>
              <Mrs />
              </Role>
              } />
            <Route path="/process/:pid" element={
              <Role allowedRoles={["admin","production"]} userRole={userRole}>
              <Processroute />
              </Role>
              } />
  
          </Routes>
    </Router>
  </AuthProvider>
    
  );
}

export default App;
