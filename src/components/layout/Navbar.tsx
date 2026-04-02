import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useSiteContext } from '../../context/SiteContext';

export const Navbar = () => {
  const { siteConfig } = useSiteContext();
  const location = useLocation();
  
  const navLinks = [
    { name: 'Projects', path: '/projects' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
        <Link to="/" className="text-xl font-bold tracking-tighter text-white font-sans uppercase">
          {siteConfig.name.split(' ')[0]}
        </Link>
        
        <div className="hidden md:flex items-center gap-8 font-sans tracking-tight text-sm font-medium text-neutral-400">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-colors relative py-1 hover:text-white ${
                location.pathname === link.path ? 'text-white' : ''
              }`}
            >
              {link.name}
              {location.pathname === link.path && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 w-full h-px bg-white"
                />
              )}
            </Link>
          ))}
        </div>
        
        <div>
          <a href={`mailto:${siteConfig.email}`} className="bg-white text-on-primary px-5 py-1.5 font-medium hover:opacity-80 transition-opacity duration-200 ease-in-out text-sm rounded-full inline-block cursor-pointer">
            Email Me
          </a>
        </div>
      </div>
    </nav>
  );
};
