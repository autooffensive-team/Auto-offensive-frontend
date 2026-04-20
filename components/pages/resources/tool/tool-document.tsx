'use client';

import React, { useEffect, useState } from 'react';
import { ToolSidebar } from './tool-sidebar';
import { ToolRightSidebar } from './tool-right-sidebar';
import { ToolContent } from './tool-content';

interface ToolDocumentProps {
  isDark?: boolean;
}

/**
 * ToolDocument Component
 *
 * Main wrapper that combines the sidebar navigation, main content,
 * and right-side TOC. Manages state for active section and theme.
 *
 * Usage:
 * <ToolDocument isDark={false} />
 */
export const ToolDocument: React.FC<ToolDocumentProps> = ({ isDark = false }) => {
  const [activeSection, setActiveSection] = useState('#overview');
  const [themeIsDark, setThemeIsDark] = useState(isDark);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setThemeIsDark(root.classList.contains('dark'));

    syncTheme();

    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => themeObserver.disconnect();
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('section[id]'));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          setActiveSection(`#${visibleEntries[0].target.id}`);
        }
      },
      {
        threshold: [0.2, 0.35, 0.5, 0.7],
        rootMargin: '-90px 0px -45% 0px',
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleNavigate = (href: string) => {
    setActiveSection(href);
    // Optional: Scroll to element
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const bgColor = themeIsDark ? 'bg-[#09090B]' : 'bg-[#F7F5F0]';

  return (
    <div className={`${bgColor} min-h-screen transition-colors duration-300`}>
      <div className="mx-auto flex w-full max-w-7xl items-start pt-22">
        <ToolSidebar
          activeSection={activeSection}
          isDark={themeIsDark}
          onNavigate={handleNavigate}
        />

        <ToolContent isDark={themeIsDark} />

        <ToolRightSidebar
          isDark={themeIsDark}
          onNavigate={handleNavigate}
          activeSection={activeSection}
        />
      </div>
    </div>
  );
};

export default ToolDocument;
