import React, { useEffect, useMemo } from "react";
import { motion, useAnimationControls } from "framer-motion";

export type ToastProps = {
  message: string;
  type: string;
  onDelete: () => void;
};

export const Toast = (props: ToastProps) => {
  const { message, type, onDelete } = { ...props };
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onDelete(); // Trigger the onDelete callback after the specified duration
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onDelete]);

  const toastType = useMemo(() => `alert-${type}`, [type]);
  return (
    <>
      <div className={`alert ${toastType}`}>
        <span className="">{message}</span>
      </div>
    </>
  );
};

type ToastContainerProps = {
  children: React.ReactNode;
};

export const ToastContainer = (props: ToastContainerProps) => {
  return <div className="z-100 toast-end toast">{props.children}</div>;
};
