import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Button from "../Button/Button";
import FallbackImage from "../FallbackImage/FallbackImage";
import styles from "./CommentItem.module.scss";
import { useSelector } from "react-redux";

const CommentItem = ({
  comment,
  level = 0,
  maxLevel = 2,
  onReply,
  onLike,
  onEdit,
  onDelete,
  showActions = true,
  className,
  ...props
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [editText, setEditText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dropdownRef = useRef(null);
  const user = useSelector((state) => state.auth.currentUser);
  const {
    id,
    user: author,
    content,
    createdAt,
    likes_count: likes,
    isLiked = false,
    replies = [],
    isEdited = false,
  } = comment;

  const canModify = user && user?.id === author?.id;
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyText.trim() && onReply) {
      onReply(id, replyText.trim());
      setReplyText("");
      setShowReplyForm(false);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editText.trim() && onEdit) {
      onEdit(id, editText.trim());
      setEditText("");
      setShowEditForm(false);
    }
  };

  const handleLike = () => {
    if (onLike) {
      onLike(id);
    }
  };

  const handleEdit = () => {
    setEditText(content);
    setShowEditForm(true);
    setShowDropdown(false);
  };

  const handleEditCancel = () => {
    setEditText("");
    setShowEditForm(false);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(id);
    }
    setShowDeleteConfirm(false);
    setShowDropdown(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

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

  return (
    <div
      className={`${styles.commentItem} ${className || ""}`}
      style={{ "--comment-indent": level > 0 ? `${level * 24}px` : "0" }}
      {...props}
    >
      <div className={styles.comment}>
        {/* Avatar */}
        <div className={styles.avatar}>
          <FallbackImage src={author?.avatar} alt={author?.username} />
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.info}>
              <Link
                to={`/profile/${
                  author?.id || author?.name?.toLowerCase().replace(/\s+/g, "-")
                }`}
                className={styles.authorName}
              >
                {author?.username}
              </Link>
              <time className={styles.date} dateTime={createdAt}>
                {formatDate(createdAt)}
              </time>
              {isEdited && <span className={styles.edited}>(edited)</span>}
            </div>

            {/* Actions Dropdown - Only show if user can edit/delete */}
            {canModify && showActions && (onEdit || onDelete) && (
              <div className={styles.actionsDropdown} ref={dropdownRef}>
                <button
                  className={styles.moreButton}
                  onClick={toggleDropdown}
                  type="button"
                  aria-label="More actions"
                  aria-expanded={showDropdown}
                  aria-haspopup="menu"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9Z" />
                    <path d="M8 4C8.55228 4 9 3.55228 9 3C9 2.44772 8.55228 2 8 2C7.44772 2 7 2.44772 7 3C7 3.55228 7.44772 4 8 4Z" />
                    <path d="M8 14C8.55228 14 9 13.5523 9 13C9 12.4477 8.55228 12 8 12C7.44772 12 7 12.4477 7 13C7 13.5523 7.44772 14 8 14Z" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className={styles.dropdown} role="menu">
                    {onEdit && (
                      <button
                        className={styles.dropdownItem}
                        onClick={handleEdit}
                        type="button"
                        role="menuitem"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.5h.293l6.5-6.5z" />
                        </svg>
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className={`${styles.dropdownItem} ${styles.deleteItem}`}
                        onClick={() => setShowDeleteConfirm(true)}
                        type="button"
                        role="menuitem"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M6.5 1h3a.5.5 0 01.5.5v1H6v-1a.5.5 0 01.5-.5zM11 2.5v-1A1.5 1.5 0 009.5 0h-3A1.5 1.5 0 005 1.5v1H2.506a.58.58 0 000 1.162H3.36l.776 9.162A1.5 1.5 0 005.63 14h4.741a1.5 1.5 0 001.494-1.339L12.64 3.5h.854a.58.58 0 000-1.162H11z" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comment text */}
          <div className={styles.text}>
            <p>{content}</p>
          </div>

          {/* Actions */}
          {showActions && (
            <div className={styles.actions}>
              <button
                className={`${styles.likeButton} ${
                  isLiked ? styles.liked : ""
                }`}
                onClick={handleLike}
                type="button"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {likes > 0 && <span>{likes}</span>}
              </button>

              {level < maxLevel && (
                <button
                  className={styles.replyButton}
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  type="button"
                >
                  Reply
                </button>
              )}
            </div>
          )}

          {/* Reply form */}
          {showReplyForm && (
            <form className={styles.replyForm} onSubmit={handleReplySubmit}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className={styles.replyInput}
                rows="3"
              />
              <div className={styles.replyActions}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!replyText.trim()}
                >
                  Reply
                </Button>
              </div>
            </form>
          )}

          {/* Edit form */}
          {showEditForm && (
            <form className={styles.editForm} onSubmit={handleEditSubmit}>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Edit your comment..."
                className={styles.editInput}
                rows="3"
                autoFocus
              />
              <div className={styles.editActions}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleEditCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!editText.trim() || editText.trim() === content}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmModal}>
            <h3 className={styles.confirmTitle}>Delete Comment</h3>
            <p className={styles.confirmMessage}>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </p>
            <div className={styles.confirmActions}>
              <Button variant="ghost" size="sm" onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteConfirm}
                className={styles.deleteConfirmButton}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className={styles.replies}>
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={{ ...reply, isLiked: isCommentLiked(reply) }}
              level={level + 1}
              maxLevel={maxLevel}
              onReply={onReply}
              onLike={onLike}
              onEdit={onEdit}
              onDelete={onDelete}
              showActions={showActions}
            />
          ))}
        </div>
      )}
    </div>
  );
};

CommentItem.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    author: PropTypes.shape({
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
      username: PropTypes.string,
    }).isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    likes: PropTypes.number,
    isLiked: PropTypes.bool,
    replies: PropTypes.array,
    isEdited: PropTypes.bool,
  }).isRequired,
  level: PropTypes.number,
  maxLevel: PropTypes.number,
  onReply: PropTypes.func,
  onLike: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  showActions: PropTypes.bool,
  className: PropTypes.string,
};

export default CommentItem;
