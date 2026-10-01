/* MathPlay i18n — part E: domains, new topics, favorites, new games (en, zh-CN, zh-TW) */
(function () {
  const D = window.I18N_DATA;

  const en = {
    d_num: 'Numbers & Operations', d_alg: 'Algebra & Patterns', d_geo: 'Geometry & Space',
    d_meas: 'Measurement', d_think: 'Thinking Skills',
    kn_percent: 'Percentages', kn_factors: 'Factors & Multiples', kn_powers: 'Powers & Squares',
    kn_symmetry: 'Symmetry', kn_money: 'Money & Change',
    g_percent_t: 'Percent Dash',
    g_percent_d: 'Harness percentages — 50%, 25%, 10% and friends.',
    g_percent_h: 'A percentage question appears — pick the answer before the clock runs out. 60 seconds; wrong answers cost 2 seconds.',
    g_typing_t: 'Number Typer',
    g_typing_d: 'Type the numbers as fast as your fingers can fly.',
    g_typing_h: 'A number appears — type it exactly to move on. 30 seconds; each completed number scores. Tap the field first on mobile!',
    pc_of: '{p}% of {n} = ?',
    fav_add: 'Favorite', fav_saved: 'Favorited',
    fav_title: 'My Favorites',
    fav_empty: 'No favorites yet — tap ♡ on any game card!',
    recent_title: 'Recently played',
  };

  const zhCN = {
    d_num: '数与运算', d_alg: '代数与规律', d_geo: '几何与空间',
    d_meas: '度量', d_think: '思维训练',
    kn_percent: '百分比', kn_factors: '因数与倍数', kn_powers: '乘方与平方',
    kn_symmetry: '对称', kn_money: '货币与找零',
    g_percent_t: '百分比冲刺',
    g_percent_d: '玩转百分比：50%、25%、10% 信手拈来。',
    g_percent_h: '屏幕上出现百分比问题，在倒计时结束前选出答案。60 秒，答错扣 2 秒。',
    g_typing_t: '数字速打',
    g_typing_d: '指尖飞驰，看看你的键盘有多快。',
    g_typing_h: '屏幕出现数字，原样输入即可进入下一个。30 秒，每打对一个得一分。手机上请先点击输入框唤起键盘！',
    pc_of: '{n} 的 {p}% = ?',
    fav_add: '收藏', fav_saved: '已收藏',
    fav_title: '我的收藏',
    fav_empty: '还没有收藏——点击游戏卡片上的 ♡ 收藏吧！',
    recent_title: '最近玩过',
  };

  const zhTW = {
    d_num: '數與運算', d_alg: '代數與規律', d_geo: '幾何與空間',
    d_meas: '度量', d_think: '思維訓練',
    kn_percent: '百分比', kn_factors: '因數與倍數', kn_powers: '乘方與平方',
    kn_symmetry: '對稱', kn_money: '貨幣與找零',
    g_percent_t: '百分比衝刺',
    g_percent_d: '玩轉百分比：50%、25%、10% 信手拈來。',
    g_percent_h: '螢幕上出現百分比問題，在倒數結束前選出答案。60 秒，答錯扣 2 秒。',
    g_typing_t: '數字速打',
    g_typing_d: '指尖飛馳，看看你的鍵盤有多快。',
    g_typing_h: '螢幕出現數字，原樣輸入即可進入下一個。30 秒，每打對一個得一分。手機上請先點擊輸入框喚起鍵盤！',
    pc_of: '{n} 的 {p}% = ?',
    fav_add: '收藏', fav_saved: '已收藏',
    fav_title: '我的收藏',
    fav_empty: '還沒有收藏——點擊遊戲卡片上的 ♡ 收藏吧！',
    recent_title: '最近玩過',
  };

  Object.assign(D.en, en);
  Object.assign(D['zh-CN'], zhCN);
  Object.assign(D['zh-TW'], zhTW);
})();
