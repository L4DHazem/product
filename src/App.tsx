
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Protectedrout from './Layout/protectedrout'
import Productpage from './Pages/productpage'
import Checkout from './Pages/checkout'
import Authprotectedrout from './Layout/Authprotectedrout'
import Register from './Pages/register'
import Login from './Pages/login'


function App() {

    const router = createBrowserRouter([

        {
            path: '/', element: <Productpage />

        },

        {
            path: '/checkout', element: (

                <Protectedrout>
                    <Checkout />
                </Protectedrout>
            )

        },

        {
            path: '/register', element: (

                <Authprotectedrout>
                    <Register />
                </Authprotectedrout>
            )
        },

        {
            path: '/login', element: (
                <Authprotectedrout>
                    <Login />
                </Authprotectedrout>
            )
        }
    ])



    return <RouterProvider router={router} />

}

export default App
