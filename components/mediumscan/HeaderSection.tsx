export default function HeaderSection() {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="display-font text-5xl font-bold">Medium Scan</h1>
        <p className="text-[20px] text-gray-400 mt-2">
          Sophisticated penetration testing automation, tailored for precision
          and speed.
        </p>
      </div>

      <div className="bg-white text-black rounded-xl px-5 py-3 shadow flex items-center gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          ⚡
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Today’s Usage</p>
          <p className="font-bold">0/3 Scans Used Today</p>
        </div>
      </div>
    </div>
  );
}
