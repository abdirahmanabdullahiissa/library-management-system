import React, { useState } from 'react';
import { useQuery,useMutation, useQueryClient } from "@tanstack/react-query";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
import { AgGridReact } from 'ag-grid-react';
import { Pencil, Search } from 'lucide-react';
import { Trash2} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';




// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function UserList() {
  const [searchTerm, setSearchTerm]=useState("")
  const navigate = useNavigate()
  const queryClient=useQueryClient()

  const { mutate } = useMutation({
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

  
      return fetch(`http://127.0.0.1:5555/users/${data.id}`, {
        method: 'DELETE',
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
    onSuccess: () => {
      toast('✅ user deleted successfully!');
    queryClient.invalidateQueries({queryKey: ['users'],});
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


// Column Definitions: Defines the columns to be displayed.
const [colDefs, setColDefs] = useState([
    { field: "username" },
    { field: "email" },
    { field: "edit", maxWidth: 100, cellRenderer: (params) => <div className='py-2' onClick={() =>navigate(`/users/${params.data.id}`)}>
      <Pencil color='gray' className='cursor-pointer'/>
    </div>},
    { field: "delete", maxWidth: 100, cellRenderer: (params) => <div className='py-2' onClick={() =>{
      const shouldDelete=window.confirm('are you sure you want to delete the selected user')
      if (shouldDelete){
        mutate({ id: params.data.id })

      }
    }} >
      <Trash2 color='red' className='cursor-pointer'/>
    </div> }
]);


  const { isPending, error, data:users } = useQuery({
    queryKey: ['users'],
    queryFn: () =>
      fetch('http://127.0.0.1:5555/users').then((res) => res.json()),
  });

  if (isPending) return 'Loading...';

  if (error) return 'An error has occurred: ' + error.message;

  // Log the data once it's fetched
  console.log(users);

  return (
    
    <div>
      <h2 className='text-center text-3xl my-3  tracking-wider'>UserList</h2>
      <div className='px-3 my-3 rounded-md'>
        <div className='border rounded-md flex my-3 p-2 max-w-sm '>
        <Search />
        <input 
        type='text' 
        placeholder='search by any field ' 
        className='outline-none pl-2 w-full'
        onChange={(event)=>setSearchTerm(event.target.value)}/>
        </div>
        <div style={{ height: 500 }}>
           <AgGridReact
            rowData={users}
            columnDefs={colDefs} 
            pagination={true} 
            paginationPageSize={10}
            quickFilterText={searchTerm}
            />
        </div>
      </div>
    </div>
  );
}
