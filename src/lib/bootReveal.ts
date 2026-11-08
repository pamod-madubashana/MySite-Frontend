import { createContext, useContext } from "react";

export const BootDoorOpenContext = createContext(false);

export const useBootReveal = () => useContext(BootDoorOpenContext);
