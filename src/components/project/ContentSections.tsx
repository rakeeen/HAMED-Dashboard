import { motion } from "motion/react";
import { useSiteContext } from "../../context/SiteContext";

export const ContentSections = () => {
  const { siteConfig } = useSiteContext();
  return (
    <section className="bg-surface">
      {/* Full Width Visual */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="w-full h-[60vh] md:h-[80vh] bg-surface-container-low overflow-hidden"
      >
        <img 
          alt="Architecture Detail" 
          className="w-full h-full object-cover" 
          src={siteConfig.siteImages?.projectDetail1 || ''}
          referrerPolicy="no-referrer"
        />
      </motion.div>

      {/* Asymmetric Grid */}
      <div className="max-w-screen-2xl mx-auto px-8 py-24 md:py-48 grid grid-cols-1 md:grid-cols-12 gap-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="md:col-span-5 self-center"
        >
          <h3 className="font-headline text-white text-4xl font-bold mb-6 tracking-tight">Materiality</h3>
          <p className="text-secondary leading-relaxed">
            We explored over 40 variations of concrete aggregate to achieve the specific textural depth required for the lobby walls. The goal was a surface that feels alive as light moves across it throughout the day.
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="md:col-span-7"
        >
          <div className="bg-surface-container-low aspect-[4/5] overflow-hidden">
            <img 
              alt="Interior Detail" 
              className="w-full h-full object-cover" 
              src={siteConfig.siteImages?.projectDetail2 || ''}
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </div>

      {/* Immersive Image */}
      <div className="max-w-screen-xl mx-auto px-8 pb-48">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-surface-container-low aspect-video overflow-hidden"
        >
          <img 
            alt="Studio View" 
            className="w-full h-full object-cover" 
            src={siteConfig.siteImages?.projectDetail3 || ''}
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <div className="mt-8 flex justify-end">
          <span className="font-label text-secondary uppercase text-[10px] tracking-widest italic">Fig 04. Lighting Analysis on Main Atrium</span>
        </div>
      </div>
    </section>
  );
};
