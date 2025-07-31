import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://todo-sachin.runasp.net/api/todoapi";

const TodoPage = () => {
  const [userName, setUserName] = useState("");
  const avatarUrl = "https://i.pravatar.cc/48";

  const [todos, setTodos] = useState([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");

  const [editTodoId, setEditTodoId] = useState(null);
  const [editTodoTitle, setEditTodoTitle] = useState("");
  const [editTodoDescription, setEditTodoDescription] = useState("");
  const [editTodoIsCompleted, setEditTodoIsCompleted] = useState(false);

  const editTitleRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Axios instance
  const axiosAuthorized = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

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

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    setUserName(getUserNameFromToken(token));
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (editTitleRef.current) {
      editTitleRef.current.focus();
      editTitleRef.current.select();
    }
  }, [editTodoId]);

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

  const handleNewTodoKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addTodo();
    }
  };

  const startEdit = (todo) => {
    setEditTodoId(todo.id);
    setEditTodoTitle(todo.title);
    setEditTodoDescription(todo.description || "");
    setEditTodoIsCompleted(todo.isCompleted);
  };

  const cancelEdit = () => {
    setEditTodoId(null);
    setEditTodoTitle("");
    setEditTodoDescription("");
  };

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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-200 to-slate-200 flex flex-col">
      {/* NAV BAR */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between h-auto sm:h-20 items-center gap-4 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 tracking-wide pb-4 ">
              TodoApp
            </h1>
            <div className="flex items-center space-x-4 sm:space-x-6">
              {/* <img
                src={avatarUrl}
                alt="User Avatar"
                className="rounded-full w-14 h-14 border-2 border-blue-700"
              /> */}
              <span className="text-base sm:text-lg font-semibold text-gray-800 truncate max-w-[130px] sm:max-w-xs">
                {userName}
              </span>
              <button
                onClick={handleLogout}
                className="text-white bg-red-600 hover:bg-red-700 transition px-4 md:px-5 py-2 rounded-md font-semibold shadow-lg whitespace-nowrap"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 md:gap-12 pt-4">
        {/* ADD TODO SECTION */}
        <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 flex flex-col gap-4">
          <h2 className="text-2xl md:text-4xl font-semibold text-blue-700 mb-2 md:mb-6">
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
            className="w-full sm:w-auto self-end bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-lg px-8 py-3 shadow-lg hover:from-blue-700 hover:to-blue-500 transition mt-2"
          >
            Add Todo
          </button>
        </section>

        {/* TODO LIST SECTION */}
        <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 gap-3">
            <h2 className="text-2xl md:text-4xl font-semibold text-blue-700">
              Your Todos
            </h2>
            <button
              onClick={clearCompleted}
              disabled={!todos.some((t) => t.isCompleted)}
              className={`w-full sm:w-auto text-sm font-semibold px-4 py-2 rounded-md transition ${
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
            <p className="text-gray-500 italic text-lg text-center mt-10 md:mt-24">
              No todos yet. Add one to get started!
            </p>
          ) : (
            <ul className="overflow-y-auto max-h-[320px] sm:max-h-[500px] md:max-h-[600px] space-y-5">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 md:p-6 border rounded-lg shadow-sm transition hover:shadow-md ${
                    todo.isCompleted
                      ? "bg-green-50 border-green-400"
                      : "bg-yellow-50 border-yellow-400"
                  }`}
                >
                  <div className="flex flex-1 flex-col sm:flex-row gap-3 sm:gap-6 min-w-0 items-stretch sm:items-center">
                    {/* Checkbox toggle */}
                    <input
                      type="checkbox"
                      checked={todo.isCompleted}
                      onChange={() => toggleComplete(todo.id, todo.isCompleted)}
                      className="w-6 h-6 sm:w-7 sm:h-7 cursor-pointer rounded border-blue-400 accent-blue-600 mt-1 sm:mt-0 shrink-0"
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
                          //   onBlur={() => saveEdit(todo.id)}
                          className="text-base sm:text-xl font-medium border-b border-blue-400 focus:outline-none mb-2"
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
                            onChange={(e) =>
                              setEditTodoIsCompleted(e.target.checked)
                            }
                            className="accent-blue-600"
                          />
                          <span>Mark Completed</span>
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
                          <button
                            onClick={() => saveEdit(todo.id)}
                            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="w-full sm:w-auto px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span
                            className={`text-lg sm:text-2xl font-medium truncate max-w-full sm:max-w-xs ${
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
                              className={`truncate max-w-full sm:max-w-md ${
                                todo.isCompleted
                                  ? "line-through text-green-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {todo.description}
                            </small>
                          )}
                        </div>
                        <div className="flex flex-row gap-2 ml-0 sm:ml-4 mt-3 sm:mt-0">
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
