import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import FallbackImage from "../FallbackImage/FallbackImage";
import Button from "../Button/Button";
import styles from "./ChatWindow.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConversation,
  createConversations,
  createMessage,
  fetchConversations,
} from "@/features/conversation/conversationAsync";
import pusher from "@/services/WebSocketService";
import { usePresence } from "@/context/PresenceContext";

const ChatWindow = ({
  user,
  isOpen = false,
  onClose,
  onMinimize,
  isMinimized = false,
  ...props
}) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const { current, items, loading } = useSelector(
    (state) => state.conversation
  );
  const currentUser = useSelector((state) => state.auth.currentUser);
  const conversation = useSelector((state) => state.conversation?.items);
  const existingConversation = items.find((conv) =>
    conv.users.some((p) => p?.id === user?.id)
  );
  const { onlineUsers } = usePresence();
  const isOnline = onlineUsers[user?.id];

  useEffect(() => {
    if (isOpen) {
      if (existingConversation) {
        dispatch(fetchConversation(existingConversation.id));
      } else {
        dispatch(
          createConversations({
            participantIds: [+user.id],
          })
        );
      }
    }
  }, [isOpen, existingConversation, user, dispatch]);

  useEffect(() => {
    if (isOpen && !isMinimized && current?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [isOpen, isMinimized, current?.messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!conversation?.length) return;

    conversation.forEach((conv) => {
      const channel = pusher.subscribe(`conversation-${conv.id}`);

      channel.bind("new-message", (data) => {
        dispatch(fetchConversations());

        if (current?.id === conv.id) {
          dispatch(fetchConversation(conv.id));
        }
      });
    });

    return () => {
      conversation.forEach((conv) => {
        pusher.unsubscribe(`conversation-${conv.id}`);
      });
      pusher.unbind_all();
    };
  }, [conversation, dispatch, current?.id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && current) {
      dispatch(
        createMessage({
          conversationId: current.id,
          content: message.trim(),
          type: "text",
        })
      );
      setMessage("");
    }
  };

  const handleOpenInMessages = () => {
    navigate("/messages");
    onClose();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className={styles.minimizedWindow} onClick={() => onMinimize(false)}>
        <FallbackImage
          src={user?.avatar}
          alt={user?.name}
          className={styles.minimizedAvatar}
        />
        <span className={styles.minimizedName}>{user?.name}</span>
      </div>
    );
  }

  return (
    <div className={styles.chatWindow} {...props}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <FallbackImage
            src={user?.avatar}
            alt={user?.name}
            className={styles.avatar}
          />
          <div className={styles.userDetails}>
            <span className={styles.name}>{user?.name}</span>
            <span
              className={`${styles.status} ${
                isOnline ? styles.online : styles.offline
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>{" "}
          </div>
        </div>

        <div className={styles.headerActions}>
          {/* Menu */}
          <div className={styles.menuContainer} ref={menuRef}>
            <button
              className={styles.menuButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="More options"
            >
              ⋮
            </button>
            {isMenuOpen && (
              <div className={styles.menu}>
                <button
                  className={styles.menuItem}
                  onClick={handleOpenInMessages}
                >
                  Mở trong Messages
                </button>
              </div>
            )}
          </div>

          {/* Minimize */}
          <button
            className={styles.minimizeButton}
            onClick={() => onMinimize(true)}
          >
            ─
          </button>

          {/* Close */}
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {current?.messages?.map((msg) => {
          const senderId = msg.senderId || msg.sender?.id;

          const isOwn = String(senderId) === String(currentUser?.id);

          return (
            <div
              key={msg.id}
              className={`${styles.message} ${
                isOwn ? styles.own : styles.other
              }`}
            >
              <div className={styles.messageContent}>
                <p className={styles.messageText}>{msg.content}</p>
                <span className={styles.messageTime}>
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className={styles.inputForm} onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className={styles.input}
        />
        <Button
          type="submit"
          disabled={!message.trim()}
          className={styles.sendButton}
        >
          Gửi
        </Button>
      </form>
    </div>
  );
};

ChatWindow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onMinimize: PropTypes.func.isRequired,
  isMinimized: PropTypes.bool,
};

export default ChatWindow;
