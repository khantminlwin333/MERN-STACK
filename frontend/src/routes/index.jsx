import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";



import { useContext } from "react";

import App from '../App.jsx'
import Home from '../pages/Home.jsx';
import About from '../pages/About.jsx';
import RecipeForm from '../pages/RecipeForm.jsx';
import SignUpForm from '../pages/SignUpForm.jsx';
import SignInForm from '../pages/SignInForm.jsx';
import { AuthContext } from '../contexts/authContext.jsx';
import { Helmet } from "react-helmet";
import RecipeDetail from "../pages/RecipeDetail.jsx";
import RecipeSearch from "../pages/RecipeSearch.jsx";
import ForgetPassword from "../pages/ForgetPassword.jsx";




export default function Routes() {

    let {user} = useContext(AuthContext);
  
    const router = createBrowserRouter([
        {
          path: "/",
          element: <App />,
          children : [
            {
              path : "/",
              element : (
                <>
                <Helmet>
                  <title>All Recipes</title>
                </Helmet>
                <Home />
              </>
              )
            },

            {
              path : "/search",
              element : (
                <>
                <Helmet>
                  <title>Recipes Search</title>
                </Helmet>
                <RecipeSearch />
              </>
              )
            },

            {
              path : "/profile/:id",
              element : (
                <>
                
                <About/>
                </>
                
            )
            },

            {
              path : "/profileView/:id",
              element : (
                <>
                <Helmet>
                <title>About Us</title>
              </Helmet>
              <About/>
               </>
                
            )
            },
            {
              path : "/forgot-password",
              element : (
                <>
                <Helmet>
                <title>Forget Password</title>
              </Helmet>
              <ForgetPassword />
                </>
                
            )
            },
            {
              path : "/forgot-password/:token",
              element : (
                <>
                <Helmet>
                <title>Forget Password</title>
              </Helmet>
              <ForgetPassword />

                </>
                
            )
            },

            {
              path : "/create",
              element : (
                <>
                <Helmet>
                  <title>{user ? "Create Recipe" : "Sign In"}</title>
                </Helmet>
                {user ? <RecipeForm /> : <Navigate to="/sign-in"/>}
                </>
              )
            },
            {
              path : "/recipes/edit/:id",
              element : (
                <>
                <Helmet>
                  <title>{user ? "Edit Recipe" : "Sign In"}</title>
                </Helmet>
                {user ? <RecipeForm/> : <Navigate to ="/sign-in"/>}
                </>
              )
            },

            {
              path : "/recipes/:id",
              element : (
                <>
                <Helmet>
                  <title>Recipes</title>
                </Helmet>
                <RecipeDetail />
                </>
              )
            },
            {
                path: "/sign-in", 
                element: (
                  <>
                  <Helmet>
                    <title>
                      {!user ? "Sign In" : "All Recipes"}

                    </title>
                  </Helmet>
                  {!user ? <SignInForm /> : <Navigate to={'/'} />}
                  </>
                )
            },
            {
              path : "/sign-up",
              element : (
                <>
                <Helmet>
                  <title>{!user ? "Sign UP" : "All Recipes"}</title>
                </Helmet>
                {!user? <SignUpForm /> : <Navigate to={'/'}/>}
                </>
              )
            },
            {
              path :"/log-out",
              element : (
                <>
                <Helmet>
                  <title>Log Out</title>
                </Helmet>
                <Navigate to={'/sign-in'}/>
                </>
              )
            }
          ]
        },
      ]);
      

    return (
        <RouterProvider router={router} />
  )
}
