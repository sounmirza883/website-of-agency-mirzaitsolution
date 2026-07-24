import { notifications } from "../data";

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Notifications</h1>
      <p className="text-sm text-gray-500 mb-6">Send and view notifications</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Title", "Message", "Date"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{notifications.map((n) => <tr key={n.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{n.title}</td><td className="px-5 py-3 text-gray-600">{n.msg}</td><td className="px-5 py-3 text-gray-500">{n.date}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
