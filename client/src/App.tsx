import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import { useUser } from './hooks/useUser';
import Register from './pages/Register';
import { useChat } from './hooks/useChat';

const App: React.FC = () => {
  const { userdetail,auth,getuser } = useUser();
  const {getAllUser} = useChat(); 
  // ✅ derive auth directly
  useEffect(()=>{
    getuser()
    getAllUser();
  },[])

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={auth ? <Home /> : <Navigate to="/log" replace />}
        />
        <Route path="/reg" element={!auth ? <Register /> : <Home />} />
        <Route
          path="/log"
          element={!auth ? <Login /> : <Navigate to="/" replace />}
        />
      </Routes>
    </>
  );
};

export default App;