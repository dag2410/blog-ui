import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TopicList, FeaturedPosts, PostList, Button } from "../../components";
import styles from "./Home.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFeaturedPosts,
  fetchRecentPosts,
} from "@/features/post/postAsync";
import { fetchTrendingTopics } from "@/features/topic/topicAsync";
import { usePersistReady } from "@/hooks/usePersistReady";
import ChatBotWindow from "@/components/ChatbotWindow/ChatbotWindow";

const Home = () => {
  const dispatch = useDispatch();
  const isPersistReady = usePersistReady();
  const featuredPosts = useSelector((state) => state.post.featuredPosts);
  const loadingFeatured = useSelector(
    (state) => state.post.loadingFeaturedPosts
  );
  const recentPosts = useSelector((state) => state.post.recentPosts);
  const LoadingRecent = useSelector((state) => state.post.loadingRecentPosts);
  const trendingTopics = useSelector(
    (state) => state.topic.trendingTopics.data
  );
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      dispatch(fetchFeaturedPosts());
      dispatch(fetchRecentPosts());
      dispatch(fetchTrendingTopics());
    };

    loadData();
  }, [dispatch]);

  if (!isPersistReady) return null;

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                Learn{" "}
                <span className={styles.heroHighlight}>
                  Modern Web Development
                </span>{" "}
                with Expert Insights
              </h1>
              <p className={styles.heroDescription}>
                Discover cutting-edge tutorials, best practices, and industry
                insights from experienced developers. Stay ahead with the latest
                technologies and frameworks.
              </p>
              <div className={styles.heroActions}>
                <Button variant="primary" size="lg" asChild>
                  <Link to="/topics">Explore Topics</Link>
                </Button>
                <Button
                  component="a"
                  variant="ghost"
                  size="lg"
                  href="#featured"
                  className={styles.heroButton}
                >
                  Featured Posts
                </Button>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.heroCard}>
                <div className={styles.heroCardHeader}>
                  <div className={styles.heroCardDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className={styles.heroCardContent}>
                  <div className={styles.heroCode}>
                    <div className={styles.codeLine}>
                      <span className={styles.codeKeyword}>const</span>
                      <span className={styles.codeVariable}> knowledge</span>
                      <span className={styles.codeOperator}> = </span>
                      <span className={styles.codeString}>
                        &apos;power&apos;
                      </span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.codeKeyword}>function</span>
                      <span className={styles.codeFunction}> learn</span>
                      <span className={styles.codeBracket}>()</span>
                      <span className={styles.codeBracket}> {"{"}</span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.codeIndent}> </span>
                      <span className={styles.codeKeyword}>return</span>
                      <span className={styles.codeVariable}> success</span>
                    </div>
                    <div className={styles.codeLine}>
                      <span className={styles.codeBracket}>{"}"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="container">
        {/* Featured Posts */}
        <section id="featured" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Articles</h2>
            <p className={styles.sectionSubtitle}>
              Hand-picked content from our expert contributors
            </p>
          </div>
          <FeaturedPosts
            posts={featuredPosts}
            loading={loadingFeatured}
            maxPosts={3}
            showTitle={false}
          />
        </section>

        {/* Recent Posts */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Latest Posts</h2>
            <p className={styles.sectionSubtitle}>
              Fresh content updated regularly
            </p>
          </div>
          <PostList
            posts={recentPosts}
            loading={LoadingRecent}
            showPagination={false}
            layout="grid"
            className={styles.recentPosts}
          />
          <div className={styles.sectionAction}>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/topics">View All Posts</Link>
            </Button>
          </div>
        </section>

        {/* Trending Topics */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Trending Topics</h2>
            <p className={styles.sectionSubtitle}>
              Popular categories our readers love
            </p>
          </div>
          <TopicList topics={trendingTopics} />
          <div className={styles.sectionAction}>
            <Button variant="secondary" asChild>
              <Link to="/topics">Explore All Topics</Link>
            </Button>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className={styles.newsletter}>
          <div className={styles.newsletterCard}>
            <div className={styles.newsletterContent}>
              <h3 className={styles.newsletterTitle}>Stay Updated</h3>
              <p className={styles.newsletterDescription}>
                Get the latest tutorials and insights delivered to your inbox
                weekly. Join our community of developers!
              </p>
              <div className={styles.newsletterActions}>
                <Button variant="primary" size="lg">
                  Subscribe Newsletter
                </Button>
              </div>
            </div>
            <div className={styles.newsletterVisual}>📧</div>
          </div>
        </section>
      </div>
      <img
        src="/chatbot/chatbot.png"
        alt="chatbot"
        className={styles.chatbot}
        onClick={() => setIsChatbotOpen(true)}
      />
      <ChatBotWindow
        isOpen={isChatbotOpen}
        isMinimized={isMinimized}
        onClose={() => setIsChatbotOpen(false)}
        onMinimize={setIsMinimized}
      />
    </div>
  );
};

export default Home;
