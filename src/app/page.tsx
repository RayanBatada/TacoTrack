"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  MessageSquare,
  TrendingUp,
  Sparkles,
  ArrowDown,
  ChevronDown,
} from "lucide-react";
import { FeatureCard } from "@/components/feature-card";
import { ScrollIndicator } from "@/components/scroll-indicator";
import { getRecipes, getIngredients, getWasteEntries } from "@/lib/cache";

export default function LandingPage() {
  const router = useRouter();
  const [isZooming, setIsZooming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();

  // Logo animations based on scroll
  const logoScale = useTransform(scrollY, [0, 400], [1, 0.25]);
  const logoY = useTransform(scrollY, [0, 400], [0, -350]);
  const logoOpacity = useTransform(scrollY, [0, 200, 400], [1, 0.8, 0]);

  // Hero text animations
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, -100]);

  const handleEnterDashboard = async () => {
    setIsZooming(true);

    // Fire prefetch in background without awaiting (non-blocking)
    Promise.all([getRecipes(), getIngredients(), getWasteEntries()])
      .then(([recipes]) => {
        // Prefetch forecast for first dish - don't await
        if (recipes && recipes.length > 0) {
          getForecast(recipes[0].id, 7).catch(() => {
            // Silently fail
          });
        }
      })
      .catch(() => {
        // Silently fail prefetch
      });

    // Navigation always happens after 1200ms regardless of prefetch status
    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  };

  // Auto-scroll hint animation
  const [showScrollHint, setShowScrollHint] = useState(true);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollHint(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden"
    >
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator maxScroll={2000} />

      {/* Zoom overlay */}
      {isZooming && (
        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-primary via-purple-600 to-pink-600 z-[100]"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 20, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeIn" }}
        />
      )}

      {/* Hero Section - Logo */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Logo */}
          <motion.div
            style={{ scale: logoScale, y: logoY, opacity: logoOpacity }}
            className="relative mb-8"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(157, 78, 221, 0.3)",
                  "0 0 60px rgba(157, 78, 221, 0.6)",
                  "0 0 20px rgba(157, 78, 221, 0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-full"
            >
              <Image
                src="/newlogo.jpg"
                alt="TacoTrack Logo"
                width={400}
                height={400}
                className="w-auto h-auto max-w-[300px] md:max-w-[400px] drop-shadow-2xl"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Hero Text */}
          <motion.div
            style={{ opacity: heroOpacity, y: heroY }}
            className="text-center px-6 max-w-4xl"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
            >
              Never Run Out Again
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
            >
              AI-powered inventory management that predicts stockouts and
              optimizes your restaurant operations
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex gap-4 justify-center items-center"
            >
              <div className="px-6 py-3 bg-primary/20 border border-primary/40 rounded-full text-white font-semibold backdrop-blur-sm">
                🏆 Innovation • Feasibility • Impact
              </div>
            </motion.div>

            {/* Scroll hint - below badge */}
            {showScrollHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-8"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex flex-col items-center gap-2 text-white/60"
                >
                  <span className="text-sm font-medium">Scroll to explore</span>
                  <ChevronDown className="h-6 w-6" />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Three Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to eliminate waste and maximize profits
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* TacoTalk AI */}
            <FeatureCard
              title="TacoTalk AI"
              description="Your intelligent inventory assistant. Ask questions, get insights, and receive proactive alerts about stock levels."
              icon={MessageSquare}
              gradient="bg-gradient-to-br from-purple-900/40 to-pink-900/40"
              delay={0.1}
              visual={
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
                      🌮
                    </div>
                    <div className="bg-secondary/50 rounded-lg px-3 py-2 text-sm text-gray-300">
                      When should I reorder beef?
                    </div>
                  </div>
                  <div className="flex items-start gap-2 justify-end">
                    <div className="bg-primary/30 rounded-lg px-3 py-2 text-sm text-white text-right">
                      You have 2.3 days left. Order 50 lbs by tomorrow!
                    </div>
                  </div>
                </div>
              }
            />

            {/* Prediction Model */}
            <FeatureCard
              title="AI Forecasting"
              description="Machine learning models analyze sales patterns to predict future demand and reduce shrinkage."
              icon={TrendingUp}
              gradient="bg-gradient-to-br from-cyan-900/40 to-blue-900/40"
              delay={0.2}
              visual={
                <div className="h-24 flex items-end justify-between gap-1">
                  {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                      className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-400 rounded-t"
                    />
                  ))}
                </div>
              }
            />

            {/* Wrapped Feature */}
            <FeatureCard
              title="TacoTrack Wrapped"
              description="Beautiful Spotify-style analytics showcasing your top dishes, revenue, and performance insights."
              icon={Sparkles}
              gradient="bg-gradient-to-br from-orange-900/40 to-red-900/40"
              delay={0.3}
              visual={
                <div className="text-center py-4">
                  <div className="text-4xl font-black bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent mb-2">
                    1,247
                  </div>
                  <div className="text-sm text-gray-400">
                    Tacos served this month 🎉
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-8 text-white">
              Ready to Transform Your
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Inventory Management?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join the future of restaurant operations. Reduce waste, increase
              profits, and never run out of ingredients again.
            </p>

            <motion.button
              onClick={handleEnterDashboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-12 py-5 bg-gradient-to-r from-primary via-purple-600 to-pink-600 rounded-full text-white text-xl font-bold shadow-2xl overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-primary"
                initial={{ x: "100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center gap-3">
                Enter Taco Track
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <div>
                <div className="text-3xl font-black text-primary mb-2">99%</div>
                <div className="text-sm text-gray-400">Prediction Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-black text-primary mb-2">30%</div>
                <div className="text-sm text-gray-400">Waste Reduction</div>
              </div>
              <div>
                <div className="text-3xl font-black text-primary mb-2">
                  24/7
                </div>
                <div className="text-sm text-gray-400">AI Monitoring</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer Spacer */}
      <div className="h-32" />
    </div>
  );
}
