import { onAuthStateChanged } from "firebase/auth";
import React, { createContext, useEffect, useState } from "react";
import { auth } from "../../firebase";

export const UserContext = createContext()
export default function UserContextProvider ({children}) {
    const [user, setUser] = useState("")

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, user => {
            setUser(user)
        })

        return () => {
            unsub()
        }
    })

    return(
        <UserContext.Provider value={user}>
            {children}
        </UserContext.Provider>
    )
}