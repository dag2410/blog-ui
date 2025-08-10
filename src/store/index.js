import logger from "redux-logger";
import storage from "redux-persist/lib/storage";
import persistStore from "redux-persist/es/persistStore";
import persistReducer from "redux-persist/es/persistReducer";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import topicReducer from "@/features/topic/topicSlice";
import postReducer from "@/features/post/postSlice";
import commentReducer from "@/features/comment/commentSlice";
import followReducer from "@/features/follow/followSlice";

const rootConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "follow"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  topic: topicReducer,
  post: postReducer,
  comment: commentReducer,
  follow: followReducer,
});

export const store = configureStore({
  reducer: persistReducer(rootConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(logger),
});

export const persistor = persistStore(store);
