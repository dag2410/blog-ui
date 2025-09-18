import {
  createMessage,
  fetchConversation,
  fetchConversations,
  markRead,
} from "@/features/conversation/conversationAsync";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Button from "../../components/Button/Button";
import FallbackImage from "../../components/FallbackImage/FallbackImage";
import Input from "../../components/Input/Input";
import styles from "./DirectMessages.module.scss";
import pusher from "@/services/WebSocketService";
import { usePresence } from "@/context/PresenceContext";
import { resetUnread } from "@/features/message/messageSlice";

const DirectMessages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const { current } = useSelector((state) => state.conversation);
  const conversation = useSelector((state) => state.conversation?.items);
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const currentMessages = current?.messages || [];
  const { onlineUsers } = usePresence();

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (!conversation?.length) return;

    conversation.forEach((conv) => {
      const channel = pusher.subscribe(`conversation-${conv.id}`);
      channel.bind("new-message", () => {
        dispatch(fetchConversations());
      });
    });

    return () => {
      conversation.forEach((conv) => {
        pusher.unsubscribe(`conversation-${conv.id}`);
        pusher.unbind_all();
      });
    };
  }, [conversation, dispatch]);

  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId) {
      const foundConversation = conversation?.find(
        (conv) => conv.id.toString() === conversationId
      );
      if (foundConversation) {
        setSelectedConversation(foundConversation);
      }
      dispatch(fetchConversation(conversationId));
    }
  }, [searchParams, dispatch, conversation]);

  useEffect(() => {
    const convId = searchParams.get("conversation");
    if (convId) {
      dispatch(resetUnread(convId));
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages.length, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setSearchParams({ conversation: conversation.id.toString() });
    dispatch(resetUnread(conversation.id));

    const lastMessage =
      conversation.messages?.[conversation.messages.length - 1];
    if (
      lastMessage &&
      !lastMessage.read_at &&
      lastMessage.user_id !== currentUser.id
    ) {
      dispatch(markRead(conversation.id)).then(() => {
        dispatch(fetchConversation(conversation.id));
        dispatch(fetchConversations());
      });
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !current) return;

    dispatch(
      createMessage({
        conversationId: current.id,
        content: newMessage.trim(),
        type: "text",
      })
    );
    dispatch(fetchConversation(conversation.id));

    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date?.toLocaleDateString();
  };

  const getOpponent = (conv, currentUser) => {
    if (!conv?.users) return null;
    return conv.users.find((u) => u.id !== currentUser.id);
  };

  const filteredConversations = conversation?.filter((conv) => {
    const opponent = getOpponent(conv, currentUser);
    if (!opponent?.username) return false;
    return opponent.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* Conversations Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h1 className={styles.title}>Messages</h1>
            <Button
              variant="ghost"
              size="sm"
              className={styles.newMessageButton}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </Button>
          </div>

          <div className={styles.searchSection}>
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.conversationsList}>
            {filteredConversations?.map((conv) => {
              const lastMessage = conv.messages?.[conv.messages.length - 1];
              const shouldBold =
                lastMessage &&
                !lastMessage.read_at &&
                lastMessage.user_id !== currentUser.id;

              const opponent = getOpponent(conv, currentUser);

              return (
                <div
                  key={conv.id}
                  className={`${styles.conversationItem} ${
                    selectedConversation?.id === conv.id ? styles.selected : ""
                  }`}
                  onClick={() => handleConversationSelect(conv)}
                >
                  <div className={styles.avatarContainer}>
                    <FallbackImage
                      src={opponent?.avatar}
                      alt={opponent?.name}
                      className={styles.avatar}
                    />
                    {onlineUsers[opponent?.id] && (
                      <div className={styles.onlineIndicator} />
                    )}
                  </div>

                  <div className={styles.conversationContent}>
                    <div className={styles.conversationHeader}>
                      <span className={styles.participantName}>
                        {getOpponent(conv, currentUser)?.username}
                      </span>

                      <span className={styles.timestamp}>
                        {conv.messages?.length > 0
                          ? formatTime(
                              new Date(
                                conv.messages[
                                  conv.messages.length - 1
                                ].createdAt
                              )
                            )
                          : ""}
                      </span>
                    </div>
                    <div className={styles.lastMessage}>
                      <span
                        className={`${styles.messageText} ${
                          shouldBold ? styles.unread : ""
                        }`}
                      >
                        {conv.messages?.length > 0 ? (
                          <>
                            {conv.messages[conv.messages.length - 1].user_id ===
                            currentUser.id
                              ? `Bạn: ${
                                  conv.messages[conv.messages.length - 1]
                                    .content
                                }`
                              : ` ${
                                  conv.messages[conv.messages.length - 1]
                                    .content
                                }`}
                          </>
                        ) : (
                          "No messages yet"
                        )}
                      </span>

                      {conv.unreadCount > 0 && (
                        <span className={styles.unreadBadge}>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Messages Area */}
        <div className={styles.messagesArea}>
          {selectedConversation ? (
            <>
              {/* Messages Header */}
              <div className={styles.messagesHeader}>
                <div className={styles.participantInfo}>
                  <div className={styles.avatarContainer}>
                    <FallbackImage
                      src={getOpponent(current, currentUser)?.avatar}
                      alt={getOpponent(current, currentUser)?.name}
                      className={styles.avatar}
                    />
                    {onlineUsers[getOpponent(current, currentUser)?.id] && (
                      <div className={styles.onlineIndicator} />
                    )}
                  </div>

                  <div>
                    <h2 className={styles.participantName}>
                      {getOpponent(current, currentUser)?.username}
                    </h2>
                    <span className={styles.participantStatus}>
                      {onlineUsers[getOpponent(current, currentUser)?.id]
                        ? "Online"
                        : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Thread */}
              <div className={styles.messagesThread}>
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.message} ${
                      message.user_id === currentUser.id
                        ? styles.sent
                        : styles.received
                    }`}
                  >
                    <div className={styles.messageContent}>
                      <span className={styles.messageText}>
                        {message.content}
                      </span>
                      <span className={styles.messageTime}>
                        {formatTime(new Date(message.createdAt))}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className={styles.messageInputContainer}>
                <div className={styles.messageInputWrapper}>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message to ${
                      getOpponent(current, currentUser)?.username || "user"
                    }...`}
                    className={styles.messageInput}
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={styles.sendButton}
                    size="sm"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateContent}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={styles.emptyIcon}
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <h3 className={styles.emptyTitle}>Select a conversation</h3>
                <p className={styles.emptyDescription}>
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectMessages;
