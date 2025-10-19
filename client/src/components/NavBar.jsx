import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, register } from '../pages/api'

export default function NavBar(){
  const navigate = useNavigate();
  const [q, setQ] = React.useState('');
  const [email, setEmail] = React.useState('alice@example.com');
  const [password, setPassword] = React.useState('password123');

  async function demoLogin(){
    try{
      await login(email, password);
      alert('Logged in!');
    }catch(e){
      alert('Login failed: ' + e.message);
    }
  }

  return (
    <header style={{background:'#111', color:'#fff'}}>
      <div style={{display:'flex', alignItems:'center', gap:16, maxWidth:1100, margin:'0 auto', padding:16}}>
        <Link to="/" style={{color:'#fff', textDecoration:'none', fontWeight:700}}>BookHive</Link>
        <input placeholder="Search books..." value={q} onChange={e=>setQ(e.target.value)}
          onKeyDown={e=> e.key==='Enter' && navigate(`/books?q=${encodeURIComponent(q)}`)}
          style={{flex:1, padding:'8px 12px', borderRadius:6, border:'1px solid #333', background:'#222', color:'#fff'}} />
        <button onClick={demoLogin} title="Demo login" style={{background:'#fff', border:'none', padding:'8px 12px', borderRadius:6}}>Login</button>
        <Link to="/cart" style={{color:'#fff'}}>Cart</Link>
        <Link to="/orders" style={{color:'#fff'}}>Orders</Link>
      </div>
    </header>
  )
}
