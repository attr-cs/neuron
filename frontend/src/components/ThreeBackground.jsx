import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Animated sphere component
const AnimatedSphere = ({ position, color, speed = 1, size = 1 }) => {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
    }
    if (materialRef.current) {
      materialRef.current.distort = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.3;
    }
  });

  return (
    <Sphere ref={meshRef} args={[size, 32, 32]} position={position}>
      <MeshDistortMaterial
        ref={materialRef}
        color={color}
        speed={2}
        distort={0.3}
        radius={1}
        transparent
        opacity={0.1}
      />
    </Sphere>
  );
};

// Floating particles component
const FloatingParticles = ({ count = 100 }) => {
  const particlesRef = useRef();
  const positions = useRef();

  useEffect(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 20;
      pos[i + 1] = (Math.random() - 0.5) * 20;
      pos[i + 2] = (Math.random() - 0.5) * 20;
    }
    positions.current = pos;
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#3b82f6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Wave effect component
const WaveEffect = () => {
  const meshRef = useRef();
  const geometryRef = useRef();

  useEffect(() => {
    if (geometryRef.current) {
      const positions = geometryRef.current.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] = Math.sin(positions[i] * 0.1) * 2;
      }
      geometryRef.current.attributes.position.needsUpdate = true;
    }
  }, []);

  useFrame((state) => {
    if (geometryRef.current) {
      const positions = geometryRef.current.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] = Math.sin(positions[i] * 0.1 + state.clock.elapsedTime * 2) * 2;
      }
      geometryRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <planeGeometry ref={geometryRef} args={[20, 20, 50, 50]} />
      <meshBasicMaterial
        color="#3b82f6"
        transparent
        opacity={0.1}
        wireframe
      />
    </mesh>
  );
};

// Main ThreeBackground component
const ThreeBackground = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.z = 5;
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <AnimatedSphere
        position={[-3, 2, 0]}
        color="#3b82f6"
        speed={0.5}
        size={1.5}
      />
      
      <AnimatedSphere
        position={[3, -2, 1]}
        color="#8b5cf6"
        speed={0.8}
        size={1}
      />
      
      <AnimatedSphere
        position={[0, 3, -1]}
        color="#06b6d4"
        speed={0.3}
        size={0.8}
      />
      
      <FloatingParticles count={200} />
      <WaveEffect />
    </>
  );
};

// Wrapper component
const ThreeBackgroundWrapper = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ThreeBackground />
      </Canvas>
    </div>
  );
};

export default ThreeBackgroundWrapper; 