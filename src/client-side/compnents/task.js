import { useContext, useEffect, useReducer, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import ModalEdit from "./modalEdit";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { UserContext } from "../contexts/userContext";
import { ListTaskContext } from "../contexts/listTasksContext";
import Modal from "./modal";
import { TiTick } from "react-icons/ti";
import { VscError } from "react-icons/vsc";

export default function Task(task) {
    const currentUser = useContext(UserContext);
    const listTask = useContext(ListTaskContext);
    const [showModal, setShowModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [modalStatus, setModalStatus] = useState({
        title: "",
        message: "",
        icon: ""
    })
    const [newTask, setNewTask] = useState("");
    const [button, dispatchButton] = useReducer(handleButtonClick, {
        title: "",
        icon: "",
        disabled: "",
        buttonClick: "",
        buttonContent: "",
        value: ""
    })
    const [confirmButton, dispatchConfirmButton] = useReducer(confirmAction, "");

    function handleButtonClick(state, action) {
        setShowTaskModal(true)
        setNewTask(task.name)
        if (action.type == "changeTask") {
            return ({
                title: "Edit your task. You can edit tasks anytime",
                icon: <MdEdit className="w-10 h-10" />,
                disabled: false,
                buttonClick: () => dispatchConfirmButton({type: "confirmEdit"}),
                buttonContent: "Edit",
            })
        }
        else if (action.type == "deleteTask") {
            return ({
                title: "Are you sure you want to delete this task? This action cannot be undone",
                icon: <MdDelete className="w-10 h-10" />,
                disabled: true,
                buttonClick: () => dispatchConfirmButton({type: "confirmDelete"}),
                buttonContent: "Delete",
            })
        }
    }

    async function confirmAction(state, action) {
        setShowTaskModal(false)
        await getDoc(doc(db, "usersLists", currentUser.uid))
        .then(async res => {
            const list = res.data();
            list.lists?.map(async item => {
                if (listTask.state.name === item.name) {
                    if (action.type === 'confirmEdit') {
                        if (item.tasks?.filter(task => task.name == newTask).length > 0 || !newTask) {
                            setShowModal(true)
                            setModalStatus({
                                title: "Error occured",
                                message: "Task name cannot be empty or have duplicated name",
                                icon: <VscError className="h-10 w-10" />
                            })
                        }
                        else {
                            item.tasks?.map((single, index) => {
                                if (single.name == task.name) {
                                    item.tasks?.splice(index, 1, {name: newTask, isCompleted: item.tasks[index].isCompleted})
                                }
                            })
                            await updateDoc(doc(db, "usersLists", currentUser.uid), {
                                lists: list.lists
                            })
                        }
                    }
                    else if (action.type == 'confirmDelete') {
                        list.lists?.map(item => {
                            const taskArray = item.tasks?.filter(single => single.name !== newTask)
                            item.tasks = taskArray
                        })
                        await updateDoc(doc(db, "usersLists", currentUser.uid), {
                            lists: list.lists
                        })    
                    }
                }
            })
        })
    }

    const bgColor = task.completed ? 'bg-green-300' : 'bg-red-300'

    return (
        <div className="flex w-4/5">
            {showTaskModal && 
                <ModalEdit
                    title={button.title}
                    icon={button.icon}
                    disabled={button.disabled}
                    buttonClick={button.buttonClick}
                    buttonContent={button.buttonContent}
                    value={newTask}
                    handleChange={(e) => setNewTask(e.target.value)}
                    cancelChange={() => {
                        setShowTaskModal(false)
                        setNewTask(task.name)
                    }
                    }
                />
            }
            {showModal && 
                <Modal 
                    title={modalStatus.title} 
                    desc={modalStatus.message}
                    icon={modalStatus.icon}
                    handleClick={() => setShowModal(false)}
                />
            }
            <div className="basis-full flex">
                <div className="basis-11/12 flex">
                    <input className="w-[3%] h-9 cursor-pointer p-0" type="checkbox" id={task.id} checked={task.checked} onChange={task.handleCheck}/>
                    <input className={`w-[97%] h-8 ${bgColor} ps-3`} type="text" readOnly value={task.name} onChange={task.handleChange}/>
                </div>
                <div className="basis-1/12">
                    <button className="w-1/2 h-8 text-2xl bg-neutral-100 border-r border-black ps-1.5 hover:bg-gray-300" onClick={() => dispatchButton({type: task.edit, info: newTask})}><MdEdit /></button>
                    <button className="w-1/2 h-8 text-2xl rounded-tr rounded-br bg-neutral-100 ps-1.5 hover:bg-gray-300" onClick={() => dispatchButton({type: task.delete, info: task.name})}><MdDelete /></button>
                </div>
            </div>
        </div>
    )
};