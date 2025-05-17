import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "@/components/ui/drawer"
import { Menu } from "lucide-react"
import {Button} from "@/components/ui/button"
import Navigation from "../navigation/Navigation"
import { useState } from "react"


function MobileDrawer() {
  const [open, setOpen]=useState(false);
  return (
    <Drawer open={open} onOpenChange={setOpen}>
    <DrawerTrigger>
      <Menu size={30}/>
    </DrawerTrigger>
    <DrawerContent className="min-h-screen">
      <DrawerHeader>
        <DrawerTitle>Navigation menu</DrawerTitle>
        <DrawerDescription>opens a navigation sidebar menu</DrawerDescription>
      </DrawerHeader>
      <Navigation setOpen={setOpen}/>
    </DrawerContent>
  </Drawer>
  
  )
}

export default MobileDrawer