import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types';
import { useLang } from '../../context/LangContext';

interface PolaroidCardProps {
  key?: React.Key;
  project: Project;
  index: number;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({ project, index }) => {
  const navigate = useNavigate();
  const { resolveField } = useLang();
  const tilt = index % 2 === 0 ? "-1.5deg" : "1.5deg";
  const colorIndex = (index % 4) + 1;
  const color = `var(--card-bg-${colorIndex})`;

  return (
    <div className="polaroid" style={{ "--tilt": tilt } as React.CSSProperties} onClick={() => navigate(`/project/${project.id}`)}>
      <div style={{ height: 180, background: color, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
        <div style={{ textAlign: "center", position: 'relative', zIndex: 2 }}>
          <p style={{ fontFamily: "var(--font-sketch)", fontSize: "1.2rem", color: "rgba(255,255,255,0.8)", marginTop: "0.5rem", fontWeight: 'bold' }}>
            {resolveField(project.category)}
          </p>
        </div>
      </div>
      <div style={{ paddingTop: "0.8rem", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-sketch)", fontSize: "1.3rem", fontWeight: 700, color: "var(--ink)" }}>{resolveField(project.title)}</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--ink-faded)", fontStyle: "italic" }}>
          {project.tags?.slice(0, 2).map(tag => resolveField(tag)).join(', ')}
        </p>
      </div>
    </div>
  );
};
