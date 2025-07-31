import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  BlogContent,
  AuthorInfo,
  RelatedPosts,
  CommentSection,
  Loading,
} from "../../components";
import styles from "./BlogDetail.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { fetchPost, fetchRelatedPosts } from "@/features/post/postAsync";
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
} from "@/features/comment/commentAsync";
import { createLike, deleteLike } from "@/features/like/likeAsync";

const BlogDetail = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likingInProgress, setLikingInProgress] = useState(false);
  const [bookmarkingInProgress, setBookmarkingInProgress] = useState(false);
  const [commentEdit, setCommentEdit] = useState([]);

  const dispatch = useDispatch();
  const post = useSelector((state) => state.post?.selected?.data);
  const user = useSelector((state) => state.auth?.currentUser);
  const relatedPosts = useSelector((state) => state.post?.relatedPosts);
  const comments = useSelector((state) => state.comment?.items || []);
  const commentsLoading = useSelector((state) => state.comment?.loading);

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
          const topicId = post.topics[0].id;
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
  }, [post?.id, dispatch]);

  const handleAddComment = async (content) => {
    if (!post?.id) return;

    try {
      const commentData = {
        post_id: post.id,
        content: content,
        user_id: user.id,
      };

      const commentEdit = await dispatch(createComment(commentData));
      setCommentEdit(commentEdit);
      console.log("Comment added successfully");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleReplyComment = async (parentId, content) => {
    if (!post?.id) return;

    try {
      const replyData = {
        post_id: post.id,
        parent_id: parentId,
        content: content,
        user_id: user.id,
      };

      await dispatch(createComment(replyData));
      console.log("Reply added successfully");
    } catch (error) {
      console.error("Failed to add reply:", error);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      console.log("Comment like toggled:", commentId);
    } catch (error) {
      console.error("Failed to toggle comment like:", error);
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      const updateData = {
        content: newContent,
      };

      await dispatch(
        updateComment({
          id: commentId,
          data: updateData,
        })
      );

      dispatch(fetchComments({ postId: post.id }));

      console.log("Comment edited successfully:", commentId);
    } catch (error) {
      console.error("Failed to edit comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await dispatch(deleteComment(commentId));
      console.log("Comment deleted successfully:", commentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  useEffect(() => {
    if (!post || !user) return;

    const liked =
      Array.isArray(post.likes) &&
      post.likes.some((like) => like.user_id === user.id);

    setIsLiked(liked);
  }, [post, user]);

  const handleLikePost = async () => {
    if (likingInProgress || !user || !post?.id) return;

    setLikingInProgress(true);
    const willLike = !isLiked;
    setIsLiked(willLike);

    const payload = {
      likeable_type: "Post",
      likeable_id: post.id,
      user_id: user.id,
    };

    try {
      if (willLike) {
        await dispatch(createLike(payload)).unwrap();
        post.likes_count + 1;
      } else {
        await dispatch(deleteLike(payload)).unwrap();
        post.likes_count - 1;
      }
      await dispatch(fetchPost(slug));
    } catch (error) {
      setIsLiked(!willLike);
      console.error("Failed to toggle like:", error);
    } finally {
      setLikingInProgress(false);
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
      {/* Article Header with Interactions */}
      <div className={styles.articleHeader}>
        <BlogContent {...post} />

        {/* Post Interactions - Moved to top for better UX */}
        <div className={styles.interactions}>
          {/* Stats */}
          <div className={styles.stats}>
            {/* Views */}
            <div className={styles.stat}>
              <svg viewBox="0 0 16 16" fill="none">
                <path
                  d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="8" cy="8" r="2" />
              </svg>
              <span>{post.views_count} views</span>
            </div>

            {/* Likes */}
            <div className={styles.stat}>
              <svg viewBox="0 0 16 16" fill="none">
                <path
                  d="M14 6.5c0 4.8-5.25 7.5-6 7.5s-6-2.7-6-7.5C2 3.8 4.8 1 8 1s6 2.8 6 5.5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{post.likes_count} likes</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            {/* Like Button */}
            <button
              className={`${styles.actionButton} ${
                isLiked ? styles.liked : ""
              } ${likingInProgress ? styles.loading : ""}`}
              onClick={handleLikePost}
              disabled={likingInProgress}
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

            {/* Bookmark Button */}
            <button
              className={`${styles.actionButton} ${
                isBookmarked ? styles.bookmarked : ""
              } ${bookmarkingInProgress ? styles.loading : ""}`}
              // onClick={handleBookmarkPost}
              disabled={bookmarkingInProgress}
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

      {/* Author Info */}
      <div className={styles.authorSection}>
        <AuthorInfo
          author={{
            name: `${post.users.username}`,
            title: post.users.title,
            bio: post.users.about,
            avatar: post.users.avatar,
            postsCount: post.users.post_count,
            followers: post.users.followers_count,
            following: post.users.following_count,
            social: {
              twitter: post.users.twitter_url,
              github: post.users.github_url,
              linkedin: post.users.linkedin_url,
              website: post.users.website_url,
            },
          }}
        />
      </div>

      {/* Related Posts */}
      <div className={styles.contentSection}>
        <RelatedPosts posts={[...relatedPosts]} />
      </div>

      {/* Comments */}
      <div className={styles.contentSection}>
        <CommentSection
          comments={comments}
          loading={commentsLoading}
          onAddComment={handleAddComment}
          onReplyComment={handleReplyComment}
          onLikeComment={handleLikeComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
};

export default BlogDetail;
