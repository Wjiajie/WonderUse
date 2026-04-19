"use client";

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import type { MiaoWuState } from '@/components/miaowu/MiaoWu'

interface MiaoWu3DProps {
  state: MiaoWuState
  size?: number
}

const STATE_POSES: Record<MiaoWuState, { rotationY: number; rotationZ: number }> = {
  idle:      { rotationY: 0,    rotationZ: 0 },
  happy:     { rotationY: 0.2,  rotationZ: 0 },
  curious:   { rotationY: -0.3, rotationZ: 0 },
  surprised: { rotationY: 0.1,  rotationZ: 0 },
}

function CatMesh({ state }: { state: MiaoWuState }) {
  const groupRef = useRef<THREE.Group>(null)
  const target = STATE_POSES[state] ?? STATE_POSES.idle

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, target.rotationY, 0.08)
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, target.rotationZ, 0.08)
  })

  return (
    <group ref={groupRef}>
      {/* 身体 — 椭球 */}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshStandardMaterial color="#F5C842" roughness={0.8} />
      </mesh>

      {/* 头部 */}
      <mesh position={[0, 0.55, 0.15]}>
        <sphereGeometry args={[0.52, 16, 16]} />
        <meshStandardMaterial color="#F5C842" roughness={0.8} />
      </mesh>

      {/* 左耳 */}
      <mesh position={[-0.32, 0.95, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.17, 0.32, 4]} />
        <meshStandardMaterial color="#F5C842" roughness={0.8} />
      </mesh>

      {/* 右耳 */}
      <mesh position={[0.32, 0.95, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.17, 0.32, 4]} />
        <meshStandardMaterial color="#F5C842" roughness={0.8} />
      </mesh>

      {/* 左眼 */}
      <mesh position={[-0.17, 0.6, 0.65]}>
        <sphereGeometry args={[0.075, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* 右眼 */}
      <mesh position={[0.17, 0.6, 0.65]}>
        <sphereGeometry args={[0.075, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* 左眼高光 */}
      <mesh position={[-0.14, 0.63, 0.7]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>

      {/* 右眼高光 */}
      <mesh position={[0.2, 0.63, 0.7]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>

      {/* 鼻子 */}
      <mesh position={[0, 0.45, 0.72]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#E87B7B" roughness={0.6} />
      </mesh>

      {/* 尾巴 */}
      <mesh position={[0, 0.05, -0.7]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.035, 0.75, 8]} />
        <meshStandardMaterial color="#F5C842" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function MiaoWu3D({ state, size = 140 }: MiaoWu3DProps) {
  return (
    <Canvas
      frameloop="demand"
      gl={{ antialias: true, alpha: true }}
      style={{ width: size, height: size }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 3]} />
      <ambientLight intensity={1.5} />
      <pointLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-3, -3, -3]} intensity={0.4} color="#F5C842" />
      <CatMesh state={state} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate={state === 'idle'}
        autoRotateSpeed={0.8}
      />
    </Canvas>
  )
}