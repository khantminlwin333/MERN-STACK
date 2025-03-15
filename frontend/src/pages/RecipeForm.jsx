import plus from '../assets/plus.svg';
import Ingredients from '../components/Ingredients';
import { useEffect, useState } from 'react';
import axios from '../helpers/axios';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '../components/editor';


export default function RecipeForm() {

    let {id} = useParams();

    let navigate = useNavigate();
    let [ingredients,setIngredients] = useState([]);
    let [newIngredient,setNewIngredient] = useState('');
    let [title,setTitle] = useState('');
    let [description,setDescription] = useState('');
    let [errors,setError] = useState([]);
    let[preview,setPreview] = useState(null);
    let[file,setFile] = useState(null);
    let [loading,setLoading] = useState(false);
    let [deletePending, setDeletePending] = useState(false);


    useEffect(()=>{
        let fetchRecipe = async()=>{
            if(id){
                let res = await axios.get('/api/recipes/'+id)
                if(res.status === 200){
                    setTitle(res.data.title)
                    setDescription(res.data.description)
                    setIngredients(res.data.ingredients)
                    if(res.data.photo) {
                        setPreview(import.meta.env.VITE_BACKEND_ASSET_URL + res.data.photo)

                    }else{
                        setPreview(null);
                    }
                }
            }
        }
        fetchRecipe()
    },[id])

    let addIngredient =()=>{
        if(newIngredient){
            setIngredients(prev =>[newIngredient,...prev])
            setNewIngredient('')
        }
        
    }

    let submitRecipe= async (e)=>{
        try{
            e.preventDefault();
            setLoading(true);
        
            let recipe ={
                title,
                description,
                ingredients,
                
            };

            //file data sending to backend
           
           let res;
           if(id){
            res = await axios.patch('/api/recipes/'+ id,recipe)
           } else{
            res = await axios.post('/api/recipes',recipe)
           }

          
           
           
           if (deletePending) {
            await axios.delete('/api/recipes/delete-photo/'+ id);
            setFile(null);
            setPreview(null);
            document.getElementById("upload_picture").value = "";
            setDeletePending(false); // Reset delete flag
          }

          if(file){

            let formData = new FormData;
            formData.set('photo',file);
 
            await axios.post(`/api/recipes/${res.data._id}/upload`,
                formData,{
                 headers : {
                     Accept : "multipart/form-data"
                 }
                })
           }
           if(res.status===200){
            
            setLoading(false);
            navigate('/',{replace: true})
            window.location.reload();
           }else{
            setLoading(false);
            setError(res.data.errors);
           }
        }
        catch(e){
            setLoading(false);
            if (e.response && e.response.data && e.response.data.errors) {
                setError(Object.keys(e.response.data.errors));
              } else {
                console.error('Error creating recipe:', e);
              }
        }
       }

       let upload=(e)=>{
        e.preventDefault();
        let selectedFile = e.target.files[0];
        if (!selectedFile) {
            setPreview(null);
            return;
        }
        setFile(selectedFile);
        
        let fileReader = new FileReader();
        fileReader.onload=(e)=>{
            setPreview(e.target.result);
        }
        fileReader.readAsDataURL(selectedFile);
       }
       //Deleting Image

       let handleDeleteImage=(e)=>{
        e.preventDefault();
        setDeletePending(true);
        setPreview(null);

        const fileInput = document.getElementById("upload_picture");
        if (fileInput) fileInput.value = "";
       }


       let onIngredientRemove = (i) => {
        event?.preventDefault();
        
        setIngredients((prev) => prev.filter((_, j) => j !== i));
    };

    return (
        <div className="mx-auto max-w-md border-2 border-white p-4">
    
            <h1 className="mb-6 text-2xl font-bold text-orange-400 text-center">Recipe {id ? 'Edit Form' : 'Create Form' } </h1>
            <form action="" onSubmit={submitRecipe} className="space-y-5">
                <ul className='list-disc pl-4'>
                    {!!errors.length && errors.map((error,i)=>(
                    <li className='text-red-500 text-sm' key={i}>{error} is invalid value!</li>
                    ))}
                    
                </ul>
                <input type="file" onChange={upload} className="block w-full text-sm text-slate-500 cursor-pointer
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-yellow-500 file:text-green-700
                hover:file:bg-violet-100"/>
                

                <div className="relative inline-block">
  {/* Image Preview */}
  {preview ? (
  <>
    <img src={preview} alt="Preview" className="w-full h-full object-cover border" />
    <button
      onClick={handleDeleteImage}
      className="absolute top-0 right-0 animate-bounce bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-lg hover:bg-red-600 transition duration-200"
    >
      ❌
    </button>
  </>
) : null}
</div>

                  
                <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Recipe Title" id="upload_picture"  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                {/*<textarea placeholder="Recipe Description" value={description} onChange={e=>setDescription(e.target.value)} rows="5" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" /> */}

                

                
                <Editor description={description} setDescription={setDescription} />
                
        
        
                
                <div className="flex space-x-2 items-center">
                    <input value={newIngredient} onChange={e=>setNewIngredient(e.target.value)} type="text" placeholder="Recipe Ingredient" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" />
                    <img src={plus} alt="" className='cursor-pointer' onClick={addIngredient} />
                </div>
                <div>
                    <Ingredients ingredients={ingredients} onIngredientRemove={onIngredientRemove}/>
                </div>
                <button type='submit' className='w-full px-3 py-1 rounded-full bg-orange-400 text-white flex items-center justify-center'>
                 {loading && <svg className="mr-3 -ml-1 size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    }                    
                    {id ? 'Edit' : 'Create' } Recipe</button>

            </form>
        </div>
    )
}