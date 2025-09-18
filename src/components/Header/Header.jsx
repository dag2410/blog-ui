import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navigation from "../Navigation/Navigation";
import Button from "../Button/Button";
import FallbackImage from "../FallbackImage/FallbackImage";
import NotificationDropdown from "../NotificationDropdown/NotificationDropdown";
import styles from "./Header.module.scss";
import { getCurrentUser, postLogOut } from "@/features/auth/authAsync";
import { clearToken } from "@/utils/httpRequest";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/features/notification/notificationAsync";
import pusher from "@/services/WebSocketService";
import { FiMessageSquare } from "react-icons/fi";
import { Badge } from "..";
import { incrementUnread } from "@/features/message/messageSlice";

const Header = () => {
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const conversations = useSelector((state) => state.conversation?.items);
  const { totalUnread } = useSelector((state) => state.message);

  const { isLoggedIn, currentUser, isLoading } = useSelector(
    (state) => state.auth
  );

  const isNotificationRead = (notification) => {
    const receiver = notification.receivers?.find(
      (r) => r.id === currentUser?.id
    );
    return (
      receiver?.user_notification?.read_at !== null &&
      receiver?.user_notification?.read_at !== undefined
    );
  };

  const unreadCount =
    notifications?.filter((n) => !isNotificationRead(n)).length || 0;

  useEffect(() => {
    const fetchNotification = async () => {
      if (currentUser?.id) {
        try {
          const data = await dispatch(
            fetchNotifications({ userId: currentUser.id })
          );
          0;

          setNotifications(data.payload || []);
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
          setNotifications([]);
        }
      }
    };
    fetchNotification();
  }, [dispatch, isLoggedIn, currentUser?.id]);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    const channel = pusher.subscribe(`user-${currentUser.id}`);
    channel.bind("new-notification", (data) => {
      dispatch(fetchNotifications({ userId: currentUser.id }))
        .unwrap()
        .then((list) => setNotifications(list))
        .catch(() => {});
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`user-${currentUser.id}`);
    };
  }, [currentUser?.id]);
  useEffect(() => {
    if (!conversations || !currentUser?.id) return;

    conversations.forEach((conv) => {
      const channel = pusher.subscribe(`conversation-${conv.id}`);
      channel.bind("new-message", (data) => {
        if (data.message.user_id !== currentUser.id) {
          dispatch(incrementUnread(conv.id));
        }
      });
    });

    return () => {
      conversations.forEach((conv) => {
        const channel = pusher.channel(`conversation-${conv.id}`);
        if (channel) {
          channel.unbind_all();
          pusher.unsubscribe(`conversation-${conv.id}`);
        }
      });
    };
  }, [conversations, currentUser?.id]);

  const handleLogout = async () => {
    try {
      await dispatch(postLogOut());
    } catch (error) {
      console.log(error);
    } finally {
      clearToken();
      setIsDropdownOpen(false);
      setIsNotificationOpen(false);
      window.location.href = "/";
    }
  };

  const handleNotificationToggle = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsDropdownOpen(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markNotificationAsRead(notificationId));
      // Update state để reflect read status
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.id === notificationId) {
            const updatedReceivers = n.receivers?.map((receiver) => {
              if (receiver.id === currentUser?.id) {
                return {
                  ...receiver,
                  user_notification: {
                    ...receiver.user_notification,
                    read_at: new Date().toISOString(),
                  },
                };
              }
              return receiver;
            });
            return { ...n, receivers: updatedReceivers };
          }
          return n;
        })
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead());
      setNotifications((prev) =>
        prev.map((n) => {
          const updatedReceivers = n.receivers?.map((receiver) => {
            if (receiver.id === currentUser?.id) {
              return {
                ...receiver,
                user_notification: {
                  ...receiver.user_notification,
                  read_at: new Date().toISOString(),
                },
              };
            }
            return receiver;
          });
          return { ...n, receivers: updatedReceivers };
        })
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.brand}>
            <Link to="/" className={styles.brandLink}>
              <div className={styles.logo}>
                <div className={styles.logoIcon}>
                  <span className={styles.logoText}>B</span>
                </div>
                <h1 className={styles.brandTitle}>BlogUI</h1>
              </div>
            </Link>
          </div>

          <div className={styles.nav}>
            <Navigation />
          </div>

          <div className={styles.actions}>
            {isLoggedIn && currentUser ? (
              <>
                <Link to="/messages" className={styles.messageIcon}>
                  <FiMessageSquare size={22} />
                  {totalUnread > 0 && (
                    <Badge
                      variant="error"
                      size="sm"
                      className={styles.badge}
                      aria-label={`${totalUnread} unread messages`}
                    >
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </Badge>
                  )}
                </Link>

                <div ref={notificationRef}>
                  <NotificationDropdown
                    notifications={notifications}
                    unreadCount={unreadCount}
                    isOpen={isNotificationOpen}
                    onToggle={handleNotificationToggle}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    currentUserId={currentUser?.id}
                  />
                </div>

                <div className={styles.userMenu} ref={dropdownRef}>
                  <button
                    className={styles.userButton}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    <FallbackImage
                      src={currentUser?.avatar}
                      alt={currentUser?.last_name}
                      className={styles.userAvatar}
                    />
                    <span className={styles.userName}>
                      {currentUser?.username}
                    </span>
                    <svg
                      className={`${styles.chevron} ${
                        isDropdownOpen ? styles.chevronOpen : ""
                      }`}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownHeader}>
                        <div className={styles.dropdownUserInfo}>
                          <div className={styles.dropdownUserName}>
                            {currentUser?.username}
                          </div>
                          <div className={styles.dropdownUserEmail}>
                            {currentUser?.email}
                          </div>
                          <div className={styles.dropdownUserRole}>
                            {currentUser?.github_url}
                          </div>
                        </div>
                      </div>
                      <nav className={styles.dropdownNav}>
                        <Link
                          to={`/profile/${currentUser?.id || "user"}`}
                          className={styles.dropdownItem}
                        >
                          Profile
                        </Link>
                        <Link to="/my-posts" className={styles.dropdownItem}>
                          My Posts
                        </Link>
                        <Link to="/write" className={styles.dropdownItem}>
                          Write Post
                        </Link>
                        <Link to="/bookmarks" className={styles.dropdownItem}>
                          Bookmarks
                        </Link>
                        <Link to="/settings" className={styles.dropdownItem}>
                          Settings
                        </Link>
                      </nav>
                      <button
                        className={`${styles.dropdownItem} ${styles.logout}`}
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.authActions}>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="primary" size="sm" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          <button
            className={styles.mobileMenuToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            <span className={isMobileMenuOpen ? styles.active : ""}></span>
            <span className={isMobileMenuOpen ? styles.active : ""}></span>
            <span className={isMobileMenuOpen ? styles.active : ""}></span>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <Navigation />
            {!isLoggedIn || !currentUser ? (
              <div className={styles.mobileAuth}>
                <Button variant="ghost" size="md" fullWidth asChild>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button variant="primary" size="md" fullWidth asChild>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </Button>
              </div>
            ) : (
              <div className={styles.mobileUserMenu}>
                <div className={styles.mobileUserInfo}>
                  <FallbackImage
                    src={currentUser?.avatar}
                    alt={currentUser?.username}
                    className={styles.mobileUserAvatar}
                  />
                  <div>
                    <div className={styles.mobileUserName}>
                      {currentUser?.last_name}
                    </div>
                    <div className={styles.mobileUserEmail}>
                      {currentUser?.email}
                    </div>
                  </div>
                </div>
                <nav className={styles.mobileUserNav}>
                  <Link
                    to={`/profile/${currentUser?.username || "user"}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-posts"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Posts
                  </Link>
                  <Link to="/write" onClick={() => setIsMobileMenuOpen(false)}>
                    Write Post
                  </Link>
                  <Link
                    to="/bookmarks"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Bookmarks
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button onClick={handleLogout}>Logout</button>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
