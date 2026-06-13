import { useState } from 'react'
import Signup from './components/authentication/Signup'
import "@fontsource/inter";


function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Signup/>
    </div>
  )
}

export default App
