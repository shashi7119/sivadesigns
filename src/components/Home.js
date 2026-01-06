import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import PlanningCalendar from './PlanningCalendar';
import { fetchCalendarEvents } from '../services/calendarApi';
import { useAuth } from '../context/AuthContext';

function Home() { 
   const { user , isAuthenticated } = useAuth();
  const [calendarEvents, setCalendarEvents] = useState([]);

 useEffect(() => {
     let intervalId;
     const fetchEvents = () => {
       fetchCalendarEvents().then(setCalendarEvents).catch(console.error);
     };
     fetchEvents(); // initial fetch
     intervalId = setInterval(fetchEvents, 40000); // every 40 seconds
     return () => clearInterval(intervalId);
   }, []);

    if (!isAuthenticated) {
        return (
    <div className="main-content" >

          <Container fluid className="relative">
      
        <h1 className="font-bold mb-2">Welcome to Siva Designs</h1>      
      
      {/* Add other dashboard widgets/components below */}
    </Container>
    </div>
        );
     } else {

  return (
    <div className="main-content" >
    <Container fluid className="relative">
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Batch Calendar View</h2>
        <p className="text-gray-600">Welcome, {user.user}!</p>
        <PlanningCalendar events={calendarEvents} />
      </div>
      {/* Add other dashboard widgets/components below */}
    </Container>
    </div>
  );
}
}


export default Home;