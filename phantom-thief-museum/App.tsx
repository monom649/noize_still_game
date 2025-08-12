
import React, { useState, useEffect, useRef } from 'react';
import { ゲーム状態, ノイズの位置, サンサンの向き, おもちゃ } from './types';
import { 制限時間, おもちゃの総数, サンサン振り向き間隔_最小, サンサン振り向き間隔_最大, アセット, すべてのおもちゃ } from './constants';

// --- UI Helper Components ---

interface GameModalProps {
  gameState: ゲーム状態;
  onStart: () => void;
  reason: string;
}

const GameModal: React.FC<GameModalProps> = ({ gameState, onStart, reason }) => {
  if (gameState === 'playing') return null;

  // スタート画面のUI
  if (gameState === 'start') {
    return (
      <div className="absolute inset-0 flex justify-center items-end z-50 pb-[15vh]">
        <button
          onClick={onStart}
          className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-2xl font-semibold transition-transform transform hover:scale-105 shadow-lg"
        >
          ゲーム開始
        </button>
      </div>
    );
  }

  // ゲームオーバー/勝利画面のUI
  const title = gameState === 'won' ? 'ミッションコンプリート！' : 'ゲームオーバー';
  const message = gameState === 'won' ? 'すべてのお宝を盗み出すことに成功した！' : reason;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center z-50 text-white text-center p-8">
      <h1 className="text-5xl font-bold mb-4">{title}</h1>
      <p className="text-xl mb-8">{message}</p>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-2xl font-semibold transition-transform transform hover:scale-105"
      >
        もう一度プレイ
      </button>
    </div>
  );
};


// --- Main App Component ---

export default function App() {
  const [ゲーム状態, setゲーム状態] = useState<ゲーム状態>('start');
  const [ノイズの位置, setノイズの位置] = useState<ノイズの位置>('center');
  const [盗みモーション中, set盗みモーション中] = useState(false);
  const [サンサンの向き, setサンサンの向き] = useState<サンサンの向き>('front');
  const [盗んだおもちゃ, set盗んだおもちゃ] = useState<number[]>([]);
  const [残り時間, set残り時間] = useState(制限時間);
  const [ゲームオーバー理由, setゲームオーバー理由] = useState('');

  const 左のおもちゃ = すべてのおもちゃ.filter(t => t.配置 === 'left');
  const 右のおもちゃ = すべてのおもちゃ.filter(t => t.配置 === 'right');
  
  // --- ゲームロジック (Refs for useEffect & Audio) ---
  const ノイズの位置Ref = useRef(ノイズの位置);
  ノイズの位置Ref.current = ノイズの位置;
  const サンサンの向きRef = useRef(サンサンの向き);
  サンサンの向きRef.current = サンサンの向き;
  const 盗んだおもちゃRef = useRef(盗んだおもちゃ);
  盗んだおもちゃRef.current = 盗んだおもちゃ;
  const サンサンタイマーRef = useRef<{ turn?: number; turnBack?: number }>({});
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- ゲームロジック (Hooks) ---
  
  // ゲームタイマー
  useEffect(() => {
    if (ゲーム状態 !== 'playing') return;
    if (残り時間 <= 0) {
      setゲーム状態('lost');
      setゲームオーバー理由('時間切れです！');
      return;
    }
    const timerId = setInterval(() => {
      set残り時間(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [ゲーム状態, 残り時間]);

  // サンサンのAI
  useEffect(() => {
    if (ゲーム状態 !== 'playing') {
      setサンサンの向き('front');
      return;
    }
  
    const turnSansan = () => {
      const delay = サンサン振り向き間隔_最小 + Math.random() * (サンサン振り向き間隔_最大 - サンサン振り向き間隔_最小);
  
      サンサンタイマーRef.current.turn = window.setTimeout(() => {
        setサンサンの向き(Math.random() > 0.5 ? 'left' : 'right');
        
        サンサンタイマーRef.current.turnBack = window.setTimeout(() => {
          setサンサンの向き('front');
          turnSansan();
        }, 800);
      }, delay);
    };
  
    turnSansan();
  
    return () => {
      if (サンサンタイマーRef.current.turn) clearTimeout(サンサンタイマーRef.current.turn);
      if (サンサンタイマーRef.current.turnBack) clearTimeout(サンサンタイマーRef.current.turnBack);
    };
  }, [ゲーム状態]);
  
  // クリア条件
  useEffect(() => {
    if (盗んだおもちゃ.length === おもちゃの総数 && ゲーム状態 === 'playing') {
      setゲーム状態('won');
    }
  }, [盗んだおもちゃ, ゲーム状態]);

  // 盗むアクションの副作用を処理する
  useEffect(() => {
    if (!盗みモーション中) return;

    const timerId = setTimeout(() => {
      const currentNoisePosition = ノイズの位置Ref.current;
      const currentSansanDirection = サンサンの向きRef.current;
      const isCaught = currentNoisePosition === currentSansanDirection;

      if (isCaught) {
        setゲーム状態('lost');
        setゲームオーバー理由('サンサンに見つかりました！');
      } else {
        const targetToys = currentNoisePosition === 'left' ? 左のおもちゃ : 右のおもちゃ;
        const currentStolen = 盗んだおもちゃRef.current;
        const toyToSteal = targetToys.find(toy => !currentStolen.includes(toy.id));
        
        if (toyToSteal) {
            set盗んだおもちゃ([...currentStolen, toyToSteal.id]);
        }
        
        set盗みモーション中(false);
      }
    }, 200);

    return () => clearTimeout(timerId);
  }, [盗みモーション中]);


  // --- イベントハンドラ ---

  const ゲーム開始処理 = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => {
        console.error("Audio playback failed.", e);
      });
    }

    setゲーム状態('playing');
    setノイズの位置('center');
    set盗みモーション中(false);
    setサンサンの向き('front');
    set盗んだおもちゃ([]);
    set残り時間(制限時間);
    setゲームオーバー理由('');
  };

  const 移動処理 = (direction: 'left' | 'right') => {
    if(盗みモーション中 || ゲーム状態 !== 'playing') return;
    if (direction === 'left') {
        setノイズの位置(pos => pos === 'right' ? 'center' : 'left');
    } else {
        setノイズの位置(pos => pos === 'left' ? 'center' : 'right');
    }
  };

  const 盗むアクション処理 = () => {
    if (ゲーム状態 !== 'playing' || ノイズの位置 === 'center' || 盗みモーション中) return;
    set盗みモーション中(true);
  };


  // --- レンダーロジック ---

  let ノイズ画像URL = アセット.ノイズ待機;
  if (盗みモーション中) {
    if (ノイズの位置 === 'left') {
      ノイズ画像URL = アセット.ノイズ盗む右;
    } else if (ノイズの位置 === 'right') {
      ノイズ画像URL = アセット.ノイズ盗む左;
    }
  }

  const ノイズ位置クラス = {
    left: 'left-1/4 -translate-x-1/2',
    center: 'left-1/2 -translate-x-1/2',
    right: 'left-3/4 -translate-x-1/2'
  }[ノイズの位置];

  const サンサン画像 = {
    front: アセット.サンサン正面,
    left: アセット.サンサン左,
    right: アセット.サンサン右
  }[サンサンの向き];
  
  const 背景画像URL = ゲーム状態 === 'start' ? アセット.スタート画面 : アセット.背景;

  return (
    <div 
      className="relative h-full bg-contain bg-no-repeat bg-center overflow-hidden font-sans select-none"
      style={{
        maxWidth: '100vw',
        aspectRatio: '9 / 16',
        backgroundImage: `url('${背景画像URL}')` 
      }}
    >
      <audio ref={audioRef} src={アセット.音声ノイズだぜ} preload="auto" loop={false} />
      
      <GameModal gameState={ゲーム状態} onStart={ゲーム開始処理} reason={ゲームオーバー理由} />

      { ゲーム状態 === 'playing' && (
      <>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-30 flex flex-col items-center gap-2">
          
          <div className="grid grid-cols-6 gap-2 w-full bg-black/20 p-2 rounded-lg">
            {すべてのおもちゃ.map((toy) => {
              const isStolen = 盗んだおもちゃ.includes(toy.id);
              return (
                <div key={toy.id} className="aspect-square bg-black rounded flex justify-center items-center">
                  {isStolen && <img src={toy.画像URL} alt={toy.名前} className="w-full h-full object-contain p-1 rounded" />}
                </div>
              );
            })}
          </div>
          <div className="w-full bg-gray-300 rounded-full h-6 mt-2 relative overflow-hidden border-2 border-gray-400">
            <div 
              className="bg-yellow-400 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(残り時間 / 制限時間) * 100}%` }}
            />
            <span className="absolute inset-0 w-full h-full flex items-center justify-center text-sm font-bold text-black">
              {残り時間} 秒
            </span>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xs flex justify-around items-center z-30">
          <button onClick={() => 移動処理('left')} className="w-20 h-20 active:scale-90 transition-transform">
            <img src="https://i.imgur.com/JBLP1sK.png" alt="左に移動" className="w-full h-full" />
          </button>
          <button 
            onClick={盗むアクション処理}
            className="w-20 h-20 active:scale-90 transition-transform disabled:opacity-50"
            disabled={ゲーム状態 !== 'playing' || ノイズの位置 === 'center' || 盗みモーション中}
          >
            <img src="https://i.imgur.com/Wriattw.png" alt="盗む" className="w-full h-full" />
          </button>
          <button onClick={() => 移動処理('right')} className="w-20 h-20 active:scale-90 transition-transform">
            <img src="https://i.imgur.com/XYCX8Xz.png" alt="右に移動" className="w-full h-full" />
          </button>
        </div>

        <div className="absolute inset-0">
          <div className="absolute bottom-[28%] left-[12%] w-[20%] grid grid-cols-1 gap-4 z-20">
            {左のおもちゃ.map(toy => (
              <div key={toy.id} className={`transition-opacity duration-500 ${盗んだおもちゃ.includes(toy.id) ? 'opacity-0' : 'opacity-100'}`}>
                <img src={toy.画像URL} alt={toy.名前} className="w-full h-full object-contain" style={{ transform: 'scale(0.8)' }} />
              </div>
            ))}
          </div>
          <div className="absolute bottom-[28%] right-[12%] w-[20%] grid grid-cols-1 gap-4 z-20">
            {右のおもちゃ.map(toy => (
              <div key={toy.id} className={`transition-opacity duration-500 ${盗んだおもちゃ.includes(toy.id) ? 'opacity-0' : 'opacity-100'}`}>
                <img src={toy.画像URL} alt={toy.名前} className="w-full h-full object-contain" style={{ transform: 'scale(0.8)' }} />
              </div>
            ))}
          </div>

          <div 
              className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-1/4 max-w-[180px] z-20"
              style={{ aspectRatio: '411 / 510' }}
          >
              <img src={サンサン画像} alt="サンサン" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>

          <div className={`absolute bottom-[33%] w-1/2 max-w-[280px] transition-all duration-300 ease-in-out ${ノイズ位置クラス} z-10`}>
            <img src={ノイズ画像URL} alt="怪盗ノイズ" className="w-full drop-shadow-2xl" />
          </div>
        </div>
      </>
      )}
    </div>
  );
}
