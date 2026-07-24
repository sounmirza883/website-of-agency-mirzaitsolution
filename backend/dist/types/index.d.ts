export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
}
export interface Employee {
    id: number;
    name: string;
    dept: string;
    position: string;
    status: string;
}
export interface Client {
    id: number;
    name: string;
    email: string;
    company: string;
    status: string;
}
export interface Service {
    id: number;
    name: string;
    price: string;
    duration: string;
}
export interface Project {
    id: number;
    name: string;
    client: string;
    status: string;
    deadline: string;
}
export interface Invoice {
    id: string;
    client: string;
    amount: string;
    status: string;
    date: string;
}
export interface Notification {
    id: number;
    title: string;
    msg: string;
    date: string;
}
export interface BlogPost {
    id: number;
    title: string;
    author: string;
    date: string;
    status: string;
}
export interface PortfolioItem {
    id: number;
    title: string;
    client: string;
    category: string;
}
export interface AssignedProject {
    id: number;
    name: string;
    role: string;
    status: string;
    deadline: string;
}
export interface Task {
    id: number;
    project: string;
    task: string;
    priority: string;
    due: string;
    status: string;
}
export interface EmployeeFile {
    id: number;
    name: string;
    project: string;
    size: string;
    uploaded: string;
    status: string;
}
export interface StatusUpdate {
    id: number;
    project: string;
    update: string;
    progress: number;
    date: string;
}
export interface Attendance {
    id: number;
    date: string;
    checkIn: string;
    checkOut: string;
    status: string;
}
export interface LeaveRequest {
    id: number;
    type: string;
    reason: string;
    from: string;
    to: string;
    status: string;
}
export interface ClientProject {
    id: number;
    name: string;
    status: string;
    deadline: string;
    progress: number;
}
export interface Milestone {
    id: number;
    project: string;
    task: string;
    status: string;
    date: string;
}
export interface ClientFile {
    id: number;
    name: string;
    project: string;
    size: string;
    uploaded: string;
}
export interface ClientInvoice {
    id: string;
    project: string;
    amount: string;
    status: string;
    due: string;
}
export interface Ticket {
    id: string;
    subject: string;
    status: string;
    priority: string;
    updated: string;
}
export interface Message {
    id: number;
    from: string;
    text: string;
    time: string;
}
export interface WebsiteService {
    title: string;
    icon: string;
    description: string;
}
export interface WebsitePortfolio {
    title: string;
    category: string;
    slug: string;
    icon: string;
}
export interface ServiceDetail {
    title: string;
    description: string;
    features: string[];
    className: string;
}
