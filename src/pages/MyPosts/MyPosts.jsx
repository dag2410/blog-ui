import { PostList } from "@/components";
import { fetchUserPosts } from "@/features/post/postAsync";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Button from "../../components/Button/Button";
import EmptyState from "../../components/EmptyState/EmptyState";
import Loading from "../../components/Loading/Loading";
import styles from "./MyPosts.module.scss";
import debounce from "lodash.debounce";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPage] = useState(1);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.currentUser);
  const [counts, setCounts] = useState({ all: 0, published: 0, draft: 0 });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await dispatch(
          fetchUserPosts({
            userId: user?.id,
            page: currentPage,
            search: searchTerm,
            status: activeTab,
          })
        );
        const countsData = data.payload.counts;
        const postsData = data.payload.data;
        const paginationData = data.payload.pagination;
        setTotalPage(paginationData.totalPage);
        setCounts(countsData);
        setPosts(postsData);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setPosts({ all: 0, published: 0, draft: 0 });
        setCounts();
        setTotalPage(1);
      } finally {
      }
    };

    if (user?.id) {
      fetchPosts();
    }
  }, [user?.id, dispatch, currentPage, activeTab, searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [activeTab, searchTerm]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "warning";
      default:
        return "secondary";
    }
  };

  const tabs = [
    { key: "all", label: "All Posts", count: counts.all },
    {
      key: "published",
      label: "Published",
      count: counts.published,
    },
    {
      key: "draft",
      label: "Drafts",
      count: counts.draft,
    },
  ];

  return (
    <div className={styles.container}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>My Posts</h1>
            <p className={styles.subtitle}>
              Manage and track your published articles and drafts
            </p>
          </div>
          <div className={styles.actions}>
            <Link to="/write">
              <Button variant="primary">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 2V14M2 8H14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Write New Post
              </Button>
            </Link>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`${styles.tab} ${
                  activeTab === tab.key ? styles.tabActive : ""
                }`}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label}
                <span className={styles.tabCount}>{tab.count}</span>
              </button>
            ))}
          </div>

          <div className={styles.searchContainer}>
            <div className={styles.searchInput}>
              <svg
                className={styles.searchIcon}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M7.333 12.667A5.333 5.333 0 100 7.333a5.333 5.333 0 000 5.334zM14 14l-2.9-2.9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Search your posts..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {posts.length === 0 ? (
            <EmptyState
              title={searchTerm ? "No posts found" : "No posts yet"}
              description={
                searchTerm
                  ? "Try adjusting your search terms or filters"
                  : "Start writing your first blog post to see it here"
              }
              actionButton={
                !searchTerm && (
                  <Link to="/write">
                    <Button variant="primary">Write Your First Post</Button>
                  </Link>
                )
              }
            />
          ) : (
            <div className={styles.postsSection}>
              <PostList
                posts={posts}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                layout="grid"
                showAuthor={false}
                showStatus={true}
                getStatusBadgeVariant={getStatusBadgeVariant}
                user={user}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPosts;
