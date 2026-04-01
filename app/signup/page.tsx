"use client"

import { log } from 'console';
import { useEffect, useState } from "react";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  async function signUp() {
    console.log("Sign Up pressed with first name:", firstName, "last name:", lastName, "email:", email, "phone number:", phoneNumber, "and password:", password);
    // TODO: Implement sign up logic here, validation, etc
  }

  return (
    <section className="pt-10 pb-20">
      <h1 className="text-4xl font-black uppercase tracking-tight text-center mb-8">Sign Up</h1>
      <form className="space-y-3" onSubmit={signUp}>
        <div className="w-full max-w-sm mx-auto space-y-6 border-4 border-black p-8 bg-[#F7E8D6]">
          <input
            className="w-full border-2 border-black rounded p-2 bg-white"
            onChange={(e) => setFirstName(e.target.value)}
            defaultValue={firstName}
            placeholder="First Name"
            type="text"
            required
          />
          <input
            className="w-full border-2 border-black rounded p-2 bg-white"
            onChange={(e) => setLastName(e.target.value)}
            defaultValue={lastName}
            placeholder="Last Name"
            type="text"
            required
          />
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
            onChange={(e) => setPhoneNumber(e.target.value)}
            defaultValue={phoneNumber}
            placeholder="Phone Number"
            type="tel"
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
            onClick={signUp}
          >
            <span className="relative">
              Sign Up
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-current transition-all duration-150 group-hover:w-full" />
            </span>
          </button>
          <label className="mt-2 text-sm font-semibold text-black/70 flex items-center gap-2">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
              I want to receive updates and promotions via email.
          </label>
          <p className="mt-2 text-sm font-semibold text-black/70">
            Save your cart and manage your orders by creating an account.
          </p>
        </div>
      </form>
    </section>);
}