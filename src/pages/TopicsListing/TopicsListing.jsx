import { useState, useEffect } from "react";
import TopicList from "../../components/TopicList/TopicList";
import Loading from "../../components/Loading/Loading";
import styles from "./TopicsListing.module.scss";
import { useDispatch } from "react-redux";
import { fetchTopics } from "@/features/topic/topicAsync";

const TopicsListing = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await dispatch(fetchTopics());
        const data = result.payload;
        setTopics(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch topics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.topicsListing}>
        <div className="container">
          <Loading size="md" text="Loading topics..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.topicsListing}>
      <div className="container">
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>All Topics</h1>
          <p className={styles.description}>
            Explore all available topics and find content that interests you.
          </p>
        </header>

        {/* Topics Grid */}
        <section className={styles.content}>
          <TopicList topics={topics} loading={loading} />
        </section>
      </div>
    </div>
  );
};

export default TopicsListing;
