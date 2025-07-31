import { useState, useEffect } from "react";
import { data, useParams, useSearchParams } from "react-router-dom";
import TopicHeader from "../../components/TopicHeader/TopicHeader";
import PostList from "../../components/PostList/PostList";
import EmptyState from "../../components/EmptyState/EmptyState";
import Loading from "../../components/Loading/Loading";
import styles from "./Topic.module.scss";
import { fetchTopic } from "@/features/topic/topicAsync";
import { useDispatch } from "react-redux";
import { fetchPosts } from "@/features/post/postAsync";
const postsPerPage = 10;

const Topic = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentPage = parseInt(searchParams.get("page")) || 1;
  const [totalPages, setTotalPages] = useState(1);

  // Fetch topic data
  useEffect(() => {
    const fetchTopicDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const topicRes = await dispatch(fetchTopic(slug));
        const data = topicRes.payload;
        const topicData = {
          ...data,
          postCount: data.posts_count,
        };
        setTopic(topicData);
        // setPosts(posts);

        // const totalPostsCount = topicData.postCount;
        // setTotalPages(Math.ceil(totalPostsCount / postsPerPage));
      } catch (err) {
        console.error("Failed to fetch topic:", err);
        setError("Topic not found");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTopicDetail();
    }
  }, [slug]);

  useEffect(() => {
    const fetchPostDetail = async () => {
      if (!topic) return;

      setPostsLoading(true);
      try {
        const postsRes = await dispatch(
          fetchPosts({ topic: slug, page: currentPage, limit: postsPerPage })
        );
        const { data, pagination } = postsRes.payload;
        setPosts(data);
        setTotalPages(pagination.totalPage);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPostDetail();
  }, [topic, currentPage, slug]);

  const handlePageChange = (page) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className={styles.topicPage}>
        <div className="container">
          <Loading size="md" text="Loading topic..." />
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className={styles.topicPage}>
        <div className="container">
          <EmptyState
            icon="📚"
            title="Topic not found"
            description="The topic you're looking for doesn't exist or has been removed."
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.topicPage}>
      <div className="container">
        <TopicHeader topic={topic} />
        <PostList
          posts={posts}
          loading={postsLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          showPagination={true}
          className={styles.postsList}
        />
      </div>
    </div>
  );
};

export default Topic;
