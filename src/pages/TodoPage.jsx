import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Named import for the recent version
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://todo-sachin.runasp.net/api/todoapi";

const TodoPage = () => {
  const [userName, setUserName] = useState("");
  const avatarUrl = "https://i.pravatar.cc/48"; // Placeholder avatar

  // Todos and form state
  const [todos, setTodos] = useState([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");

  // Edit mode state
  const [editTodoId, setEditTodoId] = useState(null);
  const [editTodoTitle, setEditTodoTitle] = useState("");
  const [editTodoDescription, setEditTodoDescription] = useState("");
  const [editTodoIsCompleted, setEditTodoIsCompleted] = useState(false);

  const editTitleRef = useRef(null);
  const navigate = useNavigate();

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Create axios instance with the Authorization header
  const axiosAuthorized = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // Decode username from JWT token
  const getUserNameFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return (
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
        ] || "User"
      );
    } catch (e) {
      console.error("Failed to decode JWT token:", e);
      return "User";
    }
  };

  // On mount: redirect if no token, decode username, fetch todos
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    setUserName(getUserNameFromToken(token));
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Focus the edit title input on entering edit mode
  useEffect(() => {
    if (editTitleRef.current) {
      editTitleRef.current.focus();
      editTitleRef.current.select();
    }
  }, [editTodoId]);

  // Fetch todos from API
  const fetchTodos = async () => {
    try {
      const response = await axiosAuthorized.get("");
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  // Add new todo
  const addTodo = async () => {
    if (!newTodoTitle.trim()) {
      alert("Title is required");
      return;
    }
    try {
      const todoDto = {
        title: newTodoTitle.trim(),
        description: newTodoDescription.trim() || "",
        isCompleted: false,
      };

      const response = await axiosAuthorized.post("", todoDto);
      setTodos((prev) => [response.data, ...prev]);
      setNewTodoTitle("");
      setNewTodoDescription("");
    } catch (error) {
      console.error("Error adding todo:", error);
      alert("Failed to add todo. Please try again.");
    }
  };

  // Handle Enter key for quick add (except shift+Enter for line breaks)
  const handleNewTodoKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addTodo();
    }
  };

  // Enter edit mode
  const startEdit = (todo) => {
    setEditTodoId(todo.id);
    setEditTodoTitle(todo.title);
    setEditTodoDescription(todo.description || "");
    setEditTodoIsCompleted(todo.isCompleted);
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditTodoId(null);
    setEditTodoTitle("");
    setEditTodoDescription("");
  };

  // Save edited todo via API
  const saveEdit = async (id) => {
    if (!editTodoTitle.trim()) {
      alert("Title cannot be empty");
      return;
    }
    try {
      const updatedDto = {
        title: editTodoTitle.trim(),
        description: editTodoDescription.trim(),
        isCompleted: editTodoIsCompleted,
      };

      await axiosAuthorized.put(`/${id}`, updatedDto);

      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updatedDto } : t))
      );

      cancelEdit();
    } catch (error) {
      console.error("Error updating todo:", error);
      alert("Failed to update todo. Please try again.");
    }
  };

  // Toggle completion (checkbox)
  const toggleComplete = async (id, currentStatus) => {
    try {
      const todoToUpdate = todos.find((t) => t.id === id);
      if (!todoToUpdate) return;

      const updatedTodo = {
        title: todoToUpdate.title,
        description: todoToUpdate.description,
        isCompleted: !currentStatus,
      };

      await axiosAuthorized.put(`/${id}`, updatedTodo);

      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, isCompleted: !currentStatus } : t
        )
      );

      if (editTodoId === id) {
        setEditTodoIsCompleted(!currentStatus);
      }
    } catch (error) {
      console.error("Error toggling todo completion:", error);
      alert("Failed to update todo status.");
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this todo?")) return;
    try {
      await axiosAuthorized.delete(`/${id}`);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      if (editTodoId === id) cancelEdit();
    } catch (error) {
      console.error("Error deleting todo:", error);
      alert("Failed to delete todo. Please try again.");
    }
  };

  // Clear completed todos
  const clearCompleted = async () => {
    const completedTodos = todos.filter((t) => t.isCompleted);
    for (const todo of completedTodos) {
      try {
        await axiosAuthorized.delete(`/${todo.id}`);
      } catch (error) {
        console.error("Error deleting todo ID:", todo.id, error);
      }
    }
    setTodos((prev) => prev.filter((t) => !t.isCompleted));
    if (editTodoId && todos.find((t) => t.id === editTodoId)?.isCompleted)
      cancelEdit();
  };

  // Logout user
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-fit bg-gradient-to-br from-blue-700 via-blue-200 to-slate-200 flex flex-col" >
      {/* NAV BAR */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <h1 className="text-3xl font-bold text-blue-700 tracking-wide">
              TodoApp
            </h1>
            <div className="flex items-center space-x-6">
              {/* <img
                src={avatarUrl}
                alt="User Avatar"
                className="rounded-full w-14 h-14 border-2 border-blue-700"
              /> */}
              <span className="text-lg font-semibold text-gray-800 truncate max-w-xs">
                {userName}
              </span>
              <button
                onClick={handleLogout}
                className="text-white bg-red-600 hover:bg-red-700 transition px-5 py-2 rounded-md font-semibold shadow-lg whitespace-nowrap"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-grow max-w-6xl mx-auto p-8 flex flex-col gap-12">
        {/* ADD TODO SECTION */}
        <section className="bg-white rounded-xl shadow-lg p-8 flex flex-col gap-4">
          <h2 className="text-4xl font-semibold text-blue-700 mb-6">
            What&apos;s next, {userName}?
          </h2>
          <input
            type="text"
            placeholder="Todo Title"
            className="w-full p-3 rounded-md border border-blue-300 focus:outline-none focus:border-blue-600 text-lg"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
          />
          <textarea
            placeholder="Description (optional)"
            className="w-full p-3 rounded-md border border-blue-300 focus:outline-none focus:border-blue-600 resize-none text-lg"
            rows={3}
            value={newTodoDescription}
            onChange={(e) => setNewTodoDescription(e.target.value)}
            onKeyDown={handleNewTodoKeyDown}
          />
          <button
            onClick={addTodo}
            className="self-end bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-lg px-8 py-3 shadow-lg hover:from-blue-700 hover:to-blue-500 transition"
          >
            Add Todo
          </button>
        </section>

        {/* TODO LIST SECTION */}
        <section className="bg-white rounded-xl shadow-lg p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-semibold text-blue-700">Your Todos</h2>
            <button
              onClick={clearCompleted}
              disabled={!todos.some((t) => t.isCompleted)}
              className={`text-sm font-semibold px-4 py-2 rounded-md transition ${
                todos.some((t) => t.isCompleted)
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              aria-disabled={!todos.some((t) => t.isCompleted)}
              aria-label="Clear completed todos"
            >
              Clear Completed
            </button>
          </div>

          {todos.length === 0 ? (
            <p className="text-gray-500 italic text-lg text-center mt-24">
              No todos yet. Add one to get started!
            </p>
          ) : (
            <ul className="overflow-y-auto max-h-[600px] space-y-5">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className={`flex items-center justify-between p-6 border rounded-lg shadow-sm transition hover:shadow-md ${
                    todo.isCompleted
                      ? "bg-green-50 border-green-400"
                      : "bg-yellow-50 border-yellow-400"
                  }`}
                >
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    {/* Checkbox toggle */}
                    <input
                      type="checkbox"
                      checked={todo.isCompleted}
                      onChange={() => toggleComplete(todo.id, todo.isCompleted)}
                      className="w-7 h-7 cursor-pointer rounded border-blue-400 accent-blue-600"
                      aria-label={`Mark todo "${todo.title}" as ${
                        todo.isCompleted ? "incomplete" : "complete"
                      }`}
                    />

                    {editTodoId === todo.id ? (
                      <div className="flex flex-col flex-1">
                        <input
                          ref={editTitleRef}
                          type="text"
                          value={editTodoTitle}
                          onChange={(e) => setEditTodoTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveEdit(todo.id);
                            } else if (e.key === "Escape") {
                              cancelEdit();
                            }
                          }}
                        //   onBlur={() => saveEdit(todo.id)}
                          className="text-xl font-medium border-b border-blue-400 focus:outline-none mb-2"
                          aria-label="Edit todo title"
                          spellCheck={false}
                        />
                        <textarea
                          rows={3}
                          value={editTodoDescription}
                          onChange={(e) => setEditTodoDescription(e.target.value)}
                          className="rounded-md border border-blue-300 p-2 resize-none focus:outline-none focus:border-blue-500"
                          aria-label="Edit todo description"
                        />
                        <label className="flex items-center mt-2 space-x-2">
                          <input
                            type="checkbox"
                            checked={editTodoIsCompleted}
                            onChange={(e) => setEditTodoIsCompleted(e.target.checked)}
                            className="accent-blue-600"
                          />
                          <span>Mark Completed</span>
                        </label>
                        <div className="flex gap-4 mt-4">
                          <button
                            onClick={() => saveEdit(todo.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col flex-1">
                          <span
                            className={`text-2xl font-medium truncate ${
                              todo.isCompleted
                                ? "line-through text-green-700"
                                : "text-yellow-900"
                            } select-none`}
                            tabIndex={0}
                          >
                            {todo.title}
                          </span>
                          {todo.description && (
                            <small
                              className={`truncate ${
                                todo.isCompleted
                                  ? "line-through text-green-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {todo.description}
                            </small>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => startEdit(todo)}
                            className="px-3 py-1 rounded-md bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
                            aria-label={`Edit todo ${todo.title}`}
                            title="Edit Todo"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            aria-label={`Delete todo ${todo.title}`}
                            className="px-3 py-1 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                            title="Delete Todo"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default TodoPage;
