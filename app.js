const mealForm = document.querySelector("#mealForm");
const mealName = document.querySelector("#mealName");
const mealCalories = document.querySelector("#mealCalories");
const mealTime = document.querySelector("#mealTime");
const mealCategory = document.querySelector("#mealCategory");
const mealList = document.querySelector("#mealList");
const totalCalories = document.querySelector("#totalCalories");
const remainingCalories = document.querySelector("#remainingCalories");
const dailyGoal = document.querySelector("#dailyGoal");
const progressBar = document.querySelector("#progressBar");
const progressHint = document.querySelector("#progressHint");
const emptyState = document.querySelector("#emptyState");
const clearAll = document.querySelector("#clearAll");

const storageKey = "calorie-tracker-data";

const state = {
  meals: [],
  goal: 0,
};

const formatCalories = (value) => `${Math.round(value)} kcal`;

const saveState = () => {
  localStorage.setItem(storageKey, JSON.stringify(state));
};

const loadState = () => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    state.meals = Array.isArray(parsed.meals) ? parsed.meals : [];
    state.goal = Number(parsed.goal) || 0;
  } catch (error) {
    console.warn("Konnte Daten nicht laden", error);
  }
};

const updateSummary = () => {
  const total = state.meals.reduce((sum, meal) => sum + meal.calories, 0);
  totalCalories.textContent = formatCalories(total);

  const goalValue = state.goal;
  const remaining = Math.max(goalValue - total, 0);
  remainingCalories.textContent = goalValue
    ? formatCalories(remaining)
    : "-";

  if (!goalValue) {
    progressBar.style.width = "0";
    progressHint.textContent = "Setze dein Tagesziel, um den Fortschritt zu sehen.";
    return;
  }

  const progress = Math.min((total / goalValue) * 100, 100);
  progressBar.style.width = `${progress}%`;
  progressHint.textContent = total > goalValue
    ? "Ziel überschritten – neue Balance für den Rest des Tages finden."
    : "Super! Du bist auf Kurs.";
};

const renderMeals = () => {
  mealList.innerHTML = "";
  if (!state.meals.length) {
    mealList.appendChild(emptyState);
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  state.meals
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time))
    .forEach((meal) => {
      const item = document.createElement("div");
      item.className = "log__item";

      const info = document.createElement("div");
      const name = document.createElement("h3");
      name.textContent = meal.name;
      const meta = document.createElement("div");
      meta.className = "log__meta";
      meta.innerHTML = `
        <span>${meal.category}</span>
        <span>${meal.time}</span>
      `;

      info.appendChild(name);
      info.appendChild(meta);

      const calories = document.createElement("div");
      calories.className = "log__calories";
      calories.textContent = formatCalories(meal.calories);

      item.appendChild(info);
      item.appendChild(calories);
      mealList.appendChild(item);
    });
};

const addMeal = (meal) => {
  state.meals.push(meal);
  saveState();
  renderMeals();
  updateSummary();
};

const initializeGoal = () => {
  dailyGoal.value = state.goal ? state.goal : "";
  dailyGoal.addEventListener("input", (event) => {
    state.goal = Number(event.target.value) || 0;
    saveState();
    updateSummary();
  });
};

mealForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addMeal({
    name: mealName.value.trim(),
    calories: Number(mealCalories.value),
    time: mealTime.value,
    category: mealCategory.value,
  });

  mealForm.reset();
  mealTime.value = new Date().toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  mealName.focus();
});

clearAll.addEventListener("click", () => {
  state.meals = [];
  saveState();
  renderMeals();
  updateSummary();
});

const setDefaultTime = () => {
  const now = new Date();
  mealTime.value = now.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

loadState();
initializeGoal();
setDefaultTime();
renderMeals();
updateSummary();
