"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import TiptapEditor from "@/components/RichTextEditor";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import SubjectSelectProfile from "@/components/ui/components/SubjectSelectProfile";
export type Subjects = {
  id: string;
  name: string;
  code: string;
  grade: number;
  category?: string;
};
type CategoryGroup = {
  name: string;
  subjects: Subjects[];
};
export default function TutorProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode1, setEditMode1] = useState(false);
  const [editMode2, setEditMode2] = useState(false);
  const [editMode3, setEditMode3] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editHourlyRate, setEditHourlyRate] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const [educationText, setEducationText] = useState<string>("");
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<Subjects[]>([]);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
          error: sessionError,
        } = await supabase.auth.getUser();
        if (sessionError || !user) {
          router.push("/auth/login");
          return;
        }
        const profileRes = await fetch(
          `/api/profiles/get-full?email=${encodeURIComponent(user.email!)}`
        );
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          setEditName(profileData.name || "");
          setEditPhone(profileData.phone || "");
          setEditBio(profileData.bio || "");
          setEditHourlyRate(profileData.hourlyRate?.toString() || "");
          console.log("Profile data in profile:", profileData);
          if (profileData.education) {
            // Ensure it's a string
            setEducationText(String(profileData.education) || "");
          } else {
            setEducationText(""); // Set empty string if undefined/null
          }
          // Normalize selected subject ids from profile
          let normalizedSubjects: string[] = [];
          if (profileData.subjects && Array.isArray(profileData.subjects)) {
            normalizedSubjects = profileData.subjects
              .map((s: any) => {
                if (s && typeof s.id === "string") return s.id;
                if (s && s.Subjects && typeof s.Subjects.id === "string")
                  return s.Subjects.id;
                return undefined;
              })
              .filter(
                (id: any): id is string =>
                  typeof id === "string" && id.length > 0
              );
          }
          console.log("Normalized subjects:", normalizedSubjects);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchProfile();

    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // setSelectedSubjects(data);
          // Group by category
          const catMap = new Map<string, Subjects[]>();
          data.forEach((subject: Subjects) => {
            const cat = subject.category || "Uncategorized";
            if (!catMap.has(cat)) catMap.set(cat, []);
            catMap.get(cat)!.push(subject);
          });
          const grouped: CategoryGroup[] = Array.from(catMap.entries()).map(
            ([name, subjects]) => ({ name, subjects })
          );
          setCategories(grouped);
        } else {
          setSelectedSubjects([]);
          setCategories([]);
        }
      })
      .catch((err) => {
        console.error("Subjects fetch error:", err);
        setSelectedSubjects([]);
        setCategories([]);
      });
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    const hourlyRate = editHourlyRate ? parseFloat(editHourlyRate) : null;
    await fetch("/api/profiles/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: profile.email,
        name: editName,
        phone: editPhone,
        bio: editBio,
        hourlyRate: hourlyRate,
      }),
    });
    setProfile({
      ...profile,
      name: editName,
      phone: editPhone,
      bio: editBio,
      hourlyRate: hourlyRate,
    });
    setSaving(false);
  };
  const handleSaveEducation = async () => {
    setSaving(true);
    await fetch("/api/profiles/update-education", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: profile.email,
        education: educationText,
      }),
    });
    setProfile({ ...profile, education: educationText });
    setSaving(false);
  };
  const onSubjectsChange = (subjects: any) => {
    console.log("Selected subjects parent:", subjects);
    setSelectedSubjects(subjects);
  };
  const handleSubjectsChange = async () => {
    if (!profile?.email) return;
    Swal.fire({
      title: "Are you sure?",
      text: "All availablity records will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Proceed!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch("/api/profiles/update-course", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: profile.email,
              subjects: selectedSubjects,
            }),
          });
        } catch (e) {
          // noop; UI remains updated locally
        }
        Swal.fire({
          title: "Updated!",
          text: "Your subjects have been updated.",
          icon: "success",
        });
      }
    });
  };
  console.log("Selected subjects576:", selectedSubjects);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-white text-xl font-bold">Loading profile...</div>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-white text-xl font-bold">Profile not found.</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 grid grid-cols-1 md:grid-cols-[1.1fr_1.6fr] gap-8">
        {/* LEFT COLUMN – Subjects */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-20 h-20 rounded-2xl object-cover border border-slate-700 shadow-lg bg-slate-700 p-2"
              viewBox="0 0 48 48"
              fill="none"
            >
              <circle cx="24" cy="24" r="24" fill="#1e293b" />
              <circle cx="24" cy="19" r="8" fill="#334155" />
              <ellipse cx="24" cy="34" rx="12" ry="6" fill="#334155" />
            </svg>
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {profile.name}
              </h2>
              <div className="mt-1 inline-flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/40">
                  {profile.role === "tutor"
                    ? "Tutor"
                    : profile.role || "Student"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            {editMode3 ? (
              <>
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <SubjectSelectProfile
                    categories={categories}
                    selectedSubjects={selectedSubjects}
                    onSubjectsChange={onSubjectsChange}
                  />
                </motion.div>
                <div className="pt-5 flex justify-end">
                  <button
                    onClick={() => setEditMode3(false)}
                    className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-medium border text-white mr-3 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    cancel
                  </button>
                  <button
                    onClick={handleSubjectsChange}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-medium bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">
                      Subjects you teach
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setEditMode3(true);
                      setEditMode2(false);
                      setEditMode1(false);
                    }}
                    className="inline-flex items-center min-w-[100px] px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-900 hover:bg-white transition-colors"
                  >
                    Edit Subjects
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Manage the courses that appear on your profile.
                </p>

                <div className="">
                  {Array.isArray(profile.subjects) &&
                  profile.subjects.length > 0 ? (
                    profile.subjects.map((subject: any) => (
                      <button
                        key={subject.id}
                        className={`rounded-xl border px-5 py-4 w-full text-sm transition gap-2 hover:border-gray-400
                                    }`}
                      >
                        <div className="flex items-center justify-between">
                          {/* {selected && <CheckCircle size={14} />} */}
                          <span className="block text-white ">
                            {subject.Subjects?.name || subject.name}
                          </span>
                          <span className=" text-white rounded-lg px-[15px] bg-slate-600">
                            {subject.Subjects?.code || subject.code}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">
                      No subjects selected yet. Click &ldquo;Edit
                      Subjects&rdquo; to add some.
                    </p>
                  )}
                  ;
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN – Personal Info + Education */}
        <div className="flex flex-col gap-6">
          {/* Personal Info */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <form action="">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    Personal Info
                  </h3>
                  <p className="text-xs text-slate-400">
                    Basic details that students will see on your profile.
                  </p>
                </div>
                {!editMode1 && (
                  <span
                    onClick={() => {
                      setEditMode1(true);
                      setEditMode2(false);
                      setEditMode3(false);
                    }}
                    className="inline-flex cursor-pointer items-center min-w-[100px] px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-900 hover:bg-white transition-colors"
                  >
                    Edit profile
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Full Name
                  </label>
                  <input
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your full name"
                    disabled={saving}
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Bio
                  </label>
                  <textarea
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none min-h-[96px]"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell students about your experience, teaching style, and what to expect."
                    disabled={saving}
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Email
                    </label>
                    <input
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={profile.email}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Phone
                    </label>
                    <input
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+1 234 567 890"
                      disabled={saving}
                    />
                  </div>
                </div>

                {editMode1 && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setEditMode1(false)}
                      className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-medium border text-white mr-3 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-medium bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </section>

          {/* Education (Rich Text-ish) */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Education
                </h3>
                <p className="text-xs text-slate-400">
                  Share your degrees, institutions and any relevant
                  qualifications.
                </p>
              </div>
              {!editMode2 && (
                <span
                  onClick={() => {
                    setEditMode2(true);
                    setEditMode1(false);
                    setEditMode3(false);
                  }}
                  className="inline-flex cursor-pointer items-center min-w-[100px] px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-900 hover:bg-white transition-colors"
                >
                  Edit education
                </span>
              )}
            </div>
            <div className="relative">
              <div className="relative">
                {editMode2 ? (
                  <TiptapEditor
                    onChange={setEducationText}
                    value={educationText}
                  />
                ) : (
                  <div className="education-content">
                    <div
                      className="rendered-html-content text-white"
                      dangerouslySetInnerHTML={{ __html: educationText }}
                    />
                  </div>
                )}
              </div>
            </div>
            {editMode2 && (
              <div className="w-full flex mt-3 justify-end">
                <button
                  onClick={() => setEditMode2(false)}
                  className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium border text-white mr-3 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  cancel
                </button>
                <button
                  disabled={saving}
                  onClick={handleSaveEducation}
                  className="inline-flex items-center justify-end  px-4 py-2.5 rounded-full text-sm font-medium bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
