
const localeEN = JSON.parse(Fs.readFileSync('\\js\\locale\\en\\translation.json', 'utf8'));

const localeJP = JSON.parse(Fs.readFileSync('\\js\\locale\\ja\\translation.json', 'utf8'));

i18next
    .init({
        lng: 'ja',
        fallbackLng: 'en',
        debug: true,
        resources: {
            en: {
                translation: localeEN
            },
            ja: {
                translation: localeJP
            }
        }
    });

document.addEventListener('DOMContentLoaded', () => {
    const i18nList = document.querySelectorAll('[data-i18n]');
    i18nList.forEach(function (v) {
        v.innerHTML = window.i18next.t(v.dataset.i18n);
    })
})

