import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Badge from "../../components/Badge/Badge";
import FallbackImage from "../../components/FallbackImage/FallbackImage";
import RichTextEditor from "../../components/RichTextEditor/RichTextEditor";
import PublishModal from "../../components/PublishModal/PublishModal";
import styles from "./WritePost.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { createPost, fetchPost, updatePost } from "@/features/post/postAsync";
import { fetchTopics } from "@/features/topic/topicAsync";

const WritePost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(slug);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.currentUser);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    coverImage: "",
    topics: [],
    status: "draft",
    visibility: "public",
    metaTitle: "",
    metaDescription: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [availableTopics, setAvailableTopics] = useState([]);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const headerRef = useRef(null);

  useEffect(() => {
    if (isEditing && slug) {
      dispatch(fetchPost(slug))
        .unwrap()
        .then((post) => {
          setFormData((prev) => ({
            ...prev,
            ...post,
            topics: post.topics || [],
          }));
        })
        .catch((error) => console.error("Error fetching post:", error));
    }
  }, [isEditing, slug, dispatch]);

  useEffect(() => {
    if (showPublishModal) {
      dispatch(fetchTopics())
        .unwrap()
        .then((topics) => {
          setAvailableTopics(topics.map((t) => t.name || t));
        })
        .catch((error) => console.error("Error fetching topics:", error));
    }
  }, [showPublishModal, dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        setIsHeaderScrolled(headerRef.current.getBoundingClientRect().top <= 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddTopic = (topic) => {
    if (!topic?.trim()) return;
    if (!formData.topics.includes(topic)) {
      const newTopics = [...formData.topics, topic.trim()];
      setFormData((prev) => ({ ...prev, topics: newTopics }));
      setTopicInput("");
      console.log("Updated topics:", newTopics); // Debug
    }
  };

  const handleRemoveTopic = (topicToRemove) => {
    const newTopics = formData.topics.filter((t) => t !== topicToRemove);
    setFormData((prev) => ({ ...prev, topics: newTopics }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Excerpt is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status = "draft") => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const postData = { ...formData, user_id: user.id, status };
      if (isEditing && slug) {
        await dispatch(updatePost({ slug, data: postData })).unwrap();
        console.log("Post updated successfully");
      } else {
        await dispatch(createPost(postData)).unwrap();
        console.log("Post created successfully");
      }
      navigate("/my-posts");
    } catch (error) {
      console.error("Error saving post:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockImageUrl = `https://via.placeholder.com/800x400?text=${encodeURIComponent(
        file.name
      )}`;
      setFormData((prev) => ({ ...prev, coverImage: mockImageUrl }));
    }
  };

  const handleOpenPublishModal = () => {
    if (validateForm()) setShowPublishModal(true);
  };

  const handlePublish = async (publishData) => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const postData = {
        ...publishData,
        user_id: user.id,
        status: "published",
        topics: formData.topics,
        published_at: new Date(),
      };
      if (isEditing && slug) {
        await dispatch(updatePost({ slug, data: postData })).unwrap();
        console.log("Post updated and published successfully");
      } else {
        await dispatch(createPost(postData)).unwrap();
        console.log("Post created and published successfully");
      }
      setShowPublishModal(false);
      navigate("/my-posts");
    } catch (error) {
      console.error("Error publishing post:", error);
    } finally {
      setSaving(false);
    }
  };

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {!previewMode ? (
          <div className={styles.editor}>
            <div className={styles.form}>
              <Input
                label="Title"
                placeholder="Enter your post title..."
                value={formData.title}
                onChange={handleInputChange("title")}
                error={errors.title}
                required
                fullWidth
                size="lg"
              />
              <Input
                label="Excerpt"
                placeholder="Write a brief description..."
                value={formData.description}
                onChange={handleInputChange("description")}
                error={errors.description}
                required
                fullWidth
              />
              <div className={styles.contentSection}>
                <label className={styles.label} htmlFor="content">
                  Content *
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, content: value }))
                  }
                  placeholder="Start writing your post content..."
                  error={errors.content}
                  className={styles.richTextEditor}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.preview}>
            <div className={styles.previewContent}>
              {formData.coverImage && (
                <FallbackImage
                  src={formData.coverImage}
                  alt={formData.title}
                  className={styles.previewCoverImage}
                />
              )}
              <h1 className={styles.previewTitle}>
                {formData.title || "Your Post Title"}
              </h1>
              <p className={styles.previewExcerpt}>
                {formData.description || "Your post description..."}
              </p>
              <div className={styles.previewTopics}>
                {formData.topics.map((topic) => (
                  <Badge key={topic} variant="primary">
                    {topic}
                  </Badge>
                ))}
              </div>
              <div
                className={styles.previewText}
                dangerouslySetInnerHTML={{
                  __html: formData.content || "<p>Your post content...</p>",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div
        ref={headerRef}
        className={`${styles.footer} ${
          isHeaderScrolled ? styles.scrolled : ""
        }`}
      >
        <div className={styles.footerContent}>
          <h1 className={styles.title}>
            {isEditing ? "Edit Post" : "Write New Post"}
          </h1>
          <div className={styles.stats}>
            <span>{wordCount} words</span>
            <span>~{readingTime} min read</span>
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleButton} ${
                !previewMode ? styles.active : ""
              }`}
              onClick={() => setPreviewMode(false)}
            >
              Write
            </button>
            <button
              className={`${styles.toggleButton} ${
                previewMode ? styles.active : ""
              }`}
              onClick={() => setPreviewMode(true)}
            >
              Preview
            </button>
          </div>

          <div className={styles.saveActions}>
            <Button
              variant="secondary"
              onClick={() => handleSave("draft")}
              loading={saving}
              disabled={saving}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              onClick={handleOpenPublishModal}
              disabled={saving}
            >
              {isEditing ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={handlePublish}
        formData={formData}
        setFormData={setFormData}
        topics={formData.topics}
        topicInput={topicInput}
        setTopicInput={setTopicInput}
        availableTopics={availableTopics}
        handleAddTopic={handleAddTopic}
        handleRemoveTopic={handleRemoveTopic}
        handleImageUpload={handleImageUpload}
        isPublishing={saving}
        errors={errors}
      />
    </div>
  );
};

export default WritePost;
