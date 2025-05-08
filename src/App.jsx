import { useState } from 'react'
import './App.css'
import Hero from './components/custom/Hero'
import 'leaflet/dist/leaflet.css';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* Hero */}
      <Hero/>
    </>
  )
}

export default App
