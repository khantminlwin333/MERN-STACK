import {useContext,useEffect,useState} from 'react';
import axios from '../helpers/axios';
import { Link } from 'react-router-dom';
import  '../pages/recipecard.css';
import { AuthContext } from '../contexts/authContext';

export default function RecipeCard({recipe,onDeleted}) {

  let {user} = useContext(AuthContext);

  const [isRecipeOwner, setIsRecipeOwner] = useState(false); // Track if the user is the owner

  useEffect(() => {
    // Only run if user and recipe.userId are both available
    if (user?._id && recipe?.userId) {
      setIsRecipeOwner(recipe?.userId.toString() === user?._id.toString());
    }
  }, [user,recipe]); // Re-run whenever user or recipe changes

  let formatDate = (dateString) => {
    let date = new Date(dateString);
    let options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString(undefined, options);
  };

  let deleteRecipe= async()=>{
    let res = await axios.delete('/api/recipes/'+ recipe._id);
    if(res.status===200){
      onDeleted(recipe._id);
    }
  }
  return (
    <div className='bg-white p-5 rounded-2xl shadow-lg w-full sm:w-90 h-auto space-y-3 relative' key={recipe._id}>
     {recipe.photo && (<Link to={`/recipes/${recipe._id}`}>
      <img className='mx-auto  w-50 h-48 object-contain' src={import.meta.env.VITE_BACKEND_ASSET_URL + recipe.photo} alt=""  />
      </Link>)}
    <div className="flex justify-between">
    <Link to={`/recipes/${recipe._id}`}>
    <h3 className='text-xl font-bold text-orange-400'>{recipe.title}</h3>
    </Link>
    <div className="flex flex-row space-x-2 absolute top-2 right-2">
          { isRecipeOwner && <button onClick={deleteRecipe} className="bg-red-500 text-gray-700 rounded-lg cursor-pointer px-3 py-1">Delete</button>}
          { isRecipeOwner && <Link to={`/recipes/edit/${recipe._id}`} className="bg-yellow-400 text-white rounded-lg px-3 py-1">Edit</Link>}
        </div>
    </div>
    <Link to={`/recipes/${recipe._id}`}>
    <p>Description</p>

    <p className="text-gray-700 description" dangerouslySetInnerHTML={{ __html: recipe.description }} />
  
    <div className="space-x-2 ingredients"> 
        Ingredients - 
        {recipe.ingredients.map((ingredient, index) => (
          <span key={index} className="bg-orange-400 text-white px-2 py-1 text-sm rounded-full">{ingredient}</span>
        ))}
      </div>
    </Link>
    <p className="text-gray-500">Published at - {formatDate(recipe.createdAt)}</p>
    </div>
  )
}
