function TopBar() {
  return (
    <header className="h-16 border-b-2 border-cyan-400 bg-[#0b1220] px-6 flex items-center justify-end">
      <div className="flex items-center gap-4">
        <div className="px-5 py-2 rounded-full bg-[#1e293b] text-cyan-400 text-sm font-semibold">
          SWE 363 - SEC 03
        </div>

        <div className="w-10 h-10 rounded-full bg-blue-500"></div>
      </div>
    </header>
  );
}

export default TopBar;