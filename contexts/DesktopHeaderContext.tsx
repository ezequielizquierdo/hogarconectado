import React, { createContext, useContext, useMemo, useState } from "react";

type DesktopHeaderAction = {
  label: string;
  onPress: () => void;
};

type DesktopHeaderContextValue = {
  action: DesktopHeaderAction | null;
  setAction: React.Dispatch<React.SetStateAction<DesktopHeaderAction | null>>;
};

const DesktopHeaderContext = createContext<DesktopHeaderContextValue | null>(
  null
);

export function DesktopHeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [action, setAction] = useState<DesktopHeaderAction | null>(null);
  const value = useMemo(() => ({ action, setAction }), [action]);

  return (
    <DesktopHeaderContext.Provider value={value}>
      {children}
    </DesktopHeaderContext.Provider>
  );
}

export function useDesktopHeader() {
  const context = useContext(DesktopHeaderContext);
  if (!context) {
    throw new Error(
      "useDesktopHeader debe utilizarse dentro de DesktopHeaderProvider"
    );
  }
  return context;
}
