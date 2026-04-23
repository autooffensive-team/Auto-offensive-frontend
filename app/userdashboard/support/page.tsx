"use client";

import { motion } from "framer-motion";
import {
  MessageCircle,
  Mail,
  Book,
  ChevronRight,
  Search,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

const faqCategories = [
  {
    name: "Getting Started",
    questions: [
      "How do I start my first scan?",
      "What targets can I scan?",
      "How long do scans take?",
    ],
  },
  {
    name: "Billing & Pricing",
    questions: [
      "What payment methods are accepted?",
      "How do I upgrade my plan?",
      "Can I get a refund?",
    ],
  },
  {
    name: "Technical Support",
    questions: [
      "How do I report a bug?",
      "Where can I find API documentation?",
      "How do I integrate with CI/CD?",
    ],
  },
];

const popularArticles = [
  { title: "Quick Start Guide", views: 1234 },
  { title: "Understanding Scan Results", views: 892 },
  { title: "API Integration Guide", views: 654 },
  { title: "Best Practices for Security", views: 543 },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 dark:text-white">
          Support
        </h1>
        <p className="text-[16px] text-gray-500 dark:text-gray-400 mt-1">
          Get help and find answers
        </p>
      </div>

      {/* Search */}
      <div>
        <div className="relative max-w-2xl">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-[15px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-4 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-teal-500 transition"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
            <MessageCircle size={24} className="text-teal-500" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 dark:text-white">
              Live Chat
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chat with our team
            </p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-4 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-teal-500 transition"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Mail size={24} className="text-blue-500" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 dark:text-white">
              Email Support
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get help via email
            </p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-4 p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-teal-500 transition"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Book size={24} className="text-purple-500" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 dark:text-white">
              Documentation
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Browse full docs
            </p>
          </div>
        </motion.button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* FAQ Categories */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                <div className="p-4 bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {category.questions.map((question) => (
                    <button
                      key={question}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {question}
                      </span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Popular Articles
          </h2>
          <div className="space-y-3">
            {popularArticles.map((article, index) => (
              <motion.button
                key={article.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-teal-500 transition"
              >
                <div className="flex items-center gap-3">
                  <Book size={20} className="text-gray-500" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {article.title}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {article.views} views
                  </span>
                  <ExternalLink size={16} className="text-gray-400" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Contact Info */}
          <div className="mt-6 p-6 rounded-xl bg-linear-to-r from-teal-500 to-blue-500 text-white">
            <h3 className="font-semibold mb-2">Still need help?</h3>
            <p className="text-sm text-white/80 mb-4">
              Our support team is available 24/7 to assist you.
            </p>
            <button className="px-4 py-2 rounded-lg bg-white text-teal-600 font-medium">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
