import { BrowserRouter,Navigate,Route,Routes } from "react-router-dom"
import{QueryClientProvider,QueryClient} from "@tanstack/react-query"
import Dashboard from "./components/custom/dashboard/Dashboard"
import ProtectedRoute from "./components/custom/protected-route/ProtectedRoute"
import AddBook from "./components/custom/add-book/AddBook"
import UserList from "./components/custom/user-list/UserList"
import AddUser from "./components/custom/add-user/AddUser"
import BorrowedBook from "./components/custom/borrow-book/BorrowedBook"
import ReturnBook from "./components/custom/return-book/ReturnBook"
import Analytics from "./components/custom/analytics/Analytics"
import Chart from "./components/custom/chart/Chart"
import Header from "./components/custom/header/Header"
import Login from "./components/custom/login/Login"
import EditBook from "./components/custom/edit-book/EditBook"

const queryClient= new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Header/>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard"/>}/> 
        <Route path="/login" element={<Login/>}/>
        <Route element={<ProtectedRoute/>}> 
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/addbook" element={<AddBook/>}/>
          <Route path="/books/:id" element={<EditBook/>}/>
          <Route path="/userlist" element={<UserList/>}/>
          <Route path="/adduser" element={<AddUser/>}/>
          <Route path="/borrowbook" element={<BorrowedBook/>}/>
          <Route path="/returnbook" element={<ReturnBook/>}/>
          <Route path="/analytics" element={<Analytics/>}/>
          <Route path="/chart" element={<Chart/>}/>
          <Route path="*" element={<Navigate to="/"/>}/>
        </Route>
        
      </Routes>
    </BrowserRouter>
    
    </QueryClientProvider>
  )
}

export default App
