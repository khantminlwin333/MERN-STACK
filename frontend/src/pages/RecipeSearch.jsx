import { useLocation, useNavigate } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import { useState, useEffect } from "react";

export default function RecipeSearch() {
  let navigate = useNavigate();
  let page = new URLSearchParams(useLocation().search).get('page') || 1;
  const location = useLocation();
  
  // Initialize state with search results from location state
  const [recipes, setRecipes] = useState(location.state?.searchResults || []);

  // Get the search query from the URL
  const searchWords = new URLSearchParams(location.search).get("q") || "";


  useEffect(() => {
    // If there are new search results, update the recipes state
    if (location.state?.searchResults) {
      setRecipes(location.state.searchResults);
    }
  }, [location.state]);

  // Handle the deletion of a recipe
  let onDeleted = (_id) => {
    // Check if there is only 1 recipe and it's on a non-first page, navigate to the previous page
    if (recipes.length === 1 && page > 1) {
      navigate('/?page=' + (page - 1));
    } else {
      // Remove the deleted recipe from the state
      setRecipes(prev => prev.filter(r => r._id !== _id));
    }
  };

  return (
    <div className="container mx-auto p-5">
      {recipes.length > 0 && (
        <h2 className="text-2xl font-bold text-orange-400">Search Results for "{searchWords}"</h2>
      )}
     
      {recipes.length === 0 ? (
        <p className="text-gray-500">No recipes found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} onDeleted={onDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}
