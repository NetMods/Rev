import { createHashRouter, RouterProvider } from "react-router";
import Recording from "./modules/recorder"
import Editor from "./modules/editor"
import Screenshot from "./modules/screenshot"
import AnnotatePanel from "./modules/annotation/panel"
import AnnotateBackground from "./modules/annotation/background"

function App() {
  const router = createHashRouter([
    { path: "/", index: true, element: <Recording /> },
    { path: "/editor", element: <Editor /> },
    { path: "/annotation-panel", element: <AnnotatePanel /> },
    { path: "/annotation-background", element: <AnnotateBackground /> },
    { path: "/screenshot", element: <Screenshot /> }
  ]);

  return (
    <RouterProvider router={router} />
  )
}

export default App
