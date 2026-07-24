"use client";

import { useClientNotifications } from "../hooks";

export default function NotificationsPage() {
  const { data: notifications } = useClientNotifications();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{color:"var(--ink)"}}>Notifications</h1>
      <p className="text-sm mb-6" style={{color:"var(--ink-soft)"}}>Updates and announcements from your team</p>

      {notifications && notifications.length === 0 ? (
        <div style={{background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",padding:"32px",textAlign:"center"}}>
          <p className="text-sm" style={{color:"var(--ink-soft)"}}>You have no notifications yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notifications?.map((n) => (
            <div key={n.id} style={{background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",padding:"20px"}}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold" style={{color:"var(--ink)"}}>{n.title}</h3>
                <span className="text-xs" style={{color:"var(--ink-soft)"}}>{n.date}</span>
              </div>
              <p className="text-sm mt-2" style={{color:"var(--ink-soft)"}}>{n.msg}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
