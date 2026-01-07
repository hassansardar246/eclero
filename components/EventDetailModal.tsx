import React, { useState, useEffect } from "react";
import moment from "moment";
import { X, Clock, Calendar as CalendarIcon, DollarSign, BookOpen, User, FileText, MapPin, Tag } from 'lucide-react';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any | null;
  onDelete: (eventId: string) => void;
  onUpdate: (eventId: string, updatedData: any) => void;
}

interface UpdateFormData {
  title: string;
  price: string;
  startTime: string;
  endTime: string;
  date: string;
  endDate: string;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  onDelete,
  onUpdate,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [updateForm, setUpdateForm] = useState<UpdateFormData>({
    title: "",
    price: "",
    startTime: "",
    endTime: "",
    date: "",
    endDate: "",
  });

  useEffect(() => {
    if (event && isEditMode) {
      setUpdateForm({
        title: event.title || "",
        price: event.price?.toString() || "",
        startTime: moment(event.start).format("HH:mm"),
        endTime: moment(event.end).format("HH:mm"),
        date: moment(event.start).format("YYYY-MM-DD"),
        endDate: moment(event.end).format("YYYY-MM-DD"),
      });
    }
  }, [event, isEditMode]);

  if (!isOpen || !event) return null;

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = moment(
      `${updateForm.date} ${updateForm.startTime}`
    ).toDate();
    const endDateTime = moment(`${updateForm.endDate} ${updateForm.endTime}`).toDate();

    if (endDateTime <= startDateTime) {
      alert("End time must be after start time");
      return;
    }

    const updatedEvent = {
      ...event,
      title: updateForm.title,
      price: updateForm.price,
      start: startDateTime,
      end: endDateTime,
    };

    onUpdate(event.id, updatedEvent);
    setIsEditMode(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const startTime = moment(event.start).format("h:mm A");
  const endTime = moment(event.end).format("h:mm A");
  const startDateStr = moment(event.start).format("MMMM Do, YYYY");
  const endDateStr = moment(event.end).format("MMMM Do, YYYY");
  const duration = moment(event.end).diff(moment(event.start), 'hours', true);
  const isMultiDay = moment(event.end).date() !== moment(event.start).date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 lg:p-4 overflow-y-auto">
      <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex relative m-2.5 text-white h-24 rounded-md bg-slate-800 justify-between items-center border-b px-6 py-4">
          <div className="flex items-center gap-3">
            {isEditMode ? (
              <h2 className="text-2xl font-bold text-white">Edit Event</h2>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white">{event.title}</h2>
                {event.originalData?.subject && (
                  <p className="text-gray-300 text-sm mt-1">
                    Subject: {event.originalData.subject}
                  </p>
                )}
              </div>
            )}
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
          {isEditMode ? (
            // Edit Mode Form
            <form onSubmit={handleUpdateSubmit}>
              <div className="space-y-6">
                {/* Title/Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Subject/Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={updateForm.title}
                    onChange={handleInputChange}
                    placeholder="Enter subject or title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price *
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={updateForm.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={updateForm.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={updateForm.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={updateForm.startTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={updateForm.endTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            // View Mode
            <>
              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-700">Date</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-800 font-medium">
                      {isMultiDay ? (
                        <>
                          {startDateStr} <span className="text-gray-500">to</span> {endDateStr}
                        </>
                      ) : (
                        startDateStr
                      )}
                    </p>
                    {isMultiDay && (
                      <p className="text-sm text-gray-500">
                        {moment(event.end).diff(moment(event.start), 'days') + 1} days
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-700">Time & Duration</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-800 font-medium">
                      {startTime} - {endTime}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {duration.toFixed(1)} hours
                      </span>
                      {isMultiDay && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Multi-day
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-700">Subject</h3>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {event.title || 'Not specified'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-700">Price</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-800">
                      ${event.price || '0'}
                    </p>
                    <span className="text-gray-500">per session</span>
                  </div>
                  {event.originalData?.hourlyRate && (
                    <p className="text-sm text-gray-500 mt-1">
                      Hourly: ${event.originalData.hourlyRate}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="border-t p-6">
          <div className="flex justify-between gap-3">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="rounded-full border border-gray-300 px-5 py-2.5 text-center text-sm transition-all text-slate-600 hover:bg-slate-200 focus:bg-slate-100 active:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
              >
                Cancel
              </button>
            </div>
            
            <div className="flex gap-3">
              {isEditMode ? (
                <>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="rounded-full border border-gray-300 px-5 py-2.5 text-center text-sm transition-all text-slate-600 hover:bg-slate-200 focus:bg-slate-100 active:bg-slate-100"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleUpdateSubmit}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Update Event
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Edit Event
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this event?")) {
                        onDelete(event.id);
                        onClose();
                      }
                    }}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Delete Event
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};