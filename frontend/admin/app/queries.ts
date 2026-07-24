const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchUsers() {
  await delay(60);
  return [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Editor", status: "Active" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "Viewer", status: "Active" },
    { id: 4, name: "Sarah Lee", email: "sarah@example.com", role: "Editor", status: "Inactive" },
    { id: 5, name: "Tom Brown", email: "tom@example.com", role: "Viewer", status: "Active" },
  ];
}

export async function fetchEmployees() {
  await delay(60);
  return [
    { id: 1, name: "Ali Khan", dept: "Design", position: "Graphic Designer", status: "Active" },
    { id: 2, name: "Fatima Ahmed", dept: "Video", position: "Video Editor", status: "Active" },
    { id: 3, name: "Usman Ali", dept: "Development", position: "Web Developer", status: "Active" },
    { id: 4, name: "Ayesha Malik", dept: "Marketing", position: "Social Media Manager", status: "Inactive" },
    { id: 5, name: "Hassan Raza", dept: "Design", position: "UI/UX Designer", status: "Active" },
  ];
}

export async function fetchClientsList() {
  await delay(60);
  return [
    { id: 1, name: "Bright Tech", email: "info@brighttech.com", company: "Bright Tech Ltd", status: "Active" },
    { id: 2, name: "Green Leaf Co", email: "hello@greenleaf.com", company: "Green Leaf Co", status: "Active" },
    { id: 3, name: "Urban Studio", email: "contact@urbanstudio.com", company: "Urban Studio", status: "Inactive" },
    { id: 4, name: "Prime Media", email: "info@primemedia.com", company: "Prime Media Group", status: "Active" },
    { id: 5, name: "NextWave", email: "hello@nextwave.io", company: "NextWave Inc", status: "Active" },
  ];
}

export async function fetchServices() {
  await delay(60);
  return [
    { id: 1, name: "Graphic Design", price: "$199", duration: "3-5 days" },
    { id: 2, name: "Video Editing", price: "$299", duration: "5-7 days" },
    { id: 3, name: "Motion Graphics", price: "$399", duration: "5-10 days" },
    { id: 4, name: "UI/UX Design", price: "$499", duration: "7-14 days" },
    { id: 5, name: "WordPress Development", price: "$599", duration: "7-14 days" },
    { id: 6, name: "Social Media Marketing", price: "$249", duration: "Ongoing" },
  ];
}

export async function fetchProjects() {
  await delay(60);
  return [
    { id: 1, name: "Brand Identity", client: "Bright Tech", status: "In Progress", deadline: "Aug 15, 2026" },
    { id: 2, name: "Website Redesign", client: "Green Leaf Co", status: "Completed", deadline: "Jul 10, 2026" },
    { id: 3, name: "Social Media Campaign", client: "Prime Media", status: "In Progress", deadline: "Sep 1, 2026" },
    { id: 4, name: "Mobile App UI", client: "NextWave", status: "Pending", deadline: "Sep 20, 2026" },
    { id: 5, name: "Product Video", client: "Bright Tech", status: "Completed", deadline: "Jun 25, 2026" },
  ];
}

export async function fetchInvoices() {
  await delay(60);
  return [
    { id: "INV-001", client: "Bright Tech", amount: "$1,200", status: "Paid", date: "Jul 5, 2026" },
    { id: "INV-002", client: "Green Leaf Co", amount: "$2,500", status: "Unpaid", date: "Jul 12, 2026" },
    { id: "INV-003", client: "Urban Studio", amount: "$800", status: "Overdue", date: "Jun 20, 2026" },
    { id: "INV-004", client: "Prime Media", amount: "$1,800", status: "Paid", date: "Jul 18, 2026" },
    { id: "INV-005", client: "NextWave", amount: "$3,200", status: "Unpaid", date: "Jul 22, 2026" },
  ];
}

export async function fetchNotifications() {
  await delay(60);
  return [
    { id: 1, title: "New Project Created", msg: "Bright Tech started a new project.", date: "2 hours ago" },
    { id: 2, title: "Invoice Paid", msg: "INV-001 has been paid by Bright Tech.", date: "5 hours ago" },
    { id: 3, title: "New Client Registered", msg: "NextWave Inc has registered as a client.", date: "1 day ago" },
    { id: 4, title: "Project Completed", msg: "Website Redesign for Green Leaf Co is done.", date: "2 days ago" },
    { id: 5, title: "Support Ticket Opened", msg: "Urban Studio opened a new support ticket.", date: "3 days ago" },
  ];
}

export async function fetchBlogPosts() {
  await delay(60);
  return [
    { id: 1, title: "Top Design Trends in 2026", author: "Ali Khan", date: "Jul 15, 2026", status: "Published" },
    { id: 2, title: "Why Video Content Matters", author: "Fatima Ahmed", date: "Jul 10, 2026", status: "Published" },
    { id: 3, title: "UI/UX Best Practices", author: "Hassan Raza", date: "Jul 5, 2026", status: "Draft" },
    { id: 4, title: "Social Media Growth Tips", author: "Ayesha Malik", date: "Jun 28, 2026", status: "Published" },
    { id: 5, title: "WordPress vs Custom Dev", author: "Usman Ali", date: "Jun 20, 2026", status: "Draft" },
  ];
}

export async function fetchPortfolioList() {
  await delay(60);
  return [
    { id: 1, title: "Brand Identity Pack", client: "Bright Tech", category: "Graphic Design" },
    { id: 2, title: "Website Redesign", client: "Green Leaf Co", category: "Web Development" },
    { id: 3, title: "Product Launch Video", client: "Prime Media", category: "Video" },
    { id: 4, title: "Mobile App UI", client: "NextWave", category: "UI/UX" },
    { id: 5, title: "Social Media Kit", client: "Urban Studio", category: "Social Media" },
  ];
}
