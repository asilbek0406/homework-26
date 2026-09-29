/* ==========================================================================
   Apex Motors — Homework #26
   Структура файла:
   1. Состояние и константы
   2. Загрузка данных (Axios)
   3. Вспомогательные функции
   4. Карточки и вкладки
   5. Модальное окно
   6. Заказ и уведомление (toast)
   ========================================================================== */


/* ---------- 1. Состояние и константы ---------- */

let data = {};                  // все машины из data.json
let activeBrand = 'mercedes';   // открытая вкладка
let selectedCar = null;         // машина, открытая в модальном окне

const TOAST_DURATION = 4000;    // через сколько мс исчезает уведомление
let toastTimer = null;

// Заголовок страницы для каждой вкладки
const brandTitles = {
    mercedes: 'Mercedes-Benz',
    bmw: 'BMW',
    porsche: 'Porsche'
};

// Названия цветов по коду из availableColors
const colorNames = {
    '#0B0B0D': 'Obsidian Black',
    '#C7C9CC': 'Silver Metallic',
    '#2E3A4E': 'Midnight Blue',
    '#5B5D5F': 'Graphite Grey',
    '#F4F5F6': 'Polar White',
    '#4A4E52': 'Titanium Grey',
    '#1C2331': 'Deep Blue',
    '#7A2E2E': 'Ruby Red',
    '#3A4A3F': 'Forest Green',
    '#2E5BFF': 'Electric Blue',
    '#3A9B5C': 'Emerald Green',
    '#1C2A45': 'Navy Blue',
    '#C7352E': 'Guards Red',
    '#F2C230': 'Racing Yellow',
    '#3A2E4E': 'Amethyst',
    '#1C4532': 'Aventurine Green',
    '#4E9BB8': 'Ice Blue'
};

// Элементы страницы, с которыми работает скрипт
const cardsEl = document.querySelector('.cards');
const modalEl = document.querySelector('#carModal');
const toastEl = document.querySelector('#toast');


/* ---------- 2. Загрузка данных ---------- */

// Данные загружаются один раз при открытии страницы
axios.get('data/data.json')
    .then(function (response) {
        data = response.data;
        console.log(data);          // проверка структуры
        renderCards(activeBrand);   // первый вывод
    })
    .catch(function (error) {
        console.error('Не удалось загрузить data.json:', error);
        cardsEl.innerHTML = `
            <p class="load-error">Не удалось загрузить данные. Откройте проект через Live Server.</p>
        `;
    });


/* ---------- 3. Вспомогательные функции ---------- */

// 185000 → "$185,000"
function formatPrice(price) {
    return '$' + price.toLocaleString('en-US');
}

// Название цвета по коду (если кода нет в списке — показываем сам код)
function getColorName(color) {
    return colorNames[color] || color;
}

// Фото машины в выбранном цвете. Если для цвета нет отдельного файла — основное фото.
function getCarImage(car, color) {
    if (car.variants && car.variants[color]) {
        return car.variants[color];
    }
    return car.image;
}

// Записывает текст в элемент по селектору
function setText(selector, text) {
    document.querySelector(selector).textContent = text;
}


/* ---------- 4. Карточки и вкладки ---------- */

function renderCards(brand) {
    const cars = data[brand];
    let html = '';

    for (let i = 0; i < cars.length; i++) {
        const car = cars[i];

        // Бейдж — только у машин, которых осталась одна
        let badge = '';
        if (car.count === 1) {
            badge = '<span class="badge">Осталась 1</span>';
        }

        html = html + `
            <article class="card" onclick="openModal('${brand}', ${i})">
                ${badge}
                <img class="card-image" src="${car.image}" alt="${car.title}">
                <div class="card-body">
                    <h3>${car.title}</h3>
                    <p class="card-subtitle">${car.specs}</p>
                    <div class="card-bottom">
                        <p class="price">${formatPrice(car.price)}</p>
                        <button class="btn" type="button">Заказать</button>
                    </div>
                </div>
            </article>
        `;
    }

    // Вставляем один раз — после цикла
    cardsEl.innerHTML = html;

    setText('#brandTitle', brandTitles[brand]);
    setText('#modelCount', `${cars.length} моделей в салоне`);
}

function selectBrand(brand) {
    activeBrand = brand;

    // Подсвечиваем только активную вкладку
    const tabs = document.querySelectorAll('.tab');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.toggle('active', tabs[i].dataset.brand === brand);
    }

    renderCards(activeBrand);
}


/* ---------- 5. Модальное окно ---------- */

function openModal(brand, index) {
    const car = data[brand][index];
    selectedCar = car;

    // Кружки цветов — цикл с накоплением строки
    let colorsHtml = '';
    for (let i = 0; i < car.availableColors.length; i++) {
        const color = car.availableColors[i];
        const selectedClass = i === 0 ? 'selected' : '';

        colorsHtml = colorsHtml + `
            <span class="color-dot ${selectedClass}"
                  style="background: ${color}"
                  title="${getColorName(color)}"
                  onclick="selectColor(this, '${color}')"></span>
        `;
    }

    // Фото в первом (выбранном по умолчанию) цвете
    const image = document.querySelector('#modalImage');
    image.src = getCarImage(car, car.availableColors[0]);
    image.alt = car.title;

    // Тексты. Над названием — марка из названия: "Mercedes-AMG G 63" → "MERCEDES-AMG"
    setText('#modalKicker', `${car.title.split(' ')[0].toUpperCase()} · 2026`);
    setText('#modalTitle', car.title);
    setText('#modalPrice', formatPrice(car.price));
    setText('#modalDescription', car.description);
    setText('#modalCount', car.count);
    setText('#modalColorName', getColorName(car.availableColors[0]));
    document.querySelector('#modalColors').innerHTML = colorsHtml;

    // Показываем окно
    modalEl.classList.add('open');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}

function closeModal() {
    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    selectedCar = null;
}

// Клик по кружку цвета: выделяем его, меняем название цвета и фото
function selectColor(element, color) {
    const dots = document.querySelectorAll('.color-dot');
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove('selected');
    }
    element.classList.add('selected');
    setText('#modalColorName', getColorName(color));
    swapModalImage(getCarImage(selectedCar, color));
}

// Плавная смена фото: гасим, подменяем файл, показываем
function swapModalImage(src) {
    const image = document.querySelector('#modalImage');
    if (image.getAttribute('src') === src) return;

    image.classList.add('swapping');
    setTimeout(function () {
        image.src = src;
        image.classList.remove('swapping');
    }, 150);
}

// Закрытие окна клавишей Escape
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});


/* ---------- 6. Заказ и уведомление (toast) ---------- */

function orderCar() {
    if (!selectedCar) return;

    const carTitle = selectedCar.title;   // запоминаем до закрытия окна

    // По ТЗ: стандартный alert. Код ниже выполнится, когда alert закроют.
    alert(`Заявка на ${carTitle} принята!`);

    closeModal();
    showToast(carTitle);
}

// Плавно показывает плашку и убирает её через TOAST_DURATION
function showToast(carTitle) {
    setText('#toastCar', carTitle);
    toastEl.style.setProperty('--toast-duration', TOAST_DURATION + 'ms');

    // Если предыдущий toast ещё виден — перезапускаем его с нуля
    clearTimeout(toastTimer);
    toastEl.classList.remove('show');
    void toastEl.offsetWidth;   // сброс анимации полоски прогресса
    toastEl.classList.add('show');

    toastTimer = setTimeout(function () {
        toastEl.classList.remove('show');
    }, TOAST_DURATION);
}
