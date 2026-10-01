/* MathPlay i18n — part F: domains, new topics, favorites, new games (ja, it, fr, de) */
(function () {
  const D = window.I18N_DATA;

  const ja = {
    d_num: '数と演算', d_alg: '代数と規則性', d_geo: '図形と空間',
    d_meas: '測定', d_think: '思考力トレーニング',
    kn_percent: 'パーセント', kn_factors: '約数と倍数', kn_powers: '累乗と平方',
    kn_symmetry: '対称', kn_money: 'おかねとつり銭',
    g_percent_t: 'パーセントダッシュ',
    g_percent_d: 'パーセントをマスターしよう。',
    g_percent_h: 'パーセントの問題が出ます。時間切れまでに答えを選ぼう。60 秒、まちがえると 2 秒減。',
    g_typing_t: 'すうじタイピング',
    g_typing_d: 'すばやく入力！キーボードの速さをくらべよう。',
    g_typing_h: '数字がでたら、そのとおりに入力します。30 秒でいくつ打てる？スマホは先に入力欄をタップしてね！',
    pc_of: '{n} の {p}% は？',
    fav_add: 'お気に入りに追加', fav_saved: 'お気に入り済み',
    fav_title: 'お気に入り',
    fav_empty: 'お気に入りはまだありません。ゲームの ♡ をタップしてね！',
    recent_title: '最近遊んだゲーム',
  };

  const it = {
    d_num: 'Numeri e Operazioni', d_alg: 'Algebra e Successioni', d_geo: 'Geometria e Spazio',
    d_meas: 'Misura', d_think: 'Pensiero e Logica',
    kn_percent: 'Percentuali', kn_factors: 'Divisori e Multipli', kn_powers: 'Potenze e Quadrati',
    kn_symmetry: 'Simmetria', kn_money: 'Denaro e Resto',
    g_percent_t: 'Gara delle Percentuali',
    g_percent_d: 'Padroneggia le percentuali: 50%, 25%, 10% e compagnia.',
    g_percent_h: 'Appare una domanda sulle percentuali: scegli la risposta prima che scada il tempo. 60 secondi; gli errori costano 2 secondi.',
    g_typing_t: 'Numeri al Volo',
    g_typing_d: 'Batti i numeri più veloce di come volano le dita.',
    g_typing_h: 'Appare un numero: digitalo esattamente per passare al successivo. 30 secondi; ogni numero completato vale un punto. Su mobile, tocca prima il campo!',
    pc_of: 'Il {p}% di {n} = ?',
    fav_add: 'Aggiungi ai preferiti', fav_saved: 'Nei preferiti',
    fav_title: 'I miei preferiti',
    fav_empty: 'Nessun preferito: tocca ♡ su un gioco!',
    recent_title: 'Giocati di recente',
  };

  const fr = {
    d_num: 'Nombres et Opérations', d_alg: 'Algèbre et Suites', d_geo: 'Géométrie et Espace',
    d_meas: 'Mesures', d_think: 'Entraînement Cérébral',
    kn_percent: 'Pourcentages', kn_factors: 'Diviseurs et Multiples', kn_powers: 'Puissances et Carrés',
    kn_symmetry: 'Symétrie', kn_money: 'Monnaie et Rendu',
    g_percent_t: 'Course aux Pourcentages',
    g_percent_d: 'Maîtrise les pourcentages : 50 %, 25 %, 10 % et compagnie.',
    g_percent_h: 'Une question de pourcentage apparaît : choisis la bonne réponse avant la fin du temps. 60 secondes ; chaque erreur coûte 2 secondes.',
    g_typing_t: 'Nombres à toute Vitesse',
    g_typing_d: 'Tape les nombres aussi vite que tes doigts le permettent.',
    g_typing_h: 'Un nombre apparaît : tape-le exactement pour passer au suivant. 30 secondes ; chaque nombre complété vaut un point. Sur mobile, touche d’abord le champ !',
    pc_of: '{p} % de {n} = ?',
    fav_add: 'Ajouter aux favoris', fav_saved: 'Dans mes favoris',
    fav_title: 'Mes favoris',
    fav_empty: 'Aucun favori : touchez ♡ sur un jeu !',
    recent_title: 'Joués récemment',
  };

  const de = {
    d_num: 'Zahlen & Rechnen', d_alg: 'Algebra & Muster', d_geo: 'Geometrie & Raum',
    d_meas: 'Messen', d_think: 'Denktraining',
    kn_percent: 'Prozentrechnen', kn_factors: 'Teiler & Vielfache', kn_powers: 'Potenzen & Quadratzahlen',
    kn_symmetry: 'Symmetrie', kn_money: 'Geld & Wechseln',
    g_percent_t: 'Prozent-Sprint',
    g_percent_d: 'Beherrsche Prozentrechnung — 50 %, 25 %, 10 % und Freunde.',
    g_percent_h: 'Eine Prozentaufgabe erscheint — wähle die Antwort, bevor die Zeit abläuft. 60 Sekunden; Fehler kosten 2 Sekunden.',
    g_typing_t: 'Zahlen-Tipper',
    g_typing_d: 'Tippe die Zahlen, so schnell deine Finger können.',
    g_typing_h: 'Eine Zahl erscheint — tippe sie exakt ab, dann kommt die nächste. 30 Sekunden; jede vollendete Zahl gibt einen Punkt. Auf dem Handy erst das Feld antippen!',
    pc_of: '{p} % von {n} = ?',
    fav_add: 'Zu Favoriten', fav_saved: 'Gemerkt',
    fav_title: 'Meine Favoriten',
    fav_empty: 'Noch keine Favoriten — tippe auf ♡ bei einem Spiel!',
    recent_title: 'Zuletzt gespielt',
  };

  Object.assign(D.ja, ja);
  Object.assign(D.it, it);
  Object.assign(D.fr, fr);
  Object.assign(D.de, de);
})();
