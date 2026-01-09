import React, { useState, useEffect } from "react";
import moment from "moment";
import {
  X,
  Clock,
  Calendar as CalendarIcon,
  DollarSign,
  BookOpen,
  User,
  FileText,
  MapPin,
  Tag,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any | null;
  onDelete: (eventId: string) => void;
  onUpdate: (eventId: string, updatedData: any) => void;
}

interface UpdateFormData {
  subject_id: string;
  subject: string;
  price: string;
  startTime: string;
  endTime: string;
  date: string;
  endDate: string;
}

interface Subject {
  id: string;
  name: string;
  code: string | null;
  grade: string | null;
}


export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  onDelete,
  onUpdate,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [updateForm, setUpdateForm] = useState<UpdateFormData>({
    subject_id: "",
    subject: "",
    price: "",
    startTime: "",
    endTime: "",
    date: "",
    endDate: "",
  });

  // Fetch subjects when modal opens in edit mode
  useEffect(() => {
    if (isOpen && isEditMode) {
      const fetchSubjects = async () => {
        setLoadingSubjects(true);
        try {
          const {
            data: { user },
            error: sessionError,
          } = await supabase.auth.getUser();

          if (sessionError || !user?.email) {
            console.error("Error getting user:", sessionError);
            setLoadingSubjects(false);
            return;
          }

          const profileRes = await fetch(
            `/api/profiles/get-full?email=${encodeURIComponent(user.email)}`
          );

          if (profileRes.ok) {
            const profileData = await profileRes.json();

            if (profileData.subjects && Array.isArray(profileData.subjects)) {
              const transformedSubjects: Subject[] = profileData.subjects
                .map((s: any) => {
                  if (s?.Subjects) {
                    return {
                      id: s.Subjects.id,
                      name: s.Subjects.name,
                      code: s.Subjects.code || null,
                      grade: s.Subjects.grade || null,
                    };
                  }
                  return null;
                })
                .filter((s: Subject | null): s is Subject => s !== null);

              setSubjects(transformedSubjects);
            }
          }
        } catch (error) {
          console.error("Error fetching subjects:", error);
        } finally {
          setLoadingSubjects(false);
        }
      };

      fetchSubjects();
    }
  }, [isOpen, isEditMode]);

  useEffect(() => {
    if (event && isEditMode) {
      // Extract subject_id from event if available
      const subjectId =
        event.originalData?.subject_id || event.subject_id || "";
      const subjectName =
        event.title || event.originalData?.subject || event.subject || "";

      setUpdateForm({
        subject_id: subjectId,
        subject: subjectName,
        price: event.price?.toString() || "",
        startTime: moment(event.start).format("HH:mm"),
        endTime: moment(event.end).format("HH:mm"),
        date: moment(event.start).format("YYYY-MM-DD"),
        endDate: moment(event.end).format("YYYY-MM-DD"),
      });
    }
  }, [event, isEditMode]);

  if (!isOpen || !event) return null;

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTime = moment(
      `${updateForm.date} ${updateForm.startTime}`
    ).toDate();
    const endDateTime = moment(
      `${updateForm.endDate} ${updateForm.endTime}`
    ).toDate();

    if (endDateTime <= startDateTime) {
      alert("End time must be after start time");
      return;
    }

    if (!updateForm.subject_id) {
      alert("Please select a subject");
      return;
    }

    // Get the selected subject name
    const selectedSubject = subjects.find(
      (s) => s.id === updateForm.subject_id
    );
    const subjectName = selectedSubject?.name || updateForm.subject;

    // Get user email for tutor_id resolution
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const updatedEvent = {
      // Send both Date objects and date/time strings for flexibility
      start: startDateTime,
      end: endDateTime,
      date: updateForm.date, // "YYYY-MM-DD"
      startTime: updateForm.startTime, // "HH:mm"
      endDate: updateForm.endDate, // "YYYY-MM-DD"
      endTime: updateForm.endTime, // "HH:mm"
      start_time: updateForm.startTime,
      end_time: updateForm.endTime,
      price: updateForm.price,
      subject_id: updateForm.subject_id,
      subject: subjectName,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    };

    // Call the API to update
    try {
      const res = await fetch("/api/tutor-availability/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          updatedData: updatedEvent,
          email: user?.email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error updating event: ${errorData.error || "Unknown error"}`);
        return;
      }

  

      // Update local state with the updated event
      onUpdate(event.id, {
        ...event,
        ...updatedEvent,
        title: subjectName,
      });

      setIsEditMode(false);
         onClose();
    } catch (error: any) {
      console.error("Error updating event:", error);
      alert("Error updating event. Please try again.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If subject dropdown changed, update subject name
    if (name === "subject_id") {
      const selectedSubject = subjects.find((s) => s.id === value);
      if (selectedSubject) {
        setUpdateForm((prev) => ({
          ...prev,
          subject: selectedSubject.name,
        }));
      }
    }
  };

  const startTime = moment(event.start).format("h:mm A");
  const endTime = moment(event.end).format("h:mm A");
  const startDateStr = moment(event.start).format("MMMM Do, YYYY");
  const endDateStr = moment(event.end).format("MMMM Do, YYYY");
  const duration = moment(event.end).diff(moment(event.start), "hours", true);
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
                <h2 className="text-2xl font-bold text-white">
                  {event.title || event.subject || "Event"}
                </h2>
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
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Subject *
                  </label>
                  <select
                    name="subject_id"
                    value={updateForm.subject_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                    disabled={loadingSubjects}
                  >
                    <option value="">
                      {loadingSubjects
                        ? "Loading subjects..."
                        : "Select a subject"}
                    </option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                        {subject.code ? ` (${subject.code})` : ""}
                        {subject.grade ? ` - Grade ${subject.grade}` : ""}
                      </option>
                    ))}
                  </select>
                  {subjects.length === 0 && !loadingSubjects && (
                    <p className="text-sm text-gray-500 mt-1">
                      No subjects available. Please add subjects to your
                      profile.
                    </p>
                  )}
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
                          {startDateStr}{" "}
                          <span className="text-gray-500">to</span> {endDateStr}
                        </>
                      ) : (
                        startDateStr
                      )}
                    </p>
                    {isMultiDay && (
                      <p className="text-sm text-gray-500">
                        {moment(event.end).diff(moment(event.start), "days") +
                          1}{" "}
                        days
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-700">
                      Time & Duration
                    </h3>
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
                    {event.title ||
                      event.subject ||
                      event.originalData?.subject ||
                      "Not specified"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-700">Price</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-800">
                      ${event.price || "0"}
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
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (
                        !window.confirm(
                          "Are you sure you want to delete this event?"
                        )
                      )
                        return;

                      try {
                        const res = await fetch(
                          "/api/tutor-availability/delete",
                          {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ eventId: event.id }),
                          }
                        );

                        if (!res.ok) {
                          const err = await res.json().catch(() => ({}));
                          alert(
                            `Error deleting event: ${
                              err.error || res.statusText
                            }`
                          );
                          return;
                        }

                        onDelete(event.id); // update local state
                        onClose();
                      } catch (e: any) {
                        console.error("Error deleting event:", e);
                        alert("Error deleting event. Please try again.");
                      }
                    }}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Delete
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
