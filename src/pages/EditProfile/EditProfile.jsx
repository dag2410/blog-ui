import { uploadAvatar, uploadCover } from "@/features/upload/uploadAsync";
import { updateUser } from "@/features/user/userAsync";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import FallbackImage from "../../components/FallbackImage/FallbackImage";
import Input from "../../components/Input/Input";
import styles from "./EditProfile.module.scss";

const EditProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
      }));
      setImagePreviews({
        avatar: currentUser.avatar || "",
        coverImage: currentUser.cover_image || "",
      });
    }
  }, [currentUser]);

  const [formData, setFormData] = useState({
    firstName: currentUser?.first_name,
    lastName: currentUser?.last_name,
    username: currentUser?.username,
    title: currentUser?.title,
    about: currentUser?.about,
    address: currentUser?.address,
    website: currentUser?.website_url,
    avatar: currentUser?.avatar,
    coverImage: currentUser?.cover_image,
    social: {
      twitter: currentUser?.twitter_url,
      github: currentUser?.github_url,
      linkedin: currentUser?.linkedin_url,
    },
    skills: "",
    privacy: {
      profileVisibility: "public",
      showEmail: false,
      showFollowersCount: true,
      showFollowingCount: true,
      allowDirectMessages: true,
      showOnlineStatus: true,
    },
  });

  const [imageFiles, setImageFiles] = useState({
    avatar: null,
    coverImage: null,
  });

  const [imagePreviews, setImagePreviews] = useState({
    avatar: "",
    coverImage: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    if (field.startsWith("social.")) {
      const socialField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        social: { ...prev.social, [socialField]: value },
      }));
    } else if (field.startsWith("privacy.")) {
      const privacyField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        privacy: { ...prev.privacy, [privacyField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageChange = (type, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        [type]: "Please select a valid image file",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [type]: "Image size must be less than 5MB",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, [type]: "" }));
    setImageFiles((prev) => ({ ...prev, [type]: file }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviews((prev) => ({ ...prev, [type]: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "Name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Name is required";
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, hyphens and underscores";
    }

    if (formData.website && !formData.website.startsWith("http")) {
      newErrors.website = "Website URL must start with http:// or https://";
    }

    if (
      formData.social.twitter &&
      !formData.social.twitter.startsWith("https://twitter.com/")
    ) {
      newErrors["social.twitter"] = "Twitter URL must be valid";
    }

    if (
      formData.social.github &&
      !formData.social.github.startsWith("https://github.com/")
    ) {
      newErrors["social.github"] = "GitHub URL must be valid";
    }

    if (
      formData.social.linkedin &&
      !formData.social.linkedin.startsWith("https://linkedin.com/")
    ) {
      newErrors["social.linkedin"] = "LinkedIn URL must be valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const uploadImages = async () => {
    const uploadedUrls = { ...imagePreviews };

    if (imageFiles.avatar) {
      try {
        const res = await dispatch(uploadAvatar(imageFiles.avatar)).unwrap();
        uploadedUrls.avatar = res.url;
      } catch (error) {
        setErrors((prev) => ({ ...prev, avatar: "Failed to upload avatar" }));
      }
    }

    if (imageFiles.coverImage) {
      try {
        const res = await dispatch(uploadCover(imageFiles.coverImage)).unwrap();
        uploadedUrls.coverImage = res.url;
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          coverImage: "Failed to upload cover image",
        }));
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const imageUrls = await uploadImages();

      const submitData = {
        ...formData,
        first_name: formData.firstName,
        last_name: formData.lastName,
        avatar: imageUrls.avatar,
        cover_image: imageUrls.coverImage,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const result = await dispatch(
        updateUser({ id: currentUser?.id, data: submitData })
      );
      console.log(result);
      console.log("Submit profile data:", submitData);

      navigate(`/profile/${currentUser?.id}`, {
        state: { message: "Profile updated successfully!" },
      });
    } catch (err) {
      setErrors({ submit: "Failed to save profile. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <div className={styles.editProfilePage}>
      <div className="container">
        <div className={styles.pageHeader}>
          <Button
            variant="ghost"
            onClick={handleCancel}
            className={styles.backButton}
          >
            ← Back
          </Button>
          <h1>Edit Profile</h1>
          <p>Update your profile information and settings</p>
        </div>

        <Card className={styles.formCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Profile Images */}
            <div className={styles.section}>
              <h3>Profile Images</h3>
              <div className={styles.imageSection}>
                <div className={styles.imagePreview}>
                  <div className={styles.coverPreview}>
                    <FallbackImage
                      src={imagePreviews.coverImage}
                      alt="Cover preview"
                      className={styles.coverImg}
                    />
                    <div className={styles.imageUpload}>
                      <input
                        type="file"
                        id="coverImage"
                        accept="image/*"
                        onChange={(e) => handleImageChange("coverImage", e)}
                        className={styles.fileInput}
                      />
                      <label
                        htmlFor="coverImage"
                        className={styles.uploadButton}
                      >
                        📷 Change Cover
                      </label>
                    </div>
                    <span className={styles.imageLabel}>Cover Image</span>
                    {errors.coverImage && (
                      <div className={styles.imageError}>
                        {errors.coverImage}
                      </div>
                    )}
                  </div>

                  <div className={styles.avatarPreview}>
                    <FallbackImage
                      src={imagePreviews.avatar}
                      alt="Avatar preview"
                      className={styles.avatarImg}
                    />
                    <div className={styles.imageUpload}>
                      <input
                        type="file"
                        id="avatar"
                        accept="image/*"
                        onChange={(e) => handleImageChange("avatar", e)}
                        className={styles.fileInput}
                      />
                      <label htmlFor="avatar" className={styles.uploadButton}>
                        📷 Change
                      </label>
                    </div>
                    <span className={styles.imageLabel}>Avatar</span>
                    {errors.avatar && (
                      <div className={styles.imageError}>{errors.avatar}</div>
                    )}
                  </div>
                </div>

                <div className={styles.imageHints}>
                  <p>
                    <strong>Avatar:</strong> Recommended 400x400px, max 5MB
                  </p>
                  <p>
                    <strong>Cover:</strong> Recommended 1200x300px, max 5MB
                  </p>
                  <p>Supported formats: JPG, PNG, GIF</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className={styles.section}>
              <h3>Basic Information</h3>
              <div className={styles.grid}>
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  error={errors.firstName}
                  required
                  fullWidth
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  error={errors.lastName}
                  required
                  fullWidth
                />
                <Input
                  label="Username"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  error={errors.username}
                  required
                  fullWidth
                />
              </div>

              <Input
                label="Professional Title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                fullWidth
              />

              <div className={styles.textareaContainer}>
                <label className={styles.textareaLabel}>Bio</label>
                <textarea
                  className={styles.textarea}
                  value={formData.about}
                  onChange={(e) => handleInputChange("about", e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className={styles.section}>
              <h3>Contact Information</h3>
              <div className={styles.grid}>
                <Input
                  label="Location"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  fullWidth
                />
                <Input
                  label="Website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://yourwebsite.com"
                  error={errors.website}
                  fullWidth
                />
              </div>
            </div>

            {/* Social Links */}
            <div className={styles.section}>
              <h3>Social Links</h3>
              <Input
                label="Twitter"
                value={formData.social.twitter}
                onChange={(e) =>
                  handleInputChange("social.twitter", e.target.value)
                }
                placeholder="https://twitter.com/username"
                error={errors["social.twitter"]}
                fullWidth
              />
              <Input
                label="GitHub"
                value={formData.social.github}
                onChange={(e) =>
                  handleInputChange("social.github", e.target.value)
                }
                placeholder="https://github.com/username"
                error={errors["social.github"]}
                fullWidth
              />
              <Input
                label="LinkedIn"
                value={formData.social.linkedin}
                onChange={(e) =>
                  handleInputChange("social.linkedin", e.target.value)
                }
                placeholder="https://linkedin.com/in/username"
                error={errors["social.linkedin"]}
                fullWidth
              />
            </div>

            {/* Skills */}
            <div className={styles.section}>
              <h3>Skills</h3>
              <Input
                label="Skills (comma separated)"
                value={formData.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
                placeholder="React, TypeScript, Node.js, GraphQL"
                helperText="Separate skills with commas"
                fullWidth
              />
            </div>

            {/* Privacy Settings */}
            <div className={styles.section}>
              <h3>Privacy Settings</h3>
              <div className={styles.privacyControls}>
                <div className={styles.privacyItem}>
                  <div className={styles.privacyInfo}>
                    <label className={styles.privacyLabel}>
                      Profile Visibility
                    </label>
                    <p className={styles.privacyDescription}>
                      Control who can view your profile
                    </p>
                  </div>
                  <select
                    value={formData.privacy.profileVisibility}
                    onChange={(e) =>
                      handleInputChange(
                        "privacy.profileVisibility",
                        e.target.value
                      )
                    }
                    className={styles.privacySelect}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className={styles.privacyItem}>
                  <div className={styles.privacyInfo}>
                    <label className={styles.privacyLabel}>
                      Show Email Address
                    </label>
                    <p className={styles.privacyDescription}>
                      Display your email on your profile
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.privacy.showEmail}
                    onChange={(e) =>
                      handleInputChange("privacy.showEmail", e.target.checked)
                    }
                    className={styles.privacyToggle}
                  />
                </div>

                <div className={styles.privacyItem}>
                  <div className={styles.privacyInfo}>
                    <label className={styles.privacyLabel}>
                      Show Followers Count
                    </label>
                    <p className={styles.privacyDescription}>
                      Display number of followers on your profile
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.privacy.showFollowersCount}
                    onChange={(e) =>
                      handleInputChange(
                        "privacy.showFollowersCount",
                        e.target.checked
                      )
                    }
                    className={styles.privacyToggle}
                  />
                </div>

                <div className={styles.privacyItem}>
                  <div className={styles.privacyInfo}>
                    <label className={styles.privacyLabel}>
                      Show Following Count
                    </label>
                    <p className={styles.privacyDescription}>
                      Display number of people you follow
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.privacy.showFollowingCount}
                    onChange={(e) =>
                      handleInputChange(
                        "privacy.showFollowingCount",
                        e.target.checked
                      )
                    }
                    className={styles.privacyToggle}
                  />
                </div>

                <div className={styles.privacyItem}>
                  <div className={styles.privacyInfo}>
                    <label className={styles.privacyLabel}>
                      Allow Direct Messages
                    </label>
                    <p className={styles.privacyDescription}>
                      Let other users send you direct messages
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.privacy.allowDirectMessages}
                    onChange={(e) =>
                      handleInputChange(
                        "privacy.allowDirectMessages",
                        e.target.checked
                      )
                    }
                    className={styles.privacyToggle}
                  />
                </div>

                <div className={styles.privacyItem}>
                  <div className={styles.privacyInfo}>
                    <label className={styles.privacyLabel}>
                      Show Online Status
                    </label>
                    <p className={styles.privacyDescription}>
                      Display when you are online to other users
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.privacy.showOnlineStatus}
                    onChange={(e) =>
                      handleInputChange(
                        "privacy.showOnlineStatus",
                        e.target.checked
                      )
                    }
                    className={styles.privacyToggle}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className={styles.actions}>
              {errors.submit && (
                <div className={styles.submitError}>{errors.submit}</div>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={loading}
                size="lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                size="lg"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
