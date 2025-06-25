const apiKey = 'f782350a3b382aa55ff058a3'; // Your API key here
const baseCurrencySelect = document.getElementById('base-currency');
const amountInput = document.getElementById('amount');
const convertBtn = document.getElementById('convert-btn');
const ratesDiv = document.getElementById('rates');

// Popular currencies list to show and for selector
const popularCurrencies = [
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' },
];

// Populate base currency selector
function populateBaseCurrencies() {
  popularCurrencies.forEach(({ code, name }) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = `${code} - ${name}`;
    baseCurrencySelect.appendChild(option);
  });
  baseCurrencySelect.value = 'INR'; // default INR
}

// Fetch exchange rates for given base currency
async function fetchRates(base = 'INR') {
  ratesDiv.innerHTML = '<p>Loading rates...</p>';
  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`);
    const data = await res.json();

    if (data.result !== 'success') {
      ratesDiv.innerHTML = `<p>Error fetching rates: ${data['error-type'] || 'Unknown error'}</p>`;
      return;
    }

    displayRates(data.conversion_rates, base);
  } catch (e) {
    ratesDiv.innerHTML = '<p>Failed to fetch rates. Please try again later.</p>';
  }
}

// Display rates in cards and show converted amounts
function displayRates(rates, base) {
  const amount = parseFloat(amountInput.value) || 1;

  // Clear previous rates
  ratesDiv.innerHTML = '';

  popularCurrencies.forEach(({ code, name }) => {
    if (code === base) return; // skip base currency itself

    const rate = rates[code];
    if (!rate) return;

    const convertedAmount = (rate * amount).toFixed(4);

    // Create card element
    const card = document.createElement('div');
    card.className = 'rate-card';

    card.innerHTML = `
      <h3>${code}</h3>
      <p>${name}</p>
      <p><strong>${convertedAmount}</strong></p>
      <p>1 ${base} = ${rate.toFixed(4)} ${code}</p>
    `;

    ratesDiv.appendChild(card);
  });
}

// Event Listeners
convertBtn.addEventListener('click', () => {
  fetchRates(baseCurrencySelect.value);
});

baseCurrencySelect.addEventListener('change', () => {
  fetchRates(baseCurrencySelect.value);
});

amountInput.addEventListener('input', () => {
  // live update conversion without refetching
  const cards = document.querySelectorAll('.rate-card');
  const amount = parseFloat(amountInput.value) || 1;
  cards.forEach(card => {
    const code = card.querySelector('h3').textContent;
    const rateText = card.querySelector('p:nth-child(4)').textContent; // "1 base = x code"
    const rate = parseFloat(rateText.split('=')[1]);
    card.querySelector('p:nth-child(3)').textContent = (rate * amount).toFixed(4);
  });
});

// Init
populateBaseCurrencies();
fetchRates('INR');
