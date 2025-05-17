
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner"
import { useNavigate, useParams } from "react-router-dom";
import UserForm from "../user-form/UserForm";


function EditUser() {
  const{id}= useParams()
  const navigate=useNavigate()
  const queryClient=useQueryClient()
  
  const { data:user ,isPending: userIsPending, error } = useQuery({
    queryKey: ['user',id],
    queryFn: () =>
      fetch(`http://127.0.0.1:5555/users/${id}`).then((res) => res.json()),
  });
  console.log("user",user);
  const { isPending,  mutateAsync } = useMutation({
    mutationFn: async (data) => {
      let token = JSON.parse(localStorage.getItem('token'));
      const refreshToken = JSON.parse(localStorage.getItem('refreshToken'));

      // Check if token exists and is expired
      if (!token || isTokenExpired(token)) {
        // If token is expired, try to refresh it
        token = await refreshAccessToken(refreshToken);
        if (!token) {
          throw new Error('Unable to refresh access token');
        }
      }

      // Proceed with adding book using the valid token
      return fetch(`http://127.0.0.1:5555/users/${data.id}`, {
        method: 'PATCH',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),  // Using 'data' here
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        }
        return res.json();
      });
    },
    onError: (error) => toast(`❌ ${error.message}`),
    onSuccess: () => {
      toast('✅ user updated successfully!');
    queryClient.invalidateQueries({queryKey: ['users'],});

    setTimeout(()=> {
      navigate("/userlist")
    }, 1000);
  },
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

  const handleFormSubmit= async(id,user)=>{
    try{
     await mutateAsync(id,user);
     return true;
    }catch (error){
      console.log(error);
      return false;
    }
  };

  return (
    <div>
      <h2 className='my-3 text-center text-3xl'>Edit User : {id}</h2>
      {userIsPending && <p className="text-xl text-center text-red-500">loading...</p>}
      <UserForm key={user?.id} user={user} handleFormSubmit={handleFormSubmit}  isPending={isPending|| userIsPending}/>

      
      {error && <p className="text-2xl text-center">{error.message}</p>}
    </div>
  );
}

export default EditUser;