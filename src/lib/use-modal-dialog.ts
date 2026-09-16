import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from "react";

/**
 * Drives a native <dialog> as a modal from a boolean.
 * showModal() gives us the focus trap, Escape, and an inert background for free.
 */
export function useModalDialog(
  ref: RefObject<HTMLDialogElement | null>,
  initialFocus: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  const returnFocus = useRef<Element | null>(null);
  const pressedBackdrop = useRef(false);

  // Closing runs in a layout effect and opening in a passive one: layout effects flush first,
  // so when switching palette -> terminal the old modal is gone before the new one opens.
  useLayoutEffect(() => {
    if (!open && ref.current?.open) ref.current.close();
  }, [open, ref]);

  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog || dialog.open) return;
    returnFocus.current = document.activeElement;
    dialog.showModal();
    initialFocus.current?.focus();
  }, [open, ref, initialFocus]);

  const close = useCallback(() => ref.current?.close(), [ref]);

  const handleClose = () => {
    // Browsers restore focus on close natively; this covers the ones that don't.
    // Skipped if something (e.g. goToSection) already moved focus somewhere deliberate.
    if (document.activeElement === document.body && returnFocus.current instanceof HTMLElement) {
      returnFocus.current.focus({ preventScroll: true });
    }
    returnFocus.current = null;
    onClose();
  };

  // Close on backdrop click. Tracking pointerdown too means a text selection dragged
  // from inside the dialog and released over the backdrop doesn't dismiss it.
  const handlePointerDown = (e: PointerEvent<HTMLDialogElement>) => {
    pressedBackdrop.current = e.target === e.currentTarget;
  };
  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (pressedBackdrop.current && e.target === e.currentTarget) close();
    pressedBackdrop.current = false;
  };

  /** Spread onto the <dialog>. */
  const dialogProps = { onClose: handleClose, onPointerDown: handlePointerDown, onClick: handleClick };
  return { close, dialogProps };
}
