(function () {
    const localeEN = JSON.parse(Fs.readFileSync('\\js\\locale\\en\\translation.json', 'utf8'));

    const localeJP = JSON.parse(Fs.readFileSync('\\js\\locale\\ja\\translation.json', 'utf8'));

    const isLanguageEnglish = Store.get('config.isLanguageEnglish');
    let lng = 'ja';
    if (isLanguageEnglish) {
        lng = 'en';
    }

    i18next
        .init({
            lng: lng,
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
})();
