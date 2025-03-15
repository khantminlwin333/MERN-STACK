import { useEffect, useState } from "react"
import RecipeCard from '../components/RecipeCard';
import Pagination from '../components/Pagination';
import { Link, useLocation,useNavigate } from 'react-router-dom';
import axios from "../helpers/axios";
import loadingImg from '../assets/loading.svg';


export default function Home() {

    let [recipes, setRecipes] = useState([]);
    let [links,setLinks] = useState(null);
    let [loading, setLoading] = useState(true);
    let [error, setError] = useState(false);

    let navigate = useNavigate();
    let location = useLocation();
    let searchQuery = new URLSearchParams(location.search);
    let page =searchQuery.get('page');
    page= parseInt(page) ? parseInt(page) : 1;



    useEffect(() => {
        let fetchRecipes = async () => {
            //setLoading(true);
            setError(false); // Reset error when a new fetch starts
            try {
                let response = await axios.get('/api/recipes?page=' + page);
                
                if (response.status === 200) {
                    let data = response.data;
                    setLinks(data.links);
                    setRecipes(data.data);

                    // If no recipes are found on the requested page and it's greater than 1, redirect to page 1
                    if (data.data.length === 0 && page > 1) {
                        // Redirect to home page
                        navigate('/');
                    }
                }
            } catch (error) {
                console.error('Error fetching recipes:', error);
                setError(true);
            } finally {
                setLoading(false);
            }

            // Scroll to top
            window.scroll({ top: 0, left: 0, behavior: "smooth" });
        };

        fetchRecipes();
    }, [page, navigate]);

    //backend info (hardcode)
    

    let onDeleted=(_id)=>{

      if(recipes.length === 1 && page >1){
        navigate('/?page='+(page-1))
      }else{
        setRecipes(prev => prev.filter(r => r._id !== _id))
      }

    }

    
    return (
        <>
            {/*<div className="grid grid-cols-3 space-x-2 space-y-3"> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {loading  && (
        <div className="col-span-3 flex justify-center items-center" style={{ height: '100vh' }}>
            <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
            <img src={loadingImg} className="rounded-full h-28 w-28" />
        </div>
    ) }
    { error &&  (
        <div className="col-span-3 text-center text-2xl font-bold">Error fetching recipes</div>
    ) } 
    {(
        recipes.length === 0 ? (
            <div className="col-span-3 text-center text-2xl font-bold">No recipes found</div>
        ) : (
            
            recipes.map(recipe => (
                 
                    <RecipeCard recipe={recipe} key={recipe.id} onDeleted={onDeleted}/> 

               // <RecipeCard recipe={recipe} key={recipe._id} onDeleted={onDeleted} />
            ))
        )
    )}
</div>


            {/* Render Pagination only if there are recipes and pagination links exist */}
            {recipes.length > 0 && links && <Pagination links={links} page={page || 1} />}
        </>
    )
}