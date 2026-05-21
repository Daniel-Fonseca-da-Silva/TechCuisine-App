"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useTranslations } from "next-intl";

import type { FaqItem } from "@/types/translations";

export function FaqSection() {
  const t = useTranslations("HomePage.faq");
  const items = t.raw("items") as FaqItem[];
  const [openIndex, setOpenIndex] = useState<number>(0);

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-lime-800 to-amber-900">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {t("title")}
          </h2>
          <p className="text-white/80 text-base sm:text-lg max-w-2xl">
            {t("subtitle")}
          </p>
        </header>

        <div className="space-y-4">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-item-${index}`;

            return (
              <div
                key={item.question}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left hover:bg-white/10 transition-colors"
                  onClick={() => handleToggle(index)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                >
                  <span className="text-sm sm:text-base font-medium text-white pr-4">
                    {item.question}
                  </span>
                  <FiChevronDown
                    className={`w-5 h-5 text-white/70 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={contentId}
                  className={`px-4 sm:px-6 pb-4 text-sm text-white/80 transition-[max-height,opacity] duration-200 ease-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {isOpen && <p>{item.answer}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
