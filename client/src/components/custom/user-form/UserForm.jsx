import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
 
const formSchema = z.object({
  username: z.string().refine(v => v.trim() !== "", "This is a required field."),
  email: z.string().refine(v => v.trim() !== "", "This is a required field."),
  password: z.string().refine(v => v.trim() !== "", "This is a required field."),
})

function UserForm({handleFormSubmit,user,isPending}) {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
          username:user?.username || "",
          email:user?.email || "",
          password:user?.password || "",
        },
      })
     
      // 2. Define a submit handler.
      async function onSubmit(values) {
        console.log({values});
        let isSuccess;
        if (user) {
          isSuccess = await handleFormSubmit({ id: user?.id, ...values });

        } else {
          isSuccess = await handleFormSubmit(values);
        }
        if (isSuccess){
            form.reset()
        }
        
      }
  return (

        <div className="max-w-[500px] mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter user name" {...field} className="focus-visible:ring-transparent" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                       <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter Email" {...field} className="focus-visible:ring-transparent" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} className="focus-visible:ring-transparent" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isPending}>
                    {user ? "update" : "add" } User
                    </Button>
        
                </form>
            </Form>


      </div>
        
        
  )
}

export default UserForm