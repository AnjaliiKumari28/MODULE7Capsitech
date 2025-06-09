import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login = () => {
    const [showpass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [failure, setFailure] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (values, { setFieldError }) => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5070/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            });

            const data = await response.json();

            if (response.status === 401) {
                setFieldError('email', data.message);
            } else if (!response.ok) {
                setFailure(true);
            } else {
                localStorage.setItem("auth-token", data.token);
                navigate("/home");
            }
        } catch (err) {
            console.error(err);
            setFailure(true);
        } finally {
            setLoading(false);
            setTimeout(() => setFailure(false), 3000);
        }
    };

    return (
        <div className="bg-[url('h3.svg')] bg-cover bg-no-repeat min-h-screen w-full flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

            <div className="z-50 w-[90%] sm:w-2/3 md:w-1/2 lg:w-1/3 bg-white p-8 rounded-2xl shadow-2xl flex flex-col gap-5">
                <h1 className="text-3xl font-bold text-purple-600 text-center">Login</h1>

                <Formik
                    initialValues={{ email: '', password: '' }}
                    validationSchema={LoginSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched }) => (
                        <Form className="flex flex-col gap-4">
                            {/* Email */}
                            <div>
                                <label className="text-gray-700 font-semibold">Email</label>
                                <Field
                                    type="email"
                                    name="email"
                                    className="w-full px-3 py-2 border border-purple-300 rounded-xl bg-purple-50 focus:outline-none"
                                />
                                {errors.email && touched.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-gray-700 font-semibold">Password</label>
                                <div className="flex items-center border border-purple-300 bg-purple-50 rounded-xl px-3 py-2">
                                    <Field
                                        type={showpass ? "text" : "password"}
                                        name="password"
                                        className="flex-1 bg-transparent focus:outline-none"
                                    />
                                    <button type="button" onClick={() => setShowPass(!showpass)}>
                                        {showpass ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
                                    </button>
                                </div>
                                {errors.password && touched.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-xl transition duration-200"
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </Form>
                    )}
                </Formik>

                <p className="text-center text-sm">
                    New user?{" "}
                    <Link to="/register" className="text-purple-600 font-semibold hover:underline">
                        Register
                    </Link>
                </p>
            </div>

            {failure && (
                <div className="absolute bottom-10 bg-red-50 border border-red-500 px-5 py-2 rounded-md flex items-center gap-3 animate-bounce z-50">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.707a1 1 0 10-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 001.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z" />
                    </svg>
                    <span className="text-red-600">Login failed. Please try again.</span>
                </div>
            )}
        </div>
    );
};

export default Login;
