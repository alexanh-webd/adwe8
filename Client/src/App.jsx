import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './components/Login'
import Home from './components/Home'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import SignInSide from './SignInSide';
import EditFile from './components/EditFile'
import SignUp from './components/SignUp'
import NonAuthContent from './components/NonAuthContent'
function App() {
  return (
    <div>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/login" element={<SignInSide />}/>
            <Route path="/" element={<Home />}/>
            <Route path="/edit/:fileId" element={<EditFile />}/>
            <Route path="/signup" element={<SignUp />}/>
            <Route path= "/content/:fileId" element={<NonAuthContent/>}/>
          </Routes>  
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App
