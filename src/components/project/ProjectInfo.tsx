import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export const ProjectInfo = () => {
  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="max-w-screen-2xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
          {/* Left: Overview */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <h2 className="font-headline text-white text-3xl md:text-4xl font-bold mb-10 tracking-tight">The Vision</h2>
            <div className="space-y-6 text-secondary text-lg leading-relaxed max-w-2xl">
              <p>
                Brutal Flats represents a departure from the ornamental. It is a study in volume, light, and the inherent beauty of exposed concrete. The project aimed to create a sanctuary within the urban chaos by utilizing heavy massing to isolate sound while carving out large voids for natural illumination.
              </p>
              <p>
                Every structural element serves a dual purpose as a visual anchor. The interface between the building and its inhabitants was designed to feel tactile—a physical experience rather than just a visual one.
              </p>
            </div>
          </motion.div>

          {/* Right: Metadata */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-5"
          >
            <div className="bg-surface-container-low p-10 md:p-12 space-y-10 border border-white/5">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <span className="font-label text-secondary uppercase text-[10px] tracking-widest block mb-2">Role</span>
                  <span className="text-white font-medium">Lead Designer</span>
                </div>
                <div>
                  <span className="font-label text-secondary uppercase text-[10px] tracking-widest block mb-2">Timeline</span>
                  <span className="text-white font-medium">18 Months</span>
                </div>
                <div>
                  <span className="font-label text-secondary uppercase text-[10px] tracking-widest block mb-2">Stack</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['CAD', 'BIM', 'RVT'].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-label text-white uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-label text-secondary uppercase text-[10px] tracking-widest block mb-2">Location</span>
                  <span className="text-white font-medium">Berlin, DE</span>
                </div>
              </div>
              <div className="pt-6">
                <a 
                  className="inline-flex items-center gap-3 bg-white text-[#131313] px-8 py-4 font-headline font-bold text-sm tracking-tight hover:bg-secondary transition-colors group" 
                  href="#"
                >
                  VIEW LIVE SITE
                  <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
