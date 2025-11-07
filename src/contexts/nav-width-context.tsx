"use client";

import * as React from "react";

type NavWidth = "full" | "constrained";

interface NavWidthContextValue {
  navWidth: NavWidth;
  setNavWidth: (width: NavWidth) => void;
}

const NavWidthContext = React.createContext<NavWidthContextValue | undefined>(
  undefined
);

export function NavWidthProvider({ children }: { children: React.ReactNode }) {
  const [navWidth, setNavWidth] = React.useState<NavWidth>("constrained");

  return (
    <NavWidthContext.Provider value={{ navWidth, setNavWidth }}>
      {children}
    </NavWidthContext.Provider>
  );
}

export function useNavWidth() {
  const context = React.useContext(NavWidthContext);
  if (context === undefined) {
    throw new Error("useNavWidth must be used within a NavWidthProvider");
  }
  return context;
}

