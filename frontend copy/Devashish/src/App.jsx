//  for this type = (rafce)

import React from 'react'

import {BrowserRouter as Router , Routes, Routes} from
'react-router-dom'
const App = () => {
return (
    <Router>
        <Routes>
<Route path ='/' element={<h1>Welcome to Devashish Tech World</h1>} />
<Route path='/about' element={<h1>About us</h1>} />
        </Routes>
    </Router>

)
}

export default App