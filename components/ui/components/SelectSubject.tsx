import { useState } from "react";
import {
  BookOpen,
  Calculator,
  Microscope,
  Landmark,
  Monitor,
  MessageCircle,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";

type SubjectKey =
  | "English"
  | "Math"
  | "Science"
  | "History"
  | "Computer Science"
  | "Languages";

const SUBJECTS: {
  key: SubjectKey;
  icon: any;
  color: string;
  subcategories: string[];
}[] = [
  {
    key: "English",
    icon: BookOpen,
    color: "from-pink-500 to-purple-500",
    subcategories: ["Grammar", "Writing", "Literature", "Comprehension"],
  },
  {
    key: "Math",
    icon: Calculator,
    color: "from-purple-500 to-indigo-500",
    subcategories: [
      "Algebra",
      "Geometry",
      "Calculus",
      "Statistics",
      "Trigonometry",
      "Probability",
    ],
  },
  {
    key: "Science",
    icon: Microscope,
    color: "from-blue-500 to-cyan-500",
    subcategories: ["Physics", "Chemistry", "Biology", "Earth Science"],
  },
  {
    key: "History",
    icon: Landmark,
    color: "from-yellow-500 to-orange-500",
    subcategories: ["World History", "Islamic History", "Modern History"],
  },
  {
    key: "Computer Science",
    icon: Monitor,
    color: "from-emerald-500 to-teal-500",
    subcategories: ["Programming", "Databases", "Web Development", "AI Basics"],
  },
  {
    key: "Languages",
    icon: MessageCircle,
    color: "from-rose-500 to-pink-500",
    subcategories: ["Urdu", "Arabic", "French", "Spanish"],
  },
];

export default function SelectSubject() {
  const [activeSubject, setActiveSubject] = useState<SubjectKey | null>(null);
  const [selectedSubs, setSelectedSubs] = useState<Record<string, string[]>>(
    {}
  );

  const toggleSub = (subject: SubjectKey, sub: string) => {
    setSelectedSubs((prev) => {
      const current = prev[subject] || [];
      return {
        ...prev,
        [subject]: current.includes(sub)
          ? current.filter((s) => s !== sub)
          : [...current, sub],
      };
    });
  };

  // Get total selected count
  const totalSelected = Object.values(selectedSubs).reduce(
    (sum, subs) => sum + subs.length,
    0
  );

  // Get subjects that have selections
  const selectedSubjects = Object.keys(selectedSubs).filter(
    (subject) => selectedSubs[subject]?.length > 0
  );

  // Remove a subject entirely
  const removeSubject = (subject: SubjectKey) => {
    setSelectedSubs((prev) => {
      const newSelected = { ...prev };
      delete newSelected[subject];
      return newSelected;
    });
  };

  // Remove a specific subcategory
  const removeSubcategory = (subject: SubjectKey, sub: string) => {
    toggleSub(subject, sub);
  };

  return (
    <div className="space-y-8">
      <div className="relative group">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Grade
        </label>

        <div className="relative">
          {/* Decorative top border */}
          <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />

          {/* Input wrapper with gradient border */}
          <div className="relative bg-white rounded-2xl border-2 border-gray-200 p-[2px] transition-all duration-300 hover:border-blue-300 group-focus-within:border-blue-400 group-focus-within:shadow-lg group-focus-within:shadow-blue-100">
            <div className="flex items-center">
              {/* Input field */}
              <div className="flex-1 px-4">
                <select
                  name="grade"
                  // value={grade}
                  // onChange={(e) => onChange(e)}
                  className="w-full py-3 px-0 border-0 focus:ring-0 focus:outline-none text-lg placeholder:text-gray-400 bg-transparent"
                >
                  <option value="" className="">
                    Choose a grade
                  </option>
                  <option value="1" className="">
                    All
                  </option>
                  <option value="2" className="">
                    9th
                  </option>
                  <option value="3" className="">
                    10th
                  </option>
                  <option value="4" className="">
                    11th
                  </option>
                  <option value="5" className="">
                    12th
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Decorative bottom border */}
          <div className="absolute -bottom-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50" />
        </div>
      </div>
      {/* Selected Subjects Display */}
      {selectedSubjects.length > 0 && (
        <div className="">
          <div className="gap-3 flex items-center flex-wrap">
            {selectedSubjects.map((subjectKey) => {
              const subject = SUBJECTS.find((s) => s.key === subjectKey);
              const selectedSubcategories = selectedSubs[subjectKey] || [];
              const Icon = subject?.icon;

              return (
                <div
                  key={subjectKey}
                  className="border border-gray-200 flex-1 min-w-[40%] max-w-[50%] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${subject?.color} text-white flex items-center justify-center`}
                      >
                        {Icon && <Icon size={18} />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {subjectKey}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {selectedSubcategories.length} topic
                          {selectedSubcategories.length !== 1 ? "s" : ""}{" "}
                          selected
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSubject(subjectKey as SubjectKey)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Remove subject"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedSubcategories.map((sub) => (
                      <div
                        key={sub}
                        className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm"
                      >
                        <CheckCircle size={14} className="text-purple-500" />
                        <span>{sub}</span>
                        <button
                          onClick={() =>
                            removeSubcategory(subjectKey as SubjectKey, sub)
                          }
                          className="text-purple-400 hover:text-purple-600 ml-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subject Selection Grid */}
      <div
        className={`w-full ${
          selectedSubjects.length > 0 ? "" : "mt-12"
        } h-full grid grid-cols-12 gap-8`}
      >
        {/* Main Content */}
        <main className="col-span-12">
          <div className="grid grid-cols-3 gap-4 relative">
            {SUBJECTS.map((subject, index) => {
              const Icon = subject.icon;
              const isActive = activeSubject === subject.key;

              // Calculate column position for panel alignment
              const columnPosition = (index % 3) + 1; // 1, 2, or 3
              const panelPosition =
                columnPosition === 3
                  ? "right"
                  : columnPosition === 2
                  ? "center"
                  : "left";

              // Check if subject has any selections
              const hasSelections = selectedSubs[subject.key]?.length > 0;

              return (
                <div key={subject.key} className="relative">
                  <button
                    onClick={() =>
                      setActiveSubject(isActive ? null : subject.key)
                    }
                    className={`relative rounded-2xl border p-5 flex items-center gap-4 transition-all w-full
                    ${
                      isActive
                        ? "border-purple-500 bg-purple-50"
                        : hasSelections
                        ? "border-purple-300 bg-purple-50/50"
                        : "hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.color} text-white flex items-center justify-center relative`}
                    >
                      <Icon size={22} />
                      {hasSelections && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-xs text-white">
                          {selectedSubs[subject.key]?.length}
                        </div>
                      )}
                    </div>
                    <span className="font-sm">{subject.key}</span>
                    {/* {hasSelections && (
                      <div className="ml-auto">
                        <CheckCircle size={18} className="text-purple-500" />
                      </div>
                    )} */}
                  </button>

                  {/* Subcategory Panel - Positioned under the active subject */}
                  {isActive && (
                    <div
                      className={`absolute top-full z-10 mt-3 ${
                        panelPosition === "right"
                          ? "right-0"
                          : panelPosition === "center"
                          ? "left-1/2 transform -translate-x-1/2"
                          : "left-0"
                      }`}
                    >
                      {/* Triangle tip */}
                      <div className="relative">
                        <div
                          className={`absolute -top-2 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45 ${
                            panelPosition === "right"
                              ? "right-6 left-auto"
                              : panelPosition === "center"
                              ? "left-1/2 transform -translate-x-1/2"
                              : "left-6"
                          }`}
                        ></div>

                        {/* Panel */}
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 w-80">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                              {activeSubject}
                            </h3>
                            <button
                              onClick={() => setActiveSubject(null)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X size={18} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {SUBJECTS.find(
                              (s) => s.key === activeSubject
                            )!.subcategories.map((sub) => {
                              const selected =
                                selectedSubs[activeSubject]?.includes(sub);

                              return (
                                <button
                                  key={sub}
                                  onClick={() => toggleSub(activeSubject, sub)}
                                  className={`rounded-xl border px-4 py-2 text-sm transition flex items-center justify-center gap-2 ${
                                    selected
                                      ? "bg-purple-600 text-white border-purple-600"
                                      : "hover:border-gray-400"
                                  }`}
                                >
                                  {selected && <CheckCircle size={14} />}
                                  {sub}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
