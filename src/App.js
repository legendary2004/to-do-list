import './App.css';
import Login from './client-side/Login';
import Main from './client-side/Main';
import Register from './client-side/Register';
import {BrowserRouter, Route, Routes} from "react-router-dom"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/register" element={<Register />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
