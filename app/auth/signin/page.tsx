"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "next-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignIn() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInForm) => {
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.ok) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {t("auth.signIn")}
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t("auth.email")}
              </label>
              <input
                {...register("email")}
                type="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t("auth.password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {t("auth.errors.passwordLength")}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t("auth.signIn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}