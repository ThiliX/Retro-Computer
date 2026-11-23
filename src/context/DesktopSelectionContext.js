import { createContext, useContext } from "react";

/** Which desktop icon is highlighted. Provided by App, read by IconDisplay. */
export const DesktopSelectionContext = createContext({ selectedIcon: null, selectIcon: () => {} });

export const useDesktopSelection = () => useContext(DesktopSelectionContext);
