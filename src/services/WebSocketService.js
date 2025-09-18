import Pusher from "pusher-js";
const token = localStorage.getItem("token");

const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
  cluster: "",
  wsHost: import.meta.env.VITE_PUSHER_HOST,
  wsPort: import.meta.env.VITE_PUSHER_PORT,
  forceTLS: import.meta.env.VITE_PUSHER_USE_TLS === "true",
  enabledTransports: ["ws"],
  authEndpoint: `${import.meta.env.VITE_BASE_URL}/pusher`,
  auth: {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
});

export default pusher;
