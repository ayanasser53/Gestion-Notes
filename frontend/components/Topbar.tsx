"use client";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200">
      {/* Left: tab pill */}
      <span className="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
        Bulletins étudiant
      </span>

      {/* Right: circles + logo */}
      <div className="flex items-center gap-2.5">
        <div className="flex gap-1">
          <span className="w-4 h-4 rounded-full border border-gray-300 inline-block" />
          <span className="w-4 h-4 rounded-full border border-gray-300 inline-block" />
          <span className="w-4 h-4 rounded-full bg-red-600 border-red-600 inline-block" />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div
            className="w-5 h-5 bg-red-600"
            style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
          />
          <span className="text-[8px] font-bold tracking-widest text-gray-400 font-mono">
            ENSIAS
          </span>
        </div>
      </div>
    </header>
  );
}
