import React, { useState } from "react"

export default function Test() {
  const [count, setCount] = useState(0)

  const handleIncrement = () => {
    console.log("+")
    setCount(count + 1)
  }

  return (
    <div>
      <h2>Simple React Component with State</h2>
      <p>Current Count: {count}</p>
      <button onClick={handleIncrement}>Increment</button>
    </div>
  )
}
