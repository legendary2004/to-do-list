import { useEffect, useState } from "react"
import { VscError } from "react-icons/vsc";
import Input from "./compnents/input"
import { useNavigate } from "react-router-dom";
import Modal from "./compnents/modal";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function() {
    const navigate = useNavigate()
    const [form, setForm] = useState({email: "", pass: ""});
    const [showModal, setShowModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState("a");
    const [modalStatus, setModalStatus] = useState({title: "", message: ""})
    function pageNavigation(path) {
        navigate(path, {replace: true})
    }

    function closeModal() {
        setShowModal(false)
    }

    function handleForm(e) {
        const id = e.target.id
        const value = e.target.value
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
            await signInWithEmailAndPassword(auth, form.email, form.pass).then(res => setErrorMsg(""))
        }
        catch(err) {
            
            console.log(err.code)
            setErrorMsg(err.code)
        }
    }

    useEffect(() => {
        if (errorMsg == 'auth/invalid-login-credentials' || errorMsg == 'auth/invalid-email' || errorMsg == 'auth/missing-password') {
            setModalStatus({
                title: 'Invalid credentials',
                message: 'Invalid email or password'
            })
        }
        else if (!errorMsg) pageNavigation("/")
    }, [errorMsg])
    return (
        <div className="bg-neutral-800 h-screen w-full relative">
            <div className="bg-neutral-300 w-1/3 h-1/2 absolute top-1/4 left-1/3 rounded">
                <div className="mt-20">
                    <h1 className="text-center pt-3 text-2xl font-bold">Login Page</h1>
                    <div className="grid gap-y-2 grid-cols-1 place-items-center mt-5">
                        <Input type="email" placeholder="Enter email" id="email" width="w-4/5" rounded="rounded" value={form.email} handleChange={handleForm}/>
                        <Input type="password" placeholder="Enter password" id="pass" width="w-4/5" rounded="rounded" value={form.pass} handleChange={handleForm}/>
                        <p className="mt-4 text-lg font-medium">Do not have an account? Click <a href="#" className="hover:underline hover:underline-offset-4 text-sky-400" onClick={() => pageNavigation("/register")}>here</a> to create one</p>
                        <button type="submit" className="rounded py-1 mt-2 w-1/3 bg-sky-400 hover:bg-sky-600 duration-200 font-medium" onClick={submitForm}>Log in</button>
                    </div>
                </div>    
            </div>
            {showModal && <Modal icon={<VscError className="w-10 h-10"/>} title={modalStatus.title} desc={modalStatus.message} handleClick={closeModal}/> } 
        </div>
    )
}