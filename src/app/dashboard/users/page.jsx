"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ManageUsersPage() {
  // Added update from useSession
  const { data: session, update } = useSession();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    phone: "",
    address: "",
  });

  const [message, setMessage] = useState(null);

  // Fetch Users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  // Open Modal for Adding
  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
      phone: "",
      address: "",
    });
    setIsModalOpen(true);
    setMessage(null);
  };

  // Open Modal for Editing
  const openEditModal = (user) => {
    setIsEditMode(true);
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role || "user",
      phone: user.phone || "",
      address: user.address || "",
    });
    setIsModalOpen(true);
    setMessage(null);
  };

  // Handle Form Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const url = "/api/users";
    const method = isEditMode ? "PUT" : "POST";
    const payload = { ...formData };
    if (isEditMode) {
      payload.userId = currentUser._id;
      if (!payload.password) delete payload.password;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        setMessage({
          type: "success",
          text: isEditMode ? "User updated!" : "User created!",
        });
        fetchUsers(); // Refresh list

        // --- UPDATE SESSION (Client + Server Sync) ---
        // 1. Check if the Admin is editing THEMSELVES
        const isSelfEdit =
          isEditMode &&
          currentUser &&
          session?.user &&
          currentUser._id === session.user.id;

        if (isSelfEdit) {
          // 2. Trigger immediate NextAuth UI update (Client side)
          if (update) {
            await update({
              ...session.user,
              name: formData.name,
              email: formData.email,
              role: formData.role,
            });
          }

          // 3. Trigger custom event for manual UI updates (TopNavbar)
          // This ensures TopNavbar refetches data if it relies on manual API calls
          window.dispatchEvent(new Event("user-session-updated"));
        } else {
          // If editing someone else, still dispatch event in case Admin needs to see it elsewhere
          window.dispatchEvent(new Event("data-refresh-required"));
        }

        setTimeout(() => setIsModalOpen(false), 1000);
      } else {
        setMessage({ type: "error", text: json.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong." });
    }
  };

  // Handle Delete
  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/users?userId=${userId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchUsers();
        window.dispatchEvent(new Event("data-refresh-required")); // Notify UI
      } else {
        alert(json.message);
      }
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Manage Users
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage access and user roles.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <i className="fas fa-plus mr-2"></i> Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Users
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.length}
          </p>
        </Card>
        <Card className="p-6 border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Admins
          </p>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.role === "admin").length}
          </p>
        </Card>
        <Card className="p-6 border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Verified
          </p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.verified).length}
          </p>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-semibold text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.verified ? (
                        <span className="flex items-center text-green-600 dark:text-green-400">
                          <i className="fas fa-check-circle mr-1"></i> Verified
                        </span>
                      ) : (
                        <span className="flex items-center text-yellow-600 dark:text-yellow-400">
                          <i className="fas fa-exclamation-circle mr-1"></i>{" "}
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(user)}
                        className="font-medium text-blue-600 dark:text-blue-400 hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="font-medium text-red-600 dark:text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="w-full max-w-md bg-white dark:bg-gray-800 p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {isEditMode ? "Edit User" : "Add New User"}
            </h3>

            {message && (
              <div
                className={`mb-4 p-3 rounded text-sm ${
                  message.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  required
                  type="email"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password {isEditMode && "(leave blank to keep current)"}
                </label>
                <input
                  required={!isEditMode}
                  type="password"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="dark:text-white dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {isEditMode ? "Update User" : "Create User"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
