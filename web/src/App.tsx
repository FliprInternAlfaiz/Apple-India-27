import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { Notifications } from "@mantine/notifications";
import { store } from "./store/store";
import { appRouter } from "./routes/appRoutes";
import QueryProvider from "./lib/QueryProvider";
import '@mantine/carousel/styles.css';

function App() {
  return (
    <Provider store={store}>
      <QueryProvider>
        <MantineProvider>
          <Notifications position="bottom-right" />
          <ModalsProvider>
            <RouterProvider router={appRouter} />
          </ModalsProvider>
        </MantineProvider>
      </QueryProvider>
    </Provider>
  );
}

export default App;
