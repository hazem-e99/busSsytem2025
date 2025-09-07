'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Stars } from '@react-three/drei';
import { gsap } from 'gsap';
import Image from 'next/image';

// 3D Floating Particles Component
function FloatingParticles() {
  const particlesRef = useRef([]);
  
  useEffect(() => {
    if (particlesRef.current.length > 0) {
      particlesRef.current.forEach((particle, index) => {
        gsap.to(particle.position, {
          duration: 3 + index * 0.5,
          x: Math.random() * 10 - 5,
          y: Math.random() * 10 - 5,
          z: Math.random() * 10 - 5,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut"
        });
      });
    }
  }, []);

  return (
    <>
      {Array.from({ length: 20 }, (_, i) => (
        <Float key={i} speed={1 + i * 0.1} rotationIntensity={0.5} floatIntensity={1}>
          <mesh
            ref={(el) => {
              if (el) particlesRef.current[i] = el;
            }}
            position={[
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 20
            ]}
            scale={0.1 + Math.random() * 0.2}
          >
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial
              color={`hsl(${200 + Math.random() * 60}, 70%, 60%)`}
              transparent
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}


// Particle Burst Effect
function ParticleBurst() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
  }>>([]);

  useEffect(() => {
    const createBurst = () => {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 0,
        maxLife: 60 + Math.random() * 40
      }));
      setParticles(newParticles);
    };

    createBurst();
    const interval = setInterval(createBurst, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateParticles = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life + 1,
          vx: particle.vx * 0.98,
          vy: particle.vy * 0.98
        })).filter(particle => particle.life < particle.maxLife)
      );
    };

    const interval = setInterval(updateParticles, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            opacity: 1 - (particle.life / particle.maxLife)
          }}
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 360]
          }}
          transition={{
            duration: particle.maxLife / 60,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
}

// Main Welcome Page Component
export default function WelcomePage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const logoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    
    // Initial load animation with 3D effects
    gsap.fromTo(containerRef.current, 
      { opacity: 0, scale: 0.5, rotationY: -180, rotationX: -90 },
      { opacity: 1, scale: 1, rotationY: 0, rotationX: 0, duration: 2, ease: "power3.out" }
    );

    // Logo animation with 3D effects
    gsap.fromTo(logoRef.current,
      { scale: 0, rotation: -720, y: -200, z: -100 },
      { scale: 1, rotation: 0, y: 0, z: 0, duration: 2.5, ease: "elastic.out(1, 0.3)", delay: 0.5 }
    );

    // Set loaded state
    setTimeout(() => setIsLoaded(true), 2000);


    // Auto redirect after 8 seconds
    const redirectTimer = setTimeout(() => {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 0.5,
        rotationY: 180,
        rotationX: 90,
        duration: 1,
        ease: "power3.in",
        onComplete: () => router.push('/auth/login')
      });
    }, 8000);

    return () => {
      clearTimeout(redirectTimer);
    };
  }, [router]);

  // Prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-transparent mx-auto shadow-lg"></div>
          <p className="mt-6 text-cyan-300 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black relative overflow-hidden">
      {/* Particle Burst Effect */}
      <ParticleBurst />

      {/* 3D Background */}
      <div className="absolute inset-0 opacity-60">
        <Canvas camera={{ position: [0, 0, 15] }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0ea5e9" />
          <pointLight position={[0, 10, 0]} intensity={0.3} color="#FFD700" />
          <Stars radius={100} depth={50} count={8000} factor={4} saturation={0} fade speed={1} />
          <FloatingParticles />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Animated Bus */}
      <motion.div
        className="absolute bottom-0 left-0 z-5"
        initial={{ x: -400, y: 0, rotateY: -45 }}
        animate={{ x: "100vw", y: 0, rotateY: 45 }}
        transition={{ 
          duration: 12, 
          ease: "linear",
          repeat: Infinity,
          repeatDelay: 3
        }}
      >
        <Image
          src="/cityus-rafiki.png"
          alt="Bus Animation"
          width={500}
          height={250}
          className="object-contain drop-shadow-2xl"
        />
      </motion.div>

      {/* Main Content */}
      <div ref={containerRef} className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        
        {/* 3D Logo Section */}
        <motion.div
          ref={logoRef}
          className="mb-12 relative"
          whileHover={{ 
            scale: 1.3, 
            rotateY: 360,
            rotateX: 15,
            transition: { duration: 1 }
          }}
        >
          <div className="relative w-40 h-40 md:w-48 md:h-48">
            <Image
              src="/logo.jpg"
              alt="الريناد Logo"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
            {/* 3D Glow effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full blur-2xl opacity-60"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6],
                rotateY: [0, 360]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>

        {/* Main Title with 3D Effect */}
        <motion.h1
          initial={{ opacity: 0, y: 100, rotateX: -90 }}
          animate={isLoaded ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ delay: 1, duration: 1.5 }}
          className="absolute top-4 right-4 text-3xl md:text-4xl font-bold"
        >
          <motion.div
            className="text-gradient bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '200% 200%',
            }}
          >
            الريناد
          </motion.div>
        </motion.h1>

        {/* Developer Info with 3D Animation */}
        <motion.div
          initial={{ opacity: 0, y: 50, rotateZ: -180 }}
          animate={isLoaded ? { opacity: 1, y: 0, rotateZ: 0 } : {}}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute top-4 left-4 text-gray-300"
        >
          <motion.div
            whileHover={{ 
              scale: 1.05, 
              rotateY: 5,
              transition: { duration: 0.3 }
            }}
          >
            <motion.p 
              className="text-sm font-medium mb-1"
              animate={{
                textShadow: [
                  '0 0 5px #0ea5e9',
                  '0 0 15px #0ea5e9, 0 0 25px #0ea5e9',
                  '0 0 5px #0ea5e9'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Developed by: <span className="text-cyan-400 font-semibold">Hazem Essam</span> &{' '}
              <span className="text-cyan-400 font-semibold">Youssry Essam</span>
            </motion.p>
            <motion.p 
              className="text-sm text-blue-300"
              animate={{
                textShadow: [
                  '0 0 5px #3b82f6',
                  '0 0 10px #3b82f6',
                  '0 0 5px #3b82f6'
                ]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              📞 01094575914 & 01289529751
            </motion.p>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
