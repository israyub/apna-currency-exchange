const ratesDiv = document.getElementById('rates');

async function fetchRates() {
  try {
    const response = await fetch('https://v6.exchangerate-api.com/v6/f782350a3b382aa55ff058a3/latest/USD');
    const data = await response.json();

    const topCurrencies = ['EUR', 'GBP', 'INR', 'CAD', 'AUD'];

    ratesDiv.innerHTML = `<h2>USD Exchange Rates</h2>`;
    topCurrencies.forEach(currency => {
      ratesDiv.innerHTML += `<p>1 USD = ${data.conversion_rates[currency]} ${currency}</p>`;
    });
  } catch (error) {
    ratesDiv.innerHTML = 'Failed to load rates.';
  }
}

fetchRates();
