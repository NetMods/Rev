import Controls from './pages/controls'
import Editor from './pages/editor'
import { createBrowserRouter, RouterProvider } from "react-router";

function App() {
  const router = createBrowserRouter([
    { path: "/", index: true, element: <Controls /> },
    { path: "/editor", element: <Editor /> }
  ]);

  return (
    <RouterProvider router={router} />
  )
}

export default App
