// Login.tsx
import React, { useState } from 'react'
import { useUser } from '../hooks/useUser'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Login: React.FC = () => {
  const { login } = useUser()
  const [data, setData] = useState({ email: '', pass: '' })
  const navigate = useNavigate()

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!data.email || !data.pass) return
    login(data)
    navigate('/')
  }

  function change(e: React.ChangeEvent<HTMLInputElement>) {
    setData({ ...data, [e.target.name]: e.target.value })
  }

  return (
    <div className='h-screen overflow-hidden'>
        <Navbar />
    <div className="bg-[#f0ebe3] flex h-full">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#7c6f64] to-[#a39081] items-center justify-center relative overflow-hidden">
        <div className="absolute top-16 right-20 w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-28 left-16 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-12 w-20 h-20 rounded-2xl rotate-45 bg-white/10" />

        <div className="relative z-10 px-12 max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-light text-white leading-tight">
            Welcome<br /><span className="font-semibold">back.</span>
          </h1>
          <p className="text-white/60 text-sm mt-4 leading-relaxed">
            Sign in to continue your conversations and stay connected with the people who matter most.
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6">

        <div className="w-full max-w-sm">

          <p className="text-[#a39081] text-xs uppercase tracking-widest mb-2">Welcome back</p>
          <h2 className="text-2xl font-semibold text-[#3d3530] mb-1">Sign in to your account</h2>
          <p className="text-[#8a7e74] text-sm mb-8">Pick up where you left off</p>

          <form onSubmit={submit} className="space-y-4">
            <input
              onChange={change} name="email" value={data.email} type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3.5 bg-white rounded-xl border-2 border-[#e8e0d8] text-[#3d3530] placeholder-[#c4b5a5] focus:outline-none focus:border-[#7c6f64] transition-all text-sm"
            />
            <input
              onChange={change} name="pass" value={data.pass} type="password"
              placeholder="Password"
              className="w-full px-4 py-3.5 bg-white rounded-xl border-2 border-[#e8e0d8] text-[#3d3530] placeholder-[#c4b5a5] focus:outline-none focus:border-[#7c6f64] transition-all text-sm"
            />

            <button
              type="submit"
              className="w-full py-3.5 bg-[#7c6f64] hover:bg-[#6a5f55] text-white rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-[#7c6f64]/20 active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <p className="text-sm text-[#8a7e74] text-center mt-6">
            Don't have an account?{' '}
            <a href="/reg" className="text-[#7c6f64] font-semibold hover:underline">Register</a>
          </p>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Login