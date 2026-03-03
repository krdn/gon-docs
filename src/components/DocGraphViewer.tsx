'use client';

import { useState, useCallback } from 'react';

interface DocGraphViewerProps {
  src: string;
  title?: string;
}

export function DocGraphViewer({ src, title }: DocGraphViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const openInNewTab = useCallback(() => {
    window.open(src, '_blank');
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  return (
    <div className={`doc-graph-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* 툴바 */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 10,
          display: 'flex',
          gap: 8,
        }}
      >
        <button
          onClick={openInNewTab}
          title="새 탭에서 열기"
          style={{
            background: 'rgba(19, 24, 41, 0.9)',
            border: '1px solid var(--dg-border)',
            borderRadius: 8,
            padding: '6px 10px',
            color: 'var(--dg-text-dim)',
            cursor: 'pointer',
            fontSize: 14,
            backdropFilter: 'blur(8px)',
          }}
        >
          &#8599;
        </button>
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? '전체화면 닫기' : '전체화면'}
          style={{
            background: 'rgba(19, 24, 41, 0.9)',
            border: '1px solid var(--dg-border)',
            borderRadius: 8,
            padding: '6px 10px',
            color: 'var(--dg-text-dim)',
            cursor: 'pointer',
            fontSize: 14,
            backdropFilter: 'blur(8px)',
          }}
        >
          {isFullscreen ? '✕' : '⛶'}
        </button>
      </div>

      {/* 로딩 스피너 */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--dg-bg)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: '3px solid var(--dg-border)',
              borderTopColor: 'var(--dg-accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* 에러 */}
      {hasError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--dg-bg)',
            color: 'var(--dg-text-dim)',
            gap: 12,
          }}
        >
          <p>문서를 불러올 수 없습니다.</p>
          <button
            onClick={openInNewTab}
            style={{
              background: 'var(--dg-surface2)',
              border: '1px solid var(--dg-border)',
              borderRadius: 8,
              padding: '8px 16px',
              color: 'var(--dg-accent)',
              cursor: 'pointer',
            }}
          >
            새 탭에서 열기
          </button>
        </div>
      )}

      {/* iframe */}
      <iframe
        src={src}
        title={title ?? 'Doc Graph'}
        sandbox="allow-scripts allow-same-origin"
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: hasError ? 'none' : 'block' }}
      />
    </div>
  );
}
