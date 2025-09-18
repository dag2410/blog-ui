import {
  createComment,
  deleteComment,
  fetchComments,
  updateComment,
} from "@/features/comment/commentAsync";
import { toggleLike } from "@/features/like/likeAsync";
import { fetchPost, fetchRelatedPosts } from "@/features/post/postAsync";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  AuthorInfo,
  BlogContent,
  CommentSection,
  Loading,
  RelatedPosts,
} from "../../components";
import styles from "./BlogDetail.module.scss";
import { toggleBookmark } from "@/features/bookmark/bookmarkAsync";
import pusher from "@/services/WebSocketService";

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likedComments, setLikedComments] = useState({});
  const [likingInProgress, setLikingInProgress] = useState(false);
  const [bookmarkingInProgress, setBookmarkingInProgress] = useState(false);
  const [commentEdit, setCommentEdit] = useState([]);

  const dispatch = useDispatch();
  const post = useSelector((state) => state.post?.selected);
  const user = useSelector((state) => state?.auth?.currentUser);
  const relatedPosts = useSelector((state) => state.post?.relatedPosts);
  const comments = useSelector((state) => state.comment.items || []);
  const commentsLoading = useSelector((state) => state.comment?.loading);
  const bookmarks = useSelector((state) => state.post?.selected?.bookmarks);
  const isBookmarked = bookmarks?.some((b) => b.user_id === user?.id);
  const isPublished = post?.status === "published";

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      try {
        await dispatch(fetchPost(slug));
      } catch (error) {
        console.error("Failed to load post:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, dispatch]);

  useEffect(() => {
    if (post?.topics?.length > 0) {
      const loadRelatedPosts = async () => {
        try {
          const topicId =
            post.topics[Math.floor(Math.random() * post.topics.length)].id;
          const excludeSlug = post.slug;
          await dispatch(fetchRelatedPosts({ topicId, excludeSlug }));
        } catch (error) {
          console.error("Failed to load related posts:", error);
        }
      };
      loadRelatedPosts();
    }
  }, [post, dispatch]);

  useEffect(() => {
    if (post?.id) {
      dispatch(fetchComments({ postId: post.id }));
    }
  }, [post, dispatch]);

  useEffect(() => {
    if (!post || !user) return;
    const liked =
      Array.isArray(post.likes) &&
      post.likes.some((like) => like.user_id === user.id);
    setIsLiked(liked);
  }, [post, user]);

  useEffect(() => {
    if (!post?.id) return;

    const postChannel = pusher.subscribe(`post-${post.id}`);

    postChannel.bind("like-updated", (data) => {
      if (data.likeable_type === "Post") {
        dispatch(fetchPost(slug));
      }
    });

    ["new-comment", "update-comment"].forEach((event) => {
      postChannel.bind(event, () => {
        dispatch(fetchComments({ postId: post.id }));
      });
    });

    postChannel.bind("delete-comment", (data) => {
      dispatch(deleteComment.fulfilled(data.comment_id));
    });

    comments.forEach((c) => {
      const commentChannel = pusher.subscribe(`comment-${c.id}`);
      commentChannel.bind("like-updated", (data) => {
        if (data.likeable_type === "Comment") {
          dispatch(fetchComments({ postId: post.id }));
        }
      });
    });

    return () => {
      pusher.unsubscribe(`post-${post.id}`);
      comments.forEach((c) => {
        pusher.unsubscribe(`comment-${c.id}`);
      });
    };
  }, [post?.id, comments, dispatch, slug]);

  const handleAddComment = async (content) => {
    if (!isPublished || !post?.id) return;
    try {
      const commentData = {
        post_id: post.id,
        content,
        user_id: user.id,
      };
      await dispatch(createComment(commentData));
      await dispatch(fetchComments({ postId: post.id }));
      await dispatch(fetchPost(slug));
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleReplyComment = async (parentId, content) => {
    if (!isPublished || !post?.id) return;
    try {
      const replyData = {
        post_id: post.id,
        parent_id: parentId,
        content,
        user_id: user.id,
      };
      await dispatch(createComment(replyData));
      await dispatch(fetchComments({ postId: post.id }));
    } catch (error) {
      console.error("Failed to add reply:", error);
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    if (!isPublished) return;
    try {
      await dispatch(
        updateComment({
          id: commentId,
          data: { content: newContent },
        })
      );
      dispatch(fetchComments({ postId: post.id }));
    } catch (error) {
      console.error("Failed to edit comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isPublished) return;
    try {
      await dispatch(deleteComment(commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (likingInProgress || !user || !commentId || !isPublished) return;
    setLikingInProgress(true);
    try {
      const result = await dispatch(
        toggleLike({ likeable_type: "Comment", likeable_id: commentId })
      ).unwrap();
      const action = result?.action;
      setLikedComments((prev) => ({
        ...prev,
        [commentId]: action === "liked",
      }));
      await dispatch(fetchComments({ postId: post.id }));
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setLikingInProgress(false);
    }
  };

  const handleLikePost = async () => {
    if (likingInProgress || !user || !post?.id || !isPublished) return;
    setLikingInProgress(true);
    try {
      const result = await dispatch(
        toggleLike({ likeable_type: "Post", likeable_id: post.id })
      ).unwrap();
      setIsLiked(result?.action === "liked");
      await dispatch(fetchPost(slug));
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setLikingInProgress(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!isPublished) return;
    try {
      await dispatch(
        toggleBookmark({ user_id: user.id, post_id: post.id })
      ).unwrap();
      await dispatch(fetchPost(slug));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="md" text="Loading article..." />
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.notFoundContainer}>
        <h1>Article not found</h1>
        <p>
          The article you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.articleHeader}>
        <BlogContent {...post} featuredImage={post.cover} />

        <div className={styles.interactions}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              {/* views icon */}
              <span>{post.views_count} views</span>
            </div>
            <div className={styles.stat}>
              {/* likes icon */}
              <span>{post.likes_count} likes</span>
            </div>
          </div>
          {post.status === "draft" && user?.id === post.user_id && (
            <button
              className={styles.editButton}
              onClick={() => navigate(`/write/${post.slug}`)}
            >
              Chỉnh sửa
            </button>
          )}

          <div className={styles.actions}>
            <button
              className={`${styles.actionButton} ${
                isLiked ? styles.liked : ""
              } ${likingInProgress ? styles.loading : ""}`}
              onClick={handleLikePost}
              disabled={likingInProgress || !isPublished}
              title={isLiked ? "Unlike" : "Like"}
              aria-label={`${isLiked ? "Unlike" : "Like"} this post`}
            >
              <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"}>
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isLiked ? "Liked" : "Like"}
            </button>

            <button
              className={`${styles.actionButton} ${
                isBookmarked ? styles.bookmarked : ""
              } ${bookmarkingInProgress ? styles.loading : ""}`}
              onClick={handleToggleBookmark}
              disabled={bookmarkingInProgress || !isPublished}
              title={isBookmarked ? "Remove bookmark" : "Bookmark"}
              aria-label={`${
                isBookmarked ? "Remove bookmark from" : "Bookmark"
              } this post`}
            >
              <svg
                viewBox="0 0 16 16"
                fill={isBookmarked ? "currentColor" : "none"}
              >
                <path
                  d="M3 1C2.45 1 2 1.45 2 2V15L8 12L14 15V2C14 1.45 13.55 1 13 1H3Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.authorSection}>
        <AuthorInfo
          author={{
            id: post.users.id,
            name: post.users.username,
            title: post.users.title,
            bio: post.users.about,
            avatar: post.users.avatar,
            postsCount: post.users.posts_count,
            followers: post.users.followers_count,
            following: post.users.following_count,
            social: {
              twitter: post.users.twitter_url,
              github: post.users.github_url,
              linkedin: post.users.linkedin_url,
              website: post.users.website_url,
            },
          }}
          showFollowButton={post.users.id === user.id ? false : true}
        />
      </div>

      <div className={styles.contentSection}>
        <RelatedPosts posts={[...relatedPosts]} />
      </div>

      <div className={styles.contentSection}>
        {isPublished ? (
          <CommentSection
            comments={comments}
            loading={commentsLoading}
            onAddComment={handleAddComment}
            onReplyComment={handleReplyComment}
            onLikeComment={handleLikeComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            isAuthenticated={isAuthenticated}
            likes={comments.likes_count || 0}
          />
        ) : (
          <p>Bài viết chưa được xuất bản, không thể tương tác.</p>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;
