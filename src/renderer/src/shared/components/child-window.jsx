import { v4 as uuidv4 } from 'uuid';
import { useEffect, useRef } from "react"
import { createPortal } from 'react-dom';

export const ChildWindow = ({ children, options, onClosed }) => {
  const id = uuidv4()
  const windowRef = useRef(null)


  useEffect(() => {
    windowRef.current = window.open("about:blank", "_blank", `config=${JSON.stringify({ options, id })}`)

    return () => {
      if (windowRef.current) windowRef.current.close()
      onClosed()
      windowRef.current = null
    }
  }, [])

  return windowRef.current ? createPortal(children, windowRef.current.document.body) : null
}
