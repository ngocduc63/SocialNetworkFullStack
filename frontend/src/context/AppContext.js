import React, {createContext, useEffect, useRef} from "react";
import {io} from "socket.io-client";
import {SOCKET_ENDPOINT} from "../utils/constants";

export const AppContext = createContext();

export const AppProvider = ({children}) => {
    const socket = useRef(null);

    useEffect(() => {
        socket.current = io(SOCKET_ENDPOINT);
    }, []);

    return (
        <AppContext.Provider value={{socket}}>
            {children}
        </AppContext.Provider>
    );
};
