import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from '../helpers/axios';
import { AuthContext } from "../contexts/authContext.jsx";


export default function SignUpForm() {
    let [name, setName] = useState('');
    let [email, setEmail] = useState('');
    let [password, setPassword] = useState('');
    let [errors, setErrors] = useState(null);
    let navigate = useNavigate();
    let {dispatch} = useContext(AuthContext);

    let register = async (e) => {
        try {
            e.preventDefault();
            setErrors(null);
            let data = {
                name,
                email,
                password
            }
            let res = await axios.post('/api/users/register', data, {
                withCredentials: true
            });
            if (res.status === 200) {
                let userId = res.data.user._id;
                dispatch({ type: 'UPDATE_USER', payload: res.data.user }); 
                navigate(`/profile/${userId}?edit=true`);
            }
        } catch (e) {
            setErrors(e.response.data.errors);
        }
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            <form onSubmit={register} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h1 className="text-2xl font-bold text-center">Register Form</h1>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Name
                    </label>
                    <input value={name} onChange={e => setName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Name" />
                    {!!(errors && errors.name) && <p className="text-red-500 text-xs italic">{errors.name.msg}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input value={email} onChange={e => setEmail(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="text" placeholder="Email" />
                    {!!(errors && errors.email) && <p className="text-red-500 text-xs italic">{errors.email.msg}</p>}
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input value={password} onChange={e => setPassword(e.target.value)} className="shadow appearance-none rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************" />
                    {!!(errors && errors.password) && <p className="text-red-500 text-xs italic">{errors.password.msg}</p>}
                </div>
                <div className="flex items-center justify-between">
                    <button className="bg-orange-400 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                        Register
                    </button>
                    <Link to="/sign-in" className="inline-block align-baseline font-bold text-sm text-orange-400 hover:text-orange-400" href="#">
                        Login here
                    </Link>
                </div>
            </form>
            <p className="text-center text-gray-500 text-xs">
                &copy;2025 Khant Min Lwin.DevOps. All rights reserved.
            </p>
        </div>
    )
}