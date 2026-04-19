"use client";

// Re-export MiaoWuState type for backward compatibility
export type MiaoWuState = 'idle' | 'happy' | 'curious' | 'surprised';

// 3D version — replaces PNG static image approach
export { MiaoWu3DWrapper as MiaoWu } from './MiaoWu3DWrapper'