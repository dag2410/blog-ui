import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "../Button/Button";
import styles from "./ChatBotWindow.module.scss";
import { useSelector } from "react-redux";
import { createAIChat, getAIChat } from "@/services/chatbotService";

const ChatBotWindow = ({ isOpen = false, onClose, ...props }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const currentUser = useSelector((state) => state.auth.currentUser);

  useEffect(() => {
    const fetchHistory = async () => {
      if (isOpen && currentUser?.id) {
        try {
          const history = await getAIChat(currentUser.id);
          setMessages(history);
        } catch (err) {
          console.error("Lỗi lấy history:", err);
        }
      }
    };
    fetchHistory();
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentUser?.id) return;

    const newMsg = {
      id: Date.now(),
      role: "user",
      content: message.trim(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage("");

    try {
      await createAIChat(currentUser.id, "user", message.trim());
      const history = await getAIChat(currentUser.id);
      setMessages(history);
    } catch (err) {
      console.error("Lỗi gửi message:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.chatBotWindow} {...props}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.botInfo}>
          <span className={styles.botName}>ChatBot</span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.message} ${
              msg.role === "user" ? styles.own : styles.other
            }`}
          >
            <div className={styles.messageContent}>{msg.content}</div>
          </div>
        ))}
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
          disabled={!message?.trim()}
          className={styles.sendButton}
        >
          Gửi
        </Button>
      </form>
    </div>
  );
};

ChatBotWindow.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

export default ChatBotWindow;
