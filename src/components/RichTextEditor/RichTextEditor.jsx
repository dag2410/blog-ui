import { forwardRef, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import styles from "./RichTextEditor.module.scss";

const RichTextEditor = forwardRef(
  (
    {
      value = "",
      onChange,
      placeholder = "Start writing...",
      className = "",
      error = "",
      readOnly = false,
      theme = "snow",
      modules: customModules = {},
      formats: customFormats = [],
      onImageUpload,
      ...props
    },
    ref
  ) => {
    const quillRef = useRef(null);

    const imageHandler = () => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();

      input.onchange = async () => {
        const file = input.files[0];
        if (file) {
          try {
            if (onImageUpload) {
              const imageUrl = await onImageUpload(file);
              insertImage(imageUrl);
            } else {
              const reader = new FileReader();
              reader.onload = () => {
                insertImage(reader.result);
              };
              reader.readAsDataURL(file);
            }
          } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image");
          }
        }
      };
    };

    const insertImage = (url) => {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection();
        const index = range ? range.index : quill.getLength();
        quill.insertEmbed(index, "image", url);
        quill.setSelection(index + 1);
      }
    };

    const modules = useMemo(
      () => ({
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            ["blockquote", "code-block"],
            ["link", "image", "video"],
            [{ align: [] }],
            ["clean"],
          ],
          handlers: {
            image: imageHandler,
          },
        },
        clipboard: {
          matchVisual: false,
        },
        ...customModules,
      }),
      [customModules, onImageUpload]
    );

    const formats = useMemo(() => {
      const defaultFormats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "color",
        "background",
        "list",
        "indent",
        "blockquote",
        "code-block",
        "link",
        "image",
        "video",
        "align",
      ];
      return customFormats.length > 0 ? customFormats : defaultFormats;
    }, [customFormats]);

    const editorClasses = `${styles.editor} ${className} ${
      error ? styles.error : ""
    }`.trim();

    return (
      <div className={styles.container}>
        <ReactQuill
          ref={(el) => {
            quillRef.current = el;
            if (ref) {
              if (typeof ref === "function") {
                ref(el);
              } else {
                ref.current = el;
              }
            }
          }}
          theme={theme}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          modules={modules}
          formats={formats}
          className={editorClasses}
          {...props}
        />
        {error && <div className={styles.errorText}>{error}</div>}
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  error: PropTypes.string,
  readOnly: PropTypes.bool,
  theme: PropTypes.oneOf(["snow", "bubble"]),
  modules: PropTypes.object,
  formats: PropTypes.array,
  onImageUpload: PropTypes.func,
};

export default RichTextEditor;
