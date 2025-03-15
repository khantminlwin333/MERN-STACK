import { createContext, useEffect, useReducer } from "react";
import axios from '../helpers/axios';

const AuthContext = createContext();

let AuthReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            //store user in localstorage
            localStorage.setItem('user', JSON.stringify(action.payload))
            return { user: action.payload };
            case "UPDATE_USER":
                // Update user in localStorage
                localStorage.setItem('user', JSON.stringify(action.payload));
                return { user: action.payload };
        case "LOGOUT":
            //remove user in localstorage
            localStorage.removeItem('user');
            return { user: null };
        default:
            return state;
    }
}

const AuthContextProvider = ({ children }) => {

    //get user from loaclSotrage
    const userStorage = localStorage.getItem('user');
    //initialize state // this need to prevent logged out for refreshing the page
    let [state, dispatch] = useReducer(AuthReducer, {
        user: userStorage || null
    });

    useEffect(() => {
        
        try {
            axios.get('/api/users/me').then(res => {
                let user = res.data;
                if (user) {
                    dispatch({ type: 'LOGIN', payload: user })
                    //dispatch({type: 'REGISTER',payload:user})
                }
                else {
                    dispatch({ type: "LOGOUT" });
                }
            })

        } catch (e) {
            dispatch({ type: "LOGOUT" });
        }
    }, [])

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    )
}
export { AuthContext, AuthContextProvider };


