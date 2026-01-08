import React, { 
  useState,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import {
  Calendar,
  Views,
  DateLocalizer,
  momentLocalizer,
  View,
  Components,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { EventDetailModal } from "./EventDetailModal";
import { EventModal, EventFormData } from "./EventModal";

// Define TypeScript interfaces
interface CalendarEvent {
  id: string;
  title: string;
  price: string;
  start: Date;
  end: Date;
  start_time:any,
  end_time:any
  allDay?: boolean;
}

interface SelectableProps {
  localizer?: DateLocalizer;
  email:string,
  id:string,
  data?: CalendarEvent[];
}

interface SlotInfo {
  start: Date;
  end: Date;
  slots: Date[];
  action: "select" | "click" | "doubleClick";
}

// Set up moment localizer
const localizer = momentLocalizer(moment);

// Custom Event Components
interface CustomEventProps {
  event: CalendarEvent;
  view?: View;
}

const CustomEvent: React.FC<CustomEventProps> = ({ event, view }) => {
  const startTime = moment(event.start).format("h:mm A");
  const endTime = moment(event.end).format("h:mm A");
  const dateStr = moment(event.start).format("MMM D, YYYY");

  if (view === Views.MONTH) {
    return (
      <div className={` text-white p-1 rounded text-xs overflow-hidden`}>
        <div className="flex items-center gap-1 mb-0.5">
          <div className="font-bold truncate">{event.title}</div>
        </div>
      </div>
    );
  }

  if (view === Views.AGENDA) {
    return (
      <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500 mb-2">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-bold text-gray-800">{event.title}</div>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-700">
          <div className="flex items-center gap-1 mt-1">
            <span>🕐</span> {dateStr} • {startTime} - {endTime}
          </div>
          {event.price && (
            <div className="mt-2 text-xs text-gray-600">{event.price}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={` text-white p-2 rounded-md h-full overflow-hidden`}>
      <div className="font-bold text-sm mb-1 truncate">{event.title}</div>
      <div className="text-xs opacity-90 mb-0.5 flex items-center gap-1">
        <span className="text-[10px]">🕐</span> {startTime} - {endTime}
      </div>
    </div>
  );
};


// Main component
export default function Selectable({
  localizer: propLocalizer,
  email,
  id,
  data
}: SelectableProps) {
const transformEvents = (eventsData: any[]): CalendarEvent[] => {
  return eventsData.map(event => {
    // Use start_date and end_date if available
    if (event.start_date && event.end_date) {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      
      // Combine date from start_date/end_date with time from start_time/end_time
      const startTime = new Date(event.start_date);
      const endTime = new Date(event.end_date);
      
      startDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
      endDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
      
      return {
        id: event.id,
        title: event.subject || 'Available Slot',
        price: event.price?.toString() || '0',
        start: startDate,
        end: endDate,
        start_time: event.start_time,
        end_time: event.end_time,
        allDay: false,
        originalData: event
      };
    }
    
    // Fallback: If no start_date/end_date, use day_of_week logic (for recurring events)
    const today = new Date();
    const eventDay = new Date(today);
    
    const dayOfWeek = event.day_of_week || 0;
    const currentDay = today.getDay();
    const daysToAdd = (dayOfWeek - currentDay + 7) % 7;
    eventDay.setDate(today.getDate() + daysToAdd);
    
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    
    const startDate = new Date(eventDay);
    startDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
    
    const endDate = new Date(eventDay);
    endDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
    
    // If end is before start (crosses midnight), add one day to end
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    return {
      id: event.id,
      title: event.subject || 'Available Slot',
      price: event.price?.toString() || '0',
      start: startDate,
      end: endDate,
      start_time: event.start_time,
      end_time: event.end_time,
      allDay: false,
      originalData: event
    };
  });
};

  const [myEvents, setEvents] = useState<CalendarEvent[]>(transformEvents(data || []));

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  const [currentView, setCurrentView] = useState<View>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const handleSelectSlot = useCallback(({ start, end }: SlotInfo) => {
    setSelectedSlot({ start, end });
    setModalOpen(true);
  }, []);

  // const handleDeleteEvent = useCallback((eventId: string) => {
  //   setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
  // }, []);

  const handleCreateEvent = useCallback(async(formData: EventFormData) => {
    console.log('formData',formData)  
    const startDateTime = moment(
      `${formData.date} ${formData.startTime}`
    ).toDate();
    const endDateTime = moment(`${formData.endDate} ${formData.endTime}`).toDate();

    const newEvent = {
      id: Date.now() + "",
      title: formData.subject,        
      subject_id: formData.subject_id,
      subject: formData.subject,     
      price: formData.price,
      start: startDateTime,
      end: endDateTime,
      start_time: formData.startTime,
      end_time: formData.endTime,
      date: formData.date,
      endDate: formData.endDate,
      timezone: formData.timezone,
    };

    setEvents((prev) => [...prev, newEvent]);

      try {
      // setSaving(true);
      // const slots = buildIntervals();
      const res = await fetch('/api/tutor-availability/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newEvent, id }),
      });
      if (!res.ok) {
        console.error('Error saving availability', res);
      }
      // setMessage('Availability saved');
      // setTimeout(() => setMessage(''), 2500);
    } catch (e: any) {
      // setMessage('Error saving availability');
      // setTimeout(() => setMessage(''), 3500);
    } finally {
      // setSaving(false);
    }
    setSelectedSlot(null);
    setModalOpen(false);
  }, []);

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

const handleEventSelect = (event: any) => {
  setSelectedEvent(event);
  setIsDetailModalOpen(true);
};

const handleEventUpdate = async(eventId: string, updatedData: any) => {
  // console.log(updatedData);
  //  try {
  //     const res = await fetch('/api/tutor-availability/update', {
  //       method: 'put',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ id: eventId,updatedData }),
  //     });
  //     if (!res.ok) {
  //       console.error('Error saving availability', res);
  //     }
  //   } catch (e: any) {
  //   } finally {
  //   }
  setEvents(prev => prev.map(e => e.id === eventId ? updatedData : e));
};

const handleEventDelete = (eventId: string) => {
  // Remove event from state
  console.log('eventId',eventId)
  setEvents(prev => prev.filter(e => e.id !== eventId));
};

  // Custom components for different views
  const components: Components<CalendarEvent> = useMemo(
    () => ({
      event: (props) => <CustomEvent event={props.event} view={currentView} />,
    }),
    [currentView]
  );

  // Custom event style for background color
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const backgroundColor = "green";

    return {
      style: {
        backgroundColor,
        opacity: 0.95,
        color: "white",
        border: "none",
        display: "block",
        padding: "2px",
        overflow: "hidden",
      },
    };
  }, []);

  const { scrollToTime } = useMemo(
    () => ({
      scrollToTime: new Date(),
    }),
    []
  );
  const handleAddLectureClick = useCallback(() => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    setSelectedSlot({ start: now, end: oneHourLater });
    setModalOpen(true);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Academic Calendar
            </h1>
            <p className="text-gray-600 mb-4">
              Schedule and manage your lectures
            </p>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-sm">Lecture</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-gray-700">
                Total Events:{" "}
                <span className="font-bold">{myEvents.length}</span>
              </p>
              <button
                onClick={handleAddLectureClick}
                className="px-5 py-2.5 bg-[#cf3fad] text-white rounded-full hover:bg-[#cf3fad]/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                Add Lecture
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-[700px]">
              <Calendar
                date={currentDate}
                view={currentView}
                onView={handleViewChange}
                onNavigate={handleNavigate}
                events={myEvents}
                localizer={propLocalizer || localizer}
                onSelectEvent={handleEventSelect}
                selectable={false}
                scrollToTime={scrollToTime}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                components={components}
                eventPropGetter={eventStyleGetter}
                popup
                formats={{
                  timeGutterFormat: "h:mm A",
                  eventTimeRangeFormat: ({ start, end }) =>
                    `${moment(start).format("h:mm A")} - ${moment(end).format(
                      "h:mm A"
                    )}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSlot(null);
        }}
        onSubmit={handleCreateEvent}
        defaultStart={selectedSlot?.start || new Date()}
        defaultEnd={selectedSlot?.end || new Date(Date.now() + 60 * 60 * 1000)}
      />

      {/* Event Detail Modal */}
     <EventDetailModal
  isOpen={isDetailModalOpen}
  onClose={() => setIsDetailModalOpen(false)}
  event={selectedEvent}
  onDelete={handleEventDelete}
  onUpdate={handleEventUpdate}
/>
    </>
  );
}

Selectable.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
};
