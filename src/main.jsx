// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
// import { AuthProvider } from './context/AuthContext.jsx'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <AuthProvider>
//       <App />
//     </AuthProvider>
//   </React.StrictMode>,
// )


// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'  // ⭐ Import karein

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>  {/* ⭐ Ye wrap karna zaroori hai */}
      <App />
    </AuthProvider>
  </StrictMode>,
)