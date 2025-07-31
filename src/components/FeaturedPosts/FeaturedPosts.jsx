import PropTypes from "prop-types";
import PostCard from "../PostCard/PostCard";
import EmptyState from "../EmptyState/EmptyState";
import Loading from "../Loading/Loading";
import styles from "./FeaturedPosts.module.scss";
import { calculateReadTime } from "@/utils/readTime";
import { useDispatch, useSelector } from "react-redux";
import { createLike, deleteLike } from "@/features/like/likeAsync";

const FeaturedPosts = ({
  posts = [],
  loading = false,
  title = "Featured Posts",
  showTitle = true,
  maxPosts = 3,
  className,
  ...props
}) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.currentUser);

  const handleToggleLike = async (slug, willLike) => {
    const post = posts.find((p) => p.slug === slug);
    if (!post || !user) return;

    const payload = {
      likeable_type: "Post",
      likeable_id: post.id,
      user_id: user.id,
    };

    try {
      if (willLike) {
        await dispatch(createLike(payload)).unwrap();
      } else {
        await dispatch(deleteLike(payload)).unwrap();
      }
      console.log(`Post ${willLike ? "liked" : "unliked"}:`, slug);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleToggleBookmark = async (slug, willBookmark) => {
    // Implement bookmark functionality if needed
    console.log(`Bookmark ${willBookmark ? "added" : "removed"}:`, slug);
  };

  if (loading) {
    return (
      <section
        className={`${styles.featuredPosts} ${className || ""}`}
        {...props}
      >
        {showTitle && <h2 className={styles.title}>{title}</h2>}
        <Loading size="md" text="Loading featured posts..." />
      </section>
    );
  }

  if (!posts.length) {
    return (
      <section
        className={`${styles.featuredPosts} ${className || ""}`}
        {...props}
      >
        {showTitle && <h2 className={styles.title}>{title}</h2>}
        <EmptyState
          title="No featured posts"
          description="There are no featured posts available at the moment."
          icon="⭐"
        />
      </section>
    );
  }

  const displayPosts = posts.slice(0, maxPosts);

  return (
    <section
      className={`${styles.featuredPosts} ${className || ""}`}
      {...props}
    >
      {showTitle && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.postsGrid}>
        {displayPosts.map((post, index) => (
          <div
            key={post.id || post.slug}
            className={`${styles.postItem} ${
              index === 0 ? styles.featured : ""
            }`}
          >
            <PostCard
              title={post.title}
              description={post.description}
              author={{
                name: post.users?.username || post.author?.name,
                avatar: post.users?.avatar || post.author?.avatar,
              }}
              publishedAt={post?.published_at}
              readTime={calculateReadTime(post?.content)}
              topic={post.topics?.map((topic) => topic.name).join(" & ")}
              slug={post?.slug}
              featuredImage={post.featuredImage}
              // Like functionality
              likes={post.likes_count || 0}
              views={post.views_count || 0}
              isLiked={
                Array.isArray(post.likes) &&
                post.likes.some((like) => like.user_id === user?.id)
              }
              isBookmarked={false}
              showInteractions={true}
              showViewCount={true}
              onLike={handleToggleLike}
              onBookmark={handleToggleBookmark}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

FeaturedPosts.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      author: PropTypes.shape({
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string,
      }),
      users: PropTypes.shape({
        username: PropTypes.string,
        avatar: PropTypes.string,
      }),
      publishedAt: PropTypes.string.isRequired,
      published_at: PropTypes.string,
      readTime: PropTypes.number,
      topic: PropTypes.string,
      topics: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
        })
      ),
      slug: PropTypes.string.isRequired,
      featuredImage: PropTypes.string,
      likes_count: PropTypes.number,
      views_count: PropTypes.number,
      likes: PropTypes.arrayOf(
        PropTypes.shape({
          user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        })
      ),
    })
  ),
  loading: PropTypes.bool,
  title: PropTypes.string,
  showTitle: PropTypes.bool,
  maxPosts: PropTypes.number,
  className: PropTypes.string,
};

export default FeaturedPosts;
