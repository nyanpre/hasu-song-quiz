import { useState, useEffect, useRef } from 'react';
import type { Song } from '../types';

interface Props {
  songs: Song[];
}

export default function TodaySong({ songs }: Props) {
  const [todaySong, setTodaySong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 💡 YouTubeプレイヤーを操作するための参照
  const playerRef = useRef<any>(null);

  // 1. ローカルストレージから今日の曲を読み込む
  useEffect(() => {
    const savedDate = localStorage.getItem('todayDate');
    // 日本時間を強制して日付を取得
    const today = new Date().toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' });
    
    if (savedDate === today) {
      const savedSong = localStorage.getItem('todaySong');
      // 💡 "undefined" という異常な文字列が入っていたら無視して消去する
      if (savedSong && savedSong !== "undefined") {
        try {
          setTodaySong(JSON.parse(savedSong));
        } catch (e) {
          localStorage.removeItem('todaySong');
        }
      }
    }
  }, []);

  // 2. 今日の曲がセットされたら、裏側でYouTubeプレイヤーを準備する
  useEffect(() => {
    if (todaySong && (window as any).YT) {
      // 既にプレイヤーがあれば破棄（曲を引き直した場合などの対策）
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch(e){}
      }

      playerRef.current = new (window as any).YT.Player('today-yt-player', {
        height: '1',
        width: '1',
        videoId: todaySong.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0
        },
        events: {
          // YouTube側で再生/停止が切り替わったときに、ボタンの表示も連動させる
          onStateChange: (event: any) => {
            if (event.data === 1) { // 1 = 再生中
              setIsPlaying(true);
            } else if (event.data === 0 || event.data === 2) { // 0 = 終了, 2 = 停止
              setIsPlaying(false);
            }
          }
        }
      });
    }
  }, [todaySong]);

  // 曲を抽選する処理
  const drawSong = () => {
    // 日本時間を強制して日付を取得
    const today = new Date().toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' });
    if (localStorage.getItem('todayDate') === today) {
      alert("今日はすでに引いています！");
      return;
    }
    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    localStorage.setItem('todayDate', today);
    localStorage.setItem('todaySong', JSON.stringify(randomSong));
    setTodaySong(randomSong);
  };

  // 💡 再生・停止を切り替える処理
  const togglePlay = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  // ※シェア用URL（Hugging FaceのAPIを設定してある場合はそのURL）
  const shareUrl = todaySong ? `https://nyanpre-hasu-song-quiz-api.hf.space/share/${todaySong.videoId}` : '';
  const shareText = todaySong ? encodeURIComponent(`私の今日の一曲は「${todaySong.title}」！\n#日めくり蓮ノ空楽曲\n${shareUrl}`) : '';

  return (
    <div className="content-panel">
      <h2>今日の一曲を決める</h2>
      <button className="primary-btn" onClick={drawSong} disabled={!!todaySong}>
        {todaySong ? "今日はもう引きました" : "決める！"}
      </button>

      {todaySong && (
        <div className="result-card">
          <img src={todaySong.thumbnail} alt={todaySong.title} />
          <div className="info">
            <h3>{todaySong.title}</h3>
            {(todaySong.artist || todaySong.album) && (
              <p className="meta">
                {todaySong.artist || ''} {todaySong.album ? `/ ${todaySong.album}` : ''}
              </p>
            )}
          </div>
          
          {/* 💡 フル再生 / 停止 ボタンを追加 */}
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <button 
              onClick={togglePlay} 
              style={{
                background: isPlaying ? '#c95b70' : 'linear-gradient(135deg, #f29bb6 0%, #e87a90 100%)',
                color: 'white',
                border: 'none',
                padding: '14px 24px',
                fontSize: '16px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%',
                maxWidth: '300px',
                boxShadow: '0 4px 12px rgba(232, 122, 144, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {isPlaying ? "⏹ 停止する" : "▶ フル再生する"}
            </button>
          </div>

          <div className="share-buttons">
             <a href={`https://x.com/intent/tweet?text=${shareText}`} target="_blank" rel="noreferrer" className="share-btn x">Xでシェア</a>
             <a href={`https://bsky.app/intent/compose?text=${shareText}`} target="_blank" rel="noreferrer" className="share-btn bsky">Blueskyでシェア</a>
          </div>
        </div>
      )}

      {/* 💡 プレイヤーを画面外に完全に隠す */}
      <div style={{ position: 'absolute', width: '1px', height: '1px', left: '-9999px', overflow: 'hidden' }}>
        <div id="today-yt-player"></div>
      </div>
    </div>
  );
}