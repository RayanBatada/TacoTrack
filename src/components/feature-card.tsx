"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  delay: number;
  visual?: ReactNode;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  gradient,
  delay,
  visual,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.05, y: -10 }}
      className="relative group"
    >
      <div
        className={`glass-card rounded-2xl p-8 h-full border-2 border-white/10 hover:border-white/30 transition-all duration-300 ${gradient}`}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-br from-primary/30 to-transparent -z-10" />

        {/* Icon */}
        <div className="mb-6 inline-block p-4 rounded-xl bg-white/10 backdrop-blur-sm">
          <Icon className="h-10 w-10 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-3xl font-black mb-4 text-white tracking-tight">
          {title}
        </h3>

        {/* Description */}
        <p className="text-lg text-gray-300 leading-relaxed mb-6">
          {description}
        </p>

        {/* Visual Preview */}
        {visual && (
          <div className="mt-6 rounded-lg overflow-hidden bg-black/30 p-4">
            {visual}
          </div>
        )}
      </div>
    </motion.div>
  );
}
