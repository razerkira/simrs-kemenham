// src/app/(auth)/login/page.tsx

import LoginForm from './login-form' // Kita akan buat ini setelah ini
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          SIMRS Kemenham
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Smart Integrated Management Reporting System
        </p>
        {/* Suspense diperlukan jika ada logic loading */}
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}