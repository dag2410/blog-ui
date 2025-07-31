import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export const usePersistReady = () => {
  const [isReady, setIsReady] = useState(false);
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return isReady;
};
