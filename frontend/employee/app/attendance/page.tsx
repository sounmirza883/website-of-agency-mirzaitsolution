"use client";

import { useState } from "react";
import { useAttendance, useCheckIn, useCheckOut } from "../hooks";

export default function AttendancePage() {
  const { data: attendance } = useAttendance();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const todayRow = attendance?.find((a) => a.date === today);
  const canCheckIn = !todayRow;
  const canCheckOut = !!todayRow && !todayRow.checkOut;

  async function handleCheckIn() {
    setError("");
    try {
      await checkIn.mutateAsync();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleCheckOut() {
    setError("");
    try {
      await checkOut.mutateAsync();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Attendance</h1>
          <p className="text-sm text-gray-500">Mark and view your attendance</p>
        </div>
        <div className="text-right">
          <div className="flex gap-2">
            <button onClick={handleCheckIn} disabled={!canCheckIn || checkIn.isPending} className="bg-accent-2 text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{checkIn.isPending ? "Checking In…" : "Check In"}</button>
            <button onClick={handleCheckOut} disabled={!canCheckOut || checkOut.isPending} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{checkOut.isPending ? "Checking Out…" : "Check Out"}</button>
          </div>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Date", "Check-In", "Check-Out", "Status"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{attendance?.map((a) => <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{a.date}</td><td className="px-5 py-3 text-gray-600">{a.checkIn}</td><td className="px-5 py-3 text-gray-600">{a.checkOut}</td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${a.status === "Present" ? "bg-green-100 text-green-700" : a.status === "Absent" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{a.status}</span></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
