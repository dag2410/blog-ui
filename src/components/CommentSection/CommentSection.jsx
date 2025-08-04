import PropTypes from "prop-types";
import { useState } from "react";
import { useSelector } from "react-redux";
import Button from "../Button/Button";
import CommentItem from "../CommentItem/CommentItem";
import EmptyState from "../EmptyState/EmptyState";
import styles from "./CommentSection.module.scss";

const CommentSection = ({
  comments = [],
  loading = false,
  onAddComment,
  onReplyComment,
  onLikeComment,
  onEditComment,
  onDeleteComment,
  isAuthenticated = false,
  className,
  maxNestingLevel,
  ...props
}) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useSelector((state) => state.auth.currentUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onAddComment) {
        await onAddComment(newComment.trim());
        setNewComment("");
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId, content) => {
    if (onReplyComment) {
      try {
        await onReplyComment(parentId, content);
      } catch (error) {
        console.error("Failed to reply to comment:", error);
      }
    }
  };

  if (loading) {
    return (
      <section
        className={`${styles.commentSection} ${className || ""}`}
        {...props}
      >
        <h2 className={styles.title}>Comments</h2>
        <div className={styles.skeleton}>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className={styles.skeletonComment}>
              <div className={styles.skeletonAvatar} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonHeader} />
                <div className={styles.skeletonText} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const isCommentLiked = (comment) => {
    if (!user || !user.id || !comment || !comment.likes) {
      return false;
    }
    if (Array.isArray(comment.likes)) {
      return comment.likes.some((like) => {
        return like && like.user_id === user.id;
      });
    }
    return false;
  };

  const organizeComments = (comments) => {
    const commentMap = new Map();
    const rootComment = [];

    comments.forEach((comment) => {
      commentMap.set(comment.id, {
        ...comment,
        replies: [],
      });
    });

    comments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id);
      if (comment.parent_id === null || comment.parent_id === undefined) {
        rootComment.push(commentWithReplies);
      } else {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(commentWithReplies);
        } else {
          rootComment.push(commentWithReplies);
        }
      }
    });
    return rootComment;
  };

  const organizedComments = organizeComments(comments);

  return (
    <section
      className={`${styles.commentSection} ${className || ""}`}
      {...props}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Comments ({comments.length})</h2>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form className={styles.commentForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className={styles.commentInput}
              rows="4"
              required
            />
          </div>
          <div className={styles.formActions}>
            <div className={styles.guidelines}>
              <span>Be respectful and constructive in your comments.</span>
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={!newComment.trim() || isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <div className={styles.loginPrompt}>
          <p>
            Please <a href="/login">sign in</a> to leave a comment.
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className={styles.commentsList}>
        {organizedComments.length === 0 ? (
          <EmptyState
            icon="💬"
            title="No comments yet"
            description="Be the first to share your thoughts!"
          />
        ) : (
          organizedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={{ ...comment, isLiked: isCommentLiked(comment) }}
              onReply={isAuthenticated ? handleReply : undefined}
              onLike={isAuthenticated ? onLikeComment : undefined}
              onEdit={isAuthenticated ? onEditComment : undefined}
              onDelete={isAuthenticated ? onDeleteComment : undefined}
              showActions={isAuthenticated}
              maxLevel={maxNestingLevel}
            />
          ))
        )}
      </div>

      {/* Load More */}
      {comments.length > 0 && comments.length % 10 === 0 && (
        <div className={styles.loadMore}>
          <Button variant="ghost" size="lg">
            Load More Comments
          </Button>
        </div>
      )}
    </section>
  );
};

CommentSection.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      author: PropTypes.shape({
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string.isRequired,
      }).isRequired,
      content: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      likes: PropTypes.number,
      replies: PropTypes.array,
      isEdited: PropTypes.bool,
    })
  ),
  loading: PropTypes.bool,
  maxNestingLevel: PropTypes.number,
  onAddComment: PropTypes.func,
  onReplyComment: PropTypes.func,
  onLikeComment: PropTypes.func,
  onEditComment: PropTypes.func,
  onDeleteComment: PropTypes.func,
  isAuthenticated: PropTypes.bool,
  className: PropTypes.string,
};

export default CommentSection;
