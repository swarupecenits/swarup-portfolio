import { createContext, useContext } from "react";

export const PreloaderContext = createContext({ isLoading: false });

export const usePreloader = () => useContext(PreloaderContext);
