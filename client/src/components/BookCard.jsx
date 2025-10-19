import React from 'react'
import { Link } from 'react-router-dom'

export default function BookCard({b}){
  return (
    <div style={{border:'1px solid #eee', borderRadius:10, padding:16}}>
      <div style={{fontWeight:600, marginBottom:6}}>{b.title}</div>
      <div style={{color:'#666', fontSize:14, minHeight:18}}>{b.authors}</div>
      <div style={{margin:'8px 0', fontWeight:700}}>₹ {Number(b.price).toFixed(2)}</div>
      <Link to={`/book/${b.id}`} style={{textDecoration:'none', color:'#0366d6'}}>View</Link>
    </div>
  )
}
