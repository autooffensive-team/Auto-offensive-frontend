export default function Terminal() {
  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800">
        {/* Mac dots */}
        <div className="flex gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
        </div>

        {/* Path */}
        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          root@guardian:~/recon/target-102
        </p>

        <div className="w-6" />
      </div>

      {/* Terminal Body */}
      <div
        className="
          bg-black 
          text-green-400 
          font-mono text-sm 
          p-4 
          h-65 md:h-80
          overflow-y-auto
        "
      >
        <p className="text-gray-500">
          [INFO] Initializing Autonomous Guardian Engine v4.2.0...
        </p>

        <p>
          <span className="text-gray-400">[12:44:01]</span>{" "}
          <span className="text-cyan-400">[SYSTEM]</span> Target identified:
          192.168.1.104
        </p>

        <p>
          <span className="text-gray-400">[12:44:02]</span>{" "}
          <span className="text-green-400">[SUBFINDER]</span> Enumerating
          subdomains...
        </p>
        <p>
          <span className="text-gray-400">[12:44:05]</span>{" "}
          <span className="text-green-400">[SUBFINDER]</span> Found:
          api.target.scope
        </p>
        <p>
          <span className="text-gray-400">[12:44:06]</span>{" "}
          <span className="text-green-400">[SUBFINDER]</span> Found:
          dev.target.scope
        </p>

        <p>
          <span className="text-gray-400">[12:44:10]</span>{" "}
          <span className="text-blue-400">[HTTPX]</span> Verifying live
          assets...
        </p>
        <p>
          <span className="text-gray-400">[12:44:12]</span>{" "}
          <span className="text-blue-400">[HTTPX]</span> [200 OK]
          https://api.target.scope
        </p>
        <p>
          <span className="text-gray-400">[12:44:13]</span>{" "}
          <span className="text-red-400">[HTTPX]</span> [403 Forbidden]
          https://dev.target.scope
        </p>

        <p>
          <span className="text-gray-400">[12:44:20]</span>{" "}
          <span className="text-yellow-400">[NMAP]</span> Scanning ports...
        </p>
        <p>
          <span className="text-gray-400">[12:44:21]</span>{" "}
          <span className="text-yellow-400">[NMAP]</span> Port 80 open - HTTP
        </p>
        <p>
          <span className="text-gray-400">[12:44:21]</span>{" "}
          <span className="text-yellow-400">[NMAP]</span> Port 443 open - HTTPS
        </p>

        <p className="text-red-500 mt-2">
          [ALERT] High entropy detected in /v2/auth endpoint header
        </p>

        <p className="mt-2 text-gray-300">
          └─ Pipeline executing: Running Nuclei scans...
        </p>
      </div>

      {/* Floating Stats */}
      <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white text-sm">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-xs text-gray-300">ASSETS</p>
            <p className="font-semibold text-lg">12</p>
          </div>
          <div>
            <p className="text-xs text-gray-300">REQUESTS</p>
            <p className="font-semibold text-lg">412</p>
          </div>
          <div>
            <p className="text-xs text-gray-300">DURATION</p>
            <p className="font-semibold text-lg">04:12</p>
          </div>
        </div>
      </div>
    </div>
  );
}
