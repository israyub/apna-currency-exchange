const apiKey = 'f782350a3b382aa55ff058a3'; // Your API key here

// Elements
const fromCurrencySelect = document.getElementById('from-currency'); // fixed to INR
const toCurrencySelect = document.getElementById('to-currency');
const amountInput = document.getElementById('amount');
const swapBtn = document.getElementById('swap-btn');
const convertedAmountDisplay = document.getElementById('converted-amount');
const ratesDiv = document.getElementById('rates');

// Popular currencies to display
const popularCurrencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'SGD', name: 'Singapore Dollar' },
];

// Initialize the "To" currency selector
function populateToCurrencies() {
  popularCurrencies.forEach(({ code, name }) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = `${code} - ${name}`;
    toCurrencySelect.appendChild(option);
  });
  toCurrencySelect.value = 'USD'; // default to USD
}

// Fetch conversion rates from API
async function fetchRates() {
  const base = 'INR'; // fixed base currency
  const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`);
  const data = await res.json();
  if (data.result !== 'success') {
    ratesDiv.innerHTML = `<p>Error fetching rates: ${data['error-type'] || 'Unknown error'}</p>`;
    return null;
  }
  return data.conversion_rates;
}

// Update the converted amount display
function updateConvertedAmount(rates) {
  const amount = parseFloat(amountInput.value) || 0;
  const toCurrency = toCurrencySelect.value;

  if (!rates || !rates[toCurrency]) {
    convertedAmountDisplay.textContent = '-';
    return;
  }

  const rate = rates[toCurrency];
  const converted = (amount * rate).toFixed(4);
  convertedAmountDisplay.textContent = `${converted} ${toCurrency}`;
}

// Display live INR rates cards
function displayLiveRates(rates) {
  ratesDiv.innerHTML = ''; // clear old

  popularCurrencies.forEach(({ code, name }) => {
    if (!rates[code]) return;

    const rate = rates[code].toFixed(4);
    const card = document.createElement('div');
    card.className = 'rate-card';
    card.innerHTML = `
      <h3>${code}</h3>
      <p>${name}</p>
      <p>1 INR = ${rate} ${code}</p>
    `;
    ratesDiv.appendChild(card);
  });
}

// Swap From and To currencies — here From is fixed INR, so swap will change the To currency to INR and From to previous To?
// Since From is fixed, let's just swap amount and converted amount values and flip logic accordingly
// But for simplicity, disable swapping From currency and just swap To currency and amount conversion
function swapCurrencies(rates) {
  // Swap To currency and amount with From currency fixed to INR
  // User wants to convert INR -> ToCurrency or ToCurrency -> INR toggle

  // Let's implement toggling between INR→X and X→INR conversions:

  // We'll add a flag to track direction
  if (window.isINRtoTo) {
    // Convert To currency → INR
    window.isINRtoTo = false;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = 'INR';
  } else {
    // INR → To currency
    window.isINRtoTo = true;
    fromCurrencySelect.value = 'INR';
    toCurrencySelect.value = window.prevToCurrency || 'USD';
  }

  amountInput.value = 1;
  // Trigger conversion update
  handleConversion(rates);
}

// Handle conversion updates depending on direction
function handleConversion(rates) {
  if (!rates) return;

  const amount = parseFloat(amountInput.value) || 0;
  let converted;

  if (window.isINRtoTo) {
    // INR to To currency
    const to = toCurrencySelect.value;
    if (!rates[to]) {
      convertedAmountDisplay.textContent = '-';
      return;
    }
    converted = (amount * rates[to]).toFixed(4);
    convertedAmountDisplay.textContent = `${converted} ${to}`;
  } else {
    // From currency (To currency previously selected) to INR
    const from = fromCurrencySelect.value;
    if (!rates[from]) {
      convertedAmountDisplay.textContent = '-';
      return;
    }
    converted = (amount / rates[from]).toFixed(4);
    convertedAmountDisplay.textContent = `${converted} INR`;
  }
}

// Main function to load and update everything
async function main() {
  populateToCurrencies();
  window.isINRtoTo = true; // default direction INR → ToCurrency
  window.prevToCurrency = 'USD';

  const rates = await fetchRates();
  if (!rates) return;

  displayLiveRates(rates);
  updateConvertedAmount(rates);

  // Event listeners
  amountInput.addEventListener('input', () => handleConversion(rates));

  toCurrencySelect.addEventListener('change', () => {
    window.prevToCurrency = toCurrencySelect.value;
    if (window.isINRtoTo) updateConvertedAmount(rates);
  });

  swapBtn.addEventListener('click', () => {
    swapCurrencies(rates);
  });
}

main();
