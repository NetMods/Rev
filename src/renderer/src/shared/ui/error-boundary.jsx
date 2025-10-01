import { isRouteErrorResponse, useRouteError } from "react-router";
import { useEffect } from "react";

export function ErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    if (error) {
      window.api.core.showError({ error: error, message: error.message });
    }
  }, [error]);

  let message = "I'm dead, contact my worthless developers, and tell them to get a job."

  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`
  }

  if (error instanceof Error) {
    message = `${error.message}`
  }

  return (
    <div className="flex flex-col w-screen h-screen justify-center items-center gap-4 bg-base-100 font-sans no-drag">
      <h2 className="text-lg">Something went bonkers</h2>
      <span className="text-2xl font-serif">{message}</span>
      <pre className="text-base-content/50">
        {error.stack
          .split("\n")
          .slice(1)
          .map(line => "+ " + line.replace(/\(.*?\)/g, "").trim())
          .join("\n")}
      </pre>
      <span>Try reloading. If it still doesn’t work, report the problem to us.</span>
      <div className="flex justify-center items-center gap-1">
        <button onClick={() => window.location.reload()} className="btn active:scale-95 no-drag">Reload App</button>
        <button onClick={() => window.api.core.report(error)} className="btn  active:scale-95 no-drag">Report Problem</button>
        <button onClick={() => window.api.core.closeWindow()} className="btn active:scale-95 no-drag">Close Window</button>
      </div>
    </div>
  );
}
