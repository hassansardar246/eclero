import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Subject {
  id: number;
  name: string;
  code: string;
  duration: string;
  price: any;
}


function WizardTimeSlot({ setSelectedSubjectsWithPrice }: any) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(1);
  const [selectedDuration, setSelectedDuration] = useState<string>("0.5");
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [email, setEmail] = useState<string>("");
  const [sessionPrice, setSessionPrice] = useState<number>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
          error: sessionError,
        } = await supabase.auth.getUser();
        const profileRes = await fetch(
          `/api/profiles/get-full?email=${encodeURIComponent(user.email!)}`
        );

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setEmail(profileData.email);
          let normalizedSubjects: any[] = [];
          if (profileData.subjects && Array.isArray(profileData.subjects)) {
            normalizedSubjects = profileData.subjects
              .map((s: any) => {
                // Check if s.subject exists and is an object
                if (s && s.Subjects && typeof s.Subjects === "object") {
                  // Return the subject object with added duration and price fields
                  return {
                    ...s.Subjects,
                    duration: "0.5",
                    price: 0,
                  };
                }
                return undefined;
              })
              .filter(
                (Subjects: any): Subjects is any => Subjects !== undefined
              );
          }
          setSelectedSubjects(normalizedSubjects);
        }
      } catch (error) {}
    };

    fetchProfile();
    setSelectedSubjectId(0);
  }, []);
  // Subjects data
  const categoryName = "Mathematics";
  const color = "from-blue-500 to-indigo-600";
  const Icon = Clock;

  const durationOptions = [
    { value: "0.5", label: "30 min", color: "bg-blue-100 text-blue-800" },
    { value: "1", label: "1 hour", color: "bg-indigo-100 text-indigo-800" },
    { value: "1.5", label: "1.5 hour", color: "bg-purple-100 text-purple-800" },
  ];
  console.log(selectedSubjects);

  const selectedSubject = selectedSubjects.find((s, index) => index === selectedSubjectId) || selectedSubjects[0];

  const updateSubjectDuration = (id: number, duration: string) => {
    let updated = selectedSubjects.map((subject, index) =>
        index === id ? { ...subject, duration } : subject
      );
    setSelectedSubjects(updated);
    setSelectedSubjectsWithPrice(updated);
    setSelectedDuration(duration);
  };

  const updateSubjectPrice = (id: number, price: number) => {
    let updated =  selectedSubjects.map((subject, index) =>
        index === id ? { ...subject, price } : subject
      )
    setSelectedSubjects(updated);
    setSessionPrice(price);
      setSelectedSubjectsWithPrice(updated);
  };

  return (
    <div className="w-full mx-auto p-4">
      <div className="transition-all duration-300">
        {/* Header Section */}


        {/* Subjects Chips */}
        <div className="flex flex-wrap gap-3 mb-8">
          {selectedSubjects.map((subject, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedSubjectId(index);
                setSelectedDuration(subject.duration);
                setSessionPrice(subject.price);
              }}
              className={`inline-flex items-center gap-2 border px-4 py-2.5 rounded-xl text-sm shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group ${
                selectedSubjectId === index
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-700 ring-2 ring-blue-100 ring-opacity-50"
                  : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 hover:border-blue-200"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                  selectedSubjectId === index
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                    : "bg-gradient-to-r from-blue-400 to-indigo-400"
                }`}
              >
                <CheckCircle size={12} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-semibold ${
                    selectedSubjectId === index
                      ? "text-gray-900"
                      : "text-gray-800"
                  }`}
                >
                  {subject.name}
                </span>
                <span className="text-xs text-gray-500">{subject.code}</span>
              </div>

              {/* Show price/duration badge for each subject */}
              <div className="ml-2 px-2 py-1 bg-white/80 rounded-lg text-xs border border-blue-100">
                <div className="flex items-center gap-1">
                  <Clock size={10} className="text-blue-500" />
                  <span>
                    {subject.duration == "0.5" && "30 min"}
                    {subject.duration == "1" && "1 hour"}
                    {subject.duration == "1.5" && "1.5 hour"}
                    {subject.duration == "" && "N/A"}
                  </span>
                  <span className="text-gray-300 mx-1">•</span>
                  <DollarSign size={10} className="text-green-500" />
                  <span>${subject.price || "0"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Configuration for Selected Subject */}
        {selectedSubject && (
          <>
            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-gray-500">
                  Configuring {selectedSubject.name}
                </span>
              </div>
            </div>

            {/* Duration Selection */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={20} className="text-gray-400" />
                <h5 className="font-semibold text-gray-900">
                  Duration for {selectedSubject.name}
                </h5>
              </div>
              <div className="flex gap-3">
                {durationOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex-1 cursor-pointer transition-all duration-300 ${
                      selectedDuration === option.value
                        ? "ring-2 rounded-xl ring-offset-2 ring-indigo-500 transform scale-[1.02]"
                        : "hover:scale-[1.02]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="duration"
                      value={option.value}
                      checked={selectedDuration === option.value}
                      onChange={(e) =>
                        updateSubjectDuration(selectedSubjectId, e.target.value)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`${option.color} border border-transparent rounded-xl p-4 text-center transition-all duration-300 hover:shadow-md`}
                    >
                      <div className="font-bold text-lg mb-1">
                        {option.label}
                      </div>
                      <div className="text-xs opacity-75">session</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Input */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={20} className="text-gray-400" />
                <h5 className="font-semibold text-gray-900">
                  Price for {selectedSubject.name}
                </h5>
              </div>
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  value={sessionPrice}
                  aria-placeholder="0.00"
                  onChange={(e: any) =>
                    updateSubjectPrice(selectedSubjectId, e.target.value)
                  }
                  placeholder="0.00"
                  className="block w-full pl-7 pr-12 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Total for {selectedSubject.name}:{" "}
                <span className="font-semibold text-gray-900">
                  ${sessionPrice || "0.00"} per{" "}
                  {selectedDuration === "0.5"
                    ? "30 min"
                    : selectedDuration === "1"
                    ? "1 hour"
                    : "1.5 hour"}{" "}
                  session
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default WizardTimeSlot;
