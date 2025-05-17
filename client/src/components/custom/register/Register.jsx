import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const { isPending, error, mutate } = useMutation({
    mutationFn: (data) =>
      fetch('http://127.0.0.1:5555/auth/register', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      toast.success("✅ Registered successfully! Please log in.");
      navigate("/login");
    },
    onError: (error) => toast(`❌ ${error.message}`),
  });

  const onSubmit = (data) => {
    mutate(data);
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen">
        <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-wider text-center text-gray-900 md:text-3xl dark:text-white">
              Create an account
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-700 dark:text-white"
                  {...register('username', { required: 'Username is required' })}
                />
                {errors.username && <p className="text-red-500">{errors.username.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-700 dark:text-white"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-700 dark:text-white"
                  {...register('password', { required: 'Password is required' })}
                />
                {errors.password && <p className="text-red-500">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 hover:bg-primary-700"
              >
                Register
              </button>

              <p className="text-sm font-light text-gray-500 dark:text-gray-400 text-center">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-primary hover:underline dark:text-primary-500">
                  Login here
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;
