function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050b18] text-white">
      <div className="w-full max-w-md rounded-xl bg-[#0b1424] p-8 shadow-lg">
        
        {/* Title */}
        <h1 className="mb-2 text-center text-2xl font-bold text-cyan-400">
          LabTrack
        </h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          Collaborative Programming Platform
        </p>

        {/* Tabs */}
        <div className="mb-6 flex rounded-lg bg-[#0f1b33] p-1">
          <button className="flex-1 rounded-md bg-cyan-500 py-2 text-sm font-semibold text-white">
            Sign in
          </button>
          <button className="flex-1 py-2 text-sm text-gray-400">
            Register
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Email / Student ID"
            className="w-full rounded-md bg-[#0f1b33] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-md bg-[#0f1b33] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <div className="flex items-center justify-between text-sm text-gray-400">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember me
            </label>
            <button className="text-cyan-400 hover:underline">
              Forgot password?
            </button>
          </div>

          <button className="w-full rounded-md bg-cyan-500 py-3 font-semibold hover:bg-cyan-600">
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;