import { useContext, useEffect, useRef, useState } from 'react';
import axios from '../helpers/axios';
import { useNavigate, useParams,Link } from 'react-router-dom';
import { AuthContext } from '../contexts/authContext';
import { Helmet } from 'react-helmet';





export default function RecipeDetail(){


    let {id} = useParams();
    let {user} = useContext(AuthContext);

    let navigate = useNavigate();
    let [userId,setUserId] = useState('');
    let [ingredients,setIngredients] = useState([]);
    let [title,setTitle] = useState('');
    let [description,setDescription] = useState('');
    let[photo,setPhoto] = useState(null);
    let [createdDate,setCreatedDate] = useState('');

    let [inputValue, setInputValue] = useState("");

    let [viewerCount, setViewerCount] = useState(0);
    let [likeCount, setLikeCount] = useState(0); 
    let [comments, setComments] = useState([]);
    let textareaRef = useRef(null);
    let [wordCount, setWordCount] = useState(0);
    let [warning, setWarning] = useState("");
    let [editingCommentId, setEditingCommentId] = useState(null);
    let [editText, setEditText] = useState("");



    useEffect(()=>{
        let fetchRecipe = async()=>{
            if(id){
                let res = await axios.get('/api/recipes/'+id);
                if(res.status === 200){
                    setTitle(res.data.title)
                    setDescription(res.data.description)
                    setIngredients(res.data.ingredients)
                    setPhoto(res.data.photo ? import.meta.env.VITE_BACKEND_ASSET_URL+res.data.photo : null);     
                    setUserId(res.data.userId);
                    setCreatedDate(res.data.createdAt);
                    setViewerCount(res.data.viewsCount || 0);
                    setLikeCount(res.data.likesCount || 0); 
                    setComments(res.data.commentsWithUser || []);
                }
            }
        }
        fetchRecipe();


        
        // Increment view count
        let incrementViewerCount = async () => {
            await axios.post(`/api/recipes/${id}/increment-views`);
            setViewerCount(prev => prev + 1);
        };

        incrementViewerCount();
    },[id]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"; // Reset height
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"; // Set new height
        }
    }, [inputValue,editText]);
    


    const fetchComments = async () => {
        try {
            let res = await axios.get(`/api/recipes/${id}`);
            if (res.status === 200) {
                setComments(res.data.commentsWithUser || []);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    // Handle Like Button Click
    const handleLike = async () => {
        try {
            if(!user){
                navigate("/sign-in");
            }
            const response = await axios.post(`/api/recipes/${id}/like`,{ userId: user._id }); // Send user ID

            setLikeCount(response.data.likes); // Update like count in UI
        } catch (error) {
            console.error("Error liking recipe:", error);
        }
    };

    const handleCommentChange = (text, setText) => {
        if(!user){
            navigate("/sign-in");
        }
        const words = text.split(/\s+/).filter(Boolean);
        
        if (words.length > 200) {
            setWarning("⚠️ Comments are allowed a maximum of 200 words.");
        } else {
            setWarning("");  // Clear warning when within the limit
            setText(text);   // ✅ Update the correct state
            setWordCount(words.length);
        }
    };
    

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
        if (inputValue.trim() !== '' && user) {
          try {
            // Submit the comment
            const response = await axios.post(`/api/recipes/${id}/addcomment`, {
              userId: user._id,
              text: String(inputValue),
            });
            if(response.status===200){
                fetchComments();
                //setComments(prevComments => [...prevComments, newComment]); // Update state
                setInputValue('');  // Clear input field
            }
      
          } catch (error) {
            console.error('Error submitting comment:', error);
          }
        }
    };

    // 🗑 Delete Comment
const handleDeleteComment = async (commentId) => {
    try {
        let response = await axios.delete(`/api/recipes/${id}/deletecomment/${commentId}`);
       if(response.status===200){
        fetchComments();  // Refresh comments after editing
        setEditingCommentId(null); // Exit edit mode
       }
    } catch (error) {
        console.error("Error deleting comment:", error);
    }
};

//Edit Comment
const handleEditComment = (commentId, text) => {
    setEditingCommentId(commentId);
    setEditText(text);
};

// ✅ Save Edited Comment
const handleSaveEdit = async (commentId) => {
    try {
        const response = await axios.put(`/api/recipes/${id}/editcomment/${commentId}`, { text: String(editText) });
        if (response.status === 200) {
            fetchComments();
            setEditingCommentId(null); // Exit edit mode
        }
    } catch (error) {
        console.error("Error updating comment:", error);
    }
};

let formatDate = (dateString) => {
    let date = new Date(dateString);
    let options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString(undefined, options);
  };

    

    return(
        <div>
            <Helmet>
                <title>{title ?` ${title}` : "Loading recipe.."}</title>
            </Helmet>
                <div className="w-full mx-auto  overflow-hidden bg-white rounded-lg shadow-lg hover:shadow-blue-400">
                { photo && (
                <div className="relative">
                    <img className="w-64 h-68 object-cover rounded-t-lg float-left ml-4 p-4"  src={photo}alt=""/>
                </div>
                )}
                <div className="px-6 py-4">
                    <div className="text-xl font-semibold text-gray-800">{title}</div>
                    <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: description }} />
                    
                </div>
                <div className="px-6 py-4 float-right">
                    
                    {ingredients.length > 0 &&
                        ingredients.map((ingredient, index) => (
                            
                                <span key={index} className="inline-block px-2 py-1 font-semibold text-white-200 bg-yellow-400 rounded-full mr-2 mb-2">{ingredient}</span>
                            
                        ))
                    }
                    
                    
                </div>
                {`Created - ${formatDate(createdDate)}`}
                <div className="px-6 py-4">
                    <Link to={`/profileView/${userId}`} className="text-blue-500 hover:underline">View Profile</Link>
                </div>

                {/* Like & View Section */}
<div className="flex items-center space-x-4 p-4 rounded-lg shadow-md">
    <div className="flex flex-col items-center space-y-1">
        <span>{viewerCount}</span>
        <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    </div>
    <div className="flex flex-col items-center space-y-1">
        <span>{likeCount}</span>
        <svg onClick={handleLike} className="h-6 w-6 text-yellow-500" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  
            <path stroke="none" d="M0 0h24v24H0z"/>  
            <path d="M7 11v 8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3" />
        </svg>
    </div>
</div>

        {/* ✅ Comment Section Below */}
        <div className="flex flex-col space-y-4 p-4 rounded-lg shadow-md">
            {/* Comment Input Section */}
            <div className="p-4 w-full max-w-full">
            <textarea
            ref={textareaRef}
            placeholder="Write a comment..."
            className="w-full border-b border-gray-300 px-3 py-2 resize-none focus:outline-none focus:border-b-blue-500"
            value={inputValue}
            onChange={(e)=>handleCommentChange(e.target.value,setInputValue)}
            rows="1"
        />

        {/* Word count and warning message */}
        <div className="mt-1 text-sm">
            <span className={`${wordCount > 200 ? "text-red-500" : "text-gray-500"}`}>
                {wordCount}/200 words
            </span>
        </div>

        {warning && <p className="text-red-500 text-sm mt-1">{warning}</p>}

        {/* Buttons (Show only when typing) */}
        {inputValue && (
            <div className="mt-2 flex space-x-2">
                <button 
                    onClick={handleCommentSubmit} 
                    className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition">
                    Comment
                </button>
                <button
                    className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition"
                    onClick={() => setInputValue("")}>
                    Cancel
                </button>
            </div>
        )}
    </div>

    
    {/* Comments List (Below the Input) */}
    <div className="px-6 py-4 mt-4 bg-gray-50 rounded-lg shadow">
        <div className="text-lg font-semibold text-gray-800 mb-3">Comments</div>
        
        {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
            comments.map((comment, index) => (
                <div key={index} className="border-b border-gray-200 py-3">
                    <div className="flex items-center space-x-3">
                        {/* User Avatar (Optional) */}
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {comment?.userId?.name?.charAt(0).toUpperCase()}
                        </div>
                        
                        <div>
                            <div className="font-semibold">{comment?.userId?.name || "Unknown User"}</div>

                            {/* Editing Mode */}
                            {editingCommentId === comment._id ? (
                                <>
                                <textarea
                                    ref={textareaRef}
                                    className="border p-2 w-full resize-none"
                                    value={editText}
                                    onChange={(e)=>handleCommentChange(e.target.value,setEditText)}
                                    
                                />
                            
                  {warning &&(
                     <>
                            <div className="mt-1 text-sm">
                            <span className={`${wordCount > 200 ? "text-red-500" : "text-gray-500"}`}>
                                {wordCount}/200 words
                            </span>
                        </div>


                        <p className="text-red-500 text-sm mt-1">{warning}</p>
                        </>
                        )}
                        </>
                            ) : (
                                <div className="text-gray-600">{comment?.text}</div>
                            )}
                            
                            {/* Actions */}
                    {user?._id === comment.userId?._id && (
                        <div className="flex items-center space-x-2">
                            {editingCommentId === comment._id ? (
                                <button 
                                    onClick={() => handleSaveEdit(comment._id)} 
                                    className="text-white bg-green-400 hover:bg-yellow-500 focus:outline-none rounded-lg font-medium text-xs cursor-pointer px-1 py-0.5 text-center me-1 mb-2"
                                >
                                    Save
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleEditComment(comment._id, comment.text)} 
                                    className="text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none rounded-lg font-medium text-xs cursor-pointer px-1 py-0.5 text-center me-1 mb-2"
                                >
                                    Edit
                                </button>
                            )}

                            <button 
                                onClick={() => handleDeleteComment(comment._id)} 
                                className="text-green-400 bg-red-500 hover:bg-red-600 focus:outline-none rounded-lg font-medium text-xs cursor-pointer px-1 py-0.5 text-center me-1 mb-2"
                            >
                                Delete
                            </button>
                        </div>
                    )}


                        </div>
                    </div>
                </div>
            ))
        )}
    </div>
</div>

            </div>

            
            
        </div>
    )
}