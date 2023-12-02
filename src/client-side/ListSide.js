import { useContext, useEffect, useReducer, useRef, useState } from "react";
import InputMainPage from "./compnents/inputMainPage";
import { IoMdAdd } from "react-icons/io";
import { MdDelete, MdEdit } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import { VscError } from "react-icons/vsc";
import { ListTaskContext } from "./contexts/listTasksContext";
import Task from "./compnents/task";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { UserContext } from "./contexts/userContext";
import { db } from "../firebase";
import { v4 } from "uuid";
import ModalEdit from "./compnents/modalEdit";

export default function() {
    const currentUser = useContext(UserContext);
    const listTaskContext = useContext(ListTaskContext);
    const [currentList, setCurrentList] = useState("");
    const [newList, setNewList] = useState(listTaskContext.state.name);
    const [task, setTask] = useState("");
    const [tasks, setTasks] = useState([]);
    const [allCheck, setAllCheck] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState({
        icon: "",
        title: "",
        value: "",
        buttonClick: "",
        buttonContent: ""
    })
    const [buttonClick, dispatch] = useReducer(handleButtonClick, false);
    const [buttonAction, confirm] = useReducer(handleButtonAction, "");

    useEffect(() => {
        setNewList(listTaskContext.state.name)
        if (currentUser) {
            onSnapshot(doc(db, "usersLists", currentUser.uid), (res) => {
                console.log("hi")
                res.data().lists.map(item => {
                    if (item.name === listTaskContext.state.name) {
                        const array = [];
                        setAllCheck(false)
                        item.tasks?.map(task => {
                            const id = v4();
                            array.push({id: id, name: task.name, isChecked: false, isCompleted: task.isCompleted})
                        })
                        setTasks(array)
                    }
                })
            })
        }
    }, [listTaskContext])

    function handleCheck(e) {
        const id = e.target.id;
        const value = e.target.checked;
        if (id == 'allCheck') setAllCheck(value)
        const updatedTasks = [];
        tasks.map(item => {
            if (!value) setAllCheck(value)
            if (id === item.id || id === 'allCheck') {
                updatedTasks.push({...item, isChecked: value})
            }
            else {
                updatedTasks.push({...item})
            }
        })
        setTasks(updatedTasks)
    }

    function handleButtonClick(state, action) {
        setShowModal(true)
        const array = tasks.filter(item => item.isChecked);
        const arrayName = array.map(a => a.name);
        if (action.type === "deleteSelectedTasks") {
            setModalStatus({
                icon: <MdDelete className="w-10 h-10" />,
                title: "Are you sure you want to delete these tasks from your selected list? You cannot undo this action",
                value: arrayName.length > 0 ? arrayName.toString() : " No task selected ",
                disabled: true,
                buttonClick: () => confirm({type: 'delete'}),
                buttonContent: "Delete" 
            })
        }
        if (action.type === "markComplete") {
            setModalStatus({
                icon: <TiTick className="w-10 h-10" />,
                title: "Are you sure you completed these tasks?",
                value: arrayName.length > 0 ? arrayName.toString() : " No task selected ",
                disabled: true,
                buttonClick: () => confirm({type: 'complete'}),
                buttonContent: "Complete" 
            })
        }
        if (action.type === "markUncomplete") {
            setModalStatus({
                icon: <TiTick className="w-10 h-10" />,
                title: "Are you sure you want to redo these tasks?",
                value: arrayName.length > 0 ? arrayName.toString() : " No task selected ",
                disabled: true,
                buttonClick: () => confirm({type: 'uncomplete'}),
                buttonContent: "Uncomplete" 
            })
        }
        if (action.type == 'editList') {
            setModalStatus({
                title: "Edit your task. You can edit tasks anytime",
                icon: <MdEdit className="w-10 h-10" />,
                disabled: false,
                buttonClick: () => confirm({type: "confirmEdit"}),
                buttonContent: "Edit",
            })
        }
        if (action.type == "deleteList") {
            setModalStatus({
                title: "Are you sure you want to delete this list? This action cannot be undone",
                icon: <MdDelete className="w-10 h-10" />,
                value: newList,
                disabled: true,
                buttonClick: () => confirm({type: "confirmDelete"}),
                buttonContent: "Delete",
            })
        }
    }

    async function handleButtonAction(state, action) {
        setShowModal(false)
        await getDoc(doc(db, "usersLists", currentUser.uid))
        .then(async res => {
            const list = res.data().lists
            const listNames = res.data().listsName
            res.data().lists.map(async (item, index) => {
                if (item.name === listTaskContext.state.name) {
                    if (action.type == 'delete') {
                        list[index].tasks = item.tasks.filter(task => !modalStatus.value.split(",").includes(task.name))
                        await updateDoc(doc(db, "usersLists", currentUser.uid), {
                            lists: list
                        })
                    }
                    if (action.type == 'complete') {
                        item.tasks?.map(task => {
                            if (modalStatus.value.split(",").includes(task.name)) {
                                task.isCompleted = true
                            }
                        })
                        list[index].tasks = item.tasks
                        await updateDoc(doc(db, "usersLists", currentUser.uid), {
                            lists: list
                        })
                    }
                    if (action.type == 'uncomplete') {
                        item.tasks?.map(task => {
                            if (modalStatus.value.split(",").includes(task.name)) {
                                task.isCompleted = false
                            }
                        })
                        list[index].tasks = item.tasks
                        await updateDoc(doc(db, "usersLists", currentUser.uid), {
                            lists: list
                        })
                    }
                    if (action.type == 'confirmEdit') {
                        if (newList.length < 3 || newList.length > 25) {
                            setShowModal(true)
                            setModalStatus({
                                title: "Error occured",
                                message: "List name should contain at least 3 character and no more than 25 characters",
                                icon: <VscError className="w-10 h-10" />
                            })
                        }
                        else if (listNames.includes(newList) || !newList) {
                            setShowModal(true)
                            setModalStatus({
                                title: "Error occured",
                                message: "Task name cannot be empty or have duplicated name",
                                icon: <VscError className="h-10 w-10" />
                            })
                        }
                        else {
                            listNames.map(async (listName, index) => {
                                if (listName === listTaskContext.state.name) {
                                    listNames.splice(index, 1, newList)
                                    list[index].name = newList
                                    listTaskContext.dispatchState({type: "getListTasks", listInfo: list[index]})
                                    await updateDoc(doc(db, "usersLists", currentUser.uid), {
                                        lists: list,
                                        listsName: listNames
                                    })
                                }
                            })
                        }
                        console.log(list)
                        console.log(listNames)
                    }
                    if (action.type == 'confirmDelete') {
                        listNames.map(async (listName, index) => {
                            if (listName === listTaskContext.state.name) {
                                const newNames = listNames.filter(name => name !== newList)
                                const updatedList = list.filter(list => list.name !== newList)
                                listTaskContext.dispatchState({type: "getListTasks", listInfo: ""})
                                await updateDoc(doc(db, "usersLists", currentUser.uid), {
                                    lists: updatedList,
                                    listsName: newNames
                                })
                            }
                        })
                    }
                }
            })
        })
    }
    return (
        <div className="set-width bg-slate-200 h-screen w-3/4">
            {showModal && 
                <ModalEdit 
                    icon={modalStatus.icon} 
                    title={modalStatus.title} 
                    value={modalStatus.disabled ? modalStatus.value : newList} 
                    disabled={modalStatus.disabled}
                    buttonClick={modalStatus.buttonClick}
                    buttonContent={modalStatus.buttonContent}
                    handleChange={(e) => setNewList(e.target.value)}
                    cancelChange={() => {
                        setShowModal(false)
                        setNewList(listTaskContext.state.name)
                    }}
                />
            }
            {listTaskContext.state.name && <div className="mt-3 ms-5 me-5">
                <div className="grid gap-y-2 grid-cols-3 place-items-center">
                    <button className="h-8 text-2xl border-black ps-1.5" onClick={() => dispatch({type: 'editList'})}><MdEdit /></button>
                    <h1 className="text-center text-2xl font-bold mb-2">{listTaskContext.state.name}</h1>
                    <button className="h-8 text-2xl rounded-tr rounded-br ps-1.5" onClick={() => dispatch({type: 'deleteList'})}><MdDelete /></button>
                </div>
                <div className="grid gap-y-2 grid-cols-1 place-items-center">
                    <InputMainPage 
                        placeholder="Add tasks" 
                        width="w-[96%]" 
                        buttonWidth="w-10" 
                        rounded="rounded-tl rounded-bl" 
                        icon={<IoMdAdd />} 
                        handleChange={(e) => setTask(e.target.value)}
                        value={task}
                        action="addTask"
                    />
                </div>
                <h3 className="text-center text-l font-medium mt-6 mb-4">Your tasks:</h3>
                <div className="grid place-items-center">
                    <div className="set-buttonAction-flex-dir flex items-center w-4/5">
                        <div className="flex items-center">
                            <input className="w-10 h-8 rounded" type="checkbox" id="allCheck" onChange={handleCheck} checked={allCheck}/>
                            <button className="h-8 bg-red-500 rounded ms-3 p-2" onClick={() => dispatch({type: "markUncomplete"})}>Mark as Uncompleted</button>
                        </div>
                            
                        <div className="flex items-center set-margin">
                            <button className="h-8 bg-red-500 rounded ms-3 p-2" onClick={() => dispatch({type: "deleteSelectedTasks"})} >Delete</button>
                            <button className="h-8 bg-green-500 rounded ms-3 p-2" onClick={() => dispatch({type: "markComplete"})}>Mark as Completed</button>
                        </div>
                        
                        
                    </div>        
                </div>
                <div className="grid gap-y-3 grid-cols-1 place-items-center mt-2">
                    {tasks.map(item => {
                        return (
                            <Task 
                                key={item.id} 
                                id={item.id} 
                                name={item.name} 
                                checked={item.isChecked} 
                                completed={item.isCompleted}
                                edit="changeTask"
                                delete="deleteTask"
                                handleCheck={handleCheck} 
                            />
                        )
                    })}
                </div>
            </div>}    
        </div>
    )
}