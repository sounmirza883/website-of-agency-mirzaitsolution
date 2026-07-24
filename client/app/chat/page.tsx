import { chatMessages } from "../data";

export default function ChatPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{color:"var(--ink)"}}>Chat with Your Team</h1>
      <p className="text-sm mb-6" style={{color:"var(--ink-soft)"}}>Communicate directly with the Zephtrix team</p>
      <div style={{background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",padding:"20px",maxWidth:"640px"}}>
        <div className="space-y-4 mb-4" style={{maxHeight:"384px",overflow:"auto"}}>
          {chatMessages.map((m) => (
            <div key={m.id} className={`flex ${m.from === "client" ? "justify-end" : "justify-start"}`}>
              <div style={{maxWidth:"300px",borderRadius:"12px",padding:"10px 16px",background:m.from==="client"?"var(--red)":"var(--soft)",color:m.from==="client"?"#fff":"var(--ink)"}}>
                <div className="text-sm">{m.text}</div>
                <div className="text-xs mt-1" style={{color:m.from==="client"?"rgba(255,255,255,.7)":"var(--ink-soft)"}}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2" style={{borderTop:"1px solid var(--line)",paddingTop:"16px"}}>
          <input type="text" placeholder="Type your message..." style={{flex:1,padding:"10px 16px",border:"1px solid var(--line)",borderRadius:"12px",fontSize:"14px",outline:"none",background:"var(--canvas)",color:"var(--ink)"}} />
          <button style={{padding:"10px 20px",background:"var(--red)",color:"#fff",fontSize:"14px",fontWeight:"500",borderRadius:"12px",border:0,cursor:"pointer"}}>Send</button>
        </div>
      </div>
    </div>
  );
}
