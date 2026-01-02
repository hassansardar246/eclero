import React, {
  Fragment,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
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
import { DateRange } from "react-date-range";
import { format } from 'date-fns';
import { EventDetailModal } from "./EventDetailModal";
import { X } from "lucide-react";

// Define TypeScript interfaces
interface CalendarEvent {
  id: number;
  title: string;
  price: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}

interface SelectableProps {
  localizer?: DateLocalizer;
}

interface SlotInfo {
  start: Date;
  end: Date;
  slots: Date[];
  action: "select" | "click" | "doubleClick";
}

interface EventFormData {
  title: string;
  price: string;
  startTime: string;
  endTime: string;
  date: string;
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
  
  const eventTypeColors: any = {
    lecture: "bg-blue-600",
    lab: "bg-green-600",
    tutorial: "bg-yellow-600",
    seminar: "bg-red-600",
  };

  const eventTypeDarkColors = {
    lecture: "bg-blue-800",
    lab: "bg-green-800",
    tutorial: "bg-yellow-800",
    seminar: "bg-red-800",
  };

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

// Modal Component
interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => void;
  defaultStart: Date;
  defaultEnd: Date;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultStart,
  defaultEnd,
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    price: "",
    startTime: moment(defaultStart).format("HH:mm"),
    endTime: moment(defaultEnd).format("HH:mm"),
    date: moment(defaultStart).format("YYYY-MM-DD"),
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: defaultStart,
      endDate: defaultEnd,
      key: "selection",
    },
  ]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      startTime: moment(defaultStart).format("HH:mm"),
      endTime: moment(defaultEnd).format("HH:mm"),
      date: moment(defaultStart).format("YYYY-MM-DD"),
    }));
    setDateRange([{
      startDate: defaultStart,
      endDate: defaultEnd,
      key: "selection",
    }]);
  }, [defaultStart, defaultEnd]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTime = moment(`${formData.date} ${formData.startTime}`).toDate();
    const endDateTime = moment(`${formData.date} ${formData.endTime}`).toDate();

    if (endDateTime <= startDateTime) {
      alert("End time must be after start time");
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateRangeChange = (item: any) => {
    console.log("Selected date range:", item.selection);
    setDateRange([item.selection]);
    const newDate = moment(item.selection.startDate).format("YYYY-MM-DD");
    setFormData(prev => ({
      ...prev,
      date: newDate,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex relative m-2.5 text-white h-24 rounded-md bg-slate-800 justify-between items-center border-b px-6 py-4">
          <h3 className="text-xl font-semibold text-white">Create New Lecture/Event</h3>
       <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-200 hover:text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6" ref={calendarRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date:</label>
            <div className="relative">
              <div
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white flex justify-between items-center hover:border-gray-400 transition-colors"
              >
                <span>
                  {dateRange[0]?.startDate ? format(dateRange[0].startDate, 'MM/dd/yyyy') : 'Start Date'} 
                  {' - '}
                  {dateRange[0]?.endDate ? format(dateRange[0].endDate, 'MM/dd/yyyy') : 'End Date'}
                </span>
                <span className="text-gray-500">📅</span>
              </div>
              
              {isCalendarOpen && (
                <div className="absolute top-full left-0 mt-1 z-10 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <DateRange
                    editableDateInputs={false}
                    onChange={handleDateRangeChange}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="english, maths"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
               <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Price *
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            {/* <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-500 text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button> */}
            <button type="button"
              onClick={onClose} data-dialog-close="true" className="rounded-full border border-transparent px-5 py-2.5 text-center text-sm transition-all text-slate-600 hover:bg-slate-200 focus:bg-slate-100 active:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" >
        Cancel
      </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#cf3fad] text-white rounded-full hover:bg-[#cf3fad]/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main component
export default function Selectable({ localizer: propLocalizer }: SelectableProps) {
  const [myEvents, setEvents] = useState<CalendarEvent[]>([
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
   const [detailModalOpen, setDetailModalOpen] = useState(false);
  const handleSelectSlot = useCallback(({ start, end }: SlotInfo) => {
    setSelectedSlot({ start, end });
    setModalOpen(true);
  }, []);

    const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setDetailModalOpen(true);
  }, []);

  const handleDeleteEvent = useCallback((eventId: number) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
  }, []);

  const handleCreateEvent = useCallback((formData: EventFormData) => {
    const startDateTime = moment(`${formData.date} ${formData.startTime}`).toDate();
    const endDateTime = moment(`${formData.date} ${formData.endTime}`).toDate();

    const newEvent: CalendarEvent = {
      id: Date.now(),
      title: formData.title,
      price: formData.price,
      start: startDateTime,
      end: endDateTime,
    };

    setEvents((prev) => [...prev, newEvent]);
    setSelectedSlot(null);
    setModalOpen(false);
  }, []);

//   const handleSelectEvent = useCallback((event: CalendarEvent) => {
//     const eventDetails = `
// 📚 ${event.title}
// ${event.subjectCode ? `📋 Subject: ${event.subjectCode}\n` : ''}🎓 Type: ${event.lectureType.toUpperCase()}
// 👨‍🏫 Instructor: ${event.instructor}
// 📍 Location: ${event.location}
// 🕐 Time: ${moment(event.start).format('h:mm A')} - ${moment(event.end).format('h:mm A')}
// 📅 Date: ${moment(event.start).format('MMMM Do, YYYY')}
// ${event.description ? `📝 Description: ${event.description}\n` : ''}
//     `.trim();

//     const response = window.confirm(
//       `${eventDetails}\n\nWould you like to delete this event?`
//     );

//     if (response) {
//       setEvents((prev) => prev.filter((ev) => ev.id !== event.id));
//     }
//   }, []);

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Custom components for different views
  const components: Components<CalendarEvent> = useMemo(() => ({
    event: (props) => (
      <CustomEvent event={props.event} view={currentView} />
    ),
  }), [currentView]);

  // Custom event style for background color
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const backgroundColor = 'green';

    return {
      style: {
        backgroundColor,
        opacity: 0.95,
        color: 'white',
        border: 'none',
        display: 'block',
        padding: '2px',
        overflow: 'hidden',
      }
    };
  }, []);

  const { scrollToTime } = useMemo(
    () => ({
      scrollToTime: new Date(),
    }),
    []
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Academic Calendar</h1>
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
                Total Events: <span className="font-bold">{myEvents.length}</span>
              </p>
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
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                scrollToTime={scrollToTime}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                components={components}
                eventPropGetter={eventStyleGetter}
                popup
                formats={{
                  timeGutterFormat: 'h:mm A',
                  eventTimeRangeFormat: ({ start, end }) =>
                    `${moment(start).format('h:mm A')} - ${moment(end).format('h:mm A')}`,
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
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onDelete={handleDeleteEvent}
      />
    </>
  );
}

Selectable.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
};