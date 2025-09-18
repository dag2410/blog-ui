import { toggleLike } from "@/features/like/likeAsync";
import { calculateReadTime } from "@/utils/readTime";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import EmptyState from "../EmptyState/EmptyState";
import Loading from "../Loading/Loading";
import PostCard from "../PostCard/PostCard";
import styles from "./FeaturedPosts.module.scss";
import { toggleBookmark } from "@/features/bookmark/bookmarkAsync";

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
          user_id: user.id,
          post_id: post.id,
        })
      ).unwrap();
    } catch (error) {
      console.error(error);
    }
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
              id={post.id}
              title={post.title}
              description={post.description}
              author={{
                id: post.users?.id,
                name: post.users?.username || post.author?.name,
                avatar: post.users?.avatar || post.author?.avatar,
              }}
              publishedAt={post?.published_at}
              readTime={calculateReadTime(post?.content)}
              topic={post.topics?.map((topic) => topic.name).join(" · ")}
              slug={post?.slug}
              featuredImage={post.thumbnail}
              likes={post.likes_count || 0}
              views={post.views_count || 0}
              isLiked={
                Array.isArray(post.likes) &&
                post.likes.some((like) => like.user_id === user?.id)
              }
              isBookmarked={post.bookmarks.some(
                (bookmark) => bookmark.user_id === user?.id
              )}
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
