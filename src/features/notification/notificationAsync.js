import * as notificationService from "@/services/notificationService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async () => {
    const response = await notificationService.getAll();
    return response.data;
  }
);

export const createNotifications = createAsyncThunk(
  "notification/createNotifications",
  async (data) => {
    const response = await notificationService.create(data);
    return response.data;
  }
);

export const deleteNotifications = createAsyncThunk(
  "notification/deleteNotifications",
  async (id) => {
    const response = await notificationService.del(id);
    return response.data;
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (id) => {
    const response = await notificationService.markAsRead(id);
    return { id, ...response.data };
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async () => {
    const response = await notificationService.markAllAsRead();
    return response.data;
  }
);
