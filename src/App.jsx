import React from 'react'
import Login from './pages/Login'
import TodoPage from './pages/TodoPage'
import Register from './pages/Register'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
const App = () => {
  return (
     <Router>
      <Routes>
          <Route path='/login' element={<Login />} />

        <Route path='/' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/Home' element={<TodoPage />} />
      </Routes>
     </Router>
  )
}

export default App