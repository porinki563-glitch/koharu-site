// 送信先は assets/js/config.js の FORM_ENDPOINT で設定します。
const FORM_ENDPOINT = (window.KOHARU_CONFIG || {}).FORM_ENDPOINT || '';

'use strict';
const form = document.getElementById('review-form');
const otherText = document.getElementById('genre-other');
otherText.addEventListener('focus', () => { form.querySelector('[name=genre][value=その他]').checked = true; });

function validate() {
  let first = null;
  function check(valid, errorId, message, controls) {
    document.getElementById(errorId).textContent = valid ? '' : message;
    controls.forEach(c => valid ? c.removeAttribute('aria-invalid') : c.setAttribute('aria-invalid', 'true'));
    if (!valid && !first) first = controls[0];
  }
  check(Boolean(form.elements.genre.value), 'genre-error', 'ご相談のジャンルを選んでください。', [...form.querySelectorAll('[name=genre]')]);
  check(Boolean(form.elements.comment.value.trim()), 'comment-error', 'ご感想を入力してください。', [form.elements.comment]);
  check(Boolean(form.elements.publish.value), 'publish-error', '掲載についてお選びください。', [...form.querySelectorAll('[name=publish]')]);
  if (first) first.focus();
  return !first;
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const button = form.querySelector('[type=submit]');
  if (button.disabled || !validate()) return;
  button.disabled = true;
  button.textContent = '送信中…';
  const genre = form.elements.genre.value === 'その他' && otherText.value.trim() ? `その他：${otherText.value.trim()}` : form.elements.genre.value;
  const payload = {
    type: 'review',
    nickname: form.elements.nickname.value.trim(),
    genre,
    comment: form.elements.comment.value.trim(),
    publish: form.elements.publish.value,
  };
  try {
    if (FORM_ENDPOINT.trim()) {
      await fetch(FORM_ENDPOINT, {method: 'POST', mode: 'no-cors', keepalive: true, headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify(payload)});
    }
    form.hidden = true;
    const done = document.getElementById('completion');
    done.hidden = false;
    done.focus();
  } catch (_) {
    document.getElementById('submit-error').textContent = '送信できませんでした。時間をおいて、もう一度お試しください。';
  } finally {
    button.disabled = false;
    button.textContent = '感想を送る';
  }
});
