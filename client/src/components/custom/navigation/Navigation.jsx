import { Link, useNavigate,useLocation} from "react-router-dom"
import { menuItems } from "../../../utils/constant"
import { useState } from "react"
import { toast } from 'sonner'
import {  useMutation} from '@tanstack/react-query'



function Navigation({setOpen}) {
    const [currentIndex, setCurrentIndex]=useState(-1)
    const {pathname}=useLocation();
    const navigate=useNavigate()
    console.log({pathname});

    const { mutate: logout, isPending: isLogoutPending } = useMutation({
        mutationFn: async (data) => {
          let token = JSON.parse(localStorage.getItem('token'));
          const refreshToken = JSON.parse(localStorage.getItem('refreshToken'));
      
          if (!token || isTokenExpired(token)) {
            token = await refreshAccessToken(refreshToken);
            if (!token) {
              throw new Error('Unable to refresh access token');
            }
          }
      
          return fetch(`http://127.0.0.1:5555/auth/logout`, {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }).then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status} - ${res.statusText}`);
            }
            return res.json();
          });
        },
        onError: (error) => toast(`❌ ${error.message}`),
        onSuccess: () => navigate('/login')
      });
      
      // Function to check if the access token is expired
      function isTokenExpired(token) {
        const decoded = JSON.parse(atob(token.split('.')[1])); // Decode the JWT token
        const exp = decoded.exp * 1000; // Convert to milliseconds
        return exp < Date.now(); // If the expiration time has passed
      }
    
      // Function to refresh the access token using the refresh token
      async function refreshAccessToken(refreshToken) {
        const response = await fetch('http://127.0.0.1:5555/auth/refresh', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
    
        if (response.ok) {
          const data = await response.json();
          // Store the new access token in localStorage
          localStorage.setItem('token', JSON.stringify(data.access));
          return data.access;
        } else {
          throw new Error('Failed to refresh access token');
        }
      }

    const handleclick=({index,path})=>{
        setCurrentIndex(index);
        setOpen && setOpen();
        path === "" ? logout () : navigate(path);

    };
    if (isLogoutPending) {
        return (
            <p className="text-center text-3xl tracking-wider">logging out...</p>
        )
    }
  return (
        <ul className="p-4 max-lg:min-h-screen max-lg:flex-col max-lg:justify-center">
            {menuItems.map(({title,path}, index)=>{
                return(
                    <li 
                    key={title}
                    className={`max-lg:text-center max-lg:text-2xl my-2 p-2 rounded-md  cursor-pointer hover:bg-primary hover:text-white ${currentIndex=== index  || pathname=== path ?"bg-primary text-white" : ""

                    }`}
                    onClick={()=> handleclick({index,path})}
                    >
                      <Link to={path || null}>{title}</Link>
                    </li>

                )
            })}
            
        </ul>
  )
}

export default Navigation