// src/components/ui/use-toast.ts

import * as React from "react"

import { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_DURATION = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type ActionType = typeof actionTypes

type Action =  
  | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
  | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
  | { type: ActionType["DISMISS_TOAST"]; toastId?: ToasterToast["id"] }
  | { type: ActionType["REMOVE_TOAST"]; toastId?: ToasterToast["id"] }

interface State {
  toasts: ToasterToast[]
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST:
      const { toastId } = action

      // ! Side effects ! - This gets executed in a reducer, probably not the best idea.
      // Should probably use useEffect afterwards to cleanup .is_dismissed
      if (toastId) {
        dismissToast(toastId)
      } else {
        state.toasts.forEach((toast) => {
          dismissToast(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return { ...state, toasts: [] }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

const listeners: Function[] = []

const subscribe = (listener: Function) => {
  listeners.push(listener)
  return () => {
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }
}

const publish = (action: Action) => {
  listeners.forEach((listener) => listener(action))
}

const addToast = (toast: ToasterToast) => {
  publish({ type: actionTypes.ADD_TOAST, toast })
}

const updateToast = (toast: Partial<ToasterToast>) => {
  publish({ type: actionTypes.UPDATE_TOAST, toast })
}

const dismissToast = (toastId?: ToasterToast["id"]) => {
  publish({ type: actionTypes.DISMISS_TOAST, toastId })
}

const removeToast = (toastId?: ToasterToast["id"]) => {
  publish({ type: actionTypes.REMOVE_TOAST, toastId })
}

type Toast = ({ ...props }: ToastProps) => {
  id: string
  dismiss: () => void
}

const useToast = (): {
  toast: Toast
  dismiss: (toastId?: string) => void
  toasts: ToasterToast[]
} => {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] })

  React.useEffect(() => {
    const unsubscribe = subscribe(dispatch)
    return () => unsubscribe()
  }, [])

  return {
    ...state,
    toast: React.useCallback(({ ...props }: ToastProps) => {
      const id = generateEphemeralId()

      addToast({
        ...props,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) {
            dismissToast(id)
          }
        },
      })

      return {
        id: id,
        dismiss: () => dismissToast(id),
      }
    }, []),
    dismiss: dismissToast,
  }
}

// Just a helper to generate unique IDs
const generateEphemeralId = ((): () => string => {
    let count = 0;
    return () => `toast-${count++}`;
})()

export { useToast, reducer }
