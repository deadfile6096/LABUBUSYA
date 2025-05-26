/* Labubu Pixel Pet — Core logic */

// Game constants
const MAX_OPEN_PETS = 3;
const TOTAL_PETS = 30;
const STAT_DECAY_INTERVAL = 30000; // 30 seconds
const GROWTH_INCREASE_INTERVAL = 60000; // 1 minute
const GROWTH_INCREASE_AMOUNT = 0.05; // 5% per minute (much faster)
const STAT_MAX = 1.0;
const STAT_MIN = 0.0;

// Translations
const TRANSLATIONS = {
  en: {
    // Navigation
    'nav_pet': 'Pet',
    'nav_shop': 'Shop',
    'nav_pets': 'Pets',
    'nav_achievements': 'Achievements',
    'nav_help': 'Help',
    'nav_settings': 'Settings',
    
    // Pet screen
    'feed': 'Feed',
    'drink': 'Drink',
    'play': 'Play',
    'brush': 'Brush',
    'sleep': 'Sleep',
    'happy': 'Happy',
    'hunger': 'Hunger',
    'thirst': 'Thirst',
    'growth': 'Growth',
    'baby': 'Baby',
    'teen': 'Teen',
    'adult': 'Adult',
    
    // Shop
    'shop_title': 'Labubu Shop',
    'interior': 'Interior',
    'accessories': 'Accessories',
    'boosts': 'Boosts',
    'buy': 'Buy',
    'owned': 'Owned',
    'use_boost': 'Use Boost',
    'not_enough_coins': 'Not enough coins!',
    'purchased': 'Purchased: {0}!',
    
    // Pet selection
    'choose_labubu': 'Choose your Labubu',
    'unlock_message': 'Unlock all growth stages of a Labubu to get the "Labubu-Master" achievement and the next Labubu!',
    
    // Settings
    'settings': 'Settings',
    'game_settings': 'Game Settings',
    'sound': 'Sound',
    'enable_sound': 'Enable sound effects',
    'enable_music': 'Enable background music',
    'language': 'Language'
  },
  ru: {
    // Navigation
    'nav_pet': 'Питомец',
    'nav_shop': 'Магазин',
    'nav_pets': 'Питомцы',
    'nav_achievements': 'Достижения',
    'nav_help': 'Помощь',
    'nav_settings': 'Настройки',
    
    // Pet screen
    'feed': 'Кормить',
    'drink': 'Поить',
    'play': 'Играть',
    'brush': 'Чистить',
    'sleep': 'Спать',
    'happy': 'Счастье',
    'hunger': 'Голод',
    'thirst': 'Жажда',
    'growth': 'Рост',
    'baby': 'Малыш',
    'teen': 'Подросток',
    'adult': 'Взрослый',
    
    // Shop
    'shop_title': 'Магазин Labubu',
    'interior': 'Интерьер',
    'accessories': 'Аксессуары',
    'boosts': 'Бусты',
    'buy': 'Купить',
    'owned': 'Куплено',
    'use_boost': 'Использовать',
    'not_enough_coins': 'Недостаточно монет!',
    'purchased': 'Куплено: {0}!',
    
    // Pet selection
    'choose_labubu': 'Выберите своего Labubu',
    'unlock_message': 'Разблокируйте все стадии роста Labubu, чтобы получить достижение "Мастер Labubu" и следующего питомца!',
    
    // Settings
    'settings': 'Настройки',
    'game_settings': 'Настройки игры',
    'sound': 'Звук',
    'enable_sound': 'Включить звуковые эффекты',
    'enable_music': 'Включить фоновую музыку',
    'language': 'Язык'
  }
};

// Audio settings and functions
let audioEnabled = true;
let bgMusicPlaying = false;

// Function to play a sound
function playSound(soundId) {
  if (!audioEnabled) return;
  
  const audio = document.getElementById(soundId);
  if (audio) {
    audio.currentTime = 0; // Reset to start
    audio.play().catch(e => console.error('Error playing sound:', e));
  }
}

// Function to toggle background music
function toggleBackgroundMusic() {
  const bgMusic = document.getElementById('audio-background');
  if (!bgMusic) return;
  
  // Проверяем настройки звука и музыки
  if (!audioEnabled || !appState.settings.music) {
    // Если звук или музыка отключены в настройках, останавливаем музыку
    if (bgMusicPlaying) {
      bgMusic.pause();
      bgMusicPlaying = false;
    }
    
    // Показываем кнопку воспроизведения музыки, если пользователь уже взаимодействовал с документом
    if (userInteracted && $('#music-play-btn')) {
      $('#music-play-btn').style.display = 'block';
    }
    
    return;
  }
  
  if (bgMusicPlaying) {
    bgMusic.pause();
    bgMusicPlaying = false;
    
    // Показываем кнопку воспроизведения музыки, если пользователь уже взаимодействовал с документом
    if (userInteracted && $('#music-play-btn')) {
      $('#music-play-btn').style.display = 'block';
    }
  } else {
    bgMusic.play().catch(e => {
      console.error('Error playing background music:', e);
      // Если возникла ошибка при воспроизведении, устанавливаем флаг в false
      bgMusicPlaying = false;
      
      // Показываем кнопку воспроизведения музыки в случае ошибки
      if ($('#music-play-btn')) {
        $('#music-play-btn').style.display = 'block';
      }
    });
    bgMusicPlaying = true;
    
    // Скрываем кнопку воспроизведения музыки, если музыка успешно запущена
    if ($('#music-play-btn')) {
      $('#music-play-btn').style.display = 'none';
    }
  }
}

// Function to toggle all audio
function toggleAudio() {
  audioEnabled = !audioEnabled;
  
  if (!audioEnabled && bgMusicPlaying) {
    const bgMusic = document.getElementById('audio-background');
    if (bgMusic) {
      bgMusic.pause();
      bgMusicPlaying = false;
    }
  }
  
  return audioEnabled;
}


// Pet personalities
const PET_PERSONALITIES = [
  { name: "Sleepy Labubu", description: "Loves to sleep, eats little, doesn't like to play", stats: { sleep: 0.9, eat: 0.3, drink: 0.5, play: 0.2, speed: 0.4 } },
  { name: "Playful Labubu", description: "Very active, loses happiness quickly, but earns coins fast", stats: { sleep: 0.4, eat: 0.6, drink: 0.6, play: 0.9, speed: 0.8 } },
  { name: "Hungry Labubu", description: "Always hungry, but grows your coin balance quickly", stats: { sleep: 0.5, eat: 0.9, drink: 0.7, play: 0.5, speed: 0.7 } },
  { name: "Minimalist Labubu", description: "Doesn't need many accessories, but earns fewer coins", stats: { sleep: 0.6, eat: 0.5, drink: 0.5, play: 0.4, speed: 0.3 } },
  { name: "Glamorous Labubu", description: "Loves beautiful rooms, earns more coins in a well-decorated space", stats: { sleep: 0.5, eat: 0.6, drink: 0.6, play: 0.7, speed: 0.6 } },
  { name: "Thirsty Labubu", description: "Always needs water, but very happy when hydrated", stats: { sleep: 0.5, eat: 0.5, drink: 0.9, play: 0.6, speed: 0.5 } },
  { name: "Lazy Labubu", description: "Relaxed and easy-going, doesn't need much attention", stats: { sleep: 0.8, eat: 0.4, drink: 0.4, play: 0.3, speed: 0.2 } },
  { name: "Energetic Labubu", description: "Full of energy, needs lots of play and food", stats: { sleep: 0.3, eat: 0.8, drink: 0.7, play: 0.8, speed: 0.7 } },
  { name: "Royal Labubu", description: "Demands the finest things, but rewards you handsomely", stats: { sleep: 0.6, eat: 0.7, drink: 0.6, play: 0.5, speed: 0.8 } },
  { name: "Shy Labubu", description: "Timid but loyal, needs gentle care", stats: { sleep: 0.7, eat: 0.5, drink: 0.5, play: 0.4, speed: 0.4 } },
];

// Game state
const appState = {
  coins: 100, // Начинаем с небольшим количеством монет,
  currentPet: null,
  pets: [],
  petStats: {
    happy: 0.75,
    hunger: 0.75,
    thirst: 0.75,
    sleep: 0.75,
    growth: 0.01,
  },
  growthStage: 'baby', // 'baby', 'teen', 'ultra'
  ownedItems: {
    interior: [],
    accessories: [],
    boosts: ['boost1', 'boost7'], // Добавляем несколько бустов сразу
  },
  activeBoosts: [],
  achievements: [],
  settings: {
    sound: true,
    music: true,
    language: 'en',
  },
  lastTimestamp: Date.now(),
};

// Helper functions
function $(sel, parent = document) {
  return parent.querySelector(sel);
}

function $$(sel, parent = document) {
  return [...parent.querySelectorAll(sel)];
}

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Функция для преобразования названий цветов в шестнадцатеричные коды
function getColorHex(colorName) {
  const colorMap = {
    'amber': 'F59E0B',
    'orange': 'F97316',
    'yellow': 'EAB308',
    'lime': '84CC16',
    'emerald': '10B981',
    'teal': '14B8A6',
    'cyan': '06B6D4',
    'sky': '0EA5E9',
    'blue': '3B82F6',
    'indigo': '6366F1'
  };
  
  return colorMap[colorName] || 'F59E0B'; // Возвращаем amber по умолчанию
}

// Generate mock pets with personalities
function generatePets() {
  // Очищаем массив питомцев перед генерацией, чтобы избежать дубликатов
  appState.pets = [];
  
  // Создаем массив уже использованных спрайтов, чтобы избежать повторений
  const usedSprites = new Set();
  
  for (let i = 0; i < TOTAL_PETS; i++) {
    const open = i < MAX_OPEN_PETS;
    const personality = i < PET_PERSONALITIES.length 
      ? PET_PERSONALITIES[i] 
      : randomFromArray(PET_PERSONALITIES);
    
    // Создаем уникальные спрайты для каждого питомца
    let sprites;
    
    // Используем реальные спрайты для первых трех питомцев
    if (i === 0) {
      // Первый питомец - labubu1
      sprites = {
        baby: 'img/labubu1/baby.png',
        teen: 'img/labubu1/middle.png',
        ultra: 'img/labubu1/ultra.png'
      };
    } else if (i === 1) {
      // Второй питомец - labubu2
      sprites = {
        baby: 'img/labubu2/baby.png',
        teen: 'img/labubu2/middle.png',
        ultra: 'img/labubu2/ultra.png'
      };
    } else if (i === 2) {
      // Третий питомец - labubu3
      sprites = {
        baby: 'img/labubu3/baby.png',
        teen: 'img/labubu3/middle.png',
        ultra: 'img/labubu3/ultra.png'
      };
    } else {
      // Для остальных создаем уникальные заполнители с разными цветами
      // Создаем массив цветов в бежевой гамме
      const colors = [
        'amber', 'orange', 'yellow', 'lime', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo'
      ];
      
      // Выбираем цвет на основе индекса питомца
      const colorIndex = i % colors.length;
      const color = colors[colorIndex];
      
      // Создаем уникальные спрайты с разными цветами и формами
      sprites = {
        baby: `https://via.placeholder.com/80x80/${getColorHex(color)}/FFFFFF?text=L${i + 1}`,
        teen: `https://via.placeholder.com/80x80/${getColorHex(color)}/FFFFFF?text=L${i + 1}T`,
        ultra: `https://via.placeholder.com/80x80/${getColorHex(color)}/FFFFFF?text=L${i + 1}U`,
      };
    }
    
    appState.pets.push({
      id: i,
      name: personality.name,
      description: personality.description,
      stats: personality.stats,
      open,
      sprites,
      mastered: false,
      growth: 0.01, // Индивидуальный прогресс роста для каждого питомца
      growthStage: 'baby', // Индивидуальная стадия роста для каждого питомца: 'baby', 'teen', 'ultra'
    });
  }
}

// Shop items data
const SHOP_ITEMS = {
  interior: [
    { id: 'int1', name: 'Galaxy Cat Poster', price: 50, image: 'img/shop/galaxy_cat_poster.png', happiness: 0.05 },
    { id: 'int2', name: 'Pixel Arcade Table', price: 120, image: 'img/shop/Pixel_Arcade_Table.png', happiness: 0.08 },
    { id: 'int3', name: 'Cloud Rug', price: 80, image: 'img/shop/Cloud_Rug.png', happiness: 0.06 },
    { id: 'int4', name: 'Lava Lamp', price: 100, image: 'img/shop/Lava_Lamp.png', happiness: 0.07 },
    { id: 'int5', name: 'Retro Game Console', price: 150, image: 'img/shop/Retro_Game_Console.png', happiness: 0.09 },
    { id: 'int6', name: 'Pixel Bookshelf', price: 130, image: 'img/shop/Pixel_Bookshelf.png', happiness: 0.08 },
    { id: 'int7', name: 'Mini Aquarium', price: 200, image: 'img/shop/Mini_Aquarium.png', happiness: 0.10 },
    { id: 'int8', name: 'Pixel City Window', price: 180, image: 'img/shop/pixel_city_window.png', happiness: 0.09 },
    { id: 'int9', name: 'Chunky TV', price: 250, image: 'img/shop/Chunky_TV.png', happiness: 0.12 },
    { id: 'int10', name: 'Trophy Shelf', price: 300, image: 'img/shop/Trophy_Shelf.png', happiness: 0.15 },
  ],
  accessories: [
    { id: 'acc1', name: 'VR Glasses', price: 40, image: 'img/shop/Accessories/vr_glasses.png', happiness: 0.05 },
    { id: 'acc2', name: 'Headphones', price: 35, image: 'img/shop/Accessories/headphones.png', happiness: 0.04 },
    { id: 'acc3', name: 'Propeller Cap', price: 30, image: 'img/shop/Accessories/proppeler_cap.png', happiness: 0.03 },
    { id: 'acc4', name: 'Scarf', price: 25, image: 'img/shop/Accessories/scarf.png', happiness: 0.03 },
    { id: 'acc5', name: 'Pixel Cape', price: 45, image: 'img/shop/Accessories/Pixel_Cape.png', happiness: 0.05 },
    { id: 'acc6', name: 'Wing Backpack', price: 60, image: 'img/shop/Accessories/Wing_Backpack.png', happiness: 0.06 },
    { id: 'acc7', name: 'Cyberpunk Glasses', price: 50, image: 'img/shop/Accessories/Cyberpunk_Glasses.png', happiness: 0.05 },
    { id: 'acc8', name: 'Star Crown', price: 70, image: 'img/shop/Accessories/Star_Crown.png', happiness: 0.07 },
    { id: 'acc9', name: 'Mustache Stickers', price: 20, image: 'img/shop/Accessories/Mustache Stickers.png', happiness: 0.02 },
    { id: 'acc10', name: 'Pajamas', price: 40, image: 'img/shop/Accessories/Pajamas.png', happiness: 0.04 },
  ],
  boosts: [
    { id: 'boost1', name: '2x Coins (10 min)', price: 100, image: 'img/shop/galaxy_cat_poster.png', duration: 600000, effect: 'doubleMoney' },
    { id: 'boost2', name: 'Instant Refill', price: 80, image: 'img/shop/Pixel_Arcade_Table.png', duration: 0, effect: 'refillStats' },
    { id: 'boost3', name: 'Slow Decay', price: 120, image: 'img/shop/Cloud_Rug.png', duration: 1800000, effect: 'slowDecay' },
    { id: 'boost4', name: 'Happy Hour', price: 90, image: 'img/shop/Lava_Lamp.png', duration: 1200000, effect: 'happyHour' },
    { id: 'boost5', name: 'Interior Boost', price: 110, image: 'img/shop/Retro_Game_Console.png', duration: 1800000, effect: 'interiorBoost' },
    { id: 'boost6', name: 'Crystal Sleep', price: 150, image: 'img/shop/Pixel_Bookshelf.png', duration: 3600000, effect: 'crystalSleep' },
    { id: 'boost7', name: 'Growth Boost', price: 50, image: 'img/shop/Mini_Aquarium.png', duration: 180000, effect: 'growthBoost' }, // 3 минуты
    { id: 'boost8', name: 'Attractive Look', price: 130, image: 'img/shop/pixel_city_window.png', duration: 1800000, effect: 'attractiveLook' },
    { id: 'boost9', name: 'Random Gift', price: 50, image: 'img/shop/Chunky_TV.png', duration: 0, effect: 'randomGift' },
    { id: 'boost10', name: 'Pet Preview (5 min)', price: 300, image: 'img/shop/Trophy_Shelf.png', duration: 300000, effect: 'petPreview' },
  ]
};

// Achievements data
const ACHIEVEMENTS = [
  { id: 'ach1', name: '10 Feedings in a Row', description: 'Feed your Labubu 10 times without doing other actions', unlocked: false },
  { id: 'ach2', name: '100% Happiness', description: 'Get your Labubu to 100% happiness', unlocked: false },
  { id: 'ach3', name: 'Sleepless 24h', description: 'Keep your Labubu awake for 24 hours', unlocked: false },
  { id: 'ach4', name: 'Shopaholic', description: 'Buy 5 items from the shop', unlocked: false },
  { id: 'ach5', name: 'Decorator', description: 'Buy all interior items', unlocked: false },
  { id: 'ach6', name: 'Fashion Icon', description: 'Buy all accessories', unlocked: false },
  { id: 'ach7', name: 'Coin Collector', description: 'Earn 1000 coins total', unlocked: false },
  { id: 'ach8', name: 'Labubu Master', description: 'Reach the final growth stage with any Labubu', unlocked: false },
];

// Initialize game
generatePets();

// Pet interaction functions
function renderPetGrid() {
  const grid = $('#gridPets');
  grid.innerHTML = '';
  
  // Создаем копию массива питомцев, чтобы не изменять оригинальный
  const uniquePets = [];
  const seenSpriteUrls = new Set();
  
  // Фильтруем питомцев, чтобы убрать дубликаты по спрайтам
  appState.pets.forEach(pet => {
    const spriteUrl = pet.sprites.baby;
    if (!seenSpriteUrls.has(spriteUrl)) {
      seenSpriteUrls.add(spriteUrl);
      uniquePets.push(pet);
    }
  });
  
  // Отображаем только уникальных питомцев
  // Фильтруем питомцев, чтобы удалить питомца с текстом L21
  uniquePets.filter(pet => {
    // Проверяем, что это не питомец с текстом L21
    return !pet.sprites.baby.includes('text=L21');
  }).forEach((pet) => {
    const item = document.createElement('div');

    // Делаем все карточки одинакового размера с фиксированной высотой
    // Удаляем pointer-events-none для недоступных карточек, чтобы подсказка работала
    item.className = `relative group border-2 rounded-lg p-2 cursor-pointer transition transform hover:-translate-y-1 hover:shadow-xl ${
      pet.open ? 'border-amber-500' : 'border-gray-400 opacity-50'
    }`;
    
    // Создаем контейнер фиксированной высоты для изображения
    // Для недоступных карточек используем изображение labubu-not/labubu_0.png
    item.innerHTML = `
      <div class="h-32 flex items-center justify-center">
        ${pet.open ? 
          `<img 
            src="${pet.sprites.baby}" 
            class="max-h-full object-contain mx-auto" 
            alt="${pet.name}" 
          />` : 
          `<img 
            src="img/labubu-not/labubu_0.png" 
            class="max-h-full object-contain mx-auto" 
            alt="Locked Labubu Pet" 
          />`
        }
      </div>
    `;

    if (pet.open) {
      item.addEventListener('click', () => selectPet(pet));
      item.addEventListener('mouseenter', (e) => showPetTooltip(pet, e));
      item.addEventListener('mousemove', (e) => moveTooltip(e));
      item.addEventListener('mouseleave', hideTooltip);
    } else {
      // Add click handler for locked pet cards
      item.addEventListener('click', () => {
        const tt = $('#tooltip');
        tt.innerHTML = `<p class="text-center font-bold text-amber-600">Unlock all growth stages of a Labubu to get the "Labubu-Master" achievement and the next Labubu!</p>`;
        tt.classList.remove('hidden');
        setTimeout(() => {
          tt.classList.add('hidden');
        }, 3000);
      });
      
      item.addEventListener('mouseenter', (e) => {
        const tt = $('#tooltip');
        tt.innerHTML = `<p class="text-center">Unlock all growth stages of a Labubu to get the "Labubu-Master" achievement and the next Labubu!</p>`;
        tt.classList.remove('hidden');
        moveTooltip(e);
      });
      item.addEventListener('mousemove', (e) => moveTooltip(e));
      item.addEventListener('mouseleave', hideTooltip);
    }

    grid.appendChild(item);
  });
}

function startGameLoop() {
  // Останавливаем предыдущий цикл, если он был запущен
  if (window.gameLoopInterval) {
    clearInterval(window.gameLoopInterval);
    window.gameLoopInterval = null;
  }
  
  // Проверяем, что есть выбранный питомец
  if (!appState.currentPet) {
    console.error('Cannot start game loop: no pet selected');
    return;
  }
  
  // Устанавливаем время последнего обновления
  appState.lastTimestamp = Date.now();
  
  // Запускаем игровой цикл
  window.gameLoopInterval = setInterval(() => {
    try {
      updateGameState();
    } catch (e) {
      console.error('Error in game loop:', e);
      // Останавливаем цикл при ошибке
      clearInterval(window.gameLoopInterval);
      window.gameLoopInterval = null;
    }
  }, 1000); // Обновляем каждую секунду
  
  // Начальное обновление
  try {
    updateGameState();
  } catch (e) {
    console.error('Error in initial game state update:', e);
  }
}

function selectPet(pet) {
  appState.currentPet = pet;
  
  // Устанавливаем флаг взаимодействия пользователя
  userInteracted = true;
  
  // Switch screen
  switchScreen('screen-room');
  // Update sprite - используем индивидуальную стадию роста питомца
  $('#petSprite').src = pet.sprites[pet.growthStage];
  $('#growth-stage').textContent = capitalizeFirstLetter(pet.growthStage);
  // Обновляем отображение прогресса роста в интерфейсе
  appState.petStats.growth = pet.growth;
  // Update stats visuals
  updateAllStats();
  // Start game loop
  startGameLoop();
}

function updateAllStats() {
  // Update bars and values
  Object.entries(appState.petStats).forEach(([key, value]) => {
    updateBar(key, value);
    $(`#value-${key}`).textContent = `${Math.round(value * 100)}%`;
  });
  
  // Update coins - добавляем проверку на NaN
  if (isNaN(appState.coins)) {
    console.error('Coins value is NaN, resetting to 0');
    appState.coins = 0;
  }
  $('#coins').textContent = appState.coins;
  $('#shop-coins').textContent = appState.coins;
}

function updateBar(name, val) {
  $(`#bar-${name}`).style.width = `${val * 100}%`;
}

function showPetTooltip(pet, e) {
  const tt = $('#tooltip');
  tt.innerHTML = `
    <p class="font-bold mb-2 text-center">${pet.name}</p>
    <p class="text-[10px] mb-2">${pet.description}</p>
    <div class="flex justify-center gap-1 mb-2">
      <img src="${pet.sprites.baby}" class="w-6 h-6" />
      <img src="${pet.sprites.teen}" class="w-6 h-6" />
      <img src="${pet.sprites.ultra}" class="w-6 h-6" />
    </div>
    <ul class="space-y-1 text-[10px]">
      <li>Sleep: ${(pet.stats.sleep * 10).toFixed(1)}</li>
      <li>Food: ${(pet.stats.eat * 10).toFixed(1)}</li>
      <li>Drink: ${(pet.stats.drink * 10).toFixed(1)}</li>
      <li>Play: ${(pet.stats.play * 10).toFixed(1)}</li>
      <li>Speed: ${(pet.stats.speed * 10).toFixed(1)}</li>
    </ul>
    <p class="mt-2 text-[10px] text-center italic opacity-60">Unlock all stages to gain "Labubu-Master"!</p>
  `;
  tt.classList.remove('hidden');
  moveTooltip(e);
}

function moveTooltip(e) {
  const tt = $('#tooltip');
  const offset = 16;
  tt.style.left = `${e.pageX + offset}px`;
  tt.style.top = `${e.pageY + offset}px`;
}

function hideTooltip() {
  $('#tooltip').classList.add('hidden');
}

function bindNav() {
  document.querySelectorAll('.nav-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetScreen = btn.dataset.target;
      switchScreen(targetScreen);
      
      // Update shop coins when entering shop
      if (targetScreen === 'screen-shop') {
        $('#shop-coins').textContent = appState.coins;
      }
    });
  });
  $('#mobileMenuBtn').addEventListener('click', () => {
    $('#mobileMenu').classList.toggle('hidden');
  });
}

function switchScreen(screenId) {
  try {
    console.log(`Switching to screen: ${screenId}`);
    
    // Останавливаем игровой цикл при переходе на экран выбора питомцев или настроек
    if (screenId === 'screen-select' || screenId === 'screen-settings') {
      if (window.gameLoopInterval) {
        clearInterval(window.gameLoopInterval);
        window.gameLoopInterval = null;
        console.log('Game loop stopped due to screen change');
      }
    }
    
    // Hide all screens
    $$('section[id^="screen-"]').forEach(screen => screen.classList.add('hidden'));
    
    // Show selected screen
    const targetScreen = $(`#${screenId}`);
    if (!targetScreen) {
      console.error(`Screen with ID ${screenId} not found`);
      return;
    }
    
    targetScreen.classList.remove('hidden');
    
    // Обновляем монеты при переходе на экран магазина
    if (screenId === 'screen-shop') {
      // Проверяем, что значение монет не NaN
      if (isNaN(appState.coins)) {
        console.error('Coins value is NaN, resetting to 0');
        appState.coins = 0;
      }
      // Обновляем отображение монет в магазине
      $('#shop-coins').textContent = appState.coins;
      console.log('Shop coins updated:', appState.coins);
    }
    
    // Запускаем игровой цикл при возвращении на экран с питомцем, если есть выбранный питомец
    if (screenId === 'screen-room' && appState.currentPet && !window.gameLoopInterval) {
      startGameLoop();
    }
  } catch (e) {
    console.error('Error in switchScreen:', e);
  }
}

function bindActions() {
  document.querySelectorAll('.action-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const statToUpdate = btn.dataset.stat;
      
      // Perform action
      performAction(action, statToUpdate);
    });
  });
}

// Флаг для отслеживания первого взаимодействия пользователя
let userInteracted = false;

// Функция для инициализации кнопки воспроизведения музыки
function initMusicButton() {
  const musicBtn = $('#music-play-btn');
  if (!musicBtn) return;
  
  // Скрываем кнопку, если музыка уже играет
  if (bgMusicPlaying) {
    musicBtn.style.display = 'none';
  }
  
  // Добавляем обработчик клика
  musicBtn.addEventListener('click', () => {
    // Устанавливаем флаг взаимодействия
    userInteracted = true;
    
    // Включаем звук, если он был выключен
    audioEnabled = true;
    appState.settings.sound = true;
    
    // Включаем музыку в настройках
    appState.settings.music = true;
    
    // Воспроизводим звук касания
    playSound('audio-touch');
    
    // Включаем фоновую музыку
    if (!bgMusicPlaying) {
      toggleBackgroundMusic();
    }
    
    // Скрываем кнопку после включения музыки
    musicBtn.style.display = 'none';
    
    // Обновляем настройки в интерфейсе
    if ($('#sound-toggle')) {
      $('#sound-toggle').checked = true;
    }
    if ($('#music-toggle')) {
      $('#music-toggle').checked = true;
    }
    
    // Сохраняем настройки
    saveGame();
  });
}

function performAction(action, statToUpdate) {
  // Воспроизводим звук касания
  playSound('audio-touch');
  
  // Устанавливаем флаг взаимодействия пользователя
  userInteracted = true;
  
  // Each action yields coins based on pet's speed stat
  const coinIncrease = 1 + Math.floor(appState.currentPet.stats.speed * 3);
  const coinMultiplier = hasActiveBoost('doubleMoney') ? 2 : 1;
  appState.coins += coinIncrease * coinMultiplier;
  
  // Update stat based on action
  if (statToUpdate) {
    const statIncrease = 0.1; // 10% increase per action
    appState.petStats[statToUpdate] = clamp(appState.petStats[statToUpdate] + statIncrease, 0, 1);
  }
  
  // Check for achievements
  checkAchievements(action);
  
  // Update UI
  updateAllStats();
  
  // Animate pet
  animatePet(action);
}

function animatePet(action) {
  const pet = $('#petSprite');
  
  // Simple animation based on action
  switch(action) {
    case 'feed':
      pet.classList.add('animate-bounce');
      setTimeout(() => pet.classList.remove('animate-bounce'), 1000);
      break;
    case 'drink':
      pet.classList.add('animate-pulse');
      setTimeout(() => pet.classList.remove('animate-pulse'), 1000);
      break;
    case 'play':
      pet.classList.add('animate-spin');
      setTimeout(() => pet.classList.remove('animate-spin'), 1000);
      break;
    case 'brush':
      pet.classList.add('animate-pulse');
      setTimeout(() => pet.classList.remove('animate-pulse'), 1000);
      break;
    case 'sleep':
      pet.classList.add('opacity-50');
      setTimeout(() => pet.classList.remove('opacity-50'), 1000);
      break;
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function startGameLoop() {
  // Clear any existing interval
  if (window.gameLoopInterval) {
    clearInterval(window.gameLoopInterval);
  }
  
  // Set up game loop
  window.gameLoopInterval = setInterval(() => {
    updateGameState();
  }, 1000); // Update every second
  
  // Initial update
  updateGameState();
}

function updateGameState() {
  try {
    // Проверяем, что есть выбранный питомец
    if (!appState.currentPet) {
      console.warn('updateGameState called without a selected pet');
      // Останавливаем игровой цикл, если он запущен
      if (window.gameLoopInterval) {
        clearInterval(window.gameLoopInterval);
        window.gameLoopInterval = null;
        console.log('Game loop stopped due to missing pet');
      }
      return;
    }
    
    // Вычисляем прошедшее время
    const now = Date.now();
    if (!appState.lastTimestamp) {
      appState.lastTimestamp = now;
      return; // Пропускаем первый цикл, если нет предыдущего времени
    }
    
    // Проверяем, что прошедшее время имеет смысл
    const elapsed = now - appState.lastTimestamp;
    if (elapsed <= 0 || elapsed > 60000) { // Не более минуты
      console.warn(`Suspicious elapsed time: ${elapsed}ms, resetting to 1000ms`);
      appState.lastTimestamp = now - 1000; // Используем 1 секунду как безопасное значение
    }
    
    // Обновляем время последнего обновления
    appState.lastTimestamp = now;
    
    // Обновляем статистику на основе прошедшего времени
    updateStats(elapsed);
    
    // Проверяем прогресс роста
    checkGrowthProgress(elapsed);
    
    // Обновляем активные бусты
    updateActiveBoosts(elapsed);
    
    // Обновляем интерфейс
    updateAllStats();
  } catch (e) {
    console.error('Error in updateGameState:', e);
    // Останавливаем игровой цикл при критической ошибке
    if (window.gameLoopInterval) {
      clearInterval(window.gameLoopInterval);
      window.gameLoopInterval = null;
      console.log('Game loop stopped due to error');
    }
  }
}

function updateStats(elapsed) {
  // Проверяем, что есть выбранный питомец
  if (!appState.currentPet) return;
  
  // Calculate decay rate based on pet personality and boosts
  const decayMultiplier = hasActiveBoost('slowDecay') ? 0.5 : 1.0;
  const happyDecayRate = (0.1 / STAT_DECAY_INTERVAL) * elapsed * appState.currentPet.stats.play * decayMultiplier;
  const hungerDecayRate = (0.1 / STAT_DECAY_INTERVAL) * elapsed * appState.currentPet.stats.eat * decayMultiplier;
  const thirstDecayRate = (0.1 / STAT_DECAY_INTERVAL) * elapsed * appState.currentPet.stats.drink * decayMultiplier;
  const sleepDecayRate = (0.1 / STAT_DECAY_INTERVAL) * elapsed * appState.currentPet.stats.sleep * decayMultiplier;
  
  // Don't decay stats if crystal sleep is active
  if (!hasActiveBoost('crystalSleep')) {
    // Decay stats
    appState.petStats.happy = clamp(appState.petStats.happy - happyDecayRate, 0, 1);
    appState.petStats.hunger = clamp(appState.petStats.hunger - hungerDecayRate, 0, 1);
    appState.petStats.thirst = clamp(appState.petStats.thirst - thirstDecayRate, 0, 1);
    appState.petStats.sleep = clamp(appState.petStats.sleep - sleepDecayRate, 0, 1);
  }
}

function checkGrowthProgress(elapsed) {
  // Если нет выбранного питомца, выходим
  if (!appState.currentPet) return;
  
  // Increase growth at a moderate pace
  const growthBoostMultiplier = hasActiveBoost('growthBoost') ? 3.33 : 1; // 3x faster with boost (3 min vs 10 min)
  const growthIncrease = (GROWTH_INCREASE_AMOUNT / GROWTH_INCREASE_INTERVAL) * elapsed * growthBoostMultiplier;
  
  // Увеличиваем рост только текущего питомца
  appState.currentPet.growth = clamp(appState.currentPet.growth + growthIncrease, 0, 1);
  
  // Обновляем отображение прогресса роста в интерфейсе
  appState.petStats.growth = appState.currentPet.growth; // Для отображения в интерфейсе
  
  // Check for growth stage changes
  if (appState.currentPet.growth >= 0.5 && appState.currentPet.growthStage === 'baby') {
    appState.currentPet.growthStage = 'teen';
    $('#growth-stage').textContent = 'Teen';
    $('#petSprite').src = appState.currentPet.sprites.teen;
    showAchievementNotification('Growth milestone reached: Teen stage!');
  } else if (appState.currentPet.growth >= 0.95 && appState.currentPet.growthStage === 'teen') {
    appState.currentPet.growthStage = 'ultra';
    $('#growth-stage').textContent = 'Ultra-Mega';
    $('#petSprite').src = appState.currentPet.sprites.ultra;
    appState.currentPet.mastered = true;
    unlockAchievement('ach8'); // Labubu Master achievement
    showAchievementNotification('Growth milestone reached: Ultra-Mega stage!');
    showAchievementNotification('Achievement unlocked: Labubu Master!');
  }
}

function hasActiveBoost(boostEffect) {
  return appState.activeBoosts.some(boost => boost.effect === boostEffect && boost.endTime > Date.now());
}

function updateActiveBoosts(elapsed) {
  // Remove expired boosts
  appState.activeBoosts = appState.activeBoosts.filter(boost => boost.endTime > Date.now());
}

function showAchievementNotification(message, soundType = 'default') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce';
  notification.textContent = message;
  
  // Воспроизводим соответствующий звук в зависимости от типа уведомления
  if (soundType === 'error' || message.includes('Not enough coins')) {
    playSound('audio-error');
  } else if (soundType === 'achievement' || message.includes('Achievement')) {
    playSound('audio-achievement');
  } else if (soundType === 'buy' || message.includes('Purchased')) {
    playSound('audio-buy');
  } else {
    // Для всех остальных уведомлений используем звук касания
    playSound('audio-touch');
  }
  
  // Add to document
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Shop functionality
function initShop() {
  // Обновляем монеты при инициализации магазина
  try {
    // Проверяем, что значение монет не NaN
    if (isNaN(appState.coins)) {
      console.error('Coins value is NaN in initShop, resetting to 0');
      appState.coins = 0;
    }
    // Обновляем отображение монет в магазине
    $('#shop-coins').textContent = appState.coins;
    console.log('Shop coins initialized:', appState.coins);
  } catch (e) {
    console.error('Error updating shop coins:', e);
  }
  
  // Bind shop tabs
  $$('.shop-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      // Update active tab styling
      $$('.shop-tab').forEach(t => {
        if (t.dataset.tab === tabName) {
          t.classList.add('bg-amber-600', 'text-white');
        } else {
          t.classList.remove('bg-amber-600', 'text-white');
        }
      });
      
      // Show corresponding content
      $$('.shop-content').forEach(content => {
        if (content.id === `shop-${tabName}`) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
      
      // Обновляем монеты при переключении между вкладками магазина
      try {
        // Проверяем, что значение монет не NaN
        if (isNaN(appState.coins)) {
          console.error('Coins value is NaN in shop tab click, resetting to 0');
          appState.coins = 0;
        }
        // Обновляем отображение монет в магазине
        $('#shop-coins').textContent = appState.coins;
        console.log('Shop coins updated on tab change:', appState.coins);
      } catch (e) {
        console.error('Error updating shop coins on tab change:', e);
      }
    });
  });
  
  // Добавим обработчик для кнопок в статических бустах
  $$('#shop-boosts button').forEach(btn => {
    btn.addEventListener('click', () => {
      const boostName = btn.parentElement.querySelector('h3').textContent;
      let boostId;
      
      // Определяем ID буста по его имени
      if (boostName === 'Growth Boost') {
        boostId = 'boost7';
      } else if (boostName.includes('2x Coins')) {
        boostId = 'boost1';
      } else {
        console.error('Unknown boost:', boostName);
        return;
      }
      
      // Используем функцию buyItem для покупки буста
      buyItem(boostId, 'boosts');
    });
  });
  
  // Render shop items - отключаем динамическое создание бустов, т.к. они уже есть в HTML
  renderShopItems('interior');
  renderShopItems('accessories');
  // renderShopItems('boosts'); // Закомментировано, т.к. бусты уже добавлены в HTML
}

function renderShopItems(category) {
  const container = $(`#shop-${category} > div`);
  container.innerHTML = '';
  
  SHOP_ITEMS[category].forEach(item => {
    const owned = appState.ownedItems[category].includes(item.id);
    const itemElement = document.createElement('div');
    
    itemElement.className = `bg-amber-50/80 backdrop-blur-sm rounded-lg p-3 shadow-md flex flex-col items-center ${owned ? 'border-2 border-amber-500' : ''}`;
    itemElement.innerHTML = `
      <img src="${item.image}" class="w-16 h-16 mb-2" alt="${item.name}" />
      <h3 class="font-bold text-xs text-center">${item.name}</h3>
      <div class="flex items-center mt-2 mb-1">
        <img src="img/coin.png" class="inline-block w-4 h-4 mr-1 object-contain" alt="Coins" />
        <span class="text-xs">${item.price}</span>
      </div>
      ${category === 'boosts' && owned ? 
        `<button class="text-xs bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded w-full shop-use-btn" data-category="${category}" data-id="${item.id}">Use Boost</button>` :
        owned ? 
        `<button class="text-xs bg-amber-500 text-white px-2 py-1 rounded w-full" disabled>Owned</button>` : 
        `<button class="text-xs bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded w-full shop-buy-btn" data-category="${category}" data-id="${item.id}">Buy</button>`
      }
    `;
    
    container.appendChild(itemElement);
  });
  
  // Bind buy buttons
  $$(`#shop-${category} .shop-buy-btn`).forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.id;
      const category = btn.dataset.category;
      
      // Запускаем фоновую музыку после первого взаимодействия пользователя
      if (!userInteracted && audioEnabled && !bgMusicPlaying) {
        userInteracted = true;
        setTimeout(() => {
          if (audioEnabled) {
            toggleBackgroundMusic();
          }
        }, 500);
      }
      
      buyItem(itemId, category);
    });
  });
  
  // Bind use boost buttons
  $$(`#shop-${category} .shop-use-btn`).forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.id;
      const boost = SHOP_ITEMS.boosts.find(b => b.id === itemId);
      
      // Запускаем фоновую музыку после первого взаимодействия пользователя
      if (!userInteracted && audioEnabled && !bgMusicPlaying) {
        userInteracted = true;
        setTimeout(() => {
          if (audioEnabled) {
            toggleBackgroundMusic();
          }
        }, 500);
      }
      
      if (boost) {
        applyBoost(boost);
        showAchievementNotification(`Activated: ${boost.name}!`, 'achievement');
        renderShopItems('boosts'); // Обновляем отображение бустов
      }
    });
  });
}

function buyItem(itemId, category) {
  // Find the item
  const item = SHOP_ITEMS[category].find(i => i.id === itemId);
  
  if (!item) return;
  
  // Check if player has enough coins
  if (appState.coins < item.price) {
    showAchievementNotification('Not enough coins!', 'error');
    return;
  }
  
  // Purchase the item - добавляем проверку на NaN
  appState.coins = Number(appState.coins) - Number(item.price);
  
  // Проверяем, что значение не NaN
  if (isNaN(appState.coins)) {
    console.error('Coins value became NaN after purchase, resetting to 0');
    appState.coins = 0;
  }
  
  // Обновляем отображение монет в магазине сразу после покупки
  try {
    $('#shop-coins').textContent = appState.coins;
    console.log('Shop coins updated after purchase:', appState.coins);
  } catch (e) {
    console.error('Error updating shop coins after purchase:', e);
  }
  
  // Add to owned items
  if (category === 'boosts') {
    // For boosts, apply effect immediately
    applyBoost(item);
  } else {
    // For other items, add to inventory
    appState.ownedItems[category].push(itemId);
    
    // Apply interior happiness bonus if applicable
    if (category === 'interior' && item.happiness) {
      appState.petStats.happy = clamp(appState.petStats.happy + item.happiness, 0, 1);
    }
  }
  
  // Update UI
  updateAllStats();
  renderShopItems(category);
  
  // Check achievements
  checkShopAchievements();
  
  // Show notification
  showAchievementNotification(`Purchased: ${item.name}!`, 'buy');
}

function applyBoost(boost) {
  switch(boost.effect) {
    case 'refillStats':
      // Instantly refill all stats
      appState.petStats.happy = 1.0;
      appState.petStats.hunger = 1.0;
      appState.petStats.thirst = 1.0;
      appState.petStats.sleep = 1.0;
      break;
    case 'randomGift':
      // Give random reward
      const rewards = [
        { type: 'coins', amount: Math.floor(Math.random() * 50) + 10 },
        { type: 'stat', stat: 'happy', amount: 0.2 },
        { type: 'stat', stat: 'hunger', amount: 0.2 },
        { type: 'stat', stat: 'thirst', amount: 0.2 },
        { type: 'stat', stat: 'sleep', amount: 0.2 },
        { type: 'growth', amount: 0.01 }
      ];
      
      const reward = randomFromArray(rewards);
      
      if (reward.type === 'coins') {
        appState.coins += reward.amount;
        showAchievementNotification(`Gift: ${reward.amount} coins!`, 'achievement');
      } else if (reward.type === 'stat') {
        appState.petStats[reward.stat] = clamp(appState.petStats[reward.stat] + reward.amount, 0, 1);
        showAchievementNotification(`Gift: +${Math.round(reward.amount * 100)}% ${reward.stat}!`, 'achievement');
      } else if (reward.type === 'growth') {
        appState.petStats.growth = clamp(appState.petStats.growth + reward.amount, 0, 1);
        showAchievementNotification(`Gift: +${Math.round(reward.amount * 100)}% growth!`, 'achievement');
      }
      break;
    case 'petPreview':
      // Temporarily unlock a random locked pet
      const lockedPets = appState.pets.filter(p => !p.open);
      if (lockedPets.length > 0) {
        const randomPet = randomFromArray(lockedPets);
        randomPet.open = true;
        randomPet.previewUntil = Date.now() + boost.duration;
        showAchievementNotification(`Preview unlocked: ${randomPet.name} for 5 minutes!`, 'achievement');
        renderPetGrid(); // Refresh pet grid
      } else {
        showAchievementNotification('No locked pets to preview!', 'error');
        appState.coins += boost.price; // Refund
      }
      break;
    default:
      // For timed boosts, add to active boosts
      if (boost.duration > 0) {
        appState.activeBoosts.push({
          id: boost.id,
          effect: boost.effect,
          endTime: Date.now() + boost.duration
        });
        showAchievementNotification(`Activated: ${boost.name}!`, 'achievement');
      }
  }
}

function addItemToRoom(item) {
  // Simple visualization of room items
  const roomItems = $('#room-items');
  const itemElement = document.createElement('div');
  
  // Position randomly in the room
  const top = Math.floor(Math.random() * 70) + 5; // 5-75%
  const left = Math.floor(Math.random() * 70) + 5; // 5-75%
  const size = Math.floor(Math.random() * 20) + 20; // 20-40px
  
  itemElement.className = 'absolute';
  itemElement.style.top = `${top}%`;
  itemElement.style.left = `${left}%`;
  itemElement.innerHTML = `<img src="${item.image}" style="width: ${size}px; height: ${size}px;" alt="${item.name}" class="object-contain" />`;
  
  roomItems.appendChild(itemElement);
}

// Achievement functions
function initAchievements() {
  // Add achievements to state
  appState.achievements = [...ACHIEVEMENTS];
  
  // Render achievements list
  renderAchievements();
}

function renderAchievements() {
  const container = $('#achievements-list');
  container.innerHTML = '';
  
  appState.achievements.forEach(achievement => {
    const achievementElement = document.createElement('div');
    
    achievementElement.className = `bg-amber-50/80 backdrop-blur-sm rounded-lg p-4 shadow-md ${achievement.unlocked ? 'border-2 border-amber-500' : 'opacity-70'}`;
    achievementElement.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center text-lg font-bold text-amber-600">
          ${achievement.unlocked ? '✓' : '○'}
        </div>
        <div class="flex-1">
          <h3 class="font-bold text-sm">${achievement.name}</h3>
          <p class="text-xs opacity-80">${achievement.description}</p>
        </div>
        ${achievement.unlocked ? '<span class="ml-auto text-amber-500 text-xs font-bold">Unlocked</span>' : ''}
      </div>
    `;
    
    container.appendChild(achievementElement);
  });
}

function unlockAchievement(achievementId) {
  const achievement = appState.achievements.find(a => a.id === achievementId);
  
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true;
    showAchievementNotification(`Achievement unlocked: ${achievement.name}!`, 'achievement');
    renderAchievements();
    
    // Special case for Labubu Master achievement
    if (achievementId === 'ach8') {
      // Unlock a new pet
      const lockedPets = appState.pets.filter(p => !p.open);
      if (lockedPets.length > 0) {
        const randomPet = randomFromArray(lockedPets);
        randomPet.open = true;
        showAchievementNotification(`New pet unlocked: ${randomPet.name}!`, 'achievement');
        renderPetGrid(); // Refresh pet grid
      }
    }
  }
}

function checkAchievements(action) {
  // Check for specific achievements based on action
  if (action === 'feed') {
    appState.feedCount = (appState.feedCount || 0) + 1;
    
    if (appState.feedCount >= 10) {
      unlockAchievement('ach1'); // 10 Feedings in a Row
    }
  } else {
    // Reset feed count if doing other actions
    appState.feedCount = 0;
  }
  
  // Check happiness achievement
  if (appState.petStats.happy >= 0.99) {
    unlockAchievement('ach2'); // 100% Happiness
  }
  
  // Check coins achievement
  if (appState.coins >= 1000) {
    unlockAchievement('ach7'); // Coin Collector
  }
}

function checkShopAchievements() {
  // Count total purchased items
  const totalPurchased = Object.values(appState.ownedItems).flat().length;
  
  // Shopaholic achievement
  if (totalPurchased >= 5) {
    unlockAchievement('ach4'); // Shopaholic
  }
  
  // Check if all interior items are owned
  if (appState.ownedItems.interior.length >= SHOP_ITEMS.interior.length) {
    unlockAchievement('ach5'); // Decorator
  }
  
  // Check if all accessories are owned
  if (appState.ownedItems.accessories.length >= SHOP_ITEMS.accessories.length) {
    unlockAchievement('ach6'); // Fashion Icon
  }
}

// Settings functionality
function initSettings() {
  // Sound toggle
  $('#sound-toggle').checked = appState.settings.sound;
  $('#sound-toggle').addEventListener('change', (e) => {
    appState.settings.sound = e.target.checked;
    // Используем нашу функцию для управления звуком
    audioEnabled = e.target.checked;
    
    // Если звук включен, воспроизводим звук касания
    if (audioEnabled) {
      playSound('audio-touch');
    } else if (bgMusicPlaying) {
      // Если звук выключен, останавливаем фоновую музыку
      const bgMusic = document.getElementById('audio-background');
      if (bgMusic) {
        bgMusic.pause();
        bgMusicPlaying = false;
      }
    }
    
    // Сохраняем настройки
    saveGame();
  });
  
  // Добавляем кнопку для управления фоновой музыкой
  if ($('#music-toggle')) {
    // Устанавливаем состояние переключателя в соответствии с настройками
    $('#music-toggle').checked = appState.settings.music;
    $('#music-toggle').addEventListener('change', (e) => {
      // Сохраняем настройку в appState
      appState.settings.music = e.target.checked;
      
      // Управляем фоновой музыкой
      if (e.target.checked && !bgMusicPlaying && audioEnabled) {
        toggleBackgroundMusic();
      } else if (!e.target.checked && bgMusicPlaying) {
        toggleBackgroundMusic();
      }
      
      // Сохраняем настройки
      saveGame();
    });
  }
  
  // Language select
  $('#language-select').value = appState.settings.language;
  $('#language-select').addEventListener('change', (e) => {
    appState.settings.language = e.target.value;
  });
  
  // Обработчики кнопок сброса и исправления удалены по запросу пользователя
}

// Save and load game
function saveGame() {
  try {
    // Проверяем, что все необходимые объекты существуют
    if (!appState || !appState.pets || !Array.isArray(appState.pets)) {
      console.error('Cannot save game: appState or appState.pets is invalid');
      return;
    }
    
    // Сохраняем только необходимые данные, чтобы избежать проблем с циклическими ссылками
    const stateToSave = {
      coins: isNaN(appState.coins) ? 0 : Number(appState.coins),
      currentPetId: appState.currentPet ? appState.currentPet.id : null,
      petStats: appState.petStats || { happy: 0.75, hunger: 0.75, thirst: 0.75, sleep: 0.75, growth: 0.01 },
      pets: appState.pets.map(pet => ({
        id: pet.id,
        growth: isNaN(pet.growth) ? 0.01 : Number(pet.growth),
        growthStage: pet.growthStage || 'baby',
        mastered: Boolean(pet.mastered),
        open: Boolean(pet.open)
      })),
      ownedItems: appState.ownedItems || { interior: [], accessories: [], boosts: [] },
      activeBoosts: Array.isArray(appState.activeBoosts) ? appState.activeBoosts : [],
      achievements: Array.isArray(appState.achievements) ? appState.achievements : [],
      settings: appState.settings || { sound: true, language: 'en' },
      lastTimestamp: Date.now()
    };
    
    // Проверяем, что localStorage доступен
    if (typeof localStorage === 'undefined') {
      console.error('localStorage is not available');
      return;
    }
    
    localStorage.setItem('labubuGameState', JSON.stringify(stateToSave));
    console.log('Game saved successfully!');
  } catch (e) {
    console.error('Error saving game:', e);
  }
}

function loadGame() {
  try {
    // Проверяем, что localStorage доступен
    if (typeof localStorage === 'undefined') {
      console.error('localStorage is not available');
      return false;
    }
    
    const savedState = localStorage.getItem('labubuGameState');
    
    if (!savedState) {
      console.log('No saved game found');
      return false;
    }
    
    try {
      const parsedState = JSON.parse(savedState);
      
      // Проверяем, что данные валидны
      if (!parsedState || typeof parsedState !== 'object') {
        console.error('Invalid saved state format');
        return false;
      }
      
      // Сначала генерируем питомцев, чтобы иметь их в памяти
      generatePets();
      initAchievements();
      
      // Загружаем сохраненные данные с проверками
      // Проверяем, что значение монет не NaN
      const loadedCoins = parsedState.coins || 0;
      appState.coins = isNaN(Number(loadedCoins)) ? 0 : Number(loadedCoins);
      
      // Загружаем статистику с проверкой
      if (parsedState.petStats && typeof parsedState.petStats === 'object') {
        appState.petStats = {
          happy: typeof parsedState.petStats.happy === 'number' ? clamp(parsedState.petStats.happy, 0, 1) : 0.75,
          hunger: typeof parsedState.petStats.hunger === 'number' ? clamp(parsedState.petStats.hunger, 0, 1) : 0.75,
          thirst: typeof parsedState.petStats.thirst === 'number' ? clamp(parsedState.petStats.thirst, 0, 1) : 0.75,
          sleep: typeof parsedState.petStats.sleep === 'number' ? clamp(parsedState.petStats.sleep, 0, 1) : 0.75,
          growth: typeof parsedState.petStats.growth === 'number' ? clamp(parsedState.petStats.growth, 0, 1) : 0.01
        };
      }
      
      // Загружаем предметы с проверкой
      if (parsedState.ownedItems && typeof parsedState.ownedItems === 'object') {
        appState.ownedItems = {
          interior: Array.isArray(parsedState.ownedItems.interior) ? parsedState.ownedItems.interior : [],
          accessories: Array.isArray(parsedState.ownedItems.accessories) ? parsedState.ownedItems.accessories : [],
          boosts: Array.isArray(parsedState.ownedItems.boosts) ? parsedState.ownedItems.boosts : []
        };
      } else {
        appState.ownedItems = { interior: [], accessories: [], boosts: [] };
      }
      
      // Загружаем активные бусты и достижения
      appState.activeBoosts = Array.isArray(parsedState.activeBoosts) ? parsedState.activeBoosts : [];
      appState.achievements = Array.isArray(parsedState.achievements) ? parsedState.achievements : appState.achievements;
      
      // Загружаем настройки
      if (parsedState.settings && typeof parsedState.settings === 'object') {
        appState.settings = {
          sound: typeof parsedState.settings.sound === 'boolean' ? parsedState.settings.sound : true,
          music: typeof parsedState.settings.music === 'boolean' ? parsedState.settings.music : true,
          language: typeof parsedState.settings.language === 'string' ? parsedState.settings.language : 'en'
        };
      } else {
        appState.settings = { sound: true, music: true, language: 'en' };
      }
      
      // Загружаем индивидуальный прогресс роста каждого питомца
      if (parsedState.pets && Array.isArray(parsedState.pets)) {
        parsedState.pets.forEach(savedPet => {
          if (!savedPet || typeof savedPet !== 'object' || savedPet.id === undefined) return;
          
          const pet = appState.pets.find(p => p.id === savedPet.id);
          if (pet) {
            // Проверяем и преобразуем типы данных
            pet.growth = typeof savedPet.growth === 'number' ? clamp(savedPet.growth, 0, 1) : 0.01;
            pet.growthStage = ['baby', 'teen', 'ultra'].includes(savedPet.growthStage) ? savedPet.growthStage : 'baby';
            pet.mastered = Boolean(savedPet.mastered);
            pet.open = savedPet.open !== undefined ? Boolean(savedPet.open) : pet.open;
          }
        });
      }
      
      // Восстанавливаем текущего питомца, если он был выбран
      if (parsedState.currentPetId !== null && parsedState.currentPetId !== undefined) {
        appState.currentPet = appState.pets.find(p => p.id === parsedState.currentPetId) || null;
      }
      
      console.log('Game loaded successfully!');
      return true;
    } catch (e) {
      console.error('Error parsing saved game:', e);
      return false;
    }
  } catch (e) {
    console.error('Error loading game:', e);
    return false;
  }
}

function saveGame() {
  try {
    // Проверяем, что все необходимые объекты существуют
    if (!appState || !appState.pets || !Array.isArray(appState.pets)) {
      console.error('Cannot save game: appState or appState.pets is invalid');
      return;
    }
    
    // Сохраняем только необходимые данные, чтобы избежать проблем с циклическими ссылками
    const stateToSave = {
      coins: isNaN(appState.coins) ? 0 : Number(appState.coins),
      currentPetId: appState.currentPet ? appState.currentPet.id : null,
      petStats: appState.petStats || { happy: 0.75, hunger: 0.75, thirst: 0.75, sleep: 0.75, growth: 0.01 },
      pets: appState.pets.map(pet => ({
        id: pet.id,
        growth: isNaN(pet.growth) ? 0.01 : Number(pet.growth),
        growthStage: pet.growthStage || 'baby',
        mastered: Boolean(pet.mastered),
        open: Boolean(pet.open)
      })),
      ownedItems: appState.ownedItems || { interior: [], accessories: [], boosts: [] },
      activeBoosts: Array.isArray(appState.activeBoosts) ? appState.activeBoosts : [],
      achievements: Array.isArray(appState.achievements) ? appState.achievements : [],
      settings: appState.settings || { sound: true, language: 'en' },
      lastTimestamp: Date.now()
    };
    
    // Проверяем, что localStorage доступен
    if (typeof localStorage === 'undefined') {
      console.error('localStorage is not available');
      return;
    }
    
    localStorage.setItem('labubuGameState', JSON.stringify(stateToSave));
    console.log('Game saved successfully!');
  } catch (e) {
    console.error('Error saving game:', e);
  }
}

// Функция для перевода текста
function translate(key, params) {
  // Получаем текущий язык из настроек
  const currentLang = appState.settings?.language || 'en';
  
  // Получаем перевод из словаря
  let translation = TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['en'][key] || key;
  
  // Заменяем параметры, если они есть
  if (params) {
    for (let i = 0; i < params.length; i++) {
      translation = translation.replace(`{${i}}`, params[i]);
    }
  }
  
  return translation;
}

// Функция для обновления всех текстов на странице
function updateAllTexts() {
  // Обновляем навигацию
  $$('.nav-link').forEach(link => {
    const target = link.dataset.target;
    if (target === 'screen-room') link.textContent = translate('nav_pet');
    if (target === 'screen-shop') link.textContent = translate('nav_shop');
    if (target === 'screen-select') link.textContent = translate('nav_pets');
    if (target === 'screen-achievements') link.textContent = translate('nav_achievements');
    if (target === 'screen-help') link.textContent = translate('nav_help');
    if (target === 'screen-settings') link.textContent = translate('nav_settings');
  });
  
  // Обновляем заголовки экранов
  $('#screen-shop h1').textContent = translate('shop_title');
  $('#screen-select h1').textContent = translate('choose_labubu');
  $('#screen-settings h1').textContent = translate('settings');
  $('#screen-settings h2').textContent = translate('game_settings');
  
  // Обновляем кнопки действий
  $$('.action-btn').forEach(btn => {
    const action = btn.dataset.action;
    btn.querySelector('span').textContent = translate(action);
  });
  
  // Обновляем вкладки магазина
  $$('.shop-tab').forEach(tab => {
    const tabName = tab.dataset.tab;
    tab.textContent = translate(tabName);
  });
  
  // Обновляем настройки
  $('#screen-settings label[for="sound-toggle"]').textContent = translate('enable_sound');
  $('#screen-settings label[for="music-toggle"]').textContent = translate('enable_music');
  $('#screen-settings .font-bold.text-sm').forEach(label => {
    if (label.textContent.includes('Sound')) label.textContent = translate('sound');
    if (label.textContent.includes('Language')) label.textContent = translate('language');
  });
}

// Функция инициализации настроек
function initSettings() {
  console.log('Initializing settings...');
  
  // Инициализируем настройки, если их нет
  if (!appState.settings) {
    appState.settings = { sound: true, music: false, language: 'en' };
  }
  
  // Звуковые настройки
  $('#sound-toggle').checked = appState.settings.sound !== false;
  $('#sound-toggle').addEventListener('change', (e) => {
    appState.settings.sound = e.target.checked;
    audioEnabled = e.target.checked;
    saveGame();
  });
  
  // Настройки музыки
  $('#music-toggle').checked = appState.settings.music === true;
  $('#music-toggle').addEventListener('change', (e) => {
    appState.settings.music = e.target.checked;
    if (!e.target.checked && bgMusicPlaying) {
      toggleBackgroundMusic();
    } else if (e.target.checked && userInteracted && !bgMusicPlaying) {
      toggleBackgroundMusic();
    }
    saveGame();
  });
  
  // Настройки языка
  const languageSelect = $('#language-select');
  languageSelect.value = appState.settings.language || 'en';
  languageSelect.addEventListener('change', (e) => {
    appState.settings.language = e.target.value;
    updateAllTexts();
    saveGame();
  });
  
  // Обновляем тексты при инициализации
  updateAllTexts();
}

function initGame() {
  try {
    console.log('Initializing game...');
    
    // Инициализируем звуки
    audioEnabled = appState.settings?.sound !== false;
    
    // Инициализируем кнопку воспроизведения музыки
    initMusicButton();
    
    // Останавливаем игровой цикл, если он был запущен
    if (window.gameLoopInterval) {
      clearInterval(window.gameLoopInterval);
      window.gameLoopInterval = null;
      console.log('Existing game loop stopped during initialization');
    }
    
    // Try to load saved game
    const gameLoaded = loadGame();
    
    if (!gameLoaded) {
      // First time setup
      console.log('No saved game found, generating new game...');
      generatePets();
      initAchievements();
    }
    
    // Initialize UI
    renderPetGrid();
    bindNav();
    bindActions();
    initShop();
    initSettings();
    
    // Добавляем обработчик видимости вкладки
    handleTabVisibility();
    
    // Если есть выбранный питомец, сразу переходим к нему
    if (appState.currentPet) {
      console.log('Current pet found, selecting pet...');
      selectPet(appState.currentPet);
    } else {
      // Если нет выбранного питомца, останавливаем игровой цикл, если он запущен
      if (window.gameLoopInterval) {
        clearInterval(window.gameLoopInterval);
        window.gameLoopInterval = null;
        console.log('Game loop stopped due to no pet selected');
      }
      // Обновляем интерфейс без выбранного питомца
      updateAllStats();
      // Переходим на экран выбора питомца
      switchScreen('screen-select');
    }
    
    console.log('Game initialization completed successfully');
  } catch (e) {
    console.error('Error during game initialization:', e);
    // В случае ошибки при инициализации переходим на экран выбора питомца
    try {
      switchScreen('screen-select');
    } catch (navError) {
      console.error('Failed to navigate to select screen:', navError);
    }
  }
}

// Функция обработки видимости вкладки
function handleTabVisibility() {
  // Переменная для хранения состояния игрового цикла при переключении вкладки
  let wasGameLoopRunning = false;
  
  // Обработчик изменения видимости вкладки
  document.addEventListener('visibilitychange', () => {
    try {
      if (document.hidden) {
        // Вкладка скрыта - приостанавливаем игровой цикл
        wasGameLoopRunning = window.gameLoopInterval !== null;
        if (wasGameLoopRunning) {
          clearInterval(window.gameLoopInterval);
          window.gameLoopInterval = null;
          console.log('Game loop paused due to tab visibility change');
          
          // Сохраняем игру при скрытии вкладки
          try {
            saveGame();
          } catch (e) {
            console.error('Error saving game on tab hide:', e);
          }
        }
      } else {
        // Вкладка снова видима - возобновляем игровой цикл, если он был запущен
        if (wasGameLoopRunning && appState.currentPet) {
          // Обновляем время последнего обновления
          appState.lastTimestamp = Date.now();
          startGameLoop();
          console.log('Game loop resumed after tab visibility change');
        }
      }
    } catch (e) {
      console.error('Error handling tab visibility change:', e);
    }
  });
}
  
// Сохраняем игру при закрытии или обновлении страницы
window.addEventListener('beforeunload', saveGame);

// Сохраняем игру каждые 30 секунд, но только если страница активна
let saveInterval;

// Функция безопасного сохранения
const safeSave = () => {
  try {
    saveGame();
  } catch (e) {
    console.error('Error during auto-save:', e);
  }
};

// Запускаем автосохранение
saveInterval = setInterval(safeSave, 30000); // Save every 30 seconds

// Останавливаем автосохранение, когда страница неактивна
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(saveInterval);
  } else {
    clearInterval(saveInterval);
    saveInterval = setInterval(safeSave, 30000);
  }
});
// Сохраняем игру при любом действии с питомцем
$$('.action-btn').forEach(btn => {
  btn.addEventListener('click', saveGame);
});

// Start on selection screen
switchScreen('screen-select');

// Start the game
initGame();
