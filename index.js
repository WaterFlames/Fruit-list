// элементы в DOM
const fruitsList = document.querySelector('.fruits__list');
const shuffleButton = document.querySelector('.shuffle__btn');
const filterButton = document.querySelector('.filter__btn');
const sortKindLabel = document.querySelector('.sort__kind');
const sortTimeLabel = document.querySelector('.sort__time');
const sortChangeButton = document.querySelector('.sort__change__btn');
const sortActionButton = document.querySelector('.sort__action__btn');
const kindInput = document.querySelector('.kind__input');
const colorInput = document.querySelector('.color__input');
const weightInput = document.querySelector('.weight__input');
const addActionButton = document.querySelector('.add__action__btn');
const minWeightInput = document.getElementById('minweight__input');
const maxWeightInput = document.getElementById('maxweight__input');
const resetFilterButton = document.getElementById('reset__btn');

//--------------------------------------------------------------\\

// список фруктов в JSON формате
let fruitsJSON = `[
  {"kind": "Мангустин", "color": "фиолетовый", "weight": 13},
  {"kind": "Дуриан", "color": "зеленый", "weight": 35},
  {"kind": "Личи", "color": "розово-красный", "weight": 17},
  {"kind": "Карамбола", "color": "желтый", "weight": 28},
  {"kind": "Тамаринд", "color": "светло-коричневый", "weight": 22}
]`;

// преобразование JSON в объект JavaScript
let fruits = JSON.parse(fruitsJSON);

// отображение
const display = (items = fruits) => {
  // очищстка списока
  fruitsList.innerHTML = '';

  // создание карточек
  items.forEach(item => {
    const fruitItem = document.createElement('li');
    fruitItem.className = 'fruit__item';
    fruitItem.setAttribute('data-color', item.color);
    fruitItem.innerHTML = `
      <div class="fruit__info">
        <div>Вид: <span>${item.kind}</span></div>
        <div>Цвет: <span>${item.color}</span></div>
        <div>Вес: <span>${item.weight} кг</span></div>
      </div>
    `;
    fruitsList.appendChild(fruitItem);
  });
};

display();

// перемешкиваем
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffleFruits = () => {
  const shuffled = [...fruits];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  fruits = shuffled;
};

shuffleButton.addEventListener('click', () => {
  shuffleFruits();
  display();
});

//--------------------------------------------------------------\\

// функция фильтрации
const filterFruits = () => {
  const minWeight = parseInt(minWeightInput.value) || 0;
  const maxWeight = parseInt(maxWeightInput.value) || Infinity;

  // валидация ввода
  if (minWeight < 0 || maxWeight < 0) {
    alert('Вес не может быть отрицательным!');
    return fruits;
  }
  
  if (minWeight > maxWeight) {
    alert('Минимальный вес не может быть больше максимального!');
    return fruits;
  }

  return fruits.filter(fruit => fruit.weight >= minWeight && fruit.weight <= maxWeight);
};

// обработчики событий
filter__btn.addEventListener('click', () => {
  const filteredFruits = filterFruits();
  display(filteredFruits);
  
  if (filteredFruits.length === 0) {
    alert('Фруктов с таким весом не найдено!');
  }
});
reset__btn.addEventListener('click', () => {
  minWeightInput.value = '';
  maxWeightInput.value = '';
  display(); // Показываем все фрукты
});

display();

//--------------------------------------------------------------\\

let sortKind = 'bubbleSort'; // инициализация состояния вида сортировки
let sortTime = '-'; // инициализация состояния времени сортировки
sortKindLabel.textContent = 'Пузырьком';
sortTimeLabel.textContent = sortTime;

// функция сравнения по цвету
const comparationColor = (a, b) => {
  return a.color.localeCompare(b.color);
};

// алгоритмы сортировки
const sortAPI = {
  // сортировка пузырьком (изменяет исходный массив)
  bubbleSort(arr, comparation) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (comparation(arr[j], arr[j + 1]) > 0) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; // swap
        }
      }
    }
  },

  // быстрая сортировка (возвращает новый массив)
  quickSort(arr, comparation) {
    if (arr.length <= 1) return arr;
    
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = [];
    const right = [];
    const equal = [];
    
    for (const item of arr) {
      const cmp = comparation(item, pivot);
      if (cmp < 0) left.push(item);
      else if (cmp > 0) right.push(item);
      else equal.push(item);
    }
    
    return [
      ...this.quickSort(left, comparation),
      ...equal,
      ...this.quickSort(right, comparation)
    ];
  },

  // замер времени выполнения
  startSort(sort, arr, comparation) {
    const start = performance.now();
    const result = sort === this.quickSort 
      ? sort([...arr], comparation) // для quickSort передаем копию
      : (sort(arr, comparation), arr); // для bubbleSort работаем с исходным массивом
    const end = performance.now();
    sortTime = `${(end - start).toFixed(3)} ms`;
    return result;
  }
};

// Обработчик смены типа сортировки
sortChangeButton.addEventListener('click', function() {
  sortKind = sortKind === 'bubbleSort' ? 'quickSort' : 'bubbleSort';
  sortKindLabel.textContent = sortKind === 'bubbleSort' ? 'Пузырьком' : 'Быстрая';
  sortTimeLabel.textContent = '-'; // сбрасываем время при смене типа
});

// Единственный обработчик кнопки сортировки
sortActionButton.addEventListener('click', function() {
  sortTimeLabel.textContent = 'sorting...';
  
  setTimeout(() => {
    const sort = sortAPI[sortKind];
    const sortedFruits = sortAPI.startSort(sort, [...fruits], comparationColor);
    
    // Всегда обновляем массив, независимо от типа сортировки
    fruits = sortedFruits;
    
    display();
    sortTimeLabel.textContent = sortTime;
  }, 10);
});
//--------------------------------------------------------------\\

// обработчик кнопки добавления фрукта
addActionButton.addEventListener('click', () => {
  const kind = kindInput.value.trim();
  const color = colorInput.value.trim();
  const weightStr = weightInput.value.trim();
  
  // проверка введены ли данные
  if (!kind || !color || !weightStr) {
    alert('Пожалуйста, заполните все поля!');
    return;
  }
  
  // проверка веса
  const weight = Number(weightStr);
  if (isNaN(weight) || weight <= 0) {
    alert('Пожалуйста, введите корректный вес (положительное число)!');
    return;
  }
  
  const newFruit = {
    kind: kind,
    color: color,
    weight: weight
  };
  
  fruits.push(newFruit);
  
  display();
  
  kindInput.value = '';
  colorInput.value = '';
  weightInput.value = '';
});