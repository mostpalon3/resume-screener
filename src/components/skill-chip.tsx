interface SkillChipProps {
  skill: string;
  type: 'matched' | 'missing';
}

export default function SkillChip({ skill, type }: SkillChipProps) {
  return (
    <span className={`skill-chip skill-chip--${type}`}>
      {type === 'matched' ? '✓' : '✗'} {skill}
    </span>
  );
}
