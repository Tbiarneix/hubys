"use client";

import { useForm } from "react-hook-form";
import { useTranslation } from "next-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  birthDate: z.string().optional(),
  bio: z.string().optional(),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpForm) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/auth/signin");
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {t("auth.signUp")}
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                {t("auth.name")}
              </label>
              <input
                {...register("name")}
                type="text"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t("auth.name")}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {t("auth.errors.requiredField")}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                {t("auth.email")}
              </label>
              <input
                {...register("email")}
                type="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t("auth.email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {t("auth.errors.invalidEmail")}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t("auth.password")}
              </label>
              <input
                {...register("password")}
                type="password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t("auth.password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {t("auth.errors.passwordLength")}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="birthDate" className="sr-only">
                {t("auth.birthDate")}
              </label>
              <input
                {...register("birthDate")}
                type="date"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="bio" className="sr-only">
                {t("auth.bio")}
              </label>
              <textarea
                {...register("bio")}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t("auth.bio")}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t("auth.signUp")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}