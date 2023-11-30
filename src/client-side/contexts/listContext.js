import { doc, onSnapshot } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./userContext";
import { db } from "../../firebase";

export const ListContext = createContext()
export default function ListContextProvider({children}) {
    const [allLists, setAllLists] = useState([]);
    const currentUser = useContext(UserContext)

    useEffect(() => {
        if (currentUser) {
            const unsub = onSnapshot(doc(db, "usersLists", currentUser.uid), (res) => {
                setAllLists(res.data().listsName);
            })

            return () => {
                unsub()
            }
        }
    }, [currentUser])

    return (
        <ListContext.Provider value={allLists}>
            {children}
        </ListContext.Provider>
    )
}