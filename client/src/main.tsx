import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { MessageProvider } from "./context/message";
import { ChatProvider } from "./context/ChatContext.tsx";
import { SocketProvider } from "./context/socket.tsx";
import { BrowserRouter } from "react-router-dom";
import { UserInfoProvider } from "./context/User.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <UserInfoProvider>
      <SocketProvider>
        <ChatProvider>
          <MessageProvider>
            <App />
          </MessageProvider>
        </ChatProvider>
      </SocketProvider>
    </UserInfoProvider>
  </BrowserRouter>,
);
