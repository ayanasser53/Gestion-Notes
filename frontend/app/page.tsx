"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(
        "http://localhost:8081/api/auth/admin-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        setErrorMessage("Email ou mot de passe incorrect ❌");
        return;
      }

      const data = await res.json();

      localStorage.setItem("token", data.token);

      setSuccessMessage("Connexion réussie ✅");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error) {
      setErrorMessage("Erreur serveur ⚠️");
    }
  }

  return (
    <main className="min-h-screen bg-white flex justify-center items-start py-3">
      <div className="w-[760px] min-h-[1000px] border border-black bg-white">
        <header className="h-[48px] border-b border-gray-400 flex items-center justify-between px-8">
          <span className="text-[20px] text-gray-800">
            Bulletins étudiant
          </span>

          <div className="flex gap-2">
            <span className="w-[20px] h-[20px] rounded-full border-2 border-black" />
            <span className="w-[20px] h-[20px] rounded-full border-2 border-black" />
            <span className="w-[20px] h-[20px] rounded-full border-2 border-blue-500" />
          </div>
        </header>

        <section className="flex flex-col items-center pt-[70px]">
          <div className="flex flex-col items-center mb-[55px]">
            <div className="relative w-[120px] h-[105px]">
              <div className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[60px] border-r-[60px] border-b-[105px] border-l-transparent border-r-transparent border-b-red-500" />

              <div className="absolute top-[55px] left-1/2 -translate-x-1/2 w-[45px] h-[35px] bg-white/70 blur-md rounded-full" />
            </div>

            <div className="border-t border-b border-red-500 px-2">
              <h1 className="text-red-500 tracking-[0.45em] text-[30px] font-normal pl-3">
                ENSIAS
              </h1>
            </div>
          </div>

          <h2 className="text-center text-[26px] leading-[42px] font-bold text-black mb-[42px]">
            Bienvenue sur l&apos;application de
            <br />
            consultation des notes
          </h2>

          <form
            onSubmit={handleLogin}
            className="w-[460px] min-h-[435px] border border-gray-400 rounded-[6px] px-[45px] py-[36px]"
          >
            <p className="text-[25px] text-slate-600 mb-[40px]">
              Veuillez vous authentifier
            </p>

            {successMessage && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-center font-semibold">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="mb-[34px]">
              <label className="block text-[17px] font-bold text-black mb-[12px]">
                Email ENSIAS
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[48px] border border-gray-400 rounded-[5px] px-3 text-[17px] text-black outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-[40px]">
              <label className="block text-[17px] font-bold text-black mb-[12px]">
                Mot de passe
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[48px] border border-gray-400 rounded-[5px] px-3 pr-12 text-[17px] text-black outline-none focus:border-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black"
                >
                  {showPassword ? (
                    <EyeOff size={25} />
                  ) : (
                    <Eye size={25} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-[18px] font-semibold px-[48px] py-[15px] rounded-[5px] transition"
              >
                Connexion
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}