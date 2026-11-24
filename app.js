  const dialUpAudio = new Audio('sounds/dialup_screech.mp3'); // I forgot this existed, went off page to make something else and got confused by my own easter egg...
  dialUpAudio.loop = true;

  const translations = {
    et: {
      darkMode: 'Lülita tume režiim',
      lightMode: 'Lülita hele režiim',
      opening: 'Avamine...',
    },
    en: {
      darkMode: 'Enable dark mode',
      lightMode: 'Enable light mode',
      opening: 'Opening...',
    },
  };

  let sessionStart = sessionStorage.getItem('sessionStartTime');
  if (!sessionStart) {
    sessionStart = Date.now();
    sessionStorage.setItem('sessionStartTime', sessionStart);
  }

  function updateTimer() {
    const now = Date.now();
    const totalSeconds = Math.floor((now - sessionStart) / 1000);
    
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    document.getElementById('timer').innerText = `${mins}:${secs}`;

    if (totalSeconds === 1800 && document.hidden) {
      dialUpAudio.play().catch(err => console.log("Audio play blocked until user interaction."));
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      dialUpAudio.pause();
      dialUpAudio.currentTime = 0;
    }
  });

  updateTimer();
  setInterval(updateTimer, 1000);

document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.altKey && e.key === 't') {
    window.location.href = 'terminal.html';
  }
});
  
function playMailSound(event) {
    event.preventDefault();
    const link = event.currentTarget;
    const originalText = link.innerHTML;
    const audio = document.getElementById('mailSound');
    
    link.style.opacity = '0.5';
    const lang = localStorage.getItem('preferred-lang') || 'et';
    link.innerText = translations[lang].opening;

    audio.play().catch(err => console.log("Audio play blocked"));

    setTimeout(() => {
        const hiddenLink = document.createElement('a');
        hiddenLink.href = link.href;
        hiddenLink.target = '_blank'; 
        hiddenLink.rel = 'noopener noreferrer';
        
        document.body.appendChild(hiddenLink);
        hiddenLink.click();
        document.body.removeChild(hiddenLink);

        setTimeout(() => {
            link.style.opacity = '1';
            link.innerHTML = originalText;
        }, 2000);
    }, 800);
}


function setLanguage(lang) {
    document.querySelectorAll('[data-lang]').forEach(el => {
        el.style.display = el.getAttribute('data-lang') === lang ? '' : 'none';
    });
    document.documentElement.lang = lang;
    localStorage.setItem('preferred-lang', lang);
    updateDarkModeUI(document.body.classList.contains('dark-mode'));
}

const savedLang = localStorage.getItem('preferred-lang') || 'et';
setLanguage(savedLang);

document.getElementById('current-year').textContent = new Date().getFullYear();

function updateDarkModeUI(isDark) {
    const icon = document.getElementById('mode-icon');
    const etText = document.getElementById('mode-text');
    const enText = document.getElementById('mode-text-en');
    const lang = localStorage.getItem('preferred-lang') || 'et';
    
    if (isDark) {
        document.body.classList.add('dark-mode');
        icon.textContent = '☀️';
        etText.textContent = 'Hele režiim';
        enText.textContent = 'Light Mode';
        document.getElementById('dark-mode-btn').setAttribute('aria-label', translations[lang].lightMode);
    } else {
        document.body.classList.remove('dark-mode');
        icon.textContent = '🌙';
        etText.textContent = 'Tume režiim';
        enText.textContent = 'Dark Mode';
        document.getElementById('dark-mode-btn').setAttribute('aria-label', translations[lang].darkMode);
    }
}

function toggleDarkMode() {
    const isDark = !document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateDarkModeUI(isDark);
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') updateDarkModeUI(true);

const bttButton = document.getElementById("backToTop");
bttButton.addEventListener('click', scrollToTop);
document.getElementById('dark-mode-btn').addEventListener('click', toggleDarkMode);
document.getElementById('lang-et').addEventListener('click', () => setLanguage('et'));
document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('share-btn').addEventListener('click', sharePortfolio);
document.querySelectorAll('.mail-link').forEach(link => {
    link.addEventListener('click', playMailSound);
});

window.onscroll = function() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        bttButton.style.display = "block";
    } else {
        bttButton.style.display = "none";
    }
};

function scrollToTop() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in-section').forEach(section => observer.observe(section));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered! Scope:', reg.scope))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}

async function sharePortfolio() {
    const shareData = {
        title: 'Gregor Opmann – Portfoolio',
        text: 'Vaata Gregor Opmanni portfooliot!',
        url: 'https://gregoropmann.otset.ee'
    };

    const msgEl = document.getElementById('share-msg');
    const lang = localStorage.getItem('preferred-lang') || 'et';

    try {
        if (navigator.share) {
            await navigator.share(shareData);
            return;
        }

        const copied = await copyToClipboard(shareData.url);
        msgEl.innerText = copied
            ? (lang === 'et' ? 'Link kopeeritud lõikelauale!' : 'Link copied to clipboard!')
            : (lang === 'et' ? 'Kopeerimine ebaõnnestus.' : 'Copying failed.');
        msgEl.style.opacity = '1';

        setTimeout(() => {
            msgEl.style.opacity = '0';
        }, 2000);
    } catch (err) {
        console.error('Sharing failed', err);
    }
}

async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();

    let copied = false;
    try {
        copied = document.execCommand('copy');
    } finally {
        document.body.removeChild(textArea);
    }
    return copied;
}
