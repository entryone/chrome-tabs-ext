import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import Button from '@mui/material/Button'
import { useState, useEffect } from 'react'
import './App.css'
import TodoList from "./TodoList";
//import { closeProhibited, extractHostname } from '../../common/background'

function App() {
  const [hostName, setCurrentHostName] = useState('')

  useEffect(() => {

  }, [])

  const onChange = e => {
    setSites(e.target.value)
  }

  const onAdd= () => {

  }

  const onGiveMeMinute = () => {

  }

  return (
    <div className="App">
        <TodoList />
    </div>
  )
}

export default App







