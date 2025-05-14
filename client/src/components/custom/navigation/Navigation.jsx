import { Link, useNavigate,useLocation} from "react-router-dom"
import { menuItems } from "../../../utils/constant"
import { useState } from "react"

function Navigation() {
    const [currentIndex, setCurrentIndex]=useState(-1)
    const {pathname}=useLocation();
    const navigate=useNavigate()
    console.log({pathname});

    const handleclick=({index,path})=>{
        setCurrentIndex(index);
        navigate(path);
    };
  return (
        <ul className="p-2 ">
            {menuItems.map(({title,path}, index)=>{
                return(
                    <li 
                    key={title}
                    className={`my-2 p-2 rounded-md  cursor-pointer hover:bg-primary hover:text-white ${currentIndex=== index  || pathname=== path ?"bg-primary text-white" : ""

                    }`}
                    onClick={()=> handleclick({index,path})}
                    >
                      <Link to={path}>{title}</Link>
                    </li>

                )
            })}
            
        </ul>
  )
}

export default Navigation