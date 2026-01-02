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
import { X, Clock, MapPin, User, BookOpen, Calendar as CalendarIcon, FileText } from 'lucide-react';
interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any | null;
  onDelete: (eventId: number) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  onDelete,
}) => {
  if (!isOpen || !event) return null;

  const eventTypeColors:any = {
    lecture: "bg-blue-100 text-blue-800 border-blue-200",
    lab: "bg-green-100 text-green-800 border-green-200",
    tutorial: "bg-yellow-100 text-yellow-800 border-yellow-200",
    seminar: "bg-red-100 text-red-800 border-red-200",
  };

  const eventTypeIcons:any = {
    lecture: "📚",
    lab: "💻",
    tutorial: "📝",
    seminar: "🎤",
  };

  const startTime = moment(event.start).format("h:mm A");
  const endTime = moment(event.end).format("h:mm A");
  const dateStr = moment(event.start).format("MMMM Do, YYYY");
  const duration = moment(event.end).diff(moment(event.start), 'hours', true);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 lg:p-4 overflow-y-auto">
      <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex relative m-2.5 text-white h-24 rounded-md bg-slate-800 justify-between items-center border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">{event.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
           <X className="w-6 h-6 text-gray-200 hover:text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-700">Date</h3>
              </div>
              <p className="text-gray-800 font-medium">{dateStr}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-700">Time & Duration</h3>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-gray-800 font-medium">
                  {startTime} - {endTime}
                </p>
                <span className="text-sm text-gray-500">
                  {duration.toFixed(1)} hours
                </span>
              </div>
            </div>
          </div>


          {/* Description */}
          {event.description && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-700">Price</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-700 whitespace-pre-line">{event.price}</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-full border border-transparent px-5 py-2.5 text-center text-sm transition-all text-slate-600 hover:bg-slate-200 focus:bg-slate-100 active:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this event?")) {
                  onDelete(event.id);
                  onClose();
                }
              }}
              className="px-5 py-2.5 bg-[#cf3fad] text-white rounded-full hover:bg-[#cf3fad]/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Delete Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};