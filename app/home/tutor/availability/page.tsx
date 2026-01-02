"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import EventCalender from "@/components/EventCalender";
import Selectable from "@/components/EventCalender";
import { momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
type ApiSlot = { dayOfWeek: number; start: string; end: string };

const DAYS = [
  { label: "Mon", idx: 1 },
  { label: "Tue", idx: 2 },
  { label: "Wed", idx: 3 },
  { label: "Thu", idx: 4 },
  { label: "Fri", idx: 5 },
  { label: "Sat", idx: 6 },
  { label: "Sun", idx: 0 },
];

function generateTimes(start = 7, end = 22, stepMinutes = 30) {
  const out: string[] = [];
  for (let h = start; h <= end; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      if (h === end && m > 0) break;
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      out.push(`${hh}:${mm}`);
    }
  }
  return out; // inclusive start, exclusive end in grouping logic
}

const TIMES = generateTimes(7, 22, 30);

function addMinutes(t: string, minutes: number) {
  const [h, m] = t.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export default function TutorAvailability() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [timezone, setTimezone] = useState<string>('UTC');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  // (UI was simplified; week offset removed)

  // Range helper for batch apply
  const [rangeStart, setRangeStart] = useState<string>('09:00');
  const [rangeEnd, setRangeEnd] = useState<string>('17:00');

  const ALLOWED_TZS: { value: string; label: string }[] = [
    { value: 'America/New_York', label: 'ET (Eastern)' },
    { value: 'America/Chicago', label: 'CT (Central)' },
    { value: 'America/Denver', label: 'MT (Mountain)' },
    { value: 'America/Los_Angeles', label: 'PT (Pacific)' },
    { value: 'UTC', label: 'UTC' },
  ];

  function mapSystemTzToAllowed(sysTz: string | undefined): string {
    const s = sysTz || '';
    const map: { re: RegExp; target: string }[] = [
      { re: /^America\/(New_York|Toronto|Detroit|Montreal|Nassau|Indiana|Kentucky|Louisville)/, target: 'America/New_York' },
      { re: /^America\/(Chicago|Winnipeg|Mexico_City|Guatemala|Belize)/, target: 'America/Chicago' },
      { re: /^America\/(Denver|Phoenix|Edmonton)/, target: 'America/Denver' },
      { re: /^America\/(Los_Angeles|Vancouver|Tijuana)/, target: 'America/Los_Angeles' },
    ];
    for (const m of map) if (m.re.test(s)) return m.target;
    return 'UTC';
  }

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          setLoading(false);
          return;
        }
        setEmail(user.email);
        const res = await fetch(`/api/tutor-availability/get?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          const savedTz: string | undefined = data.timezone;
          const allowedValues = ALLOWED_TZS.map(t => t.value);
          if (savedTz && allowedValues.includes(savedTz)) {
            setTimezone(savedTz);
          } else {
            setTimezone(mapSystemTzToAllowed(Intl.DateTimeFormat().resolvedOptions().timeZone));
          }
          // Mark all 30-min slots covered by intervals as selected
          const next = new Set<string>();
          (data.slots as ApiSlot[]).forEach((s) => {
            let t = s.start;
            while (t < s.end) {
              next.add(`${s.dayOfWeek}-${t}`);
              t = addMinutes(t, 30);
            }
          });
          setSelected(next);
        } else {
          setTimezone(mapSystemTzToAllowed(Intl.DateTimeFormat().resolvedOptions().timeZone));
        }
      } catch (e) {
        setTimezone(mapSystemTzToAllowed(Intl.DateTimeFormat().resolvedOptions().timeZone));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const toggleCell = (dayIdx: number, time: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      const key = `${dayIdx}-${time}`;
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleDayAll = (dayIdx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      const allSelected = TIMES.every(t => next.has(`${dayIdx}-${t}`));
      TIMES.forEach(t => {
        const k = `${dayIdx}-${t}`;
        if (allSelected) next.delete(k); else next.add(k);
      });
      return next;
    });
  };

  const applyRangeAllDays = () => {
    if (rangeEnd <= rangeStart) return;
    setSelected(prev => {
      const next = new Set(prev);
      DAYS.forEach(({ idx }) => {
        let t = rangeStart;
        while (t < rangeEnd) {
          next.add(`${idx}-${t}`);
          t = addMinutes(t, 30);
        }
      });
      return next;
    });
  };

  const clearAll = () => setSelected(new Set());

  function buildIntervals(): ApiSlot[] {
    // For each day, merge contiguous 30-min slots
    const out: ApiSlot[] = [];
    DAYS.forEach(({ idx }) => {
      const times = TIMES.filter(t => selected.has(`${idx}-${t}`));
      if (!times.length) return;
      // iterate groups
      let groupStart: string | null = null;
      let prev: string | null = null;
      const flush = () => {
        if (groupStart && prev) {
          out.push({ dayOfWeek: idx, start: groupStart, end: addMinutes(prev, 30) });
        }
        groupStart = null;
        prev = null;
      };
      for (const t of times) {
        if (!groupStart) {
          groupStart = t;
          prev = t;
        } else {
          // check continuity with prev
          const nextOfPrev = addMinutes(prev!, 30);
          if (t === nextOfPrev) {
            prev = t;
          } else {
            flush();
            groupStart = t;
            prev = t;
          }
        }
      }
      flush();
    });
    return out;
  }

  const save = async () => {
    try {
      setSaving(true);
      const slots = buildIntervals();
      const res = await fetch('/api/tutor-availability/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: email, timezone, slots }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }
      setMessage('Availability saved');
      setTimeout(() => setMessage(''), 2500);
    } catch (e: any) {
      setMessage('Error saving availability');
      setTimeout(() => setMessage(''), 3500);
    } finally {
      setSaving(false);
    }
  };

  const reload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tutor-availability/get?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setTimezone(data.timezone || timezone);
        const next = new Set<string>();
        (data.slots as ApiSlot[]).forEach((s) => {
          let t = s.start;
          while (t < s.end) {
            next.add(`${s.dayOfWeek}-${t}`);
            t = addMinutes(t, 30);
          }
        });
        setSelected(next);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-white/90">Loading availability…</div>
      </div>
    );
  }

  // Simplified UI: no week date header
const localizer = momentLocalizer(moment)
  return (
    <>
      <Selectable localizer={localizer} />
    </>

  );
}
