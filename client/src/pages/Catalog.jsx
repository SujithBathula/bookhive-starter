import React from 'react'
import { useSearchParams } from 'react-router-dom'
import BookCard from '../components/BookCard'
import { api } from './api'

export default function Catalog(){
  const [sp] = useSearchParams()
  const [data, setData] = React.useState([])

  React.useEffect(()=>{
    const q = sp.get('q') || ''
    api(`/books?q=${encodeURIComponent(q)}`).then(setData)
  }, [sp])

  return (
    <section>
      <h2>Catalog</h2>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:16}}>
        {data.map(b=> <BookCard key={b.id} b={b}/>)}
      </div>
    </section>
  )
}
