"use client";


import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  return (
    <>

                  <ToastContainer position="bottom-right" />
                  {children}

    </>
  );
}