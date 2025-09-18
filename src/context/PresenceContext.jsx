// PresenceContext.jsx
import pusher from "@/services/WebSocketService";
import { createContext, useContext, useEffect, useState } from "react";

const PresenceContext = createContext();

export const PresenceProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    const channel = pusher.subscribe("presence-chat");

    channel.bind("pusher:subscription_succeeded", (members) => {
      const onlineMap = {};
      members.each((member) => {
        onlineMap[member.id] = true;
      });
      setOnlineUsers(onlineMap);
    });

    channel.bind("pusher:member_added", (member) => {
      setOnlineUsers((prev) => ({ ...prev, [member.id]: true }));
    });

    channel.bind("pusher:member_removed", (member) => {
      setOnlineUsers((prev) => {
        const copy = { ...prev };
        delete copy[member.id];
        return copy;
      });
    });

    return () => {
      pusher.unsubscribe("presence-chat");
      channel.unbind_all();
    };
  }, []);

  return (
    <PresenceContext.Provider value={{ onlineUsers }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => useContext(PresenceContext);
