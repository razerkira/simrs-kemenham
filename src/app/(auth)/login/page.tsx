// src/app/(auth)/login/page.tsx

import LoginForm from "./login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center  p-4 pt-8 xl:pt-12">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          SIMRS Kemenham
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Smart Integrated Management Reporting System
        </p>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
