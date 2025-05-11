import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import CreateTrip from './create-trip/index.jsx'
import Header from './components/custom/Header.jsx'
import { Toaster } from './components/ui/sonner.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import Viewtrip from './view-trip/[tripId]/index.jsx'
import MyTrips from './my-trips/index.jsx'
import PublicTrips from './public-trips/index.jsx'
import GroupTrips from './group-trips/index.jsx'
import 'leaflet/dist/leaflet.css';

const router = createBrowserRouter([{
  path: '/',
  element: <App />
},
{
  path:'/create-trip',
  element: <CreateTrip />
},
{
  path: '/view-trip/:tripId',
  element: <Viewtrip />
},
{
  path: '/my-trips',
  element: <MyTrips />
},
{
  path: '/public-trips',
  element: <PublicTrips />
},
{
  path: '/group-trips',
  element: <GroupTrips />
}
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <Header />
      <Toaster/>
      <RouterProvider router={router}/>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
