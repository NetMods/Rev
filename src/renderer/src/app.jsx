import Controls from './pages/controls'
import Editor from './pages/editor'
import { createHashRouter, RouterProvider } from "react-router";

function App() {
  const router = createHashRouter([
    { path: "/", index: true, element: <Controls /> },
    { path: "/editor", element: <Editor /> }
  ]);

  return (
    <RouterProvider router={router} />
  )
}

export default App
