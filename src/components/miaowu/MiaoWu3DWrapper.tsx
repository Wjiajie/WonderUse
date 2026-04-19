"use client";

import dynamic from 'next/dynamic'
import { MiaoWuState } from './MiaoWu'

const MiaoWu3D = dynamic(
  () => import('@/components/3d/MiaoWu3D').then(m => m.MiaoWu3D),
  {
    ssr: false,
    loading: () => (
      <div style={{
        width: 80,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.1)',
        borderRadius: '50%',
      }}>
        🐱
      </div>
    ),
  }
)

interface Props {
  currentState?: MiaoWuState
  onClick?: () => void
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const SIZE_MAP = { small: 80, medium: 140, large: 200 }

export function MiaoWu3DWrapper({ currentState = 'idle', size = 'medium', onClick, className = '' }: Props) {
  return (
    <div onClick={onClick} className={className} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <MiaoWu3D state={currentState} size={SIZE_MAP[size]} />
    </div>
  )
}