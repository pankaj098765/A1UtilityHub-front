(function () {
  try {
    // --- Detect Telegram WebView and auto open externally ---
    if (navigator.userAgent.includes("Telegram")) {
      const current = window.location.href;
      // Forces opening in external browser (Chrome/Safari)
      window.location.href = `https://t.me/share/url?url=${encodeURIComponent(current)}`;
      return; // stop running inside Telegram WebView
    }

    // --- Normal Bonus Flow ---
    const script = document.currentScript;
    const VERIFY_URL =
      (script && script.dataset.verifyUrl) ||
      'https://secretshorebot-341306804018.asia-south1.run.app/verify/verify_bonus';
    const SECRET =
      (script && script.dataset.secret) || '0921powqlksamnxz';
    const BOT_USERNAME =
      (script && script.dataset.bot) || 'SecretShoreBot';

    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid');
    const sid = params.get('sid');
    if (!uid || !sid) return;

    // --- Create Claim Button ---
    const btn = document.createElement('button');
    btn.id = 'claimBtn';
    btn.innerText = '🎁 Claim Bonus';
    btn.type = 'button';
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      display: 'none',
      padding: '12px 20px',
      border: 'none',
      borderRadius: '10px',
      background: '#22c55e',
      color: '#fff',
      fontSize: '16px',
      fontWeight: '600',
      boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
      zIndex: '9999',
      cursor: 'pointer'
    });

    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(btn);
    });

    let scrolled = false,
      waited = false,
      shown = false;

    function atBottom() {
      const doc = document.documentElement;
      return (
        (window.scrollY || doc.scrollTop) + window.innerHeight >=
        doc.scrollHeight - 10
      );
    }

    function showIfReady() {
      if (!shown && scrolled && waited) {
        btn.style.display = 'block';
        shown = true;
      }
    }

    function onScroll() {
      if (atBottom()) {
        scrolled = true;
        showIfReady();
        window.removeEventListener('scroll', onScroll);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    if (atBottom()) scrolled = true;

    setTimeout(() => {
      waited = true;
      showIfReady();
    }, 20000);

    // --- Claim Bonus Handler ---
    btn.addEventListener('click', async () => {
      btn.innerText = '⏳ Verifying...';
      btn.disabled = true;
      try {
        const res = await fetch(VERIFY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Secret-Token': SECRET
          },
          body: JSON.stringify({ uid, sid })
        });

        if (!res.ok) throw new Error('Verification failed');

        btn.innerText = '✅ Bonus Claimed! Redirecting...';

        setTimeout(() => {
          const telegramUrl = `https://t.me/${BOT_USERNAME}`;
          const newWindow = window.open(telegramUrl, '_blank');
          if (!newWindow) window.location.href = telegramUrl;
        }, 2000);
      } catch (err) {
        console.error('Bonus verification error:', err);
        btn.innerText = '⚠️ Try Again';
        btn.disabled = false;
      }
    });
  } catch (err) {
    console.error('bonus.js init error:', err);
  }
})();
