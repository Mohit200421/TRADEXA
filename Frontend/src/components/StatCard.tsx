import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  index: number;
}

export const StatCard = ({ label, value, icon, index }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 hover:border-gray-600 transition-colors"
  >
    <div className="flex items-center justify-between mb-2">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-blue-400">{icon}</div>
    </div>
    <div className="text-gray-400 text-sm">{label}</div>
  </motion.div>
);