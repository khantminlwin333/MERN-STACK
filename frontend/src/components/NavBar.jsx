import { useContext,useState,useEffect,useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/authContext.jsx";
import axios from "../helpers/axios.js";
import registerImg from '../assets/register.png';
import loginImg from '../assets/loggedin.png';


export default function NavBar() {
  let navigate = useNavigate();
  let { user, dispatch } = useContext(AuthContext);
  let [isOpen,setIsOpen] = useState(false);
  const aboutRef = useRef(null);
  let [searchQuery, setSearchQuery] = useState("");
  let [userPic, setUserPic] = useState(null);

  
  useEffect(()=>{
    
    if (user?.photo) {
      setUserPic(import.meta.env.VITE_BACKEND_ASSET_URL + user?.photo);
    } else {
      setUserPic(loginImg); // Default profile image
    }

    const handleClickOutside = (event) => {
      if (aboutRef.current && !aboutRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      
    };
    
  },[user]);


  
  let handleSearch = async () => {
    try {
      const res = await axios.get(`/api/recipes/search?q=${searchQuery}`);
      if (res.status === 200) {
        navigate('/search?q=' + searchQuery, { state: { searchResults: res.data } });
        setSearchQuery("");
      }
    } catch (e) {
      console.log("Search failed", e);
    }
  };

  let logout = async () => {
    try {
      let res = await axios.post('/api/users/logout', {}, { withCredentials: true });
      if (res.status === 200) {
        dispatch({ type: "LOGOUT" });
        navigate('/sign-in');
      }
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <nav className='flex justify-between items-center p-5 bg-white relative z-50'>
      <div>
        <Link to="/" className='hover:text-orange-400'>
        <h1 className='font-bold text-2xl text-orange-400'>Recipicity</h1>
        </Link>
      </div>
           {/* Search form for recipes */}
           <div className="relative w-84 md:w-50 lg:w-110 flex items-center">
        <input
          type="text"
          className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-300 rounded-md pl-3 pr-10 py-2 transition focus:outline-none focus:border-slate-500 hover:border-slate-400 shadow-sm"
          placeholder="Search recipes or users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-slate-800 p-1.5 text-white shadow-sm hover:shadow focus:bg-slate-700 active:bg-slate-700 disabled:opacity-50"
          onClick={handleSearch}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      

      <ul className='flex space-x-10'>
        
        <li className="hidden md:flex"><NavLink to="/" className='hover:text-orange-400 home'>Home</NavLink></li>
        
        <li><NavLink to="/create" className='hover:text-orange-400 create-recipe'>Create Recipe</NavLink></li>

      {/** This is About toogle bar */}

      <div className="relative" ref={aboutRef}>

      <img src={ user? userPic : registerImg} alt="" className="w-10 h-10 rounded-full cursor-pointer" onClick={()=>setIsOpen(!isOpen)}/>
    

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-3" onMouseLeave={()=>setIsOpen(false)}>
          <ul className="space-y-2">

          { user && <li>
              <NavLink to={`/profile/${user._id}`} className="hover:text-orange-400">
                Profile
              </NavLink>
            </li>}

            {!user ? (
              <>
                <li>
                  <Link to="/sign-in" className="hover:text-orange-400">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/sign-up" className="hover:text-orange-400">
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <button onClick={logout} className="hover:text-orange-400">
                  Log Out
                </button>
              </li>
            )}
            
          </ul>
        </div>
      )}
    </div>
        
      </ul>
    </nav>
  );
}
