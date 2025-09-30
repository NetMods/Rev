import { createHashRouter, RouterProvider } from "react-router";
import Recording from "./modules/recorder"
import Editor from "./modules/editor"
import Screenshot from "./modules/screenshot"
import AreaSelection from './modules/screenshot/components/area/screen-area-select'
import AnnotatePanel from "./modules/annotation/panel"
import AnnotateBackground from "./modules/annotation/background"
import { ErrorBoundary } from './shared/ui/error-boundary'

function App() {
  const router = createHashRouter([
    { path: "/", index: true, element: <Recording />, ErrorBoundary },
    { path: "/editor", element: <Editor />, ErrorBoundary },
    { path: "/annotation-panel", element: <AnnotatePanel />, ErrorBoundary },
    { path: "/annotation-background", element: <AnnotateBackground />, ErrorBoundary },
    { path: "/screenshot", element: <Screenshot />, ErrorBoundary },
    { path: "/screenshot-area-selection", element: <AreaSelection />, ErrorBoundary }
  ]);

  return (
    <RouterProvider router={router} />
  )
}

export default App
