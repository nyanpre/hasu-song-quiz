import { useState, useEffect, useRef } from 'react';
import type { Song } from '../types';

interface Props {
  songs: Song[];
}

export default function IntroQuiz({ songs }: Props) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [playSec, setPlaySec] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const playerRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    if (songs.length > 0) {
      setNextSong();
    }
  }, [songs]);

  useEffect(() => {
    if (currentSong && (window as any).YT) {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch(e){}
      }

      playerRef.current = new (window as any).YT.Player('yt-player', {
        height: '1', 
        width: '1',
        videoId: currentSong.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0
        },
        events: {
          onReady: () => {
            playerRef.current.mute();
            playerRef.current.playVideo();
            setTimeout(() => {
              playerRef.current.pauseVideo();
              playerRef.current.unMute();
              playerRef.current.seekTo(0, true);
            }, 500);
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.ENDED (0) でフル再生が自然に終わった時に「再生中」を解除する
            if (event.data === 0) {
              setIsPlaying(false);
            }
          }
        }
      });
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentSong]);

  const setNextSong = () => {
    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    setCurrentSong(randomSong);
    setShowAnswer(false);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    if (!playerRef.current || !currentSong) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setIsPlaying(true);
    playerRef.current.seekTo(0, true);
    playerRef.current.playVideo();

    // 💡 playSecが0（フル再生）より大きい場合のみ、指定秒数後に自動停止する
    if (playSec > 0) {
      timeoutRef.current = setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.pauseVideo();
        }
        setIsPlaying(false);
      }, playSec * 1000);
    }
  };

  if (!currentSong) return <div>準備中...</div>;

  return (
    <div className="content-panel">
      <h2>イントロクイズ</h2>
      
      <div className="controls">
        <label>再生秒数: 
          <select value={playSec} onChange={(e) => setPlaySec(Number(e.target.value))}>
            <option value={0.5}>0.5秒</option>
            <option value={0.75}>0.75秒</option>
            <option value={1}>1秒</option>
            <option value={2}>2秒</option>
            <option value={3}>3秒</option>
            <option value={5}>5秒</option>
            <option value={0}>フル</option>
          </select>
        </label>
      </div>

      <div className="action-buttons">
        <button className="primary-btn" onClick={handlePlay} disabled={isPlaying}>
          {isPlaying ? "再生中..." : "再生"}
        </button>
        <button onClick={setNextSong}>次の曲</button>
        <button onClick={() => setShowAnswer(true)} disabled={showAnswer}>答えを見る</button>
      </div>

      {showAnswer && (
        <div className="result-card">
          <img src={currentSong.thumbnail} alt={currentSong.title} />
          <div className="info">
            <h3>{currentSong.title}</h3>
            {(currentSong.artist || currentSong.album) && (
              <p className="meta">
                {currentSong.artist || ''} {currentSong.album ? `/ ${currentSong.album}` : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 💡 プレイヤーを画面外に完全に隠す */}
      <div style={{ position: 'absolute', width: '1px', height: '1px', left: '-9999px', overflow: 'hidden' }}>
        <div id="yt-player"></div>
      </div>
    </div>
  );
}