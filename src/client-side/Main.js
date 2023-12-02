import { useContext, useEffect, useState } from "react";
import InputMainPage from "./compnents/inputMainPage";
import Modal from "./compnents/modal";
import ListSide from "./ListSide";
import { FaSearch } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { TiTick } from "react-icons/ti";
import { VscError } from "react-icons/vsc";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "./contexts/userContext";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { arrayUnion, collection, getDocs, getDoc, query, updateDoc, where, doc, onSnapshot } from "firebase/firestore";
import { ListContext } from "./contexts/listContext";
import ListNameContext from "./contexts/listNameContext";
export default function() {
    const navigate = useNavigate();
    const location = useLocation()
    const [showModal, setShowModal] = useState(true);
    const [sideForm, setSideForm] = useState({addForm: "", searchForm: ""});
    const [modalStatus, setModalStatus] = useState({title: "", message: "", icon: ""});
    const currentUser = useContext(UserContext);

    function handleFormChange(e) {
        const id = e.target.id;
        const value = e.target.value;
        setSideForm(prevValue => {
            return {
                ...prevValue,
                [id]: value
            }
        })
    }

    useEffect(() => {
        if (!currentUser) {
            setModalStatus({
                title: "Hello there",
                message: "You must sign in to use our app",
                icon: <VscError className="w-10 h-10" />
            })
        }
        if (currentUser) {
            console.log(currentUser)
            setModalStatus({
                title: "Hello there",
                message: "Welcome user. You are ready to go",
                icon: <TiTick className="w-10 h-10"/>
            })
        }
    }, [currentUser])

    function pageNavigation(path) {
        navigate(path, {replace: true})
    }

    function closeModal() {
        setShowModal(false)
        if (!currentUser) pageNavigation("/login")
    }

    async function signOutUser() {
        await signOut(auth);
        pageNavigation("/login");
    }

    return (
        <div className="set-main-flex-dir h-screen flex">
            {showModal && <Modal icon={modalStatus.icon} title={modalStatus.title} desc={modalStatus.message} handleClick={closeModal}/>}
            <div className="set-width bg-neutral-300 w-1/4 shadow-md shadow-inner">
                <div className="mt-3 ms-5 me-5">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">To do list</h1>
                        <button type="button" className="text-base font-normal hover:underline hover:underline-offset-8" onClick={signOutUser}>Log out</button>
                    </div>
                    {currentUser && <div className="flex justify-center items-center mt-3">
                        <img src={currentUser.photoURL} className="rounded-[50%] w-12 h-12"/>
                        <p type="button" className="text-xl font-normal ms-2">{currentUser.displayName}</p>
                    </div>}
                    <div className="grid gap-y-2 grid-cols-1 place-items-center mt-3">
                        <InputMainPage 
                            placeholder="Add list" 
                            buttonWidth="w-10" 
                            width="w-[97%]" 
                            rounded="rounded-tl rounded-bl" 
                            icon={<IoMdAdd />} 
                            value={sideForm.addForm} 
                            handleChange={handleFormChange} 
                            id="addForm"
                            action="addList"
                        />
                        <InputMainPage 
                            placeholder="Search your list" 
                            buttonWidth="w-10" 
                            width="w-[97%]" 
                            rounded="rounded-tl rounded-bl" 
                            icon={<FaSearch />} 
                            value={sideForm.searchForm} 
                            handleChange={handleFormChange} 
                            id="searchForm"
                            action="searchList"
                        />
                    </div>
                    <h3 className="text-lg font-bold text-center mt-2">Your lists: </h3>
                    <ListNameContext />
                </div>
            </div>
            <ListSide />
        </div>
    )
}