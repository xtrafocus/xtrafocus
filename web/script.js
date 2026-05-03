// =========================
// HELPERS
// =========================
const $ = (selector, root = document) => root.querySelector(selector);
const 
$$
= (selector, root = document) => [...root.querySelectorAll(selector)];

function formatEuros(n, compact = false) {
  if (!Number.isFinite(n)) return "—";

  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);

  if (compact) {
    if (abs >= 1000000) return `${sign}${(abs / 1000000).toFixed(2).replace(".", ",")} M€`;
    if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1).replace(".", ",")} K€`;
  }

  return `${sign}${Math.round(abs).toLocaleString("es-ES")} €`;
}

function formatNumber(n, digits = 0) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("es-ES", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function safeMonthlyFutureValue(payment, monthlyRate, months) {
  if (!Number.isFinite(payment) || !Number.isFinite(monthlyRate) || !Number.isFinite(months)) return 0;
  if (months <= 0) return 0;
  if (monthlyRate === 0) return payment * months;
  return payment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

function safeLoanPayment(loan, monthlyRate, months) {
  if (!Number.isFinite(loan) || !Number.isFinite(monthlyRate) || !Number.isFinite(months)) return 0;
  if (loan <= 0 || months <= 0) return 0;
  if (monthlyRate === 0) return loan / months;

  return loan * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
}

function brutToNet(bruto) {
  if (!Number.isFinite(bruto) || bruto <= 0) return 0;

  let irpf;
  if (bruto <= 12450) irpf = 0.19;
  else if (bruto <= 20200) irpf = 0.24;
  else if (bruto <= 35200) irpf = 0.30;
  else if (bruto <= 60000) irpf = 0.37;
  else irpf = 0.45;

  const segSocial = 0.064;
  return (bruto * (1 - irpf - segSocial)) / 12;
}

// =========================
// SCROLL SUAVE
// =========================
$$
("[data-scroll]").forEach((el) => {
  el.addEventListener("click", () => {
    const target = el.getAttribute("data-scroll");
    const node = $(target);
    if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// =========================
// MODALES
// =========================
let lastFocusedElement = null;

function openModal(type) {
  const modal = document.getElementById(`modal-${type}`);
  if (!modal) return;

  lastFocusedElement = document.activeElement;
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  const firstFocusable = modal.querySelector("button, input, select, textarea");
  if (firstFocusable) firstFocusable.focus();
}

function closeModal(type) {
  const modal = document.getElementById(`modal-${type}`);
  if (!modal) return;

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocusedElement) lastFocusedElement.focus();
}

function closeActiveModal() {
  const active = $(".modal-overlay.active");
  if (!active) return;
  active.classList.remove("active");
  active.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocusedElement) lastFocusedElement.focus();
}


$$
("[data-open]").forEach((el) => {
  el.addEventListener("click", () => {
    const type = el.getAttribute("data-open");
    openModal(type);
  });
});
$$
("[data-close]").forEach((el) => {
  el.addEventListener("click", () => {
    const type = el.getAttribute("data-close");
    closeModal(type);
  });
});


$$
(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeActiveModal();
  }
});
$$
(".tool-card").forEach((card) => {
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const type = card.getAttribute("data-open");
      if (type) openModal(type);
    }
  });
});

// =========================
// QUIZ
// =========================
const quizAnswers = {};
let currentStep = 1;
const TOTAL_STEPS = 7;

function updateProgressBar() {
  const pct = ((currentStep - 1) / TOTAL_STEPS) * 100;
  const bar = $("#quiz-progress-bar");
  const label = $("#quiz-step-label");

  if (bar) bar.style.width = `${pct}%`;
  if (label) {
    label.textContent = currentStep <= TOTAL_STEPS
      ? `Pregunta ${currentStep} de ${TOTAL_STEPS}`
      : "Tu resultado";
  }
}

function showQuizStep(step) {
  
$$
(".quiz-step").forEach((s) => s.classList.remove("active"));
  const target = document.getElementById(`step-${step}`);
  if (target) {
    target.classList.add("active");
    currentStep = step;
    updateProgressBar();
  }
}

function resetQuiz() {
  Object.keys(quizAnswers).forEach((key) => delete quizAnswers[key]);
  currentStep = 1;
$$
(".quiz-option").forEach((o) => o.classList.remove("selected"));
  
$$
(".quiz-next").forEach((btn) => btn.disabled = true);

  const quizSteps = $("#quiz-steps");
  const quizResult = $("#quiz-result");

  if (quizSteps) quizSteps.style.display = "block";
  if (quizResult) {
    quizResult.hidden = true;
    quizResult.classList.remove("show");
  }

  const step1 = $("#step-1");
  if (step1) {
$$
(".quiz-step").forEach((s) => s.classList.remove("active"));
    step1.classList.add("active");
  }

  updateProgressBar();
}


$$
(".quiz-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    const step = btn.closest(".quiz-step");
    if (!step) return;

    const key = btn.dataset.key;
    const value = btn.dataset.value;
    const stepNum = Number(step.id.replace("step-", ""));
$$
(".quiz-option", step).forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    quizAnswers[key] = value;

    if (stepNum < TOTAL_STEPS) {
      const nextBtn = $(`.quiz-next[data-next="${stepNum}"]`);
      if (nextBtn) nextBtn.disabled = false;
    } else {
      const finishBtn = $("#quiz-finish");
      if (finishBtn) finishBtn.disabled = false;
    }
  });
});


$$
(".quiz-next[data-next]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const from = Number(btn.dataset.next);
    showQuizStep(from + 1);
  });
});

$("#quiz-finish")?.addEventListener("click", generateRoadmap);
$("#reset-quiz-btn")?.addEventListener("click", resetQuiz);

function buildSteps(data) {
  const steps = [];

  if (data.deudas === "tarjetas" || data.deudas === "varias") {
    steps.push({
      title: "Eliminar deuda de alto interés",
      desc: "Antes de pensar en escalar patrimonio, reduce el coste financiero que más te frena. La deuda cara suele ser la primera fuga importante.",
      tag: "Prioridad inmediata"
    });
  }

  if (data.emergencia === "no") {
    steps.push({
      title: "Crear un colchón mínimo",
      desc: "Empieza por construir una primera reserva líquida que te proteja de imprevistos. Sin una base estable, cualquier plan se vuelve frágil.",
      tag: "Base"
    });
  } else if (data.emergencia === "poco" || data.emergencia === "medio") {
    steps.push({
      title: "Completar tu fondo de emergencia",
      desc: "Refuerza el ahorro líquido hasta que tu situación sea menos vulnerable. La tranquilidad financiera también es una ventaja estratégica.",
      tag: "Estabilidad"
    });
  }

  if (data.empleo === "sin_trabajo") {
    steps.push({
      title: "Recuperar tracción en ingresos",
      desc: "En este momento tu prioridad no es optimizar, sino estabilizar. Ordenar el flujo de ingresos cambia por completo el resto del plan.",
      tag: "Crítico"
    });
  } else if (data.ingresos === "menos1000") {
    steps.push({
      title: "Subir tu capacidad de ingresos",
      desc: "Cuando el margen es pequeño, la mejor palanca no siempre es recortar más, sino aumentar tu valor, empleabilidad o ingresos adicionales.",
      tag: "Palanca principal"
    });
  } else if (data.ingresos === "1000_2000") {
    steps.push({
      title: "Optimizar tu sistema de gastos",
      desc: "Con ingresos medios, la diferencia suele estar en el diseño del sistema: automatización, control de fijos y menos fricción al ahorrar.",
      tag: "Impacto rápido"
    });
  }

  if (data.inversion === "no") {
    steps.push({
      title: "Empezar a invertir de forma sencilla",
      desc: "No necesitas complejidad para comenzar. Prioriza consistencia, horizonte largo y una estrategia clara antes que la perfección.",
      tag: "Siguiente paso"
    });
  } else if (data.inversion === "pensando") {
    steps.push({
      title: "Convertir intención en ejecución",
      desc: "Esperar demasiado también tiene coste. Una estrategia imperfecta pero constante suele ganar a la indecisión permanente.",
      tag: "Momento de actuar"
    });
  } else if (data.inversion === "poco") {
    steps.push({
      title: "Escalar aportaciones y revisar estructura",
      desc: "Si ya has empezado, ahora el foco está en mejorar disciplina, aportaciones y eficiencia general del sistema.",
      tag: "Crecimiento"
    });
  } else if (data.inversion === "activo") {
    steps.push({
      title: "Optimizar cartera y decisiones avanzadas",
      desc: "Cuando la base ya está construida, el siguiente salto suele venir de mejorar la calidad de las decisiones y reducir ineficiencias.",
      tag: "Optimización"
    });
  }

  const objectiveMap = {
    salir_deudas: {
      title: "Diseñar un plan de salida de deudas",
      desc: "Ordenar saldos, intereses y estrategia no solo mejora números: también reduce presión mental y te devuelve margen.",
      tag: "Objetivo principal"
    },
    ahorrar: {
      title: "Automatizar tu ahorro",
      desc: "La manera más eficaz de ahorrar suele ser quitarle protagonismo a la fuerza de voluntad y dárselo al sistema.",
      tag: "Objetivo principal"
    },
    invertir: {
      title: "Definir una estrategia de inversión clara",
      desc: "A largo plazo, la claridad suele valer más que la sofisticación. Cuanto mejor entiendas tu plan, más probable es que lo mantengas.",
      tag: "Objetivo principal"
    },
    casa: {
      title: "Preparar compra de vivienda con criterio",
      desc: "La vivienda no se decide solo por cuota. También importa el margen que te deja y la flexibilidad que pierdes o ganas.",
      tag: "Objetivo principal"
    },
    negocio: {
      title: "Emprender con base financiera sólida",
      desc: "Una buena idea mejora mucho cuando no la sometes a urgencia económica. Más margen suele significar mejores decisiones.",
      tag: "Objetivo principal"
    },
    libertad: {
      title: "Trazar tu ruta hacia libertad financiera",
      desc: "La combinación de ahorro, tiempo y crecimiento del capital suele pesar más que intentar encontrar atajos.",
      tag: "Objetivo principal"
    }
  };

  if (objectiveMap[data.objetivo]) {
    steps.push(objectiveMap[data.objetivo]);
  }

  if (data.tiempo === "nada") {
    steps.push({
      title: "Montar un sistema en automático",
      desc: "Si apenas tienes tiempo, necesitas menos decisiones repetitivas y más automatización inteligente.",
      tag: "Modo pasivo"
    });
  } else if (data.tiempo === "poco") {
    steps.push({
      title: "Rutina mínima de control",
      desc: "Con poco tiempo, una revisión breve pero constante puede darte mucha más claridad de la que parece.",
      tag: "Modo eficiente"
    });
  } else {
    steps.push({
      title: "Aprovechar tiempo para profundizar",
      desc: "Si puedes dedicar más tiempo, aprovéchalo para mejorar criterio, no para sobrecomplicar tu sistema.",
      tag: "Modo crecimiento"
    });
  }

  steps.push({
    title: "Revisar tu plan cada trimestre",
    desc: "No hace falta revisar todo cada semana. Un ciclo trimestral suele ser suficiente para ajustar y seguir avanzando.",
    tag: "Hábito permanente"
  });

  return steps;
}

function buildInsight(data) {
  const insights = {
    libertad: "Tu objetivo requiere paciencia, disciplina y un sistema sostenible. La ventaja real viene de mantener buenas decisiones durante años.",
    negocio: "Emprender bien no es solo tener ambición, sino también tener margen. La base financiera cambia mucho la calidad del riesgo que asumes.",
    casa: "La vivienda puede ser una gran decisión o una carga muy rígida. La diferencia suele estar en cuánto aire te deja después.",
    invertir: "Invertir bien suele ser más simple de lo que parece: claridad, constancia y tiempo.",
    ahorrar: "Ahorrar no es el fin, pero sí la base que permite todo lo demás.",
    salir_deudas: "Salir de deuda suele producir un doble beneficio: liberas dinero y recuperas sensación de control."
  };

  return insights[data.objetivo] ||
    "La mejora financiera rara vez viene de un gran gesto aislado. Normalmente llega de varias decisiones pequeñas bien mantenidas en el tiempo.";
}

function generateRoadmap() {
  const quizSteps = $("#quiz-steps");
  const quizResult = $("#quiz-result");

  if (!quizSteps || !quizResult) return;

  $("#quiz-progress-bar").style.width = "100%";
  $("#quiz-step-label").textContent = "Tu resultado";

  quizSteps.style.display = "none";
  quizResult.hidden = false;
  quizResult.classList.add("show");

  const { empleo, ingresos, deudas, emergencia, inversion, objetivo, tiempo } = quizAnswers;

  const hasDebt = deudas === "tarjetas" || deudas === "varias";
  const noEmergency = emergencia === "no" || emergencia === "poco";
  const notInvesting = inversion === "no" || inversion === "pensando";
  const lowIncome = ingresos === "menos1000";
  const noJob = empleo === "sin_trabajo";

  let level = "";
  let levelLabel = "";

  if (hasDebt || lowIncome || noJob) {
    level = "Nivel 1 — Estabilidad";
    levelLabel = "Primero toca construir base y reducir fragilidad.";
  } else if (noEmergency || notInvesting) {
    level = "Nivel 2 — Construcción";
    levelLabel = "Ya tienes estructura inicial; ahora toca fortalecerla.";
  } else if (inversion === "poco") {
    level = "Nivel 3 — Crecimiento";
    levelLabel = "Tu sistema ya avanza. El siguiente paso es escalarlo.";
  } else {
    level = "Nivel 4 — Optimización";
    levelLabel = "Ahora el juego está en refinar, proteger y optimizar.";
  }

  $("#roadmap-level-badge").textContent = level;
  $("#roadmap-level-label").textContent = levelLabel;

  const steps = buildSteps({ empleo, ingresos, deudas, emergencia, inversion, objetivo, tiempo });
  const container = $("#roadmap-steps-container");
  container.innerHTML = "";

  steps.forEach((step, i) => {
    const el = document.createElement("div");
    el.className = "roadmap-step";
    el.innerHTML = `
      <div class="roadmap-step-number">${i + 1}</div>
      <div class="roadmap-step-content">
        <div class="roadmap-step-title">${step.title}</div>
        <div class="roadmap-step-desc">${step.desc}</div>
        <div class="roadmap-step-tag">${step.tag}</div>
      </div>
    `;
    container.appendChild(el);
  });

  $("#roadmap-insight-box").innerHTML = buildInsight({ objetivo });
}

// =========================
// LIBERTAD FINANCIERA
// =========================
$("#calc-freedom-btn")?.addEventListener("click", calcFreedom);

function calcFreedom() {
  const age = parseFloat($("#f-age").value) || 30;
  const income = parseFloat($("#f-income").value);
  const expenses = parseFloat($("#f-expenses").value);
  const savings = parseFloat($("#f-savings").value) || 0;
  const returnRate = (parseFloat($("#f-return").value) || 7) / 100;

  if (!income || !expenses) {
    showToast("Introduce ingresos y gastos para calcular.");
    return;
  }

  if (income <= 0 || expenses < 0 || savings < 0) {
    showToast("Revisa los valores introducidos.");
    return;
  }

  const monthlySavings = income - expenses;
  const savingsRate = income > 0 ? (monthlySavings / income) * 100 : 0;
  const annualExpenses = expenses * 12;
  const capitalNeeded = annualExpenses * 25;

  if (monthlySavings <= 0) {
    $("#r-freedom-years").textContent = "∞";
    $("#r-freedom-age").textContent = "—";
    $("#r-freedom-capital").textContent = formatEuros(capitalNeeded);
    $("#r-freedom-monthly").textContent = formatEuros(monthlySavings);
    $("#r-freedom-rate").textContent = `${formatNumber(savingsRate, 0)}%`;
    $("#r-freedom-insight").textContent =
      "Con tus datos actuales no estás generando ahorro mensual positivo. Antes de proyectar libertad financiera, necesitas crear margen entre ingresos y gastos.";
    $("#result-freedom").classList.add("show");
    return;
  }

  let capital = savings;
  let months = 0;
  const monthlyReturn = returnRate / 12;

  while (capital < capitalNeeded && months < 1200) {
    capital = capital * (1 + monthlyReturn) + monthlySavings;
    months++;
  }

  const yearsToFreedom = Math.ceil(months / 12);
  const freedomAge = age + yearsToFreedom;

  $("#r-freedom-years").textContent = yearsToFreedom >= 100 ? "100+" : yearsToFreedom;
  $("#r-freedom-age").textContent = `${freedomAge} años`;
  $("#r-freedom-capital").textContent = formatEuros(capitalNeeded);
  $("#r-freedom-monthly").textContent = formatEuros(monthlySavings);
  $("#r-freedom-rate").textContent = `${formatNumber(savingsRate, 0)}%`;

  let insight = "";
  if (savingsRate < 10) {
    insight = "Tu tasa de ahorro es baja. La palanca más fuerte probablemente no esté en buscar más rentabilidad, sino en generar más margen.";
  } else if (savingsRate < 30) {
    insight = "Vas en buena dirección. Mejorar un poco tu tasa de ahorro podría adelantarte varios años.";
  } else {
    insight = "Tu tasa de ahorro es fuerte. Mantener esta disciplina en el tiempo puede acelerar mucho tu camino.";
  }

  $("#r-freedom-insight").textContent = insight;
  $("#result-freedom").classList.add("show");
}

// =========================
// COSTE COCHE
// =========================
$("#calc-car-btn")?.addEventListener("click", calcCar);

function calcCar() {
  const price = parseFloat($("#c-price").value) || 0;
  const insurance = parseFloat($("#c-insurance").value) || 0;
  const fuel = parseFloat($("#c-fuel").value) || 0;
  const maintenance = parseFloat($("#c-maintenance").value) || 0;
  const years = parseFloat($("#c-years").value) || 5;

  if (price <= 0 || years <= 0) {
    showToast("Introduce precio del coche y años válidos.");
    return;
  }

  const depreciation = price * 0.15 + price * 0.10 * Math.max(0, years - 1);
  const fuelTotal = fuel * 12 * years;
  const insuranceTotal = insurance * years;
  const maintenanceTotal = maintenance * years;
  const itv = Math.floor(years / 2) * 50;

  const total = depreciation + fuelTotal + insuranceTotal + maintenanceTotal + itv;
  const perYear = total / years;
  const perMonth = total / (years * 12);
  const perDay = total / (years * 365);
  const kmTotal = years * 15000;
  const perKm = total / kmTotal;

  $("#r-car-total").textContent = formatEuros(total);
  $("#r-car-year").textContent = formatEuros(perYear);
  $("#r-car-month").textContent = `${formatEuros(perMonth)}/mes`;
  $("#r-car-day").textContent = `${formatNumber(perDay, 1)} €/día`;
  $("#r-car-km").textContent = `${formatNumber(perKm, 2)} €/km`;

  const depPct = total > 0 ? (depreciation / total) * 100 : 0;
  $("#r-car-insight").textContent =
    `La depreciación representa aproximadamente ${formatNumber(depPct, 0)}% del coste estimado. El coche suele costar más por sostenerlo que por comprarlo.`;

  $("#result-car").classList.add("show");
}

// =========================
// INVERSIÓN
// =========================
$("#calc-invest-btn")?.addEventListener("click", calcInvest);

function calcInvest() {
  const initial = parseFloat($("#i-initial").value) || 0;
  const monthly = parseFloat($("#i-monthly").value) || 0;
  const returnRate = (parseFloat($("#i-return").value) || 7) / 100;
  const years = parseFloat($("#i-years").value) || 20;

  if (initial <= 0 && monthly <= 0) {
    showToast("Introduce capital inicial o aportación mensual.");
    return;
  }

  if (years <= 0 || returnRate < 0) {
    showToast("Revisa plazo y rentabilidad.");
    return;
  }

  const monthlyRate = returnRate / 12;
  const months = years * 12;
  const initialGrown = initial * Math.pow(1 + monthlyRate, months);
  const monthlyGrown = safeMonthlyFutureValue(monthly, monthlyRate, months);
  const total = initialGrown + monthlyGrown;
  const contributed = initial + monthly * months;
  const gains = total - contributed;
  const multiplier = contributed > 0 ? total / contributed : 0;
  const monthlyIncome = (total * 0.04) / 12;

  $("#r-invest-total").textContent = formatEuros(total);
  $("#r-invest-contributed").textContent = formatEuros(contributed);
  $("#r-invest-gains").textContent = formatEuros(gains);
  $("#r-invest-multiplier").textContent = `x${formatNumber(multiplier, 2)}`;
  $("#r-invest-monthly-income").textContent = `${formatEuros(monthlyIncome)}/mes`;

  if (returnRate === 0) {
    $("#r-invest-insight").textContent =
      "Sin rentabilidad, el crecimiento depende solo de tus aportaciones. Aun así, la constancia ya construye patrimonio.";
  } else {
    $("#r-invest-insight").textContent =
      "En horizontes largos, el tiempo suele ser tan importante como la cantidad invertida. Retrasarse puede costar mucho más de lo que parece.";
  }

  $("#result-invest").classList.add("show");
}

// =========================
// ALQUILER VS COMPRA
// =========================
$("#calc-rent-btn")?.addEventListener("click", calcRent);

function calcRent() {
  const price = parseFloat($("#h-price").value) || 0;
  const down = parseFloat($("#h-down").value) || 0;
  const rent = parseFloat($("#h-rent").value) || 0;
  const rate = (parseFloat($("#h-rate").value) || 3.5) / 100;
  const years = parseFloat($("#h-years").value) || 30;

  if (price <= 0 || rent <= 0 || years <= 0) {
    showToast("Introduce precio, alquiler y plazo válidos.");
    return;
  }

  if (down < 0 || down > price) {
    showToast("La entrada no puede ser negativa ni mayor que el precio.");
    return;
  }

  const loan = price - down;
  const monthlyRate = rate / 12;
  const months = years * 12;

  const mortgage = safeLoanPayment(loan, monthlyRate, months);
  const gastosCompra = price * 0.10;
  const ibi = price * 0.005 * years;
  const totalBuy = down + mortgage * months + gastosCompra + ibi;

  let totalRent = 0;
  let currentRent = rent;
  for (let y = 0; y < years; y++) {
    totalRent += currentRent * 12;
    currentRent *= 1.03;
  }

  let breakEven = 0;
  let cumBuy = down + gastosCompra;
  let cumRent = 0;
  let r = rent;

  for (let y = 1; y <= 100; y++) {
    cumBuy += mortgage * 12 + price * 0.005;
    cumRent += r * 12;
    r *= 1.03;
    if (cumBuy <= cumRent) {
      breakEven = y;
      break;
    }
  }

  const isBetter = mortgage < rent ? "Comprar" : "Alquilar";

  $("#r-rent-verdict").textContent = isBetter;
  $("#r-rent-verdict-label").textContent =
    isBetter === "Comprar"
      ? "La cuota estimada es inferior al alquiler actual"
      : "El alquiler parece más ligero en el corto plazo";

  $("#r-rent-mortgage").textContent = `${formatEuros(mortgage)}/mes`;
  $("#r-rent-total-cost").textContent = formatEuros(totalBuy);
  $("#r-rent-total-rent").textContent = formatEuros(totalRent);
  $("#r-rent-break").textContent = breakEven > 0 ? `${breakEven} años` : "+50 años";

  $("#r-rent-insight").textContent =
    breakEven > 0
      ? `Según este modelo, comprar podría empezar a compensar a partir del año ${breakEven}. Si no planeas quedarte tanto tiempo, alquilar puede tener más sentido.`
      : "Con este escenario, comprar no adelanta claramente al alquiler en un plazo razonable. La flexibilidad del alquiler puede tener más valor ahora.";

  $("#result-rent").classList.add("show");
}

// =========================
// SUELDOS
// =========================
const salaryDB = {
  tech:         { junior: [18000, 24000, 32000], medio: [28000, 38000, 50000], senior: [45000, 58000, 80000], experto: [65000, 85000, 120000] },
  marketing:    { junior: [16000, 20000, 26000], medio: [22000, 28000, 38000], senior: [32000, 42000, 55000], experto: [45000, 60000, 80000] },
  finanzas:     { junior: [18000, 23000, 30000], medio: [26000, 34000, 48000], senior: [40000, 55000, 75000], experto: [60000, 80000, 110000] },
  salud:        { junior: [20000, 26000, 32000], medio: [28000, 36000, 46000], senior: [38000, 50000, 65000], experto: [55000, 70000, 90000] },
  educacion:    { junior: [16000, 20000, 25000], medio: [20000, 25000, 32000], senior: [25000, 32000, 42000], experto: [32000, 40000, 55000] },
  logistica:    { junior: [15000, 19000, 24000], medio: [20000, 26000, 34000], senior: [28000, 36000, 48000], experto: [38000, 50000, 65000] },
  construccion: { junior: [17000, 22000, 28000], medio: [24000, 30000, 40000], senior: [34000, 45000, 60000], experto: [48000, 62000, 85000] },
  hosteleria:   { junior: [14000, 17000, 22000], medio: [18000, 23000, 30000], senior: [24000, 32000, 42000], experto: [35000, 46000, 62000] },
  legal:        { junior: [18000, 23000, 30000], medio: [26000, 34000, 46000], senior: [38000, 52000, 70000], experto: [55000, 75000, 100000] },
  otro:         { junior: [15000, 20000, 26000], medio: [20000, 27000, 36000], senior: [28000, 38000, 52000], experto: [40000, 55000, 75000] }
};

const cityMultiplier = {
  madrid: 1.15,
  barcelona: 1.12,
  bilbao: 1.08,
  valencia: 1.00,
  zaragoza: 0.97,
  sevilla: 0.95,
  malaga: 0.93,
  otra: 0.90
};

$("#calc-sueldos-btn")?.addEventListener("click", calcSueldos);

function calcSueldos() {
  const sector = $("#s-sector").value;
  const ciudad = $("#s-ciudad").value;
  const experiencia = $("#s-experiencia").value;
  const salario = parseFloat($("#s-salario").value);

  if (!sector || !ciudad || !experiencia || !salario) {
    showToast("Rellena todos los campos para comparar.");
    return;
  }

  const base = salaryDB[sector]?.[experiencia];
  const multiplier = cityMultiplier[ciudad];

  if (!base || !multiplier) {
    showToast("No se ha podido calcular ese perfil.");
    return;
  }

  const minimo = Math.round(base[0] * multiplier);
  const mediana = Math.round(base[1] * multiplier);
  const maximo = Math.round(base[2] * multiplier);

  let percentil;
  if (salario <= minimo) {
    percentil = 10;
  } else if (salario >= maximo) {
    percentil = 95;
  } else if (salario <= mediana) {
    percentil = Math.round(10 + ((salario - minimo) / (mediana - minimo)) * 40);
  } else {
    percentil = Math.round(50 + ((salario - mediana) / (maximo - mediana)) * 45);
  }

  const netoMensual = brutToNet(salario);
  const diff = salario - mediana;
  const diffText = diff >= 0
    ? `${formatEuros(Math.abs(diff))} por encima de la mediana`
    : `${formatEuros(Math.abs(diff))} por debajo de la mediana`;

  let insight;
  if (percentil < 25) {
    insight = `Tu salario estimado está claramente por debajo del centro del rango (${diffText}). Puede haber margen para renegociar o revisar mercado.`;
  } else if (percentil < 50) {
    insight = `Estás algo por debajo de la mediana (${diffText}). No es una mala posición, pero sí puede haber recorrido de mejora.`;
  } else if (percentil < 75) {
    insight = `Estás por encima de la mediana (${diffText}). Tu posicionamiento salarial parece bueno para este perfil.`;
  } else {
    insight = `Tu salario está en la parte alta del rango estimado. La siguiente palanca podría estar en especialización, liderazgo o cambio estratégico.`;
  }

  $("#r-sueldos-percentil").textContent = `Top ${100 - percentil}%`;
  $("#r-sueldos-percentil-label").textContent = `Cobras más que el ${percentil}% aprox. de perfiles similares`;
  $("#r-sueldos-minimo").textContent = formatEuros(minimo);
  $("#r-sueldos-mediana").textContent = formatEuros(mediana);
  $("#r-sueldos-maximo").textContent = formatEuros(maximo);
  $("#r-sueldos-neto").textContent = `${formatEuros(netoMensual)}/mes`;
  $("#r-sueldos-insight").textContent = insight;

  $("#result-sueldos").classList.add("show");
}

// =========================
// SIMULADOR
// =========================
let currentScenario = null;

const scenarios = {
  negocio: {
    icon: "💼",
    title: "¿Y si monto un negocio?",
    fields: `
      <div class="form-grid">
        <div class="form-group">
          <label for="sim-1">Inversión inicial necesaria</label>
          <div class="input-prefix"><span>€</span><input type="number" id="sim-1" placeholder="10000"></div>
        </div>
        <div class="form-group">
          <label for="sim-2">Tu sueldo actual mensual neto</label>
          <div class="input-prefix"><span>€</span><input type="number" id="sim-2" placeholder="2000"></div>
        </div>
        <div class="form-group">
          <label for="sim-3">Ingresos estimados del negocio al año</label>
          <div class="input-prefix"><span>€</span><input type="number" id="sim-3" placeholder="30000"></div>
        </div>
        <div class="form-group">
          <label for="sim-4">Gastos mensuales del negocio</label>
          <div class="input-prefix"><span>€</span><input type="number" id="sim-4" placeholder="800"></div>
        </div>
      </div>
    `
  },
  ahorro: {
    icon: "💰",
    title: "¿Y si ahorro más cada mes?",
    fields: `
      <div class="form-grid">
        <div class="form-group">
          <label for="sim-1">Ahorro extra mensual</label>
          <div class="input-prefix"><span>€</span><input type="number" id="sim-1" placeholder="200"></div>
        </div>
        <div class="form-group">
          <label for="sim-2">Rentabilidad si lo inviertes</label>
          <div class="input-suffix"><input type="number" id="sim-2" placeholder="7" min="0" max="20"><span>%</span></div>
        </div>
        <div class="form-group full">
          <label for="sim-3">Durante cuántos años</label>
          <input type="number" id="sim-3" placeholder="20" min="1" max="60">
        </div>
      </div>
    `
  },
  inversion: {
    icon: "📈",
    title: "¿Y si hubiera empezado antes?",
    fields: `
      <div class="form-grid">
        <div class="form-group">
          <label for="sim-1">Aportación mensual</label>
          <div class="input-prefix"><span>€</span><input type="number" id="sim-1" placeholder="200"></div>
        </div>
        <div class="form-group">
          <label for="sim-2">Rentabilidad anual</label>
          <div class="input-suffix"><input type="number" id="sim-2" placeholder="7" min="0" max="20"><span>%</span></div>
        </div>
        <div class="form-group">
          <label for="sim-3">Años que llevas sin invertir</label>
          <input type="number" id="sim-3" placeholder="5" min="1" max="40">
        </div>
        <div class="form-group">
          <label for="sim-4">Años que planeas invertir desde hoy</label>
          <input type="number" id="sim-4" placeholder="20" min="1" max="60">
        </div>
      </div>
    `
  },
  trabajo: {
    icon: "🚀",
    title: "¿Y si cambio de trabajo?",
    fields: `
      <div class="form-grid">
        <div class="form-group">
          <label for="sim-1">Sueldo bruto actual anual</label>
          <div class="input-prefix"><span>€</span><input type="number" id="sim-1" placeholder="28000"></div>
        </div>
        <div class="form-group">
          <label for="sim-2">Sueldo bruto nuevo anual</label>
          <div class="input-prefix"><span>€</span><input type="number" id="sim-2" placeholder="35000"></div>
        </div>
        <div class="form-group full">
          <label for="sim-3">Años que estarías en el nuevo trabajo</label>
          <input type="number" id="sim-3" placeholder="10" min="1" max="40">
        </div>
      </div>
    `
  }
};

function loadScenario(type) {
  currentScenario = type;
  const scenario = scenarios[type];
  if (!scenario) return;

  $("#simulator-selector").hidden = true;
  $("#simulator-form").hidden = false;
  $("#result-simulador").classList.remove("show");
  $("#sim-scenario-header").innerHTML = `${scenario.icon} ${scenario.title}`;
  $("#sim-fields").innerHTML = scenario.fields;
}

function backToScenarios() {
  currentScenario = null;
  $("#simulator-selector").hidden = false;
  $("#simulator-form").hidden = true;
  $("#result-simulador").classList.remove("show");
}
$$
(".sim-scenario-card").forEach((card) => {
  card.addEventListener("click", () => {
    const type = card.getAttribute("data-scenario");
    loadScenario(type);
  });
});

$("#sim-back-btn")?.addEventListener("click", backToScenarios);
$("#run-simulation-btn")?.addEventListener("click", runSimulation);

function runSimulation() {
  if (!currentScenario) return;

  let main = "—";
  let label = "";
  let insight = "";
  const details = [];

  if (currentScenario === "negocio") {
    const inversion = parseFloat($("#sim-1").value) || 0;
    const sueldo = parseFloat($("#sim-2").value) || 0;
    const ingresos = parseFloat($("#sim-3").value) || 0;
    const gastos = parseFloat($("#sim-4").value) || 0;

    if (sueldo <= 0 && ingresos <= 0) {
      showToast("Introduce datos suficientes para simular.");
      return;
    }

    const beneficioAnual = ingresos - gastos * 12;
    const sueldoAnual = sueldo * 12;
    const diferencia = beneficioAnual - sueldoAnual;

    let mesesRecuperar = "—";
    if (beneficioAnual > 0 && inversion > 0) {
      mesesRecuperar = `${Math.ceil(inversion / (beneficioAnual / 12))} meses`;
    }

    main = diferencia >= 0 ? `+${formatEuros(diferencia)}/año` : `${formatEuros(diferencia)}/año`;
    label = "diferencia estimada frente a tu situación actual";

    details.push({ v: formatEuros(beneficioAnual), l: "Beneficio anual estimado" });
    details.push({ v: formatEuros(sueldoAnual), l: "Tu sueldo actual anual" });
    details.push({ v: mesesRecuperar, l: "Tiempo para recuperar inversión" });
    details.push({ v: formatEuros(inversion), l: "Inversión inicial" });

    if (diferencia >= 0) {
      insight = "Con este escenario, el negocio podría superar tu situación actual. Aun así, conviene recordar que el riesgo real suele ser mayor que el del cálculo.";
    } else {
      insight = "Con estos números, el escenario todavía parece más débil que tu situación actual. Tal vez haga falta validar mejor ingresos o reducir costes antes del salto.";
    }
  }

  if (currentScenario === "ahorro") {
    const extra = parseFloat($("#sim-1").value) || 0;
    const rentabilidad = (parseFloat($("#sim-2").value) || 7) / 100;
    const anios = parseFloat($("#sim-3").value) || 20;

    if (extra <= 0 || anios <= 0) {
      showToast("Introduce ahorro mensual y años válidos.");
      return;
    }

    const meses = anios * 12;
    const monthlyRate = rentabilidad / 12;
    const totalInvertido = extra * meses;
    const totalFinal = safeMonthlyFutureValue(extra, monthlyRate, meses);
    const ganancias = totalFinal - totalInvertido;
    const mult = totalInvertido > 0 ? totalFinal / totalInvertido : 0;

    main = formatEuros(totalFinal);
    label = `acumulado estimado en ${anios} años`;

    details.push({ v: formatEuros(totalInvertido), l: "Dinero aportado" });
    details.push({ v: formatEuros(ganancias), l: "Ganancias estimadas" });
    details.push({ v: formatEuros(extra * 12), l: "Ahorro extra por año" });
    details.push({ v: `x${formatNumber(mult, 1)}`, l: "Multiplicador" });

    insight = "Pequeños cambios sostenidos durante mucho tiempo pueden producir diferencias enormes. La clave suele ser la constancia, no el esfuerzo heroico.";
  }

  if (currentScenario === "inversion") {
    const mensual = parseFloat($("#sim-1").value) || 0;
    const rentabilidad = (parseFloat($("#sim-2").value) || 7) / 100;
    const aniosPerdidos = parseFloat($("#sim-3").value) || 5;
    const aniosFuturos = parseFloat($("#sim-4").value) || 20;

    if (mensual <= 0 || aniosPerdidos <= 0 || aniosFuturos <= 0) {
      showToast("Introduce aportación y plazos válidos.");
      return;
    }

    const r = rentabilidad / 12;
    const mesesFuturos = aniosFuturos * 12;
    const mesesTotal = (aniosPerdidos + aniosFuturos) * 12;

    const capitalSolo = safeMonthlyFutureValue(mensual, r, mesesFuturos);
    const capitalTotal = safeMonthlyFutureValue(mensual, r, mesesTotal);
    const dineroPerdido = capitalTotal - capitalSolo;

    main = formatEuros(dineroPerdido);
    label = `es lo que podrías dejar de acumular por esperar ${aniosPerdidos} años`;

    details.push({ v: formatEuros(capitalTotal), l: "Si hubieras empezado antes" });
    details.push({ v: formatEuros(capitalSolo), l: "Empezando hoy" });
    details.push({ v: `${aniosPerdidos} años`, l: "Tiempo perdido" });
    details.push({ v: formatEuros(mensual * aniosPerdidos * 12), l: "Solo en aportaciones no hechas" });

    insight = "Retrasar decisiones buenas también tiene coste. El tiempo perdido no solo reduce aportaciones: reduce sobre todo la capitalización.";
  }

  if (currentScenario === "trabajo") {
    const brutoActual = parseFloat($("#sim-1").value) || 0;
    const brutoNuevo = parseFloat($("#sim-2").value) || 0;
    const anios = parseFloat($("#sim-3").value) || 10;

    if (brutoActual <= 0 || brutoNuevo <= 0 || anios <= 0) {
      showToast("Introduce salarios y plazo válidos.");
      return;
    }

    const netoActual = brutToNet(brutoActual) * 12;
    const netoNuevo = brutToNet(brutoNuevo) * 12;
    const difAnual = netoNuevo - netoActual;
    const difTotal = difAnual * anios;
    const difMensual = difAnual / 12;

    main = `${difMensual >= 0 ? "+" : ""}${formatEuros(difMensual)}/mes`;
    label = "neto adicional estimado en tu bolsillo";

    details.push({ v: formatEuros(difAnual), l: "Diferencia neta anual" });
    details.push({ v: formatEuros(difTotal), l: `Diferencia en ${anios} años` });
    details.push({ v: formatEuros(netoActual / 12), l: "Neto mensual actual" });
    details.push({ v: formatEuros(netoNuevo / 12), l: "Neto mensual nuevo" });

    if (difAnual >= 0) {
      insight = "Un cambio de trabajo puede parecer una mejora modesta en bruto, pero su impacto acumulado puede ser muy relevante si lo sostienes en el tiempo.";
    } else {
      insight = "Con estos datos, el cambio no mejoraría tu ingreso neto. Tal vez existan otros factores no monetarios que sí lo justifiquen.";
    }
  }

  $("#r-sim-main").textContent = main;
  $("#r-sim-label").textContent = label;
  $("#r-sim-insight").textContent = insight;

  const detailsEl = $("#r-sim-details");
  detailsEl.innerHTML = details.map(item => `
    <div class="result-detail-item">
      <div class="value">${item.v}</div>
      <div class="label">${item.l}</div>
    </div>
  `).join("");

  $("#result-simulador").classList.add("show");
}

// =========================
// INICIALIZACIÓN
// =========================
updateProgressBar();
resetQuiz();

// =========================
// LEGAL MODALS
// =========================
function openLegalModal(type) {
  const modal = document.getElementById(`legal-${type}`);
  if (!modal) return;

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeLegalModal(type) {
  const modal = document.getElementById(`legal-${type}`);
  if (!modal) return;

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

document.querySelectorAll("[data-legal-open]").forEach((btn) => {
  btn.addEventListener("click", () => {
    openLegalModal(btn.getAttribute("data-legal-open"));
  });
});

document.querySelectorAll("[data-legal-close]").forEach((btn) => {
  btn.addEventListener("click", () => {
    closeLegalModal(btn.getAttribute("data-legal-close"));
  });
});

document.querySelectorAll(".legal-modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }
  });
});

// =========================
// YEAR
// =========================
const currentYearEl = document.getElementById("current-year");
if (currentYearEl) {
  currentYearEl.textContent = new Date().getFullYear();
}

// =========================
// COOKIES / CONSENT
// =========================
const COOKIE_STORAGE_KEY = "xtrafocus_cookie_preferences_v1";
const GA_MEASUREMENT_ID = "G-LTPYRZ690W";

function getCookiePreferences() {
  try {
    return JSON.parse(localStorage.getItem(COOKIE_STORAGE_KEY));
  } catch {
    return null;
  }
}

function saveCookiePreferences(prefs) {
  localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify({
    ...prefs,
    updatedAt: new Date().toISOString()
  }));
}

function hasConsentDecision() {
  return !!getCookiePreferences();
}

function openCookiePanel() {
  const panel = document.getElementById("cookie-panel");
  if (!panel) return;

  const prefs = getCookiePreferences();
  const toggle = document.getElementById("analytics-consent-toggle");
  if (toggle) toggle.checked = !!prefs?.analytics;

  panel.hidden = false;
  document.body.classList.add("modal-open");
}

function closeCookiePanel() {
  const panel = document.getElementById("cookie-panel");
  if (!panel) return;

  panel.hidden = true;
  document.body.classList.remove("modal-open");
}

function hideCookieBanner() {
  const banner = document.getElementById("cookie-banner");
  if (banner) banner.hidden = true;
}

function showCookieBanner() {
  const banner = document.getElementById("cookie-banner");
  if (banner) banner.hidden = false;
}

function applyConsent(prefs) {
  saveCookiePreferences(prefs);
  hideCookieBanner();
  closeCookiePanel();

  if (prefs.analytics) {
    loadGoogleAnalytics();
  }
}

document.getElementById("cookie-accept")?.addEventListener("click", () => {
  applyConsent({ necessary: true, analytics: true });
});

document.getElementById("cookie-reject")?.addEventListener("click", () => {
  applyConsent({ necessary: true, analytics: false });
});

document.getElementById("cookie-configure")?.addEventListener("click", () => {
  openCookiePanel();
});

document.getElementById("open-cookie-settings")?.addEventListener("click", () => {
  openCookiePanel();
});

document.getElementById("cookie-panel-close")?.addEventListener("click", () => {
  closeCookiePanel();
});

document.getElementById("cookie-save-selection")?.addEventListener("click", () => {
  const analytics = document.getElementById("analytics-consent-toggle")?.checked || false;
  applyConsent({ necessary: true, analytics });
});

document.getElementById("cookie-accept-all-panel")?.addEventListener("click", () => {
  applyConsent({ necessary: true, analytics: true });
});

document.getElementById("cookie-panel")?.addEventListener("click", (e) => {
  if (e.target.id === "cookie-panel") {
    closeCookiePanel();
  }
});

// =========================
// GOOGLE ANALYTICS SOLO CON CONSENTIMIENTO
// =========================
let gaLoaded = false;

function loadGoogleAnalytics() {
  if (gaLoaded) return;
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") {
    console.warn("Falta configurar tu GA_MEASUREMENT_ID.");
    return;
  }

  gaLoaded = true;

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

// =========================
// INIT CONSENT
// =========================
(function initCookieSystem() {
  const prefs = getCookiePreferences();

  if (!prefs) {
    showCookieBanner();
    return;
  }

  hideCookieBanner();

  if (prefs.analytics) {
    loadGoogleAnalytics();
  }
})();