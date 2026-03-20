"use client"

import { log } from 'console';
import { useEffect, useState } from "react";
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    console.log("Login pressed with email:", email, "and password:", password);
    // TODO: Implement login logic here, validation, etc
  }

  return (
    <section className="pt-10 pb-20">
      <h1 className="text-4xl font-black uppercase tracking-tight text-center mb-8">Login</h1>
      <form className="space-y-3" onSubmit={login}>
        <div className="w-full max-w-sm mx-auto space-y-6 border-4 border-black p-8 bg-[#F7E8D6]">
          <input
            className="w-full border-2 border-black rounded p-2 bg-white"
            onChange={(e) => setEmail(e.target.value)}
            defaultValue={email}
            placeholder="Email"
            type="email"
            required
          />
          <input
            className="w-full border-2 border-black rounded p-2 bg-white"
            onChange={(e) => setPassword(e.target.value)}
            defaultValue={password}
            placeholder="Password"
            type="password"
            required
          />
          <button
            className="group w-full bg-black text-white py-2 rounded hover:bg-stone-800"
            type="submit"
            onClick={login}
          >
            <span className="relative">
              Log In
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-current transition-all duration-150 group-hover:w-full" />
            </span>
          </button>
          <p className="mt-2 text-sm font-semibold text-black/70">
            Don't have an account? <Link href="/signup" className="text-amber-400 hover:text-amber-300 hover:underline">Create an account</Link> to save your cart and manage your orders.
          </p>
        </div>
      </form>
    </section>
  );
}