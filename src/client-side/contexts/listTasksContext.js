import {useEffect, useReducer, createContext } from "react";


export const ListTaskContext = createContext();
export default function ListTaskContextProvider({children}) {
    const listObj = {
        name: "",
        tasks: []
    }
    const [state, dispatchState] = useReducer(handleListClick, listObj)

    function handleListClick(state, action) {
        if (action.type == "getListTasks") {
            return {
                name: action.listInfo.name,
                tasks: action.listInfo.tasks
            }
        }
    }

    useEffect(() => {
        console.log(state)
    }, [listObj])

    return (
        <ListTaskContext.Provider value={{state, dispatchState}}>
            {children}
        </ListTaskContext.Provider>
    )

}