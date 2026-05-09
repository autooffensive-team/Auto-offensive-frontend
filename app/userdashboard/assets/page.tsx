"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import TargetsTable from "@/components/assets/TargetsTable";

export default function AssetsPage() {
  const router = useRouter();

  const handleRowClick = (targetId: string, _projectId: string) => {
    router.push(`/userdashboard/assets/${targetId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Header */}
      <div>
        <h1 className="text-[36px] font-bold text-gray-900 dark:text-white leading-tight">
          Assets
        </h1>
        <p className="text-[18px] text-gray-500 dark:text-gray-400 mt-2">
          View and manage your discovered targets across all projects
        </p>
      </div>

      {/* Targets Table */}
      <TargetsTable onRowClick={handleRowClick} />
    </motion.div>
  );
}
