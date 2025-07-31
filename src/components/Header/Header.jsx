import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navigation from "../Navigation/Navigation";
import Button from "../Button/Button";
import FallbackImage from "../FallbackImage/FallbackImage";
import NotificationDropdown from "../NotificationDropdown/NotificationDropdown";
import styles from "./Header.module.scss";
import { getCurrentUser, postLogOut } from "@/features/auth/authAsync";
import { clearToken, get } from "@/utils/httpRequest";

const Header = () => {
  const dispatch = useDispatch();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const { isLoggedIn, currentUser, isLoading } = useSelector(
    (state) => state.auth
  );
  const unreadCount = notifications.filter((n) => !n.read).length;
  useEffect(() => {
    const fetchUser = async () => {
      try {
        await dispatch(getCurrentUser());
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };

    fetchUser();
  }, []);

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

  const handleMarkAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
                <div ref={notificationRef}>
                  <NotificationDropdown
                    notifications={notifications}
                    unreadCount={unreadCount}
                    isOpen={isNotificationOpen}
                    onToggle={handleNotificationToggle}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
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
                      {currentUser?.last_name}
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
                          to={`/profile/${currentUser?.username || "user"}`}
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
