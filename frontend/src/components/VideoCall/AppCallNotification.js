import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import CallNotification from "./VideoCallNotification";

const AppCallNotification = () => {
  const { socket } = useContext(AppContext);
  const [incomingCall, setIncomingCall] = useState(null);
  useEffect(() => {
    if (!socket.current) return;
    // Lắng nghe sự kiện có cuộc gọi đến
    socket.current.on("incoming-call", ({ callerId }) => {
      setIncomingCall(callerId);
    });

    return () => {
      socket.current.off("incoming-call");
    };
  }, [socket]);

  return (
    incomingCall && (
      <CallNotification
        callerId={incomingCall}
        onReject={() => setIncomingCall(null)}
      />
    )
  );
};

export default AppCallNotification;
