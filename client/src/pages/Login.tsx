import React, { useState } from 'react'
import { useUser } from '../hooks/useUser'
// import { login_data } from '../types'
import { useNavigate } from 'react-router-dom'


const Login:React.FC = () => {
    const { login } = useUser()
    const [data,setData] = useState({email:"",pass:""});
    const navigate = useNavigate()
    function submit(e:React.FormEvent<HTMLFormElement>){ 
        e.preventDefault()
        if(!data.email || !data.pass){
            return;
        }
        console.log(data)
        login(data);
        navigate("/");
    }
    function change(e:React.ChangeEvent<HTMLInputElement>){
        setData({...data,[e.target.name]: e.target.value})
    }
    return (
        <div className='flex items-center justify-center bg-gradient-to-tr from-[#f82aff] to-[#2f96b8] h-screen'>
            <form className='w-96  bg-gradient-to-tr from-[#d856d8] to-[#d5a346] p-3 rounded-lg' onSubmit={(e)=>{submit(e)}}>
                <div className='flex'>
                    <h1 className='block mx-auto font-semibold text-xl mb-3'>login form</h1>
                </div>
                <div className='flex flex-col'>
                    <label htmlFor="Email" className='text-[10px] p-1'>Email</label>
                    <input onChange={(e)=>{change(e)}} name="email" value={data.email} type="text" className='flex-1 px-2 py-1 mb-2 bg-gray-200 rounded-md focus:outline-none focus:border-b-gray-700 border-2 ' placeholder='E-mail' id="" />
                </div>
                <div  className='flex flex-col'>
                    <label htmlFor="password" className='text-[10px] p-1'>Password</label>
                    <input onChange={(e)=>{change(e)}} name="pass" value={data.pass} type="password" className='flex-1 px-2 py-1 mb-5 bg-gray-200 rounded-md focus:outline-none focus:border-b-gray-700 border-2 ' placeholder='E-mail'  id="" />
                </div>
                <div className='w-full'>
                    <button type='submit' className='px-5 py-2 text-md  hover:duration-1000 transition-all block bg-slate-300 rounded-lg mx-auto'>Login</button>
                </div>
                <div className='flex'>
                    <h1 className='mx-auto'>Don't Have an account?? <a href='/reg' className='text-green-500 text-xl'>Register</a></h1>
                </div>
            </form>
        </div>
    )
}

export default Login