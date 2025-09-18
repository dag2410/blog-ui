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
import settingReducer from "@/features/setting/settingSlice";
import uploadReducer from "@/features/upload/uploadSlice";
import notificationReducer from "@/features/notification/notificationSlice";
import conversationReducer from "@/features/conversation/conversationSlice";
import messageReducer from "@/features/message/messageSlice";

const rootConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "follow", "message"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  topic: topicReducer,
  post: postReducer,
  comment: commentReducer,
  follow: followReducer,
  setting: settingReducer,
  upload: uploadReducer,
  notification: notificationReducer,
  conversation: conversationReducer,
  message: messageReducer,
});

export const store = configureStore({
  reducer: persistReducer(rootConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(logger),
});

export const persistor = persistStore(store);
