(function () {
  try {
    const script = document.currentScript;
    const VERIFY_URL = (script && script.dataset.verifyUrl) || 'https://secretshorebot-341306804018.asia-south1.run.app/verify/verify_bonus';
    const SECRET = (script && script.dataset.secret) || '0921powqlksamnxz';
    const BOT_USERNAME = (script && script.dataset.bot) || 'SecretShoreBot';

    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid');
    const sid = params.get('sid');
    if (!uid || !sid) return;

    // Create floating hidden button
    const btn = document.createElement('button');
    btn.innerText = '🎁 Claim Bonus';
    btn.id = 'claimBtn';
    btn.type = 'button';
    btn.style.position = 'fixed';
    btn.style.bottom = '20px';
    btn.style.right = '20px';
    btn.style.display = 'none';
    btn.style.padding = '10px 18px';
    btn.style.border = 'none';
    btn.style.borderRadius = '8px';
    btn.style.background = '#22c55e';
    btn.style.color = '#fff';
    btn.style.fontSize = '16px';
    btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
    btn.style.zIndex = '9999';
    btn.style.cursor = 'pointer';
    btn.setAttribute('aria-live', 'polite');
    btn.setAttribute('aria-label', 'Claim Bonus');

    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(btn);
    });

    let fullScrolled = false, waited = false, shown = false;

    function pageBottomReached() {
      const doc = document.documentElement;
      const scrollY = (window.scrollY || window.pageYOffset || doc.scrollTop);
      const viewH = window.innerHeight || doc.clientHeight;
      const scrollH = Math.max(
        doc.scrollHeight,
        doc.offsetHeight,
        doc.clientHeight
      );
      return scrollY + viewH >= scrollH - 10;
    }

    function checkReady() {
      if (!shown && fullScrolled && waited) {
        btn.style.display = 'block';
        shown = true;
      }
    }

    const onScroll = () => {
      if (pageBottomReached()) {
        fullScrolled = true;
        checkReady();
        window.removeEventListener('scroll', onScroll, { passive: true });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // In case content is short or user lands at bottom
    if (pageBottomReached()) {
      fullScrolled = true;
    }

    // Wait 20 seconds
    setTimeout(() => { waited = true; checkReady(); }, 20000);

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
          window.location.href = `https://t.me/${BOT_USERNAME}`;
        }, 2000);
      } catch (e) {
        console.error(e);
        btn.innerText = '⚠️ Try Again';
        btn.disabled = false;
      }
    });
  } catch (err) {
    console.error('bonus.js initialization error:', err);
  }
})();
