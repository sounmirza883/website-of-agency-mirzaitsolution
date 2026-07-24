const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchAssignedProjects() {
  await delay(60);
  return [
    { id: 1, name: "Brand Identity – Bright Tech", role: "Graphic Designer", status: "In Progress", deadline: "Aug 15, 2026" },
    { id: 2, name: "Social Media Kit – Green Leaf", role: "Graphic Designer", status: "Completed", deadline: "Jul 20, 2026" },
    { id: 3, name: "Product Video – Prime Media", role: "Video Editor", status: "In Progress", deadline: "Sep 1, 2026" },
    { id: 4, name: "Website UI – NextWave", role: "UI/UX Designer", status: "Pending", deadline: "Sep 20, 2026" },
  ];
}

export async function fetchEmpTasks() {
  await delay(60);
  return [
    { id: 1, project: "Brand Identity", task: "Design Logo Variations", priority: "High", due: "Jul 28, 2026", status: "In Progress" },
    { id: 2, project: "Brand Identity", task: "Create Mood Board", priority: "Medium", due: "Jul 25, 2026", status: "Done" },
    { id: 3, project: "Product Video", task: "Edit Raw Footage", priority: "High", due: "Aug 5, 2026", status: "Pending" },
    { id: 4, project: "Product Video", task: "Add Motion Graphics", priority: "Medium", due: "Aug 10, 2026", status: "Pending" },
    { id: 5, project: "Social Media Kit", task: "Finalize Templates", priority: "Low", due: "Jul 22, 2026", status: "Done" },
  ];
}

export async function fetchEmpFiles() {
  await delay(60);
  return [
    { id: 1, name: "Logo_V1.ai", project: "Brand Identity", size: "4.2 MB", uploaded: "Jul 20, 2026", status: "Approved" },
    { id: 2, name: "Logo_V2.ai", project: "Brand Identity", size: "4.5 MB", uploaded: "Jul 21, 2026", status: "Pending Review" },
    { id: 3, name: "Mood_Board.pdf", project: "Brand Identity", size: "1.8 MB", uploaded: "Jul 22, 2026", status: "Approved" },
    { id: 4, name: "Video_Rough_Cut.mp4", project: "Product Video", size: "120 MB", uploaded: "Jul 23, 2026", status: "Pending Review" },
    { id: 5, name: "Thumbnail_Design.psd", project: "Social Media Kit", size: "8.3 MB", uploaded: "Jul 18, 2026", status: "Approved" },
  ];
}

export async function fetchStatusUpdates() {
  await delay(60);
  return [
    { id: 1, project: "Brand Identity", update: "Completed logo variations and color palette", progress: 65, date: "Jul 22, 2026" },
    { id: 2, project: "Product Video", update: "Finished filming, starting rough cut editing", progress: 35, date: "Jul 23, 2026" },
    { id: 3, project: "Social Media Kit", update: "All templates delivered to client", progress: 100, date: "Jul 20, 2026" },
  ];
}

export async function fetchAttendance() {
  await delay(60);
  return [
    { id: 1, date: "Jul 17, 2026", checkIn: "9:00 AM", checkOut: "5:30 PM", status: "Present" },
    { id: 2, date: "Jul 18, 2026", checkIn: "8:45 AM", checkOut: "5:15 PM", status: "Present" },
    { id: 3, date: "Jul 19, 2026", checkIn: "—", checkOut: "—", status: "Weekend" },
    { id: 4, date: "Jul 20, 2026", checkIn: "9:15 AM", checkOut: "5:00 PM", status: "Present" },
    { id: 5, date: "Jul 21, 2026", checkIn: "—", checkOut: "—", status: "Absent" },
    { id: 6, date: "Jul 22, 2026", checkIn: "8:55 AM", checkOut: "5:30 PM", status: "Present" },
    { id: 7, date: "Jul 23, 2026", checkIn: "9:05 AM", checkOut: "—", status: "Present" },
  ];
}

export async function fetchLeaveRequests() {
  await delay(60);
  return [
    { id: 1, type: "Sick Leave", reason: "Not feeling well", from: "Aug 5, 2026", to: "Aug 6, 2026", status: "Approved" },
    { id: 2, type: "Personal Leave", reason: "Family event", from: "Aug 12, 2026", to: "Aug 12, 2026", status: "Pending" },
    { id: 3, type: "Annual Leave", reason: "Vacation", from: "Sep 10, 2026", to: "Sep 15, 2026", status: "Pending" },
    { id: 4, type: "Sick Leave", reason: "Doctor appointment", from: "Jul 28, 2026", to: "Jul 28, 2026", status: "Approved" },
  ];
}
