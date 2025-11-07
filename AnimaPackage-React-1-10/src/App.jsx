import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { DivWrapper } from "./screens/DivWrapper";
import { IphonePro } from "./screens/IphonePro";
import { IphoneProScreen } from "./screens/IphoneProScreen";
import { IphoneProWrapper } from "./screens/IphoneProWrapper";
import { Screen4 } from "./screens/Screen4";
import { Screen5 } from "./screens/Screen5";
import { Screen6 } from "./screens/Screen6";
import { Screen7 } from "./screens/Screen7";
import { Screen8 } from "./screens/Screen8";
import { Screen9 } from "./screens/Screen9";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <IphonePro />,
  },
  {
    path: "/iphone-16-pro-u45-1",
    element: <IphonePro />,
  },
  {
    path: "/iphone-16-pro-u45-9",
    element: <IphoneProScreen />,
  },
  {
    path: "/iphone-16-pro-u45-6",
    element: <IphoneProWrapper />,
  },
  {
    path: "/iphone-16-pro-u45-10",
    element: <DivWrapper />,
  },
  {
    path: "/iphone-16-pro-u45-3",
    element: <Screen4 />,
  },
  {
    path: "/iphone-16-pro-u45-4",
    element: <Screen5 />,
  },
  {
    path: "/iphone-16-pro-u45-5",
    element: <Screen6 />,
  },
  {
    path: "/iphone-16-pro-u45-2",
    element: <Screen7 />,
  },
  {
    path: "/iphone-16-pro-u45-8",
    element: <Screen8 />,
  },
  {
    path: "/iphone-16-pro-u45-7",
    element: <Screen9 />,
  },
]);

export const App = () => {
  return <RouterProvider router={router} />;
};
