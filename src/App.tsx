import { useState, useEffect } from 'react';
import type { Song } from './types';
import TodaySong from './components/TodaySong';
import IntroQuiz from './components/IntroQuiz';
import './App.css';

// 💡 先ほど完成したHugging FaceのAPI URLを設定
const API_URL = 'https://nyanpre-hasu-song-quiz-api.hf.space/api/songs';

function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'quiz'>('today');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

useEffect(() => {
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error("APIサーバーがエラーを返しました");
        return res.json();
      })
      .then((data) => {
        // 💡 ちゃんと配列（リスト）が返ってきたかチェックする
        if (Array.isArray(data)) {
          setSongs(data);
        } else {
          setSongs([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("データの取得に失敗しました", err);
        setSongs([]); // エラー時は空にする
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">読み込み中...</div>;
  if (songs.length === 0) return <div className="loading">曲データがありません。</div>;

  return (
    <div className="app-container">
      <header>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'today' ? 'active' : ''} 
            onClick={() => setActiveTab('today')}
          >
            今日の一曲
          </button>
          <button 
            className={activeTab === 'quiz' ? 'active' : ''} 
            onClick={() => setActiveTab('quiz')}
          >
            イントロクイズ
          </button>
        </div>
      </header>
      
      <main>
        {activeTab === 'today' && <TodaySong songs={songs} />}
        {activeTab === 'quiz' && <IntroQuiz songs={songs} />}
      </main>
    </div>
  );
}

export default App;