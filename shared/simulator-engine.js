/**
 * Simulator Engine — 공통 유틸리티
 * 모든 시뮬레이터에서 사용하는 헬퍼 함수들
 */
const SimEngine = {
  /** 금액 포맷 (예: 123456789 → "123,456,789") */
  formatWon(n) {
    if (n == null || isNaN(n)) return '—';
    return Math.round(n).toLocaleString('ko-KR');
  },

  /** 퍼센트 포맷 (예: 0.0418 → "4.180%") */
  formatPct(n, decimals = 3) {
    if (n == null || isNaN(n)) return '—';
    return (n * 100).toFixed(decimals) + '%';
  },

  /** 날짜 포맷 (yyyy-MM-dd, local time) */
  formatDate(d) {
    if (!d) return '—';
    if (typeof d === 'string') return d;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  /** 안전한 날짜 파싱 (로컬 타임존) */
  parseDate(s) {
    if (!s) return null;
    // date input values are 'yyyy-MM-dd' — parse as local midnight
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  },

  /** 원화 문자열 → 숫자 (예: "2.67억" → 267000000) */
  parseKoreanAmount(s) {
    s = String(s).replace(/,/g, '').trim();
    const m = s.match(/^([\d.]+)\s*(억|만|천)?$/);
    if (!m) return parseFloat(s) || 0;
    let v = parseFloat(m[1]);
    if (m[2] === '억') v *= 100000000;
    else if (m[2] === '만') v *= 10000;
    else if (m[2] === '천') v *= 1000;
    return v;
  },

  /** 퍼센트 문자열 → 숫자 (예: "4.18%" → 0.0418) */
  parsePercent(s) {
    s = String(s).replace(/%/g, '').trim();
    const v = parseFloat(s);
    if (s.endsWith('%') || v < 1) return isNaN(v) ? 0 : v / 100;
    return isNaN(v) ? 0 : v;
  },

  /** 두 날짜 사이 일수 */
  daysBetween(d1, d2) {
    return Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
  },

  /** 일수 → 연분수 */
  yearFrac(d1, d2) {
    return this.daysBetween(d1, d2) / 365.0;
  },

  /** 단리 이자 계산 */
  simpleInterest(principal, rate, d1, d2) {
    return principal * rate * this.yearFrac(d1, d2);
  },

  /** 복리 원리금 계산 */
  compoundBalance(principal, rate, d1, d2) {
    const years = this.yearFrac(d1, d2);
    return principal * Math.pow(1 + rate, years);
  },

  /** URL 파라미터 → 객체 */
  loadFromURL() {
    const p = new URLSearchParams(window.location.search);
    const params = {};
    for (const [k, v] of p.entries()) {
      const num = parseFloat(v);
      params[k] = isNaN(num) ? v : num;
    }
    return params;
  },

  /** 객체 → URL 파라미터 (현재 URL 업데이트) */
  saveToURL(params) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v != null && v !== '') p.set(k, String(v));
    }
    const qs = p.toString();
    const url = window.location.pathname + (qs ? '?' + qs : '');
    window.history.replaceState(null, '', url);
  },

  /** 클립보드에 URL 복사 */
  copyShareURL(params) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v != null && v !== '') p.set(k, String(v));
    }
    const base = window.location.origin + window.location.pathname;
    const url = base + (p.toString() ? '?' + p.toString() : '');
    navigator.clipboard.writeText(url).then(() => {
      this.showToast('✅ 링크가 복사되었습니다. 공유해보세요!');
    }).catch(() => {
      this.showToast('⚠️ 복사 실패 — 수동으로 URL을 복사해주세요');
    });
  },

  /** 토스트 메시지 표시 */
  showToast(msg, duration = 2500) {
    let toast = document.getElementById('sim-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sim-toast';
      toast.style.cssText = `
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
        background: var(--text); color: var(--bg);
        padding: 10px 20px; border-radius: 20px; font-size: 13px;
        z-index: 9999; opacity: 0; transition: opacity 0.3s;
        pointer-events: none; white-space: nowrap;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.style.opacity = '0'; }, duration);
  },

  /** 슬라이더-숫자 입력 동기화 */
  bindSliderInput(sliderId, inputId, onChange) {
    const slider = document.getElementById(sliderId);
    const input = document.getElementById(inputId);
    if (!slider || !input) return;
    const sync = () => {
      input.value = slider.value;
      if (onChange) onChange();
    };
    slider.addEventListener('input', sync);
    input.addEventListener('change', () => {
      slider.value = input.value;
      if (onChange) onChange();
    });
    sync();
  }
};
