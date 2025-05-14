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
  name: z.string().refine(v => v.trim() !== "", "This is a required field."),
  author: z.string().refine(v => v.trim() !== "", "This is a required field."),
  isbn: z.string().refine(v => v.trim() !== "", "This is a required field."),
  publication_year: z.coerce.number().int().positive({ message: "Year must be a positive number." }),
  category: z.string().refine(v => v.trim() !== "", "This is a required field."),
})

function BookForm({handleFormSubmit,book,isPending}) {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
          name:book?.name || "",
          author:book?.author || "",
          isbn:book?.isbn|| "",
          publication_year: book?.publication_year ||"",
          category:book?.category || "",
        },
      })
     
      // 2. Define a submit handler.
      async function onSubmit(values) {
        console.log({values});
        let isSuccess;
        if (book) {
          isSuccess = await handleFormSubmit({ id: book?.id, ...values });

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
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter book name" {...field} className="focus-visible:ring-transparent" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                       <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Author</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter Author name" {...field} className="focus-visible:ring-transparent" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                      <FormField
                    control={form.control}
                    name="isbn"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Isbn</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter Isbn number" {...field} className="focus-visible:ring-transparent" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="publication_year"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Publication_year</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter publicaion year" {...field} className="focus-visible:ring-transparent" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter category" {...field} className="focus-visible:ring-transparent" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isPending}>
                    {book ? "update" : "add" } Book
                    </Button>
        
                </form>
            </Form>


      </div>
        
        
  )
}

export default BookForm