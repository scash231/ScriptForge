import React, { useCallback, useRef, useEffect } from 'react';

interface Props {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
}

export const ResizeHandle: React.FC<Props> = ({ direction, onResize }) => {
  const dragging = useRef(false);
  const lastPos = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      lastPos.current = direction === 'horizontal' ? e.clientX : e.clientY;

      const onMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        const pos = direction === 'horizontal' ? ev.clientX : ev.clientY;
        const delta = pos - lastPos.current;
        lastPos.current = pos;
        onResize(delta);
      };

      const onUp = () => {
        dragging.current = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [direction, onResize],
  );

  const cls =
    direction === 'horizontal'
      ? 'w-1 cursor-col-resize hover:bg-accent-blue transition-colors flex-shrink-0'
      : 'h-1 cursor-row-resize hover:bg-accent-blue transition-colors flex-shrink-0';

  return <div className={`${cls} bg-bdr`} onMouseDown={onMouseDown} />;
};
