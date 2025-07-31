import PropTypes from "prop-types";
import PostCard from "../PostCard/PostCard";
import EmptyState from "../EmptyState/EmptyState";
import styles from "./RelatedPosts.module.scss";
import { calculateReadTime } from "@/utils/readTime";
import { useDispatch, useSelector } from "react-redux";
import { createLike, deleteLike } from "@/features/like/likeAsync";

const RelatedPosts = ({
  posts = [],
  loading = false,
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

  const displayPosts = posts.slice(0, maxPosts);

  if (loading) {
    return (
      <section
        className={`${styles.relatedPosts} ${className || ""}`}
        {...props}
      >
        <h2 className={styles.title}>Related Posts</h2>
        <div className={styles.grid}>
          {Array.from({ length: maxPosts }, (_, index) => (
            <PostCard key={index} loading />
          ))}
        </div>
      </section>
    );
  }

  if (displayPosts.length === 0) {
    return (
      <section
        className={`${styles.relatedPosts} ${className || ""}`}
        {...props}
      >
        <h2 className={styles.title}>Related Posts</h2>
        <EmptyState
          icon="📰"
          title="No related posts"
          description="Check back later for more content on this topic."
        />
      </section>
    );
  }

  return (
    <section className={`${styles.relatedPosts} ${className || ""}`} {...props}>
      <h2 className={styles.title}>Related Posts</h2>
      <div className={styles.grid}>
        {displayPosts.map((post) => (
          <PostCard
            key={post.id}
            title={post.title}
            description={post.description}
            author={{
              name: post.users?.username || post.author?.name,
              avatar: post.users?.avatar || post.author?.avatar,
            }}
            publishedAt={post.published_at || post.publishedAt || ""}
            readTime={calculateReadTime(post.content)}
            topic={post.topics?.map((topic) => topic.name).join(" & ")}
            slug={post.slug}
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
        ))}
      </div>
    </section>
  );
};

RelatedPosts.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      excerpt: PropTypes.string,
      featuredImage: PropTypes.string,
      author: PropTypes.shape({
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string,
      }),
      publishedAt: PropTypes.string.isRequired,
      readTime: PropTypes.number,
      topic: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  maxPosts: PropTypes.number,
  className: PropTypes.string,
};

export default RelatedPosts;
