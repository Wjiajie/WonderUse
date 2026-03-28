"use client";

type Mood = 'happy' | 'surprised' | 'grateful' | 'proud';

interface MoodPickerProps {
  value: Mood | null;
  onChange: (mood: Mood) => void;
}

const MOODS: { id: Mood; emoji: string; label: string }[] = [
  { id: 'happy',     emoji: '😊', label: '开心'  },
  { id: 'surprised', emoji: '😲', label: '惊喜'  },
  { id: 'grateful',  emoji: '🙏', label: '感恩'  },
  { id: 'proud',     emoji: '😌', label: '自豪'  },
];

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-3)',
      justifyContent: 'center',
    }}>
      {MOODS.map(mood => {
        const isSelected = value === mood.id;
        return (
          <button
            key={mood.id}
            onClick={() => onChange(mood.id)}
            title={mood.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              width: '60px',
              height: '64px',
              border: isSelected
                ? '2px solid var(--color-wood-dark)'
                : '2px dashed rgba(93,64,55,0.35)',
              borderRadius: 'var(--radius-md)',
              background: isSelected
                ? 'linear-gradient(135deg, var(--color-gold), var(--color-brass))'
                : 'rgba(240,226,200,0.5)',
              boxShadow: isSelected ? 'var(--shadow-pressed)' : 'none',
              transform: isSelected ? 'scale(0.97)' : 'scale(1)',
              cursor: 'pointer',
              transition: 'all 0.18s var(--ease-smooth)',
              fontFamily: 'var(--font-handwriting-stack)',
            }}
          >
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{mood.emoji}</span>
            <span style={{
              fontSize: 'var(--text-xs)',
              color: isSelected ? 'var(--color-wood-dark)' : 'var(--color-text-muted)',
              fontWeight: isSelected ? 700 : 400,
            }}>
              {mood.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export type { Mood };
