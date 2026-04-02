import React from 'react';
import { useSiteContext } from '../../context/SiteContext';

export const Footer = () => {
  const { siteConfig } = useSiteContext();

  return (
    <footer className="bg-neutral-950 w-full py-12 border-t border-neutral-800/20">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-8 gap-6">
        <div className="font-label text-[10px] uppercase tracking-widest text-neutral-400">
          © {new Date().getFullYear()} {siteConfig.name}. Built with Precision.
        </div>
        <div className="flex items-center gap-8 font-label text-[10px] uppercase tracking-widest">
          <a href={siteConfig.socials.x} target="_blank" className="text-neutral-500 hover:text-white transition-colors cursor-pointer" rel="noreferrer">X (Twitter)</a>
          <a href={siteConfig.socials.linkedin} target="_blank" className="text-neutral-500 hover:text-white transition-colors cursor-pointer" rel="noreferrer">LinkedIn</a>
          <a href={siteConfig.socials.behance} target="_blank" className="text-neutral-500 hover:text-white transition-colors cursor-pointer" rel="noreferrer">Behance</a>
        </div>
      </div>
    </footer>
  );
};
