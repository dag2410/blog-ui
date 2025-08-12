import { toggleLike } from "@/features/like/likeAsync";
import { calculateReadTime } from "@/utils/readTime";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import EmptyState from "../EmptyState/EmptyState";
import Loading from "../Loading/Loading";
import Pagination from "../Pagination/Pagination";
import PostCard from "../PostCard/PostCard";
import styles from "./PostList.module.scss";
import { toggleBookmark } from "@/features/bookmark/bookmarkAsync";

const PostList = ({
  posts = [],
  loading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPagination = true,
  layout = "grid",
  className,
  ...props
}) => {
  if (loading) {
    return (
      <div className={`${styles.postList} ${className || ""}`} {...props}>
        <Loading size="md" text="Loading posts..." />
      </div>
    );
  }
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.currentUser);

  const handleToggleLike = async (slug) => {
    const post = posts.find((p) => p.slug === slug);
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
  const handleToggleBookmark = async (slug) => {
    const post = posts.find((p) => p.slug === slug);
    if (!post || !user) return;
    try {
      const result = await dispatch(
        toggleBookmark({
          user_id: user?.id,
          post_id: post.id,
        })
      ).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  if (!posts.length) {
    return (
      <div className={`${styles.postList} ${className || ""}`} {...props}>
        <EmptyState
          title="No posts found"
          description="There are no posts available for this topic."
          icon="📝"
        />
      </div>
    );
  }

  return (
    <div className={`${styles.postList} ${className || ""}`} {...props}>
      <div className={`${styles.postsContainer} ${styles[layout]}`}>
        {posts.map((post) => (
          <div key={post.id || post.slug} className={styles.postItem}>
            <PostCard
              title={post.title}
              description={post.description}
              author={{ id: post?.users?.id, name: post?.users?.username }}
              publishedAt={
                post.published_at ? post.published_at : post.createdAt
              }
              readTime={calculateReadTime(post.content)}
              topic={post.topics.map((topic) => topic.name).join(" · ")}
              slug={post.slug}
              featuredImage={post.featuredImage}
              likes={post.likes_count}
              isLiked={
                Array.isArray(post.likes) &&
                post.likes.some((like) => like.user_id === user?.id)
              }
              isBookmarked={post.bookmarks.some(
                (bookmark) => bookmark.user_id === user?.id
              )}
              onBookmark={handleToggleBookmark}
              onLike={handleToggleLike}
            />
          </div>
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

PostList.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      author: PropTypes.shape({
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string,
      }).isRequired,
      publishedAt: PropTypes.string.isRequired,
      readTime: PropTypes.number,
      topic: PropTypes.string,
      slug: PropTypes.string.isRequired,
      featuredImage: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func,
  showPagination: PropTypes.bool,
  layout: PropTypes.oneOf(["grid", "list"]),
  className: PropTypes.string,
};

export default PostList;
