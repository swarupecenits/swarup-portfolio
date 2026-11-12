import { useEffect, useEffectEvent } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle, FiCheckCircle, FiX } from "react-icons/fi";

const Region = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 24px;
  z-index: 60;
  display: flex;
  justify-content: center;
  padding: 0 16px;
  pointer-events: none;
`;

const Card = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: min(480px, 100%);
  padding: 12px 12px 12px 16px;
  border: 1px solid ${({ $type }) => ($type === "error" ? "rgb(248 113 113 / 0.4)" : "rgb(var(--accent-rgb) / 0.35)")};
  border-radius: var(--radius);
  background: var(--surface-strong);
  box-shadow: 0 24px 48px -16px rgb(0 0 0 / 0.85);
  color: var(--text);
  font-size: 15px;
  line-height: 1.45;
  pointer-events: auto;

  > svg {
    flex-shrink: 0;
    font-size: 20px;
    color: ${({ $type }) => ($type === "error" ? "var(--danger)" : "var(--accent)")};
  }
`;

const CloseButton = styled.button`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: rgb(255 255 255 / 0.08);
    color: var(--text);
  }
`;

/**
 * Accessible notification. `toast` is `{ id, type: "success" | "error", message }` or null;
 * it dismisses itself after `duration` ms.
 */
export default function Toast({ toast, onClose, duration = 5000 }) {
  const close = useEffectEvent(() => onClose());

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => close(), duration);
    return () => clearTimeout(timer);
  }, [toast, duration]);

  const Icon = toast?.type === "error" ? FiAlertCircle : FiCheckCircle;

  return createPortal(
    <Region role="status" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {toast && (
          <Card
            key={toast.id}
            $type={toast.type}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <Icon aria-hidden="true" />
            <span>{toast.message}</span>
            <CloseButton type="button" aria-label="Dismiss notification" onClick={onClose}>
              <FiX aria-hidden="true" />
            </CloseButton>
          </Card>
        )}
      </AnimatePresence>
    </Region>,
    document.body,
  );
}
