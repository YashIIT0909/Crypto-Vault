import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";

export const Routes = createBrowserRouter([
    {
        path: "/", element: <Home />
    },
    {
        path: "/dashboard", element: <Dashboard />
    }
])

