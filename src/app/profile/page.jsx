"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Lock,
  ShieldCheck,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Notifications
  const [notification, setNotification] = useState({
    show: false,
    type: "success", // 'success' or 'error'
    message: "",
  });

  // --- Fetch User Data ---
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated" && session?.user?.id) {
      fetchUserProfile(session.user.id);
    }
  }, [status, session, router]);

  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users?userId=${userId}`);
      const json = await res.json();

      if (json.success && json.data) {
        setUser(json.data);
        setFormData({
          name: json.data.name || "",
          email: json.data.email || "",
          phone: json.data.phone || "",
          address: json.data.address || "",
        });
      } else {
        showNotification("error", "Failed to load profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      showNotification("error", "An error occurred while loading profile");
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Reset to original data if cancelling
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!user?._id) return;

    setSaving(true);
    try {
      // Prepare payload based on your API requirements
      const payload = {
        userId: user._id, // Important: API expects userId in body
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        // Role is omitted to prevent privilege escalation from this page
      };

      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        setUser((prev) => ({ ...prev, ...formData }));
        setIsEditing(false);
        showNotification("success", "Profile updated successfully!");

        // Update session name locally for immediate UI feedback
        if (session?.user) {
          session.user.name = formData.name;
        }
      } else {
        showNotification("error", json.message || "Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      showNotification("error", "An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification("error", "New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showNotification("error", "Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        userId: user._id,
        // Note: Your API doesn't explicitly check 'currentPassword' before updating
        // it just overwrites. We'll send the new password.
        password: passwordData.newPassword,
      };

      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        showNotification("success", "Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordSection(false);
      } else {
        showNotification("error", json.message || "Failed to change password");
      }
    } catch (error) {
      console.error(error);
      showNotification("error", "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(
      () => setNotification((prev) => ({ ...prev, show: false })),
      3000,
    );
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  // --- Render Helpers ---

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-gray-500">
        User not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold border-4 border-white shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-2">
                {user.role === "admin" ? "Admin" : "Customer"}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-2 px-4 py-2 rounded-md hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Notification Toast */}
        {notification.show && (
          <div
            className={`fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg text-white flex items-center gap-3 transform transition-all duration-300 animate-bounce ${
              notification.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile Info Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Profile Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                ) : (
                  <button
                    onClick={toggleEdit}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium text-sm"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        !isEditing
                          ? "bg-gray-50 text-gray-600 border-gray-200"
                          : "bg-white border-gray-300"
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Contact support to change email.
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="+1 (555) 000-0000"
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        !isEditing
                          ? "bg-gray-50 text-gray-600 border-gray-200"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <textarea
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        !isEditing
                          ? "bg-gray-50 text-gray-600 border-gray-200"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={toggleEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none flex items-center gap-2 disabled:opacity-75"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Password Section */}
            <div className="bg-white shadow rounded-lg p-6 sm:p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Security</h2>
                <button
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  {showPasswordSection ? "Hide" : "Change Password"}
                </button>
              </div>

              {showPasswordSection && (
                <form
                  onSubmit={handlePasswordUpdate}
                  className="space-y-4 mt-4 pt-4 border-t border-gray-100"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none flex items-center gap-2 disabled:opacity-75"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right: Info / Links */}
          <div className="space-y-6">
            <div className="bg-indigo-600 shadow rounded-lg p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Need Help?</h3>
              <p className="text-indigo-100 text-sm mb-4">
                If you have trouble accessing your account or updating your
                information, please contact our support team.
              </p>
              <button className="w-full bg-white text-indigo-600 font-semibold py-2 rounded-md hover:bg-indigo-50 transition-colors text-sm">
                Contact Support
              </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/manage-my-order"
                    className="flex items-center text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors"
                  >
                    <span>My Orders</span>
                    <span className="ml-auto">→</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wishlist"
                    className="flex items-center text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors"
                  >
                    <span>Wishlist</span>
                    <span className="ml-auto">→</span>
                  </Link>
                </li>
                {user.role === "admin" && (
                  <li>
                    <Link
                      href="/dashboard"
                      className="flex items-center text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors"
                    >
                      <span>Admin Dashboard</span>
                      <span className="ml-auto">→</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
