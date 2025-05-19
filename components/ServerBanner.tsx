import { FC, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ServerBannerProps {
  banner?: string | null;
  name: string;
  isOfficial?: boolean;
  height?: string;
}

export const ServerBanner: FC<ServerBannerProps> = ({
  banner,
  name,
  isOfficial = false,
  height = '180px'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full overflow-hidden rounded-t-md" 
      style={{ height }}
    >
      {banner ? (
        <div className="relative w-full h-full">
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"]
            }}
            transition={{
              duration: 30,
              ease: "linear",
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{
              backgroundImage: "radial-gradient(circle at 30% 50%, rgba(16,185,129,0.08) 0%, transparent 50%)",
              backgroundSize: "200% 200%"
            }}
          />
          <Image
            src={banner}
            alt={`${name} banner`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {isOfficial && <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(16,185,129,0.15)]" />}
        </div>
      ) : (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-900" />
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"]
            }}
            transition={{
              duration: 30,
              ease: "linear",
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{
              backgroundImage: "radial-gradient(circle at 30% 70%, rgba(16,185,129,0.1) 0%, transparent 50%)",
              backgroundSize: "200% 200%"
            }}
          />
          {isOfficial && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15)_0%,transparent_70%)]" />
              <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(16,185,129,0.2)]" />
            </>
          )}
          <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50" />
      {/* Official Server Badge*/}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-0 left-0 p-4 text-white flex items-center"
      >
        {isOfficial && (
          <div className="relative mr-2">
            <motion.div
              className="w-8 h-8 relative cursor-pointer"
              onHoverStart={() => setShowTooltip(true)}
              onHoverEnd={() => setShowTooltip(false)}
              whileHover={{ scale: 1.1 }}
            >
              <Image 
                src="/assets/official.webp" 
                alt="Official Server" 
                width={32} 
                height={32} 
                className="drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                
              />
              
              {/* Tooltip */}
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900/90 backdrop-blur-md text-white text-xs whitespace-nowrap rounded-md border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.3)] z-50"
                >
                  Official Server
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45 -mt-1 border-r border-b border-emerald-500/20"></div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
        
        <h1 className="text-2xl font-bold drop-shadow-md flex items-center">
          {name}
          {isOfficial && (
            <motion.div 
              className="ml-2 text-xs bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium"
              animate={{ 
                boxShadow: ['0 0 0px rgba(16,185,129,0.3)', '0 0 10px rgba(16,185,129,0.5)', '0 0 0px rgba(16,185,129,0.3)'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Verified
            </motion.div>
          )}
        </h1>
      </motion.div>
    </motion.div>
  );
}; 
 