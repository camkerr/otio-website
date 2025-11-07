"use client";

import { useEffect } from "react";
import { useNavWidth } from "@/contexts/nav-width-context";

interface NavWidthSetterProps {
  width: "full" | "constrained";
  children?: React.ReactNode;
}

export function NavWidthSetter({ width, children }: NavWidthSetterProps) {
  const { setNavWidth } = useNavWidth();

  useEffect(() => {
    setNavWidth(width);
    // Reset to constrained when component unmounts (optional, for cleanup)
    return () => {
      setNavWidth("constrained");
    };
  }, [width, setNavWidth]);

  return <>{children}</>;
}

