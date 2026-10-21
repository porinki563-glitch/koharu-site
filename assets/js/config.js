/**
 * サイト共通設定（URLはここだけで管理します）
 *  - LINE_ID       : 小春の公式LINEのベーシックID。LINEを選んだ方は、入力内容が入った状態でトーク画面が開きます
 *  - FORM_ENDPOINT : Google Apps Script のウェブアプリURL（https://script.google.com/macros/s/.../exec）
 *                    入れると、申し込み・感想がスプレッドシート「小春LP_受付データ」に保存されます
 */
window.KOHARU_CONFIG = {
  LINE_ID: '@802vforw',
  FORM_ENDPOINT: 'https://script.google.com/macros/s/AKfycbwehgRLRgql0NUUxhWPOLF2KO8gd4Xvyd0KA5UKb9EugorPCRkvzNphgvAuoQWrFxNg/exec'
};
