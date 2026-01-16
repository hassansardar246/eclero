import { bookSession } from "@/lib/bookingUtils";
import React, { useMemo, useState } from "react";

interface TutorProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  email?: string;
  phone?: string;
  hourlyRate?: number;
  education?: { degree: string; institution: string; year: number }[];
  experience?: { title: string; description: string; years: number }[];
  rating?: number;
  subjects?: { name: string; code: string }[];
  isAvailableNow?: boolean;
  availableSlots?: {
    subject_id?: string;
    start_time?: string | Date | null;
    end_time?: string | Date | null;
    start_date?: string | Date | null;
    end_date?: string | Date | null;
  }[];
}

interface TutorProfileBubbleProps {
  tutor: TutorProfile;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onBookSession?: (tutor: TutorProfile) => void;
}

const TutorProfileBubble: React.FC<TutorProfileBubbleProps> = ({
  tutor,
  userId,
  isOpen,
  onClose,
  onBookSession,
}) => {
  if (!isOpen) return null;

  const [selectedDuration, setSelectedDuration] = useState<"0.5" | "1" | "1.5"| any>("0.5");
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [bookingTopic, setBookingTopic] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const timeZoneLabel =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const durationOptions = [
    { value: "0.5" as const, label: "30 Minutes" },
    { value: "1" as const, label: "1 Hour" },
    { value: "1.5" as const, label: "1.5 Hours" },
  ];

  const formatTimeLabel = (minutes: number) => {
    const hour24 = Math.floor(minutes / 60) % 24;
    const minute = minutes % 60;
    const hour12 = hour24 % 12 || 12;
    const suffix = hour24 >= 12 ? "PM" : "AM";
    return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
  };

  const timeSlots = useMemo(() => {
    const durationMinutes = Number(selectedDuration) * 60;
    const slots = new Set<number>();
    const availableSlots = Array.isArray(tutor.availableSlots)
      ? tutor.availableSlots
      : [];
console.log(availableSlots);
const toMinutes = (value?: string | Date | null) => {
  if (!value) return null;
  
  if (typeof value === 'string') {
    // Extract time portion from ISO string
    const timeMatch = value.match(/T(\d{2}):(\d{2})/);
    if (timeMatch) {
      return parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
    }
  }
  
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCHours() * 60 + date.getUTCMinutes();
};

    for (const slot of availableSlots) {
      console.log("slotsssssssss", slot);  
      const start = toMinutes(slot.start_time);
      const end = toMinutes(slot.end_time);
      if (start === null || end === null || end <= start) continue;
      for (let t = start; t + durationMinutes <= end; t += durationMinutes) {
        slots.add(t);
      }
    }

    return Array.from(slots).sort((a, b) => a - b);
  }, [selectedDuration, tutor.availableSlots]);
console.log("timeSlots", timeSlots);
  const handleBookSession = async () => {
    if (!tutor || !userId || !selectedTime) {
      alert("Please select a time slot");
      return;
    }
    
    try {
      // Convert minutes to ISO string
      const minutesToTimeString = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
      };
      
      const bookingTime = minutesToTimeString(selectedTime);
      
      const result = await bookSession({
        tutorId: tutor.id,
        studentId: userId,
        start_time: bookingTime,  // Add this field
        duration: selectedDuration * 1,      // Add this field
        topic: bookingTopic.trim() || undefined,
        notes: bookingNotes.trim() || undefined,
      });
  
      if (result.success) {
        alert(`Session successfully booked with ${tutor.name}! They will receive your request.`);
        // Reset form
        setSelectedTime(null);
        setBookingTopic("");
        setBookingNotes("");
      } else {
        alert(`Failed to book session: ${result.error}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred while booking the session.');
    }
  };
console.log("tutor", tutor);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-[90vw] max-w-3xl max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col md:flex-row gap-8"
        style={{ boxShadow: "0 8px 32px 0 rgba(31,38,135,0.37)" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white text-2xl font-bold focus:outline-none"
        >
          &times;
        </button>
        {/* Profile Picture */}
        <div className="flex flex-col items-center md:items-start md:w-1/3">
          {/* <img
            src={tutor.avatar || "/default-avatar.png"}
            alt={tutor.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-white/30 mb-4"
          /> */}
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="24" cy="24" r="20" fill="url(#gradient1)" />
            <circle cx="24" cy="18" r="6" fill="white" />
            <path
              d="M16 30C16 26 20 24 24 24C28 24 32 26 32 30V34H16V30Z"
              fill="white"
            />
            <defs>
              <linearGradient
                id="gradient1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stop-color="#8B5CF6" />
                <stop offset="100%" stop-color="#10B981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-1">{tutor.name}</h2>
            {tutor.rating && (
              <div className="flex items-center justify-center md:justify-start mt-1">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 text-white font-medium">
                  {tutor.rating}
                </span>
              </div>
            )}
            {tutor.subjects && tutor.subjects.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tutor.subjects.map((subj) => (
                  <span
                    key={subj.code}
                    className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {subj.name} ({subj.code})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Profile Info */}
        <div className="flex-1 flex flex-col gap-4 text-white">


          {/* Booking Section */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">
              Schedule a session with {tutor.name}
            </h3>
            <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-400">Duration</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {durationOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSelectedDuration(option.value);
                          setSelectedTime(null);
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          selectedDuration === option.value
                            ? "bg-white text-gray-900 border-white"
                            : "bg-white/10 text-gray-200 border-white/20 hover:bg-white/20"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">Today</div>
                  <div className="mt-2 px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20 text-gray-200">
                    {todayLabel}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-2">Select time</div>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                    {timeSlots.length > 0 ? (
                      timeSlots.map((slotMinutes) => (
                        console.log(slotMinutes),
                        <button
                          key={slotMinutes}
                        type="button"
                        onClick={() => setSelectedTime(slotMinutes)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          selectedTime === slotMinutes
                            ? "bg-white text-gray-900 border-white"
                            : "bg-white/10 text-gray-200 border-white/20 hover:bg-white/20"
                        }`}
                      >
                        {formatTimeLabel(slotMinutes)}
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400">
                      No available slots today.
                    </div>
                  )}
                </div>
            
              </div>
       
          </div>
          <div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Topic (optional)
                </label>
                <input
                  type="text"
                  value={bookingTopic}
                  onChange={(e) => setBookingTopic(e.target.value)}
                  placeholder="What would you like to study?"
                  className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Any specific requirements or questions?"
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>
              <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold border border-white/20 text-gray-200 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBookSession}
                    disabled={selectedTime === null}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Confirm
                  </button>
                </div>
            </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TutorProfileBubble;
