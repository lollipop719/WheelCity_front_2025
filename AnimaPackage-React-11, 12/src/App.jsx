import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { IphonePro } from "./screens/IphonePro";
import { IphoneProScreen } from "./screens/IphoneProScreen";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <IphonePro />,
  },
  {
    path: "/iphone-16-pro-u45-11",
    element: <IphonePro />,
  },
  {
    path: "/iphone-16-pro-u45-12",
    element: <IphoneProScreen />,
  },
]);

export const App = () => {
  return <RouterProvider router={router} />;
};
