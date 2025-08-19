import { useState, useEffect } from "react";
import { useParams, useNavigate, data } from "react-router-dom";
import AuthorInfo from "../../components/AuthorInfo/AuthorInfo";
import PostList from "../../components/PostList/PostList";
import Button from "../../components/Button/Button";
import Badge from "../../components/Badge/Badge";
import EmptyState from "../../components/EmptyState/EmptyState";
import Loading from "../../components/Loading/Loading";
import FallbackImage from "../../components/FallbackImage/FallbackImage";
import ChatWindow from "../../components/ChatWindow/ChatWindow";

import styles from "./Profile.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "@/features/auth/authAsync";
import { fetchPosts, fetchUserPosts } from "@/features/post/postAsync";
import { fetchUser } from "@/features/user/userAsync";
import {
  fetchFollowers,
  fetchFollowing,
  toggleFollow,
} from "@/features/follow/followAsync";

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const user = useSelector((state) => state.auth.currentUser);
  const followLoading = useSelector((state) => state.follow.isLoading);
  const isFollowing = useSelector((state) =>
    state.follow.following.some((fl) => String(fl.id) === String(id))
  );
  const postsCount = useSelector((state) => state.post.items.counts?.all);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const result = await dispatch(getCurrentUser());
      const currentUser = result.payload;
      const isOwn = String(currentUser?.id) === String(id);
      setIsOwnProfile(isOwn);

      if (currentUser?.id) {
        await dispatch(fetchFollowing(currentUser.id));
        await dispatch(fetchFollowers(currentUser.id));
      }

      if (isOwn) {
        setProfile(currentUser);
      } else {
        const user = await dispatch(fetchUser(id));
        setProfile(user.payload);
      }

      setLoading(false);
    };

    loadProfile();
  }, [id, dispatch]);

  const handleToggleFollow = async () => {
    if (!user?.id) return;
    setProfile((user) => ({
      ...user,
      followers_count: isFollowing
        ? (user.followers_count || 0) - 1
        : (user.followers_count || 0) + 1,
    }));
    await dispatch(toggleFollow({ following: user.id, followed_id: id }));

    await dispatch(fetchFollowing(user.id));
  };

  useEffect(() => {
    const loadPosts = async () => {
      setPostsLoading(true);
      const data = await dispatch(
        fetchUserPosts({ userId: profile.id, page: currentPage })
      );
      const postsData = data.payload.data;

      setPosts(postsData);
      setTotalPages(data.payload.pagination.totalPage);
      setPostsLoading(false);
    };

    if (profile) {
      loadPosts();
    }
  }, [profile, currentPage, activeTab, dispatch]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const handleMessageClick = () => {
    setIsChatOpen(true);
    setIsChatMinimized(false);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    setIsChatMinimized(false);
  };

  const handleChatMinimize = (minimize) => {
    setIsChatMinimized(minimize);
  };

  if (loading) {
    return (
      <div className={styles.profile}>
        <div className="container">
          <Loading size="md" text="Loading profile..." />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.profile}>
        <div className="container">
          <EmptyState
            title="Profile not found"
            description="The user profile you're looking for doesn't exist or has been removed."
            icon="👤"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profile}>
      {/* Cover Section */}
      <div className={styles.coverSection}>
        <div className={styles.coverImage}>
          <FallbackImage src={profile.cover_image} alt="Cover" />
          <div className={styles.coverOverlay}></div>
        </div>

        <div className={styles.profileHeader}>
          <div className="container">
            <div className={styles.headerContent}>
              <div className={styles.avatarSection}>
                <FallbackImage
                  src={profile.avatar}
                  alt={profile.first_name}
                  className={styles.avatar}
                />
                <div className={styles.basicInfo}>
                  <h1 className={styles.name}>
                    {profile.first_name} {profile.last_name}
                  </h1>
                  <p className={styles.username}>@{profile.username}</p>
                  {profile.title && (
                    <p className={styles.title}>{profile.title}</p>
                  )}
                </div>
              </div>

              <div className={styles.actions}>
                {isOwnProfile ? (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => navigate(`/profile/${id}/edit`)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={isFollowing ? "secondary" : "primary"}
                      size="md"
                      onClick={handleToggleFollow}
                      disabled={followLoading}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={handleMessageClick}
                    >
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container">
        <div className={styles.content}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            {/* Bio */}
            {profile.about && (
              <div className={styles.bioCard}>
                <h3>About</h3>
                <p>{profile.about}</p>
              </div>
            )}

            {/* Stats */}
            <div className={styles.statsCard}>
              <h3>Stats</h3>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <strong>{postsCount || 0}</strong>
                  <span>Posts</span>
                </div>
                <div className={styles.stat}>
                  <strong>
                    {profile.followers_count?.toLocaleString() || 0}
                  </strong>
                  <span>Followers</span>
                </div>
                <div className={styles.stat}>
                  <strong>{profile.following_count || 0}</strong>
                  <span>Following</span>
                </div>
                <div className={styles.stat}>
                  <strong>{profile.likes_count?.toLocaleString() || 0}</strong>
                  <span>Likes</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className={styles.skillsCard}>
                <h3>Skills</h3>
                <div className={styles.skills}>
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            {profile.badges && profile.badges.length > 0 && (
              <div className={styles.badgesCard}>
                <h3>Achievements</h3>
                <div className={styles.badges}>
                  {profile.badges.map((badge) => (
                    <div key={badge.name} className={styles.badge}>
                      <span className={styles.badgeIcon}>{badge.icon}</span>
                      <span className={styles.badgeName}>{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className={styles.infoCard}>
              <h3>Info</h3>
              <div className={styles.infoItems}>
                {profile.address && profile.address.trim() && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>📍</span>
                    <span>{profile.address}</span>
                  </div>
                )}
                {profile.website && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>🌐</span>
                    <a
                      href={
                        profile.website.startsWith("http")
                          ? profile.website
                          : `https://${profile.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
                {profile.createdAt && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>📅</span>
                    <span>Joined {formatDate(profile.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            {(profile.github_url || profile.linkedin_url) && (
              <div className={styles.socialCard}>
                <h3>Connect</h3>
                <div className={styles.socialLinks}>
                  {profile.github_url && profile.github_url.trim() && (
                    <a
                      href={
                        profile.github_url.startsWith("http")
                          ? profile.github_url
                          : `https://${profile.github_url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>🐙</span> GitHub
                    </a>
                  )}
                  {profile.linkedin_url && profile.linkedin_url.trim() && (
                    <a
                      href={
                        profile.linkedin_url.startsWith("http")
                          ? profile.linkedin_url
                          : `https://${profile.linkedin_url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>💼</span> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className={styles.main}>
            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${
                  activeTab === "posts" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("posts")}
              >
                Posts ({postsCount || 0})
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "about" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("about")}
              >
                About
              </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {activeTab === "posts" && (
                <div className={styles.postsTab}>
                  <PostList
                    posts={posts}
                    loading={postsLoading}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    layout="grid"
                  />
                </div>
              )}

              {activeTab === "about" && (
                <div className={styles.aboutTab}>
                  <AuthorInfo
                    author={{
                      name: `${profile.first_name} ${profile.last_name}`,
                      title: profile.title,
                      bio: profile.about,
                      avatar: profile.avatar,
                      postsCount: profile.posts_count,
                      followers: profile.followers_count,
                      following: profile.following_count,
                      social: {
                        twitter: profile.twitter_url,
                        github: profile.github_url,
                        linkedin: profile.linkedin_url,
                        website: profile.website_url,
                      },
                    }}
                    showFollowButton={false}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Chat Window */}
      {!isOwnProfile && (
        <ChatWindow
          user={{
            name: `${profile.first_name} ${profile.last_name}`,
            avatar: profile.avatar,
            username: profile.username,
          }}
          isOpen={isChatOpen}
          isMinimized={isChatMinimized}
          onClose={handleChatClose}
          onMinimize={handleChatMinimize}
        />
      )}
    </div>
  );
};

export default Profile;
