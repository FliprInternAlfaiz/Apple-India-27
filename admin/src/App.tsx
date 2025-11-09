import "./App.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { RouterProvider } from "react-router-dom";
import { appRouter } from "./routes/appRoutes";
import QueryProvider from "./lib/QueryProvider";

function App() {
  return (
    <QueryProvider>
      <MantineProvider>
        <RouterProvider router={appRouter} />
        <Notifications />
      </MantineProvider>
    </QueryProvider>
  );
}

export default App;
