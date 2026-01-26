import { ReactNode } from "react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
  index: number;
}

export const FeatureCard = ({ icon, title, description, color, index }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all hover:scale-[1.02] group"
  >
    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${color} mb-6 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </motion.div>
);