import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './PlanningCalendar.css'; // Add a CSS import for custom mobile styles

const PlanningCalendar = ({ events }) => {
  // Responsive options for mobile
  const isMobile = window.innerWidth <= 600;
  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={isMobile ? 'timeGridDay' : 'dayGridMonth'}
        headerToolbar={isMobile ? {
          left: 'prev,next',
          center: 'title',
          right: 'dayGridMonth,timeGridDay'
        } : {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        views={{
          dayGridMonth: { buttonText: 'Month' },
          timeGridWeek: { buttonText: 'Week' },
          timeGridDay: { buttonText: 'Day' }
        }}
        events={events}
        height={isMobile ? 'auto' : 'auto'}
        contentHeight={isMobile ? 'auto' : undefined}
        aspectRatio={isMobile ? 0.7 : 1.35}
      />
    </div>
  );
};

export default PlanningCalendar;
