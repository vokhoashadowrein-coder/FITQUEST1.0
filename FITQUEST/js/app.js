'use strict';
// Trang chủ dùng dữ liệu minh họa; không lưu thông tin cá nhân.
const week = [
  { day: 'Thứ 2', minutes: 20 }, { day: 'Thứ 3', minutes: 25 },
  { day: 'Thứ 4', minutes: 15 }, { day: 'Thứ 5', minutes: 30 },
  { day: 'Thứ 6', minutes: 25 }, { day: 'Thứ 7', minutes: 18 },
  { day: 'Chủ nhật', minutes: 35 }
];
const bars = document.querySelector('#bars');
week.forEach(({ day, minutes }, index) => {
  const column = document.createElement('div');
  column.className = 'bar-column';
  column.innerHTML = `<div class="bar-slot"><button class="bar${index === 5 ? ' selected' : ''}" style="--height:${minutes / 40 * 100}%" aria-label="${day}: ${minutes} phút" aria-pressed="${index === 5}"><span class="bar-value">${minutes}′</span></button></div><span class="bar-label">${day}</span>`;
  column.querySelector('button').addEventListener('click', event => {
    document.querySelectorAll('.bar').forEach(bar => { bar.classList.remove('selected'); bar.setAttribute('aria-pressed', 'false'); });
    event.currentTarget.classList.add('selected');
    event.currentTarget.setAttribute('aria-pressed', 'true');
    showToast(`${day}: ${minutes} phút luyện tập (dữ liệu minh họa).`);
  });
  bars.append(column);
});
const icons = {
 home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 flame: '<path d="M12 3c1 5 6 5 6 11a6 6 0 1 1-12 0c0-3 2-5 3-6 0 3 1 4 2 4 2-3 1-6 1-9Z"/>',
 chart: '<path d="M4 3v17h17M9 15v-4m5 4V7m5 8v-5"/>',
 trophy: '<path d="M8 3h8v6a4 4 0 0 1-8 0zM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 1v5m-4 3h8m-6-3h4v3"/>',
 settings: '<path d="m9 3-1 3-3 1v3l-2 2 2 2v3l3 1 1 3h6l1-3 3-1v-3l2-2-2-2V7l-3-1-1-3z"/><circle cx="12" cy="12" r="3"/>'
};
document.querySelectorAll('[data-icon]').forEach(element => {
  element.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[element.dataset.icon]}</svg>`;
});
let toastTimer;
const toast = document.querySelector('#toast');
function showToast(message) {
  clearTimeout(toastTimer);
  document.querySelector('#toast-text').textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 5500);
}
document.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click', () => { window.location.href = 'warmup.html'; }));
document.querySelector('#settings').addEventListener('click', () => document.querySelector('#design-toggle')?.click());
document.querySelector('#close-toast').addEventListener('click', () => toast.classList.remove('show'));
document.addEventListener('keydown', event => { if (event.key === 'Escape') toast.classList.remove('show'); });
