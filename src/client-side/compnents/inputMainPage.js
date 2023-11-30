import { useContext, useEffect, useReducer, useState } from "react"
import { VscError } from "react-icons/vsc";
import { TiTick } from "react-icons/ti";
import Input from "./input";
import Modal from "./modal";
import { UserContext } from "../contexts/userContext"
import { arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebase";
import { ListTaskContext } from "../contexts/listTasksContext";

export default function InputMainPage(prop) {
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState({title: "", message: "", icon: ""});
    const [searchStatus, setSearchStatus] = useState("");
    const currentUser = useContext(UserContext);
    const listTask = useContext(ListTaskContext)
    const [state, dispatchState] = useReducer(handleButtonEvent, '');

    function closeModal() {
        setShowModal(false)
    }

    async function handleButtonEvent(state, action) {
        await getDoc(doc(db, "usersLists", currentUser.uid))
        .then(async res => {
            if (action.type == 'addList') {
                setShowModal(true)
                if (prop.value.length < 3 || prop.value.length > 25) {
                    setModalStatus({
                        title: "Error occured",
                        message: "List name should contain at least 3 character and no more than 25 characters",
                        icon: <VscError className="w-10 h-10" />
                    })
                }
                else if (res.data().listsName?.includes(prop.value)) {
                    setModalStatus({
                        title: "Error occured",
                        message: "A list with this name already exist",
                        icon: <VscError className="w-10 h-10" />
                    })
                }   
                else {
                    await updateDoc(doc(db, "usersLists", currentUser.uid), {
                        lists: arrayUnion({
                            name: prop.value,
                            tasks: []
                        }),
                        listsName: arrayUnion(prop.value)
                    })
                    .then(
                        setModalStatus({
                            title: "List added",
                            message: "List added. Now you can add tasks to do",
                            icon: <TiTick className="w-10 h-10" />
                        })
                    )
                }
            }
            if (action.type == 'searchList') {
                if (res.data().listsName?.includes(prop.value)) {
                    setSearchStatus(<p className="text-center w-4/5 font-medium hover:bg-neutral-50 cursor-pointer">{prop.value}</p>)
                } 
                else {
                    setSearchStatus("list not found")
                }
            }
            if (action.type == 'addTask') {
                setShowModal(true)
                await getDoc(doc(db, "usersLists", currentUser.uid))
                .then(async response => {
                    const list = response.data().lists;
                    list?.map(async item => {
                        if (listTask.state.name == item.name) {
                            if (item.tasks?.filter(task => task.name === prop.value).length > 0) {
                                setModalStatus({
                                    title: "Error occured",
                                    message: "A task with this name already exist",
                                    icon: <VscError className="w-10 h-10" />
                                })
                            }
                            else {
                                item.tasks.push({name: prop.value, isCompleted: false})
                                await updateDoc(doc(db, "usersLists", currentUser.uid), {
                                    lists: list
                                }).then(
                                    setModalStatus({
                                        title: "Task added",
                                        message: "Task added. Now you can keep track of your tasks",
                                        icon: <TiTick className="w-10 h-10" />
                                    })
                                )
                            }
                        }
                    })
                })
            }
        })
    }
    
    return (
        <>
            <div className="flex w-4/5">
                {showModal && <Modal icon={modalStatus.icon} title={modalStatus.title} desc={modalStatus.message} handleClick={closeModal}/>}
                <div className="basis-full flex">
                    <Input 
                        type={prop.type} 
                        placeholder={prop.placeholder} 
                        width={prop.width} 
                        rounded={prop.rounded} 
                        handleChange={prop.handleChange} 
                        value={prop.value}
                        id={prop.id}
                    />
                    <button className={`${prop.buttonWidth} rounded-tr rounded-br h-10 bg-neutral-100 ps-1.5 text-xl`} onClick={() => dispatchState({type: prop.action})}>{prop.icon}</button>
                </div>
            </div>
            {searchStatus && <div className="w-full grid grid-cols-1 place-items-center mt-3">{searchStatus}</div>}
        </>
        
        
    )
}