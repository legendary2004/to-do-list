import { useContext, useEffect, useState } from "react";
import { ListContext } from "./listContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { ListTaskContext } from "./listTasksContext";
import { MdEdit, MdDelete } from "react-icons/md";

export default function ListNameContext() {
    const listNames = useContext(ListContext);
    const listTaskContext = useContext(ListTaskContext);

    async function getListTasks(e) {
        const q = query(collection(db, "usersLists"), where("listsName", "array-contains", e.target.innerHTML))
        const doc = await getDocs(q)
        doc.docs.map(res => {
            res.data().lists?.map(list => {
                if (list.name === e.target.innerHTML) {
                    listTaskContext.dispatchState({type: "getListTasks", listInfo: list})
                }
            })
        })
    }

    return (
        <div className="grid gap-y-2 grid-col-1 place-items-center mt-3">
            {listNames?.map((list, index) => {
                return (
                    <p className="text-center font-medium hover:bg-neutral-50 w-4/5 cursor-pointer" key={index} onClick={getListTasks}>{list}</p>
                )
            })}    
        </div>
    )
}