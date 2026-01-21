"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import SignUpWizard from "@/components/student/SignUpWizard";
import Modal from "@/components/Modal/Modal";
import { AnimatePresence } from "framer-motion";

type Stats = {
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    totalSpent: number;
    averageRating: number;
};

export default function StudentHome() {
    const [stats, setStats] = useState<Stats>({
        totalSessions: 0,
        completedSessions: 0,
        upcomingSessions: 0,
        totalSpent: 0,
        averageRating: 0,
    });
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
            const profileRes = await fetch(`/api/profiles/get-full?email=${encodeURIComponent(user.email!)}`);
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              setProfile(profileData);
            }
            setLoading(false);
          } catch (error) {
            setLoading(false);
          }
        };
        fetchProfile();
      }, [router]);
      console.log("profile", profile);
      if(loading) {
        return <div className="flex h-screen items-center justify-center bg-gradient-to-b from-[#F8F9FD] to-gray-400">
        <div className="text-lg text-white">Loading...</div>
      </div>;
      }
      if(!profile) {
        return <div className="flex h-screen items-center justify-center bg-gradient-to-b from-[#F8F9FD] to-gray-400">
        <div className="text-lg text-white">No profile found</div>
      </div>;
      }
      if(profile.role !== "student") {
        router.push("/auth/login");
      }
      if(!profile.profile_setup) {
        return (
            <>
         <AnimatePresence>
              <Modal
                isOpen={true}
                onClose={() => {}}
                transition="fade"
                overclass="justify-center overflow-y-auto w-full items-center p-2 lg:p-4"
                innerclass="max-h-screen min-h-[600px] w-full max-w-6xl mx-auto"
              >
                <SignUpWizard />
              </Modal>
          </AnimatePresence>
            </>
          );
      }

    return (
        <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-gray-600">Track your learning progress and find tutors</p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <Link
                        href="/home/student/explore"
                        className="inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-lg text-sm font-medium text-white bg-gradient-to-r from-[#1089d3] to-[#12B1D1] hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105"
                    >
                        Find Tutor
                    </Link>
                </div>
            </div>
    
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Stats cards */}
                <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Sessions
                                    </dt>
                                    <dd className="text-2xl font-bold text-gray-900">
                                        {stats.totalSessions}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
    
                <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Spent
                                    </dt>
                                    <dd className="text-2xl font-bold text-gray-900">
                                        ${stats.totalSpent}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
    
                <div className="bg-white overflow-hidden shadow-xl rounded-2xl border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Average Rating
                                    </dt>
                                    <dd className="text-2xl font-bold text-gray-900">
                                        {stats.averageRating.toFixed(1)} / 5.0
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    
            {/* Upcoming Sessions */}
            <div className="mt-8">
                <div className="bg-white shadow-xl overflow-hidden sm:rounded-2xl border border-gray-200">
                    <div className="px-6 py-5 sm:px-6">
                        <h3 className="text-xl leading-6 font-bold text-gray-900">
                            Upcoming Sessions
                        </h3>
                    </div>
                    <div className="border-t border-gray-200">
                        <div className="px-6 py-5 sm:p-6">
                            {stats.upcomingSessions === 0 ? (
                                <p className="text-gray-500 text-center">No upcoming sessions</p>
                            ) : (
                                <div className="space-y-4">
                                    {/* TODO: Add actual session list */}
                                    <p className="text-gray-500 text-center">Loading sessions...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
    
            {/* Quick Actions */}
            <div className="mt-8">
                <div className="bg-white shadow-xl overflow-hidden sm:rounded-2xl border border-gray-200">
                    <div className="px-6 py-5 sm:px-6">
                        <h3 className="text-xl leading-6 font-bold text-gray-900">
                            Quick Actions
                        </h3>
                    </div>
                    <div className="border-t border-gray-200">
                        <div className="px-6 py-5 sm:p-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Link
                                    href="/home/student/profile"
                                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                >
                                    Edit Profile
                                </Link>
                                <Link
                                    href="/home/student/sessions"
                                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                >
                                    View All Sessions
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}
