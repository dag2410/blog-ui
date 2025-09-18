import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PostCard from "../../components/PostCard/PostCard";
import EmptyState from "../../components/EmptyState/EmptyState";
import Loading from "../../components/Loading/Loading";
import Badge from "../../components/Badge/Badge";
import Button from "../../components/Button/Button";
import styles from "./Bookmarks.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteBookmarkUser,
  getBookmarkByUser,
  toggleBookmark,
} from "@/features/bookmark/bookmarkAsync";
import { toggleLike } from "@/features/like/likeAsync";
import { getCurrentUser } from "@/features/auth/authAsync";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const user = useSelector((state) => state.auth.currentUser);
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUser = async () => {
      await dispatch(getCurrentUser());
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const data = await dispatch(getBookmarkByUser(user.id));
      const bookmarkPost = data.payload.map((b) => ({
        ...b.post,
        bookmarkedAt: b.createdAt,
      }));
      setBookmarks(bookmarkPost);
    };

    fetchBookmarks();
  }, [user?.id, dispatch]);

  const handleToggleBookmark = async (slug) => {
    const post = bookmarks.find((p) => p.slug === slug);
    if (!post || !user) return;
    try {
      const result = await dispatch(
        toggleBookmark({
          user_id: user.id,
          post_id: post.id,
        })
      ).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleLike = async (slug) => {
    const post = bookmarks.find((p) => p.slug === slug);
    if (!post || !user) return;

    const payload = {
      likeable_type: "Post",
      likeable_id: post.id,
    };

    try {
      const result = await dispatch(toggleLike(payload)).unwrap();
      console.log(result);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const availableTopics = [
    ...new Set(
      bookmarks.flatMap(
        (bookmark) => bookmark.topics?.map((topic) => topic.name) || []
      )
    ),
  ].sort();

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch =
      bookmark.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.author?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTopic =
      selectedTopic === "all" ||
      bookmark.topics?.some((topic) => topic.name === selectedTopic);

    return matchesSearch && matchesTopic;
  });

  const handleRemoveBookmark = (bookmarkId) => {
    setBookmarks((prev) =>
      prev.filter((bookmark) => bookmark.id !== bookmarkId)
    );
  };

  const handleClearAllBookmarks = async () => {
    if (window.confirm("Are you sure you want to remove all bookmarks?")) {
      try {
        await dispatch(
          deleteBookmarkUser({
            user_id: user.id,
          })
        ).unwrap();
        setBookmarks([]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>My Bookmarks</h1>
            <p className={styles.subtitle}>
              {bookmarks.length} saved{" "}
              {bookmarks.length === 1 ? "article" : "articles"}
            </p>
          </div>
          {bookmarks.length > 0 && (
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearAllBookmarks}
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {bookmarks.length > 0 && (
          <div className={styles.controls}>
            <div className={styles.searchContainer}>
              <div className={styles.searchInput}>
                <svg
                  className={styles.searchIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M7.333 12.667A5.333 5.333 0 100 7.333a5.333 5.333 0 000 5.334zM14 14l-2.9-2.9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.filterContainer}>
              <label className={styles.filterLabel}>Filter by topic:</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className={styles.topicFilter}
              >
                <option value="all">All Topics</option>
                {availableTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className={styles.content}>
          {filteredBookmarks.length === 0 ? (
            <EmptyState
              title={
                bookmarks.length === 0
                  ? "No bookmarks yet"
                  : searchTerm || selectedTopic !== "all"
                  ? "No bookmarks found"
                  : "No bookmarks"
              }
              description={
                bookmarks.length === 0
                  ? "Start bookmarking articles you want to read later"
                  : "Try adjusting your search terms or filters"
              }
              actionButton={
                bookmarks.length === 0 && (
                  <Link to="/">
                    <Button variant="primary">Explore Articles</Button>
                  </Link>
                )
              }
            />
          ) : (
            <div className={styles.bookmarksGrid}>
              {filteredBookmarks.map((bookmark) => (
                <div key={bookmark.id} className={styles.bookmarkItem}>
                  <PostCard
                    id={post.id}
                    title={bookmark.title}
                    description={bookmark.description}
                    coverImage={bookmark.cover}
                    featuredImage={bookmark.thumbnail}
                    readingTime={ 
                      Math.ceil(
                        bookmark.content
                          .split(/\s+/)
                          .filter((word) => word.length > 0).length
                      ) / 200
                    }
                    publishedAt={bookmark.published_at}
                    slug={bookmark.slug}
                    topic={bookmark?.topics?.map((b) => b.name).join(" · ")}
                    author={{ name: bookmark.users.username }}
                    views={bookmark.views_count}
                    like={bookmark.likes_count}
                    isLiked={bookmark.likes?.some(
                      (like) => like.user_id === user?.id
                    )}
                    isBookmarked={bookmark.bookmarks?.some(
                      (bookmark) => bookmark.user_id === user?.id
                    )}
                    onLike={handleToggleLike}
                    onBookmark={handleToggleBookmark}
                  />
                  <div className={styles.bookmarkMeta}>
                    <div className={styles.bookmarkInfo}>
                      <span className={styles.bookmarkedDate}>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M3 1C2.45 1 2 1.45 2 2V15L8 12L14 15V2C14 1.45 13.55 1 13 1H3Z"
                            fill="currentColor"
                          />
                        </svg>
                        Saved{" "}
                        {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
                      </span>
                      <div className={styles.postStats}>
                        <span className={styles.stat}>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="8"
                              cy="8"
                              r="2"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                          {bookmark.viewsCount}
                        </span>
                        <span className={styles.stat}>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M14 6.5c0 4.8-5.25 7.5-6 7.5s-6-2.7-6-7.5C2 3.8 4.8 1 8 1s6 2.8 6 5.5z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {bookmark.likesCount}
                        </span>
                      </div>
                    </div>
                    <div className={styles.bookmarkActions}>
                      <Link
                        to={`/blog/${bookmark.slug}`}
                        className={styles.actionButton}
                        title="Read article"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M6 12l6-6-6-6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleRemoveBookmark(bookmark.id)}
                        className={`${styles.actionButton} ${styles.removeButton}`}
                        title="Remove bookmark"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M12 4L4 12M4 4l8 8"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredBookmarks.length > 0 && (
          <div className={styles.resultsInfo}>
            <p className={styles.resultsText}>
              Showing {filteredBookmarks.length} of {bookmarks.length} bookmarks
              {selectedTopic !== "all" && (
                <Badge variant="secondary" className={styles.activeTopic}>
                  {selectedTopic}
                  <button
                    onClick={() => setSelectedTopic("all")}
                    className={styles.clearFilter}
                  >
                    ×
                  </button>
                </Badge>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
