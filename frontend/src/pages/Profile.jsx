import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5070/api/auth/profile", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem("auth-token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError("Failed to load user details. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    navigate("/login");
  };

  const getBadge = (points) => {
    if (points >= 30) return "🏆 Champion";
    if (points >= 20) return "💪 Achiever";
    if (points >= 10) return "🔥 Consistent";
    return "🚀 Beginner";
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-2xl text-purple-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-100 to-white text-black">
      {/* Navbar */}
      <nav className="w-full z-20 flex justify-between items-center px-6 py-4 bg-purple-50 shadow-md fixed top-0 left-0 animate-fadeDown">
        <h1
          className="text-2xl font-bold text-purple-700 cursor-pointer hover:scale-105"
          onClick={() => navigate("/home")}
          title="Go to Home"
        >
          To-Do List
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
          <FaUserCircle
            className="text-3xl text-purple-600 cursor-pointer hover:scale-110 transition-transform duration-300"
            onClick={() => navigate("/home")}
            title="Go to Home"
          />
        </div>
      </nav>

      {/* Profile Section */}
      <div className="pt-24 pb-12 px-4 flex justify-center">
        <div className="w-full max-w-5xl bg-white/70 backdrop-blur-md rounded-xl shadow-2xl p-6 sm:p-8 hover:shadow-purple-200 transition-shadow duration-300 flex flex-col md:flex-row gap-6 animate-fadeIn">
          
          {/* Left: Profile Details */}
          <div className="w-full md:w-2/3">
            <div className="flex items-center gap-3 mb-4">
              <FaUserCircle className="text-4xl text-purple-600" />
              <h2 className="text-2xl sm:text-3xl font-semibold text-purple-800">{user.name}</h2>
            </div>

            <p className="text-sm text-gray-600 mb-6">Staying productive daily! ✅</p>

            <div className="space-y-4 text-base sm:text-lg text-gray-800">
              <p><span className="font-semibold text-purple-600">Email:</span> {user.email}</p>
              <p><span className="font-semibold text-purple-600">Points Collected:</span> {user.points || 0}</p>
              <p><span className="font-semibold text-purple-600">Badge:</span> {getBadge(user.points || 0)}</p>
            </div>

            <div className="mt-6 bg-purple-100 text-purple-700 p-3 rounded-lg shadow-inner text-center italic">
              "Your dedication is your superpower." 💜
            </div>
          </div>

          {/* Right: Static Image */}
          <div className="w-full md:w-1/3">
            <img
              src="/h3.svg"
              alt="Decorative"
              className="w-full h-auto rounded-lg shadow-md object-cover"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fadeDown {
          animation: fadeDown 0.6s ease forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease forwards;
        }

        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
