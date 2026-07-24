import { chatMessages } from "../data";

export default function ChatPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Chat with Your Team</h1>
      <p className="text-sm text-gray-500 mb-6">Communicate directly with the Zephtrix team</p>
      <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-2xl">
        <div className="space-y-4 mb-4 max-h-96 overflow-auto">
          {chatMessages.map((m) => (
            <div key={m.id} className={`flex ${m.from === "client" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-sm rounded-xl px-4 py-2.5 ${m.from === "client" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                <div className="text-sm">{m.text}</div>
                <div className={`text-xs mt-1 ${m.from === "client" ? "text-blue-200" : "text-gray-400"}`}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-gray-200 pt-4">
          <input type="text" placeholder="Type your message..." className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500" />
          <button className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Send</button>
        </div>
      </div>
    </div>
  );
}
