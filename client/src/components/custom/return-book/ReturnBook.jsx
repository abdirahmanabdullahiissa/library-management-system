import React, { useState } from 'react'
import DropDown from '../dropdown/DropDown'
import { useQuery, useMutation} from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query';

function ReturnBook() {
  const [selection, setSelection] = useState(null)
  const queryClient = useQueryClient();


  const { isPending: isBooksPending, error: booksError, data: books } = useQuery({
    queryKey: ['books'],
    queryFn: () =>
      fetch('http://127.0.0.1:5555/books').then((res) => res.json()),
    select: (data) => {
      return data.map(book => ({
        id: book.id,
        value: book.id,
        label: book.name
      }));
    },
  });
  
 
  
  const { isPending:issuePending, mutate } = useMutation({
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

      return fetch('http://127.0.0.1:5555/return-books', {
        method: 'POST',
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
      toast('✅ returned Book successfully!');
    queryClient.invalidateQueries({queryKey: ['return-books'],});
  },
  });
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

  const updateSelection = (selectedValue) => {
    setSelection({
      ...selection,
      ...selectedValue
    })
  }
  function handleReturnBook(){
    mutate({
      book_id: selection.book
    })
  }
  console.log('books',books)
  console.log('selection',selection)

  if (isBooksPending) return <div>Loading...</div>
  if (booksError ) return <div>An error occurred: {booksError?.message || usersError?.message}</div>

  return (
    <div>
      <h2 className='my-3 text-center text-3xl'>Return book</h2>

      <div className='flex flex-col max-w-[400px] mx-auto items-center justify-center space-y-3'>
        <div className='flex flex-col gap-3'>
          <label>Select Book</label>
          <DropDown
            data={books}
            title='book'
            placeholder='Select book...'
            updateSelection={updateSelection}
          />
        </div>
        <Button disabled={!selection?.book  || issuePending} onClick={handleReturnBook}>
          Return Book
        </Button>
      </div>
    </div>
  )
}

export default ReturnBook
