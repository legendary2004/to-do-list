import React, { useEffect, useState } from "react";
import { FaRegFileImage } from "react-icons/fa";
import { VscError } from "react-icons/vsc"
import Input from "./compnents/input";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import Modal from "./compnents/modal";
import { useNavigate } from "react-router-dom";

export default function() {
    const navigate = useNavigate();
    const [form, setForm] = useState({firstName: '', lastName: '', email: '', pass: '', repeatPass: '', profile: ''});
    const [showModal, setShowModal] = useState(false)
    const [errorMsg, setErrorMsg] = useState("a");
    const [modalStatus, setModalStatus] = useState({title: "", message: ""});

    function pageNavigation(path) {
        navigate(path, {replace: true})
    }

    function closeModal() {
        setShowModal(false)
    }

    function handleForm(e) {
        const id = e.target.id;
        const value = e.target.type == 'file' ? e.target.files[0] : e.target.value;
        setForm(prevValue => {
            return {
                ...prevValue,
                [id]: value
            }
        })
    }
    
    async function submitForm() {
        setShowModal(true)
        try {
            if (form.pass !== form.repeatPass) setErrorMsg("auth/invalid-password")
            else {
                await createUserWithEmailAndPassword(auth, form.email, form.pass)
                .then(async res => {
                    setErrorMsg('')
                    const imageRef  = ref(storage, res.user.uid);
                    form.profile && await uploadBytes(imageRef, form.profile);
                    const imageUrl = form.profile ? await getDownloadURL(imageRef) : "https://firebasestorage.googleapis.com/v0/b/todo-list-60266.appspot.com/o/profile.png?alt=media&token=74a2d1f7-5c30-4cdf-9593-aac218a03017"
                    await updateProfile(res.user, {
                        displayName: `${form.firstName} ${form.lastName}`,
                        photoURL: imageUrl
                    });
                    await setDoc(doc(db, "users", res.user.uid), {
                        uid: res.user.uid,
                        email: res.user.email,
                        displayName: `${form.firstName} ${form.lastName}`,
                        photoURL: imageUrl
                    });
                    await setDoc(doc(db, "usersLists", res.user.uid), {
                        listsName: [],
                        lists: []
                    });
                })
            }
            
        }
        catch (err) {
            setErrorMsg(err.code)
            console.log(err.code)
        }
    }

    useEffect(() => {
        if (errorMsg  == 'auth/email-already-in-use') {
            setModalStatus({
                title: "Email in use",
                message: "This email is already in use. Use a different email"
            })
        }
        else if (errorMsg == 'auth/invalid-email') {
            setModalStatus({
                title: "Invalid email",
                message: "This email is not valid"
            })
        }
        else if (errorMsg == 'auth/weak-password' || errorMsg == 'auth/missing-password') {
            setModalStatus({
                title: "Weak password",
                message: "Password must contain at least 6 letters"
            })
        }
        else if (errorMsg == 'auth/invalid-password') {
            setModalStatus({
                title: "Invalid passwords",
                message: "Passwords do not match"
            })
        }
        else if (!errorMsg) {
            pageNavigation("/")
        }
    }, [errorMsg])
    return (
        <div className="bg-neutral-800 h-screen w-full grid grid-cols-1 place-items-center">
            <div className="set-auth-width bg-neutral-300 w-1/3 rounded">
                <div className="my-5">
                    <h1 className="text-center pt-3 text-2xl font-bold">Register Page</h1>
                    <div className="grid gap-y-2 place-items-center mt-5">
                        <div className="flex gap-x-2 grid-cols-2 w-4/5">
                            <Input type="text" placeholder="Enter first name" width="w-1/2" rounded="rounded" id="firstName" value={form.firstName || ""} handleChange={handleForm}/>
                            <Input type="text" placeholder="Enter last name" width="w-1/2" rounded="rounded" id="lastName" value={form.lastName} handleChange={handleForm}/>
                        </div>
                            <Input type="email" placeholder="Enter email" width="w-4/5" rounded="rounded" id="email" value={form.email} handleChange={handleForm}/>
                            <Input type="password" placeholder="Enter password" width="w-4/5" rounded="rounded" id="pass" value={form.pass} handleChange={handleForm}/>
                            <Input type="password" placeholder="Repeat password" width="w-4/5" rounded="rounded" id="repeatPass" value={form.repeatPass} handleChange={handleForm}/>
                        <div>
                            <label className="flex justify-center items-center cursor-pointer mt-1">
                                <FaRegFileImage className="w-8 h-6"/>
                                <p className="font-medium">Upload profile picture</p>
                                <input type="file" className="hidden" id="profile" onChange={handleForm}/>
                            </label>
                            {form.profile && <p className="font-medium mt-2 ms-2">Your image: {form.profile.name}</p>}
                        </div>
                        <p className="ps-2 mt-2 text-lg font-medium">Already have an account? Click <a href="#" className="hover:underline hover:underline-offset-4 text-sky-400" onClick={() => pageNavigation("/login")}>here</a> to sign in</p>
                        <button type="submit" className="rounded py-1 w-1/3 bg-sky-400 hover:bg-sky-600 duration-200 font-medium" onClick={submitForm}>Sign up</button>
                    </div>
                </div>
                {showModal && <Modal icon={<VscError className="w-10 h-10"/>}title={modalStatus.title} desc={modalStatus.message} handleClick={closeModal}/> }  
            </div>
        </div>
    )
}