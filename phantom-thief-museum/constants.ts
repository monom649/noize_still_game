import { おもちゃ } from './types';

// ゲーム設定
export const 制限時間 = 120; // 2分（秒）
export const おもちゃの総数 = 6;
export const サンサン振り向き間隔_最小 = 500; // 0.5秒
export const サンサン振り向き間隔_最大 = 1500; // 1.5秒

// 画像アセット
export const アセット = {
  // background_museum.png
  背景: 'https://i.imgur.com/jCDTSVb.png',
  
  // guard_sansan_front.png
  サンサン正面: 'https://i.imgur.com/WGkCFNa.png',
  // guard_sansan_right.png (サンサンが右を向く)
  サンサン右: 'https://i.imgur.com/DM7mJnP.png',
  // guard_sansan_left.png (サンサンが左を向く)
  サンサン左: 'https://i.imgur.com/WES5Mm0.png',

  // thief_noise_idle.png
  ノイズ待機: 'https://i.imgur.com/4Q7Fj1L.png',
  // thief_noise_steal_left.png (ノイズが左に手を伸ばす)
  ノイズ盗む左: 'https://i.imgur.com/e6iNXXP.png',
  // thief_noise_steal_right.png (ノイズが右に手を伸ばす)
  ノイズ盗む右: 'https://i.imgur.com/YuphH0M.png',
  
  // スタート画面
  スタート画面: 'https://i.imgur.com/5zpbV51.png',
  // スタート画面音声
  音声ノイズだぜ: 'noisedaze.mp3',
};

export const すべてのおもちゃ: おもちゃ[] = [
  { id: 1, 名前: '車のおもちゃ', 画像URL: 'https://i.imgur.com/ELWP5jU.png', 配置: 'left' },
  { id: 2, 名前: 'ゲーム機', 画像URL: 'https://i.imgur.com/UeyBpbF.png', 配置: 'left' },
  { id: 3, 名前: 'ドールハウス', 画像URL: 'https://i.imgur.com/F8dIxbF.png', 配置: 'left' },
  { id: 4, 名前: 'ぬいぐるみ', 画像URL: 'https://i.imgur.com/OUn5pkV.png', 配置: 'right' },
  { id: 5, 名前: '恐竜', 画像URL: 'https://i.imgur.com/ppiqTXe.png', 配置: 'right' },
  { id: 6, 名前: '消防車ロボ', 画像URL: 'https://i.imgur.com/2LbWYZI.png', 配置: 'right' },
];