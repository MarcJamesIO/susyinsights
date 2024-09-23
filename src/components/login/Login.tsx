// login.tsx

import React, { useState } from "react";
import Image from "next/image";

interface LoginProps {
  onLogin?: (token: string) => void; // Optional handler for custom auth logic
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("susyinsights");
  const [password, setPassword] = useState("Susy-Insights#2024");
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/insights/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: username,
          password: password,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        console.log("Login error response:", responseData);
        setError(
          `Login failed: ${responseData.message || response.statusText}`
        );
        return;
      }

      const data = await response.json();

      const token = data.data; // Adjust based on your API response structure

      if (onLogin) {
        localStorage.setItem("token", token);

        onLogin(token);
      } else {
        // Example: Save the token in localStorage and redirect manually
        localStorage.setItem("token", token);
        alert("Login successful!");
      }

      setError(null); // Clear any existing error
    } catch (err) {
      setError(`Network error: ${err}`);
      console.error("Fetch error:", err);
    }
  };

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center h-screen w-screen bg-gray-100 overflow-hidden">
      <form
        onSubmit={handleFormSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <div className="w-full flex justify-center items-center mb-4">
          <Image src="/logo.png" alt="logo" width={90} height={100} />
        </div>

        <h1 className="font-semibold text-center mb-6 text-susyBlue">Login</h1>

        {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}

        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;
