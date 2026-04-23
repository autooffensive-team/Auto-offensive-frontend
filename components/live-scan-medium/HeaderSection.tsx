export default function HeaderSection() {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="display-font text-5xl font-bold mb-2">Tool Chain Builder</h1>
        <p className="text-[20px] text-gray-400">
          Configure your autonomous offensive pipeline
        </p>
      </div>

      <div className="bg-gray-800 px-4 py-2 rounded-full text-sm flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
        ACTIVE PIPELINE
      </div>
    </div>
  );
}
