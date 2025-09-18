import React from "react";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import { BrowserRouter } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { AppRoutes, ScrollToTop, ErrorBoundary, Loading } from "./components";
import { persistor, store } from "./store";
import "./styles/index.scss";
import { PersistGate } from "redux-persist/integration/react";
import { PresenceProvider } from "./context/PresenceContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ErrorBoundary>
          <BrowserRouter>
            <ScrollToTop>
              <PresenceProvider>
                <AppRoutes />
                <ToastContainer position="top-right" autoClose={3000} />
              </PresenceProvider>
            </ScrollToTop>
          </BrowserRouter>
        </ErrorBoundary>
      </PersistGate>
    </ReduxProvider>
  </>
);
