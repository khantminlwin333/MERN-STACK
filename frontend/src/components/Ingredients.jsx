export default function Ingredients({ ingredients,onIngredientRemove }) {
    return (
        <div className="flex items-center flex-wrap gap-2">
            <span>Ingredients -</span>
            {ingredients.length > 0 &&
                ingredients.map((ingredient, index) => (
                    <div key={index} className="relative bg-orange-400 text-white px-3 py-1 text-sm rounded-full flex items-center">
                        <span className="pr-2">{ingredient}</span>
                        <button
                            onClick={()=> onIngredientRemove(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white w-3 h-3 flex items-center justify-center rounded-full text-xs"
                        >
                            ✕
                        </button>
                    </div>
                ))
            }
        </div>
    );
}
