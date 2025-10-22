import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { Notifications } from "@mantine/notifications";
import { store } from "./store/store";
import { appRouter } from "./routes/appRoutes";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Provider store={store}>
       <AuthProvider>
      <MantineProvider>
        <Notifications position="top-right" />
        <ModalsProvider>
          <RouterProvider router={appRouter} />
        </ModalsProvider>
      </MantineProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
