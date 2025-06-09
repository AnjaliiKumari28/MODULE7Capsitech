import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen relative overflow-hidden shadow-[0_0_60px_10px_rgba(128,0,128,0.3)]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="h3.svg" // Replace with your actual image path
          alt="background"
          className="w-full h-full object-cover filter blur-sm"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Header with Login & Sign Up */}
      <div className="absolute top-5 right-8 z-20 flex gap-4">
        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 rounded-full border border-white text-white hover:bg-white hover:text-purple-600 transition duration-300 font-semibold"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition duration-300 font-semibold"
        >
          Register
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-10 h-full py-12">
        <div className="text-center mt-12">
          <h1 className="text-5xl font-bold text-white drop-shadow-md">To-Do List</h1>
        </div>

        <div className="flex flex-col items-center mb-10 px-4 text-center gap-5">
          <p className="text-white text-lg mb-4 max-w-md">
            Plan your day, track your progress, and achieve your goals—one task at a time.
          </p>
          <button
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-10 rounded-full transition duration-300 shadow-md"
            onClick={() => navigate("/home")}
          >
            Explore Now
          </button>
        </div>
      </div>
    </div>
  );
}
