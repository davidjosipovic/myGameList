'use client'
import { useState, useEffect } from 'react'

function page() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setLoading] = useState(true)
 
  useEffect(() => {
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
  }, [])
 
  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No profile data</p>
 
  return (
    <div>
      <h1>{data[0].name}</h1>
      <p>{data[0].email}</p>
    </div>
  )
}

export default page