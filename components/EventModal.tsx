import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { BookOpen, CalendarIcon, Clock, DollarSign, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export interface EventFormData {
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  subject?: string; // subject name
  subject_id?: string;
  timezone?: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => void;
  defaultStart: Date;
  defaultEnd: Date;
}

interface Subject {
  id: string;
  name: string;
  code: string | null;
  grade: string | null;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultStart,
  defaultEnd,
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    subject_id: "",
    startTime: moment(defaultStart).format("HH:mm"),
    endTime: moment(defaultEnd).format("HH:mm"),
    startDate: moment(defaultStart).format("YYYY-MM-DD"),
    endDate: moment(defaultEnd).format("YYYY-MM-DD"),
  });

  const [subjects, setSubjects] = useState<[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Fetch subjects when modal opens
  useEffect(() => {
    if (isOpen) {
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
            `/api/tutor-availability/get-full?email=${encodeURIComponent(
              user.email
            )}`
          );

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            console.log("Profile data:", profileData);

            setSubjects(profileData);
          }
        } catch (error) {
          console.error("Error fetching subjects:", error);
        } finally {
          setLoadingSubjects(false);
        }
      };

      fetchSubjects();
    }
  }, [isOpen]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      startTime: moment(defaultStart).format("HH:mm"),
      endTime: moment(defaultEnd).format("HH:mm"),
      date: moment(defaultStart).format("YYYY-MM-DD"),
    }));
  }, [defaultStart, defaultEnd]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTime = moment(
      `${formData.startDate} ${formData.startTime}`
    ).toDate();
    const endDateTime = moment(
      `${formData.endDate} ${formData.endTime}`
    ).toDate();

    if (endDateTime <= startDateTime) {
      alert("End time must be after start time");
      return;
    }

    if (!formData.subject) {
      alert("Please select a subject");
      return;
    }

    // Map subject_id to subject name
    const selectedSubject: any = subjects.find(
      (s: any) => s.id === formData.subject_id
    );
    const subjectName = selectedSubject?.subjects.name || "";
console.log("formData selectedSubject", selectedSubject)
    onSubmit({
      ...formData,
      subject_id: formData.subject_id,
      subject: subjectName,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    });
    onClose();
  };
  const selectedSubject: any = subjects.find(
      (s: any) => s.id === formData.subject_id
    );
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "subject_id") {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const subjectName = selectedOption.getAttribute("data-name");
      setFormData((prev) => ({
        ...prev,
        ["subject"]: subjectName,
      }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 rounded-lg shadow-xl max-w-2xl w-full scrollbar-hide overflow-y-auto">
        <div className="flex relative m-2.5 text-white h-24 rounded-md bg-slate-800 justify-between items-center border-b px-6 py-4">
          <h3 className="text-xl font-semibold text-white">
            Create New Lecture
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-200 hover:text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Subject *
            </label>
            <select
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
              disabled={loadingSubjects}
            >
              <option value="">
                {loadingSubjects ? "Loading subjects..." : "Select a subject"}
              </option>
              {subjects.map((obj: any) => (
                <option
                  key={obj.subjects.id}
                  value={obj.id}
                  data-name={obj.subjects.name}
                >
                  {obj.subjects.name}
                  {obj.subjects.code ? ` (${obj.subjects.code})` : ""}
                  {obj.subjects.grade ? ` - Grade ${obj.subjects.grade}` : ""}
                </option>
              ))}
            </select>
            {subjects.length === 0 && !loadingSubjects && (
              <p className="text-sm text-gray-500 mt-1">
                No subjects available. Please add subjects to your profile.
              </p>
            )}
          </div>

          {/* Price */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Price
            </label>
            <input
            disabled
              type="text"
              name="price"
              value={selectedSubject?.price || ""}
              placeholder="Enter price"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Duration
            </label>
            <input
            disabled
              type="text"
              name="price"
              value={selectedSubject?.duration == 1 ? "1 hour": selectedSubject?.duration == 0.5 ? "30 minutes": '1:30 hours'}
              placeholder="Enter price"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>
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
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
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
                value={formData.endDate}
                onChange={handleChange}
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
                value={formData.startTime}
                onChange={handleChange}
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
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-10 mt-auto border-t">
            <button
              type="button"
              onClick={onClose}
              data-dialog-close="true"
              className="rounded-full border border-transparent px-5 py-2.5 text-center text-sm transition-all text-slate-600 hover:bg-slate-200 focus:bg-slate-100 active:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#cf3fad] text-white rounded-full hover:bg-[#cf3fad]/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
