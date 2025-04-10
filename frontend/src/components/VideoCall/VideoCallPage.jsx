// VideoCallPage.jsx - Phần cần điều chỉnh
import React, { useContext, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { useSelector } from "react-redux";

const VideoCallPage = () => {
  const [searchParams] = useSearchParams();
  const callerId = searchParams.get("caller");
  const receiverId = searchParams.get("receiver");

  const { socket } = useContext(AppContext);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnectionRef = useRef(null); // Thêm ref để theo dõi peerConnection
  const pendingCandidatesRef = useRef([]); // Lưu trữ ICE candidates đến trước khi có remote description

  const { user: loggedInUser } = useSelector((state) => state.user);

  const currentUserId = loggedInUser._id;

  // Xác định vai trò: người gọi hoặc người nhận
  const isInitiator = currentUserId === callerId;

  console.log(
    "Role:",
    isInitiator ? "Caller" : "Receiver",
    "CallerId:",
    callerId,
    "ReceiverId:",
    receiverId,
  );

  // Hàm tái kết nối khi gặp lỗi
  const attemptReconnection = () => {
    console.log("Đang thử kết nối lại...");

    // Đóng kết nối hiện tại nếu có
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Thiết lập lại với stream hiện tại
    if (localStream) {
      setupPeerConnection(localStream);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Tạo stream local
    const setupLocalStream = async () => {
      try {
        console.log("Requesting media access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { max: 24 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        console.log("Media access granted");

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log("Local video stream attached to video element");
        }

        if (isMounted) {
          setLocalStream(stream);
          // Khởi tạo WebRTC connection sau khi có local stream
          setupPeerConnection(stream);
        } else {
          // Dọn dẹp nếu component đã unmount
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        alert(
          "Không thể truy cập camera hoặc microphone. Vui lòng cấp quyền và thử lại.",
        );
      }
    };

    setupLocalStream();

    // Thiết lập timeout để tự động tái kết nối nếu không nhận được video trong một khoảng thời gian
    const connectionTimeoutId = setTimeout(() => {
      if (!isConnected && isMounted) {
        // Kiểm tra trạng thái hiện tại trước khi reconnect
        const currentState = peerConnectionRef.current?.iceConnectionState;
        console.log(
          `Kết nối chưa thiết lập sau 15s, trạng thái hiện tại: ${currentState}`,
        );

        // Chỉ reconnect nếu trạng thái không phải đang trong quá trình kết nối
        if (
          currentState !== "checking" &&
          currentState !== "connected" &&
          currentState !== "completed"
        ) {
          attemptReconnection();
        } else {
          console.log("Vẫn đang trong quá trình kết nối, tiếp tục chờ...");
        }
      }
    }, 15000); // Tăng lên 15 giây

    // Cleanup khi component unmount
    return () => {
      isMounted = false;
      clearTimeout(connectionTimeoutId);

      console.log("Component unmounting, cleaning up...");
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
          console.log("Local track stopped:", track.kind);
        });
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        console.log("Peer connection closed");
      }

      // Thông báo rời khỏi cuộc gọi
      socket.current.emit("end-call", { callerId, receiverId });
      console.log("End-call event emitted");

      // Cleanup socket listeners
      socket.current.off("call-offer");
      socket.current.off("call-answer");
      socket.current.off("ice-candidate");
      socket.current.off("call-ended");
      socket.current.off("call-rejected");
      socket.current.off("call-failed");
    };
  }, [callerId, receiverId]);

  const setupPeerConnection = (stream) => {
    console.log("Setting up peer connection...");
    // Khởi tạo RTCPeerConnection với STUN servers
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        {
          urls: ["stun:ss-turn2.xirsys.com"],
        },
        {
          username:
            "bQJrgxpZzRkCZALKQiqQWJXrHvzu4hX8A2o7INLylcqAEhg2U3zjNT2_3bW7t7h6AAAAAGf3zyFkdWNubmM=",
          credential: "3ee9ab74-1614-11f0-a11d-0242ac140004",
          urls: [
            "turn:ss-turn2.xirsys.com:80?transport=udp",
            "turn:ss-turn2.xirsys.com:3478?transport=udp",
            "turn:ss-turn2.xirsys.com:80?transport=tcp",
            "turn:ss-turn2.xirsys.com:3478?transport=tcp",
            "turns:ss-turn2.xirsys.com:443?transport=tcp",
            "turns:ss-turn2.xirsys.com:5349?transport=tcp",
          ],
        },
      ],
      iceTransportPolicy: "all",
      iceCandidatePoolSize: 5,
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
    });

    peerConnectionRef.current = pc; // Lưu lại reference
    pendingCandidatesRef.current = []; // Reset pending candidates

    // Thêm local stream vào peer connection
    stream.getTracks().forEach((track) => {
      console.log("Adding local track to peer connection:", track.kind);
      pc.addTrack(track, stream);
    });

    // Tạo và thiết lập remote stream trước
    const newRemoteStream = new MediaStream();
    setRemoteStream(newRemoteStream);

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = newRemoteStream;
      console.log("Empty remote stream attached to video element");
    }

    // Xử lý khi nhận được remote stream - BUG FIX: cách xử lý ontrack
    pc.ontrack = (event) => {
      console.log("Remote track received:", event.track.kind);

      // Thêm track trực tiếp vào remote stream reference
      if (remoteVideoRef.current) {
        // Đảm bảo chúng ta luôn có một remote stream
        const currentStream =
          remoteVideoRef.current.srcObject || new MediaStream();

        // Kiểm tra xem track này đã tồn tại chưa
        const trackExists = Array.from(currentStream.getTracks()).some(
          (t) => t.id === event.track.id,
        );

        if (!trackExists) {
          currentStream.addTrack(event.track);
          console.log(`${event.track.kind} track added to remote stream`);

          // Đảm bảo video element được cập nhật
          if (remoteVideoRef.current.srcObject !== currentStream) {
            remoteVideoRef.current.srcObject = currentStream;
          }
        }
      }

      // Đăng ký sự kiện để xử lý khi track sẵn sàng
      event.track.onunmute = () => {
        console.log("Track unmuted:", event.track.kind);
        setIsConnected(true); // Đánh dấu đã kết nối khi track sẵn sàng
      };
    };

    // Log ice connection state - cải tiến xử lý trạng thái kết nối
    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
      if (["connected", "completed"].includes(pc.iceConnectionState)) {
        setIsConnected(true);
        console.log("ICE Connected!");
      } else if (pc.iceConnectionState === "disconnected") {
        console.log("ICE Disconnected - waiting to see if it recovers...");
        // Đợi 2 giây để xem liệu kết nối có tự phục hồi không
        setTimeout(() => {
          if (
            peerConnectionRef.current?.iceConnectionState === "disconnected"
          ) {
            console.log("Kết nối vẫn disconnected, thử kết nối lại...");
            attemptReconnection();
          }
        }, 2000);
      } else if (["failed", "closed"].includes(pc.iceConnectionState)) {
        setIsConnected(false);
        console.log("ICE Disconnected or failed!");
        attemptReconnection();
      }
    };

    // Theo dõi quá trình thu thập ICE candidates
    pc.onicegatheringstatechange = () => {
      console.log("ICE gathering state:", pc.iceGatheringState);
      if (pc.iceGatheringState === "complete") {
        console.log("ICE gathering completed");
      }
    };

    // Xử lý ICE candidates - cải tiến xử lý candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(
          "New ICE candidate:",
          event.candidate.type,
          event.candidate.candidate,
        );
        // Gửi ICE candidate đến đối phương
        socket.current.emit("ice-candidate", {
          candidate: event.candidate,
          from: currentUserId,
          to: isInitiator ? receiverId : callerId,
        });
      } else {
        console.log("ICE candidate gathering completed");
      }
    };

    // Log signaling state
    pc.onsignalingstatechange = () => {
      console.log("Signaling state:", pc.signalingState);
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setIsConnected(true);
        console.log("WebRTC Connection established!");
      } else if (
        ["disconnected", "failed", "closed"].includes(pc.connectionState)
      ) {
        setIsConnected(false);
        if (pc.connectionState === "failed") {
          console.log("Connection failed, attempting reconnection...");
          attemptReconnection();
        }
      }
    };

    setPeerConnection(pc);

    // Thiết lập các event listeners cho socket
    setupSocketListeners(pc);

    // Nếu là người gọi, tạo và gửi offer ngay lập tức
    if (isInitiator) {
      console.log("I am the caller, creating offer immediately");
      // Tạo offer ngay lập tức
      initiateOffer(pc);
    }
  };

  const setupSocketListeners = (pc) => {
    // Xóa event listeners cũ để tránh trùng lặp
    socket.current.off("call-offer");
    socket.current.off("call-answer");
    socket.current.off("ice-candidate");

    // Nhận offer từ người gọi và tạo answer
    socket.current.on("call-offer", async ({ offer, from }) => {
      try {
        console.log("Received call offer from:", from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("Remote description set (offer)");

        // Xử lý các candidates chờ đợi
        if (pendingCandidatesRef.current.length > 0) {
          console.log(
            `Processing ${pendingCandidatesRef.current.length} pending candidates`,
          );
          for (const candidate of pendingCandidatesRef.current) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("Pending ICE candidate added");
          }
          pendingCandidatesRef.current = [];
        }

        const answer = await pc.createAnswer();
        console.log("Answer created");
        await pc.setLocalDescription(answer);
        console.log("Local description set (answer)");

        socket.current.emit("call-answer", {
          answer,
          from: currentUserId,
          to: from,
        });
        console.log("Answer sent to:", from);
      } catch (error) {
        console.error("Error handling call offer:", error);
      }
    });

    // Nhận answer từ người nhận
    socket.current.on("call-answer", async ({ answer, from }) => {
      try {
        console.log("Received call answer from:", from);
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("Remote description set (answer)");

        // Xử lý các candidates chờ đợi
        if (pendingCandidatesRef.current.length > 0) {
          console.log(
            `Processing ${pendingCandidatesRef.current.length} pending candidates`,
          );
          for (const candidate of pendingCandidatesRef.current) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("Pending ICE candidate added");
          }
          pendingCandidatesRef.current = [];
        }
      } catch (error) {
        console.error("Error handling call answer:", error);
      }
    });

    // Xử lý ICE candidates từ peer - cải tiến để lưu trữ candidates đến sớm
    socket.current.on("ice-candidate", async ({ candidate, from }) => {
      try {
        console.log("Received ICE candidate from:", from);
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("ICE candidate added successfully");
        } else {
          console.log(
            "Caching ICE candidate for later - no remote description yet",
          );
          pendingCandidatesRef.current.push(candidate);
        }
      } catch (error) {
        console.error("Error adding ice candidate:", error);
      }
    });

    // Xử lý khi cuộc gọi kết thúc
    socket.current.on("call-ended", ({ by }) => {
      console.log("Call ended by:", by);
      alert("Cuộc gọi đã kết thúc");
      window.close(); // Đóng tab khi đối phương kết thúc cuộc gọi
    });

    // Xử lý khi cuộc gọi bị từ chối
    socket.current.on("call-rejected", () => {
      console.log("Call was rejected");
      alert("Cuộc gọi đã bị từ chối");
      window.close();
    });

    // Xử lý khi cuộc gọi thất bại
    socket.current.on("call-failed", ({ message }) => {
      console.log("Call failed:", message);
      alert(`Cuộc gọi thất bại: ${message}`);
      window.close();
    });
  };

  const initiateOffer = async (pc) => {
    try {
      console.log("Creating offer...");
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: true, // Giúp khởi động lại quá trình ICE để cải thiện kết nối
      });
      console.log("Offer created");

      await pc.setLocalDescription(offer);
      console.log("Local description set (offer)");

      socket.current.emit("call-offer", {
        offer,
        from: currentUserId,
        to: receiverId,
      });
      console.log("Offer sent to:", receiverId);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const endCall = () => {
    // Thông báo kết thúc cuộc gọi
    socket.current.emit("end-call", { callerId, receiverId });
    console.log("End call request sent");
    window.close(); // Đóng tab
  };

  // Bật/tắt camera
  const [isCameraOn, setIsCameraOn] = useState(true);
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
        console.log("Camera toggled:", videoTrack.enabled);
      }
    }
  };

  // Bật/tắt microphone
  const [isMicOn, setIsMicOn] = useState(true);
  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        console.log("Microphone toggled:", audioTrack.enabled);
      }
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="flex justify-between items-center w-[400px] p-3 bg-gray-800 shadow-md rounded-lg">
        <h1 className="text-white text-lg font-semibold">📹 Video Call</h1>
        <div className="flex items-center">
          <span
            className={`inline-block w-3 h-3 rounded-full mr-2 ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          <span className="text-white text-sm">
            {isConnected ? "Đã kết nối" : "Đang kết nối..."}
          </span>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative mt-4 w-[800px] h-[450px] bg-black rounded-lg overflow-hidden shadow-lg">
        {/* Remote video */}
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <p className="text-white text-md font-semibold animate-pulse">
              🔄 Đang chờ kết nối...
            </p>
          </div>
        )}

        {/* Local video (Nhỏ góc dưới phải) */}
        <div className="absolute bottom-2 right-2 w-24 h-16 md:w-32 md:h-20 bg-gray-700 rounded-lg overflow-hidden border-2 border-white shadow-lg">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        </div>
      </div>

      {/* Nút điều khiển */}
      <div className="p-3 flex justify-center space-x-4 mt-3">
        <button
          onClick={toggleMic}
          className={`px-4 py-2 rounded-full transition duration-200 text-white shadow ${
            isMicOn
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          {isMicOn ? "🎤 Tắt" : "🔇 Bật"}
        </button>

        <button
          onClick={toggleCamera}
          className={`px-4 py-2 rounded-full transition duration-200 text-white shadow ${
            isCameraOn
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          {isCameraOn ? "📷 Tắt" : "📸 Bật"}
        </button>

        <button
          onClick={endCall}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow transition duration-200"
        >
          ❌
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;
