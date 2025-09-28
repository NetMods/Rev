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
    <div className="flex flex-col w-screen h-screen justify-center items-center gap-2 bg-base-100">
      <h2 className="text-xl">Something went wrong.</h2>
      <span className="font-bold text-red-500">{message}</span>
      <div>
        <button onClick={() => window.location.reload()} className="btn active:scale-95 no-drag">Reload App</button>
      </div>
    </div>
  );
}
