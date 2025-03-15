import logInImg from '../assets/loggedin.png';
import { useContext, useEffect, useState,useCallback } from 'react';
import axios from '../helpers/axios';
import { useLocation, useNavigate, useParams,Link } from 'react-router-dom';
import { AuthContext } from '../contexts/authContext';
import RecipeCard from "../components/RecipeCard";
import { Helmet } from 'react-helmet';

export default function Profile() {
  let { id } = useParams();
  let { user } = useContext(AuthContext);
  let navigate = useNavigate();
  let location = useLocation();

  let [originalValues,setOriginalValues] = useState({});
  let [name, setName] = useState('');
  let [email, setEmail] = useState('');
  
  let [sex, setSex] = useState('');
  let [birthDate, setBirthDate] = useState('');
  let [age,setAge] = useState('');

  let [oldPassword, setOldPassword] = useState('');
  let [newPassword, setNewPassword] = useState('');
  let [phone, setPhone] = useState('');
  let [userRecipes,setUserRecipes] = useState([]);


  let [editProfile, setEditProfile] = useState(false);
  
  let [errors, setErrors] = useState([]);
  let [preview, setPreview] = useState(logInImg);
 // let [defaultPhoto,setDefaultPhoto] = useState('');
  let [file, setFile] = useState(null);
  let [loading, setLoading] = useState(false);
  let [changePassword, setChangePassword] = useState(false);
  let [pasBtn, setPasBtn] = useState(true);

  let [passwordAttempts, setPasswordAttempts] = useState(0);
  let [passwordError, setPasswordError] = useState('');
  let [showForgotPassword, setShowForgotPassword] = useState(false);

  let [deletePending, setDeletePending] = useState(false);

  useEffect(() => {
    // Check query parameter for edit mode
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('edit') === 'true') {
        setEditProfile(true);
    }
}, [location.search]);


  useEffect(() => {
    let fetchUser = async () => {
      if (id) {
        let res = await axios.get('/api/users/profile/' + id);
        if (res.status === 200) {

          const userData = {
            name: res.data.name,
            email: res.data.email,
            phone: res.data.phone,
            sex: res.data.sex,
            birthDate: res.data.birthDate ? new Date(res.data.birthDate).toISOString().split("T")[0] : "",
            calculateAge : calculateAge(res.data.birthDate ? new Date(res.data.birthDate).toISOString().split("T")[0] : ""),
            preview : import.meta.env.VITE_BACKEND_ASSET_URL + res.data.photo,
          };
          setOriginalValues(userData);
          setName(userData.name);
          setEmail(userData.email);
          setPreview(userData.preview);
          setSex(userData.sex);
          setBirthDate(userData.birthDate);
          calculateAge(userData.birthDate);
          setPhone(userData.phone);

         
          let recipesRes = await axios.get(`/api/recipes/userRecipe/${res.data._id}`);
          setUserRecipes(recipesRes.data || []);

          if(res.data.photo){
            setPreview(import.meta.env.VITE_BACKEND_ASSET_URL + res.data.photo);
          }else{
            setPreview(logInImg)
          }
          //if(user && res.data._id === id){
          //  setEditProfile(true);
         // }


        }
      }
    };
    fetchUser();

    
  }, [id, user]); // Add `user` as dependency to refetch data on user change



// Define validateForm using useCallback
const validateForm = useCallback(() => {
  const newErrors = {};

  // Validate each field
  const nameErrors = validateField('name', name);
  const phoneErrors = validateField('phone', phone);
  const birthDateErrors = validateField('birthDate', birthDate);
  const oldPasswordErrors = validateField('oldPassword', oldPassword);
  const newPasswordErrors = validateField('newPassword', newPassword);

  // Combine all errors
  Object.assign(newErrors, nameErrors, phoneErrors, birthDateErrors, oldPasswordErrors, newPasswordErrors);

  setErrors(newErrors);
},[name, phone, birthDate, oldPassword, newPassword]); // Add dependencies

useEffect(() => {
  if(editProfile)
  {validateForm();}
}, [editProfile,validateForm]); // Only include validateForm

  const validateField = (field, value) => {
    const newErrors = {};
  
    switch (field) {
      case 'name':
        if (value.length > 20) newErrors.name = "Name cannot be more than 20 characters";
        if(value.length===0)newErrors.name="Name can not be empty!";
        break;
      case 'oldPassword':
        if (!value && newPassword) newErrors.oldPassword = "Fill Old Password";
        break;
      case 'newPassword':
        if (!value && oldPassword) newErrors.newPassword = "Fill New Password";
        break;
      case 'phone':
        if (!/^\d+$/.test(value)) newErrors.phone = "Only numbers are allowed for phone.";
        break;
      case 'birthDate':
        if (value) {
          let selectedYear = new Date(value).getFullYear();
          let currentYear = new Date().getFullYear();
          let underAge = currentYear - selectedYear;
  
          if (underAge < 18) {
            newErrors.birthDate = "Only above 18 years are allowed!";
          }
          if (selectedYear > currentYear) {
            newErrors.birthDate = "Birth date cannot be in the future.";
          }
        }
        break;
        default:
        break;
    }
  
    return newErrors;
  };
  
  const handleInputChange = (setter, field) => (e) => {
    const value = e.target.value;
    setter(value);
  
    // Validate only the changed field

    if(editProfile)
      {const fieldErrors = validateField(field, value);
    setErrors((prevErrors) => ({ ...prevErrors, ...fieldErrors }));}
  };
  


  const handleBirthDateChange = (e) => {
    const selectedDate = e.target.value;
    setBirthDate(selectedDate);
    calculateAge(selectedDate);
  
  
    // Validate only the birthDate field
    const fieldErrors = validateField('birthDate', selectedDate);
    setErrors((prevErrors) => ({ ...prevErrors, ...fieldErrors }));
  };

const isSubmitDisabled = Object.keys(errors).length > 0;

const handleCancel = () => {
  setName(originalValues.name);
  setEmail(originalValues.email);
  setPhone(originalValues.phone);
  setSex(originalValues.sex);
  calculateAge(originalValues.birthDate);
  setBirthDate(originalValues.birthDate);
  setEditProfile(false);
  setPasBtn(true);
  setChangePassword(false);
  setErrors([]);
};

  

  let submitUser = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
     
    
      let userData = {
        name,
        email,
        phone,
        sex,
        birthDate,
        oldPassword,
        newPassword,
      };

      let res;
      if (id) {
        res = await axios.patch('/api/users/editprofile/' + id, userData);
        setPasswordAttempts(0); // Reset attempts on success
        setPasswordError('');

      }

      if (deletePending) {
        await axios.delete('/api/users/delete-photo/'+ id);
        setPreview(logInImg);
        setFile(null);
        document.getElementById("upload_profile").value = "";
        setDeletePending(false); // Reset delete flag
      }
      
      if (res?.status === 200) {
        setLoading(false);
        setEditProfile(false)
        setPasswordAttempts(0);
        setPasswordError('');
        setChangePassword(true);
        setOldPassword(null);
        setNewPassword(null);
        
        setPasBtn(true);
        setChangePassword(false);
        setErrors([]);
      } 
        else {
          setLoading(false);
          console.error('Error updating profile:', e);
          setErrors(prevErrors => [...prevErrors, "Unexpected error occurred. Try again!"]);
        }
     

      if (file) {
        let formData = new FormData();
        formData.set('photo', file);

        await axios.post(`/api/users/${res.data._id}/upload`, formData, {
          headers: { Accept: "multipart/form-data" }
        });
      }
    } 
    catch (error) {
      setLoading(false);
      console.log("error",error);

      if (error.response) {
        
          setLoading(false);

            let errorMessage = error.response.data.msg || "Something went wrong";
          
            if (errorMessage === "Old password is incorrect") {
              let attempts = passwordAttempts + 1;
              setPasswordAttempts(attempts);
              setPasswordError(errorMessage);
          
              if (attempts >= 3) {
                setShowForgotPassword(true);
              }
            } else {
              setErrors(prevErrors => [...prevErrors, errorMessage]);
            }
          
    } else {
        console.error("Request Error:", error.message);
        alert("Something went wrong. Please try again.");
    }

    }
  };

//Uploading profile picture
  let upload = (e) => {
    e.preventDefault();
    let selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    let fileReader = new FileReader();
    fileReader.onload = (e) => setPreview(e.target.result);
    fileReader.readAsDataURL(selectedFile);
  };
//Deleting porfile picture
  const handleDeleteImage= (e) => {
    e.preventDefault();
    setPreview(logInImg);
    setDeletePending(true); // Mark the photo for deletion
    alert("Photo will be deleted when you submit the form.");
  };

// ✅ Function to calculate age
const calculateAge = (DOB) => {
  if (!DOB) return;
  const birthDate = new Date(DOB);
  const today = new Date();
  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
 const monthDifference = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if the birthday hasn't occurred this year yet
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
   age--;
  }
  setAge(age);
};

  let editProfileBtn = () => {
    setEditProfile(true);
  };

  let changepassword=(e)=>{
    e.preventDefault();
    setChangePassword(true);
    setPasBtn(false);
  }

  
  return (
    <>
    <Helmet>
        <title>{name ? `${name}` : "Loading Profile..."}</title>
      </Helmet>
      <section className="py-10 my-auto dark:bg-gray-700">
        <div className="lg:w-[80%] md:w-[90%] w-[96%] mx-auto flex gap-4">
          <div className="lg:w-[88%] sm:w-[88%] w-full mx-auto shadow-2xl p-4 rounded-xl h-fit self-center dark:bg-gray-800/40">
            <div>
              <div className="relative">
                <h1 className="lg:text-3xl md:text-2xl text-xl font-serif font-extrabold mb-2 dark:text-white">
                  Profile
                </h1>
                {user && user._id === id && !editProfile && (
                  <button 
                    onClick={editProfileBtn}
                    className="absolute top-0 right-0 text-sm mb-4 text-white-400 bg-yellow-600 hover:bg-blue-700 p-2 rounded-lg border-2 border-blue-600 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 transition-colors duration-200"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              <form action="" onSubmit={submitUser}>
              <div className="flex justify-center items-center w-full">
  <div className="relative w-[141px] h-[141px] rounded-full overflow-hidden">
    <img 
      src={preview} 
      alt="" 
      className="w-full h-full rounded-full object-cover"
    />
    
    {/* Upload Icon */}
    { user && user._id === id && editProfile &&(
      <label htmlFor="upload_profile" className="absolute animate-bounce bottom-2 right-2 bg-white p-1 rounded-full cursor-pointer shadow">
      <svg className="w-6 h-6 text-blue-700" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"></path>
      </svg>
    </label>)}

{/* 🔥 Delete Icon */}
{user && user._id === id && editProfile && preview !==logInImg && (
    <button 
    onClick={handleDeleteImage} 
    className="absolute animate-bounce cursor-pointer bottom-2 left-2 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700 transition"
  >
    ❌
  </button>
  )}

    {/* Hidden File Input */}
    <input type="file" onChange={upload} name="photo" id="upload_profile" hidden />
  </div>
</div>
{user && user._id === id && editProfile && (<h2 className="text-center mt-1 font-semibold dark:text-gray-300">Upload Profile Image</h2>)}
                <div className="flex flex-col lg:flex-row gap-2 justify-center w-full">
                  <div className="w-full mb-4 mt-6">
                    <input
                       disabled={!editProfile}
                      type="text"
                      value={name}
                      onChange={handleInputChange(setName,"name")}
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      placeholder="Name"
                    />
                     {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  
                  {passwordAttempts >= 3 && showForgotPassword && (
    <div onClick={()=> setShowForgotPassword(false)} className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div className="w-[90%] sm:w-md bg-red-300 p-6 rounded-lg relative z-50">
      <button
        onClick={() => navigate("/forgot-password")}
        className="w-full p-4 text-lg font-semibold text-white bg-red-600 
        hover:bg-red-700 rounded-lg transition duration-200"
      >
        Forgot Password?
      </button>
    </div>
    </div>

)}

                    {user && user._id === id && editProfile && pasBtn && (
                      <div className="w-full mb-4 lg:mt-6">                   

                      <button onClick={changepassword} className="w-full p-4 text-lg font-semibold text-white bg-red-600 
                      hover:bg-red-700 rounded-lg transition duration-200">
                        Change Password(Option)
                      </button>
                      </div>
                    )}
                    { user && user._id === id && editProfile && changePassword && (<>
                      <div className="w-full mb-4 lg:mt-6">
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={handleInputChange(setOldPassword,"oldPassword")}
                           className={`block py-2.5 px-0 w-full text-sm text-gray-500 
                            bg-transparent border-0 border-b-2 
                            ${errors.oldPassword ? ' text-red-500 border-red-500 dark:border-red-500 focus:border-red-600' : 'border-gray-300 dark:border-gray-600 focus:border-blue-600'} 
                            appearance-none dark:text-white focus:outline-none focus:ring-0 peer`}
                        placeholder={errors.oldPassword ? "Fill old password" : "Old Password"}
                      />
                       {errors.oldPassword && <p className="text-red-500 text-xs mt-1">{errors.oldPassword}</p>}
                       {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                    </div>
                  
                  
               
                    <div className="w-full mb-4 lg:mt-6">
                      <input
                        
                        type="password"
                        value={newPassword}
                        onChange={handleInputChange(setNewPassword,"newPassword")}
                        className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 
                          ${errors.newPassword ? ' text-red-500 border-red-500 dark:border-red-500 focus:border-red-600' : 'border-gray-300 dark:border-gray-600 focus:border-blue-600'} 
                          appearance-none dark:text-white focus:outline-none focus:ring-0 peer`}
                        placeholder={errors.newPassword ? "Fill new password" : "New Password"}
                      />
                    </div>
                    </>)}
                    
                  
                </div>

                <div className="flex flex-col lg:flex-row gap-2 justify-center w-full">
                  <div className="w-full">
                    <input
                      disabled={!editProfile}
                      type="tel"
                      value={phone}
                      onChange={handleInputChange(setPhone,"phone")}
                      placeholder="Phone Number"
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    />
                  
                    <div className="text-red-500 text-sm">
                     {errors.phone && <p>{errors.phone}</p>}
                    
                  </div>
                
                  </div>

                
                    <div className="w-full">
                      <select
                       disabled={!editProfile}
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                      >
                        <option disabled value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  

                  { !editProfile && (<div className="w-full">
                    <input
    
                      type="type"
                      disabled={!editProfile}
                      value={age ? `${age} years old` : ''}
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    />
                  </div>)}

                  {user && user._id === id && editProfile && (<div className="w-full">
                    <input
                      type="date"
                      value={birthDate}
                      onChange={handleBirthDateChange}
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    />

                  
                    <div className="text-red-500 text-sm">
                      {errors.birthDate && (<p>{errors.birthDate}</p>)}
                    </div>
                  
                  </div>)}

                  
                </div>

                {user && user._id === id && editProfile && (
                  <div className="flex flex-col lg:flex-row gap-2 justify-center w-full">
                    <div className="w-full rounded-lg bg-green-500 mt-4 text-white text-lg font-semibold">
                      <button type="submit" disabled={isSubmitDisabled || loading} 
                        className={`btn ${isSubmitDisabled || loading ? 'w-full p-4 rounded-lg opacity-50 cursor-not-allowed' : 'w-full p-4 hover:bg-amber-500  rounded-lg'}`}>
                        {loading ? 'Updating...' : 'Submit'}
                      </button>
                    </div>
                    <div className="w-full rounded-lg bg-red-500 mt-4 text-white text-lg font-semibold">
                      <button onClick={handleCancel} className="w-full p-4 hover:bg-amber-600 rounded-lg">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Display User's Recipes and Favorite Links in the same row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5">
      {userRecipes.length > 0 ? (
      userRecipes.map(recipe => (
      <RecipeCard key={recipe._id} recipe={recipe} onDeleted={(deletedId) => {
        setUserRecipes(prev => prev.filter(r => r._id !== deletedId));
      }} />
    ))
  ) : (
    <p>Ther is no Recipes.</p>
  )}
</div>
      </section>
    </>
  );
}
