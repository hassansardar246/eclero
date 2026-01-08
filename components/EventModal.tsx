import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export interface EventFormData {
    title: string;      // subject_id
    price: string;
    startTime: string;
    endTime: string;
    date: string;
    endDate: string;
    subject?: string;   // subject name
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
    title: "",
    price: "",
    startTime: moment(defaultStart).format("HH:mm"),
    endTime: moment(defaultEnd).format("HH:mm"),
    date: moment(defaultStart).format("YYYY-MM-DD"),
    endDate: moment(defaultEnd).format("YYYY-MM-DD"),
  });

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: defaultStart,
      endDate: defaultEnd,
      key: "selection",
    },
  ]);

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
            `/api/profiles/get-full?email=${encodeURIComponent(user.email)}`
          );
          
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            
            // Transform subjects from the API response
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
    setDateRange([
      {
        startDate: defaultStart,
        endDate: defaultEnd,
        key: "selection",
      },
    ]);
  }, [defaultStart, defaultEnd]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    const startDateTime = moment(`${formData.date} ${formData.startTime}`).toDate();
    const endDateTime = moment(`${formData.endDate} ${formData.endTime}`).toDate();
  
    if (endDateTime <= startDateTime) {
      alert("End time must be after start time");
      return;
    }
  
    if (!formData.title) {
      alert("Please select a subject");
      return;
    }
  
    // Map subject_id to subject name
    const selectedSubject = subjects.find((s) => s.id === formData.title);
    const subjectName = selectedSubject?.name || "";
  
    onSubmit({
      ...formData,
      subject_id: formData.title,
      subject: subjectName,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    });
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
    const endDate = moment(item.selection.endDate).format("YYYY-MM-DD");
    setFormData((prev) => ({
      ...prev,
      date: newDate,
      endDate
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] min-h-[570px] scrollbar-hide overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6" ref={calendarRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date:
            </label>
            <div className="relative">
              <div
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white flex justify-between items-center hover:border-gray-400 transition-colors"
              >
                <span>
                  {dateRange[0]?.startDate
                    ? format(dateRange[0].startDate, "MM/dd/yyyy")
                    : "Start Date"}
                  {" - "}
                  {dateRange[0]?.endDate
                    ? format(dateRange[0].endDate, "MM/dd/yyyy")
                    : "End Date"}
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
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loadingSubjects}
              >
                <option value="">
                  {loadingSubjects ? "Loading subjects..." : "Select a subject"}
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
                  No subjects available. Please add subjects to your profile.
                </p>
              )}
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