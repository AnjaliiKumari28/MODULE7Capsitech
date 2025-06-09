import { useState, useEffect, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const editInputRef = useRef(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5070/api/todo", {
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
        throw new Error("Failed to fetch todos");
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError("Failed to load todos. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!input.trim()) return;

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("http://localhost:5070/api/todo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: input,
          dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error("Failed to add todo");
      }

      const newTodo = await response.json();
      setTasks([...tasks, newTodo]);
      setInput("");
      setDueDate("");
    } catch (err) {
      setError("Failed to add todo. Please try again.");
      console.error(err);
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    try {
      const token = localStorage.getItem("auth-token");
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        setError("Task not found");
        return;
      }

      const response = await fetch(`http://localhost:5070/api/todo/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: task.title,
          dueDate: task.dueDate,
          isCompleted: !currentStatus
        })
      });

      if (response.status === 404) {
        setError("Task not found or access denied");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      // Update local state since backend returns NoContent
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, isCompleted: !currentStatus }
          : task
      ));
    } catch (err) {
      setError("Failed to update todo. Please try again.");
      console.error(err);
    }
  };

  const confirmDeleteTask = (taskId) => {
    setDeleteIndex(taskId);
    setShowDeleteModal(true);
  };

  const deleteTask = async () => {
    if (deleteIndex === null) return;

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(`http://localhost:5070/api/todo/${deleteIndex}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      setTasks(tasks.filter(task => task.id !== deleteIndex));
      if (editIndex === deleteIndex) {
        setEditIndex(null);
        setEditText("");
      }
    } catch (err) {
      setError("Failed to delete todo. Please try again.");
      console.error(err);
    } finally {
      setDeleteIndex(null);
      setShowDeleteModal(false);
    }
  };

  const startEditing = (task) => {
    setEditIndex(task.id);
    setEditText(task.title);
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select();
      }
    }, 0);
  };

  const saveEdit = async (taskId) => {
    if (!editText.trim()) {
      setEditIndex(null);
      setEditText("");
      return;
    }

    try {
      const token = localStorage.getItem("auth-token");
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        setError("Task not found");
        return;
      }

      const response = await fetch(`http://localhost:5070/api/todo/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editText,
          dueDate: task.dueDate,
          isCompleted: task.isCompleted
        })
      });

      if (response.status === 404) {
        setError("Task not found or access denied");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      // Update local state since backend returns NoContent
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, title: editText }
          : task
      ));
      setEditIndex(null);
      setEditText("");
      setShowEditSuccessModal(true);
      setTimeout(() => {
        setShowEditSuccessModal(false);
      }, 1500);
    } catch (err) {
      setError("Failed to update todo. Please try again.");
      console.error(err);
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Escape") {
      setEditIndex(null);
      setEditText("");
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-2xl text-purple-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-black relative">
      {/* Navbar */}
      <nav className="w-full z-20 flex justify-between items-center px-6 py-4 bg-purple-50 shadow-md fixed top-0 left-0 animate-fadeDown">
        <h1 className="text-2xl font-bold text-purple-700">To-Do List</h1>
        <FaUserCircle
          className="text-3xl text-purple-600 cursor-pointer hover:scale-110 transition-transform duration-300"
          onClick={() => navigate("/profile")}
        />
      </nav>

      {/* Error Message */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
          <button 
            className="ml-4 text-red-700 hover:text-red-900"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="w-full pt-16">
        <div className="w-full min-h-[200px] md:min-h-[300px] lg:h-[70vh] relative overflow-hidden">
          <div className="flex flex-col md:flex-row w-full h-full">
            <img
              src="h1.jpg"
              alt="Slide 1"
              className="w-full md:w-1/3 h-48 md:h-full object-cover"
            />
            <img
              src="h3.svg"
              alt="Slide 2"
              className="w-full md:w-1/3 h-48 md:h-full object-cover"
            />
            <img
              src="h2.svg"
              alt="Slide 3"
              className="w-full md:w-1/3 h-48 md:h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full flex flex-col md:flex-row gap-6 justify-center items-start px-4 py-10">
        {/* Task Entry & List */}
        <div className="w-full md:w-1/2 bg-purple-50 p-6 rounded-xl shadow-xl">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="text"
              placeholder="Add a new task..."
              className="flex-1 p-3 rounded bg-white shadow-inner"
              onKeyDown={(e) => {
                if (e.key === "Enter") addTask();
              }}
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="p-3 rounded bg-white shadow-inner text-sm text-gray-600"
            />
            <button
              onClick={addTask}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg"
            >
              Add
            </button>
          </div>

          <ul>
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex justify-between items-center p-3 bg-white rounded mb-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {editIndex === task.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e)}
                      className="p-1 rounded border border-purple-400"
                    />
                  ) : (
                    <span>
                      {task.title}
                      {task.dueDate && (
                        <span className="text-sm text-gray-500 ml-2">
                          (Due: {new Date(task.dueDate).toLocaleDateString()})
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {editIndex === task.id ? (
                    <button
                      onClick={() => saveEdit(task.id)}
                      className="bg-green-500 text-white px-4 py-1 rounded"
                    >
                      Done
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditing(task)}
                      className="text-blue-500"
                    >
                      ✏️
                    </button>
                  )}
                  <span
                    onClick={() => confirmDeleteTask(task.id)}
                    className="text-red-500 cursor-pointer"
                  >
                    🗑️
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Today's Plan Section */}
        <div className="w-full md:w-1/2 p-4 relative">
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <img
              src="h3.svg"
              alt="Decorative"
              className="w-full h-full object-cover blur-sm"
            />
            <div className="absolute inset-0 bg-white/30 backdrop-blur-lg rounded-xl"></div>
          </div>
          <div className="relative z-10 p-6 rounded-xl shadow-lg bg-white/60 backdrop-blur-md">
            <h2 className="text-xl font-semibold text-purple-700 mb-4">
              Hey, here's your today's plan:
            </h2>
            <div className="flex flex-col gap-3">
              {tasks.length === 0 ? (
                <p className="text-gray-700">No tasks yet. Start by adding one!</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 bg-white/80 p-3 rounded-lg shadow-sm hover:bg-white/90"
                  >
                    <span
                      className={`text-black ${
                        task.isCompleted ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {task.title}
                      {task.dueDate && (
                        <span className="text-sm text-gray-500 ml-2">
                          (Due: {new Date(task.dueDate).toLocaleDateString()})
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => toggleTask(task.id, task.isCompleted)}
                      disabled={task.isCompleted}
                      className={`text-sm px-4 py-1 rounded-md ${
                        task.isCompleted
                          ? "bg-green-500 text-white cursor-not-allowed"
                          : "bg-purple-500 text-white hover:bg-purple-600"
                      }`}
                    >
                      {task.isCompleted ? "Task Completed" : "Done"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-80 max-w-full text-center shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-neutral-900">
              Are you sure you want to delete this task?
            </h3>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-neutral-900 text-white px-6 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={deleteTask}
                className="bg-red-500 text-white px-6 py-2 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Success Modal */}
      {showEditSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 pointer-events-none">
          <div className="bg-white rounded-lg p-8 w-64 max-w-full text-center shadow-lg pointer-events-auto">
            <div className="text-green-600 mb-3 text-6xl">✔️</div>
            <p className="text-lg font-semibold text-black">Task updated</p>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease forwards;
        }
        .animate-fadeDown {
          animation: fadeDown 0.6s ease forwards;
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
      `}</style>
    </div>
  );
}
