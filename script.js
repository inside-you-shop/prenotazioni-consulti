const form = document.querySelector('#booking-form');
const BOOKING_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzrvLV4Vaw03fdv0Vp1zn--B6WHDd_q85RO5Jgr8LAlgm_8v_nqjpQXcLzQDrJuLP-S0A/exec';
const serviceInputs = [...document.querySelectorAll('input[name="service"]')];
const modalityInputs = [...document.querySelectorAll('input[name="modality"]')];
const modalityFieldset = document.querySelector('#modality-fieldset');
const birthdateFieldset = document.querySelector('#birthdate-fieldset');
const natalDataFieldset = document.querySelector('#natal-data-fieldset');
const questionsFieldset = document.querySelector('#questions-fieldset');
const flashQuestionsFieldset = document.querySelector('#flash-questions-fieldset');
const calendarFieldset = document.querySelector('#calendar-fieldset');
const paymentFieldset = document.querySelector('#payment-fieldset');
const contactFieldset = document.querySelector('#contact-fieldset');
const questions = document.querySelector('#questions');
const flashQuestions = document.querySelector('#flash-questions');
const flashPeople = document.querySelector('#flash-people');
const birthdate = document.querySelector('#birthdate');
const natalBirthdate = document.querySelector('#natal-birthdate');
const natalBirthtime = document.querySelector('#natal-birthtime');
const natalBirthplace = document.querySelector('#natal-birthplace');
const phone = document.querySelector('#phone');
const phoneLabel = document.querySelector('#phone-label');
const phoneHelp = document.querySelector('#phone-help');
const contactStep = document.querySelector('#contact-step');
const errorBox = document.querySelector('#form-error');

let calendarDate = new Date();
calendarDate.setDate(1);
let selectedDate = '';
let selectedTime = '';

const pad = value => String(value).padStart(2, '0');
const isoDate = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const today = new Date();
today.setHours(0, 0, 0, 0);

// Disponibilità straordinarie: ogni orario rappresenta l'inizio di uno slot da 45 minuti.
const exactAvailability = {
  '2026-07-18': ['09:00', '09:45'],
  '2026-07-20': ['09:00', '09:45', '15:00', '15:45', '17:30', '18:15'],
  '2026-07-21': ['09:00', '15:00', '15:45', '17:30', '18:15'],
  '2026-07-22': ['18:00'],
  '2026-07-23': ['09:00', '09:45', '10:30', '15:00', '15:45', '17:30', '18:15'],
  '2026-07-24': ['09:00', '09:45', '10:30']
};

function isAvailable(date) {
  return date >= today && Boolean(exactAvailability[isoDate(date)]);
}

function resetConditionalFields() {
  [modalityFieldset, birthdateFieldset, natalDataFieldset, questionsFieldset, flashQuestionsFieldset, calendarFieldset, paymentFieldset, contactFieldset].forEach(el => el.classList.add('hidden'));
  modalityInputs.forEach(input => { input.checked = false; });
  questions.required = false;
  flashQuestions.required = false;
  flashPeople.required = false;
  birthdate.required = false;
  natalBirthdate.required = false;
  natalBirthtime.required = false;
  natalBirthplace.required = false;
  phone.required = false;
  phoneLabel.textContent = 'Numero su cui vuoi essere richiamato';
  phoneHelp.textContent = 'Per le letture telefoniche, ti chiamerò a questo numero all’orario scelto.';
  clearAppointment();
}

function onServiceChange() {
  resetConditionalFields();
  const service = form.elements.service.value;
  if (service === 'tarocchi') {
    modalityFieldset.classList.remove('hidden');
    document.querySelector('.submit-button').innerHTML = 'Richiedi la prenotazione <span>→</span>';
  } else if (service === 'nascita') {
    birthdateFieldset.classList.remove('hidden');
    calendarFieldset.classList.remove('hidden');
    paymentFieldset.classList.remove('hidden');
    contactFieldset.classList.remove('hidden');
    birthdate.required = true;
    phone.required = true;
    contactStep.textContent = '4';
    document.querySelector('.submit-button').innerHTML = 'Richiedi la prenotazione <span>→</span>';
    renderCalendar();
  } else if (service === 'natale') {
    natalDataFieldset.classList.remove('hidden');
    contactFieldset.classList.remove('hidden');
    natalBirthdate.required = true;
    natalBirthtime.required = true;
    natalBirthplace.required = true;
    contactStep.textContent = '2';
    phoneLabel.textContent = 'Numero di telefono (facoltativo)';
    phoneHelp.textContent = 'Puoi lasciarlo se preferisci essere ricontattato anche telefonicamente.';
    document.querySelector('.submit-button').innerHTML = 'Richiedi informazioni <span>→</span>';
  } else if (service === 'flash') {
    flashQuestionsFieldset.classList.remove('hidden');
    paymentFieldset.classList.remove('hidden');
    contactFieldset.classList.remove('hidden');
    flashQuestions.required = true;
    flashPeople.required = true;
    phone.required = true;
    contactStep.textContent = '3';
    phoneLabel.textContent = 'Numero WhatsApp';
    phoneHelp.textContent = 'La risposta scritta verrà inviata a questo numero entro un massimo di 24 ore.';
    document.querySelector('.submit-button').innerHTML = 'Richiedi il consulto flash <span>→</span>';
  }
}

function onModalityChange() {
  questionsFieldset.classList.add('hidden');
  calendarFieldset.classList.add('hidden');
  paymentFieldset.classList.remove('hidden');
  contactFieldset.classList.remove('hidden');
  questions.required = false;
  phone.required = false;
  clearAppointment();
  if (form.elements.modality.value === 'audio') {
    questionsFieldset.classList.remove('hidden');
    questions.required = true;
    contactStep.textContent = '4';
    phoneLabel.textContent = 'Numero di telefono (facoltativo)';
    phoneHelp.textContent = 'Puoi lasciarlo se preferisci essere ricontattato anche telefonicamente.';
  } else {
    calendarFieldset.classList.remove('hidden');
    phone.required = true;
    contactStep.textContent = '4';
    phoneLabel.textContent = 'Numero su cui vuoi essere richiamato';
    phoneHelp.textContent = 'Ti chiamerò a questo numero all’orario scelto.';
    renderCalendar();
  }
}

serviceInputs.forEach(input => input.addEventListener('change', onServiceChange));
modalityInputs.forEach(input => input.addEventListener('change', onModalityChange));

function selectServiceCard(card) {
    const service = card.dataset.service;
    const input = document.querySelector(`input[name="service"][value="${service}"]`);
    input.checked = true;
    onServiceChange();
    document.querySelectorAll('.service-card').forEach(card => {
      card.classList.remove('selected-service');
      card.setAttribute('aria-pressed', 'false');
    });
    card.classList.add('selected-service');
    card.setAttribute('aria-pressed', 'true');
    const bookingSection = document.querySelector('#prenota');
    const bookingTitle = document.querySelector('#booking-title');
    const bookingTitles = {
      tarocchi: 'Prenota PsicoTarocchi',
      nascita: 'Prenota la lettura della data di nascita',
      natale: 'Richiedi il percorso del tema natale',
      flash: 'Richiedi il consulto flash scritto'
    };
    bookingTitle.textContent = bookingTitles[service];
    bookingSection.classList.remove('hidden');
    bookingSection.scrollIntoView({ behavior: 'smooth' });
}

document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('click', () => selectServiceCard(card));
  card.addEventListener('keydown', event => {
    if (event.target === card && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      selectServiceCard(card);
    }
  });
});

function renderCalendar() {
  const title = document.querySelector('#calendar-title');
  const grid = document.querySelector('#calendar-grid');
  title.textContent = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(calendarDate);
  grid.innerHTML = '';
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);

  for (let i = 0; i < 42; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = date.getDate();
    button.className = 'calendar-day';
    if (date.getMonth() !== month) button.classList.add('other-month');
    if (isoDate(date) === isoDate(today)) button.classList.add('today');
    if (isAvailable(date)) {
      button.classList.add('available');
      button.setAttribute('aria-label', `${date.toLocaleDateString('it-IT')} disponibile`);
      if (isoDate(date) === selectedDate) button.classList.add('selected');
      button.addEventListener('click', () => selectDay(date));
    } else {
      button.classList.add('busy');
      button.disabled = true;
    }
    grid.appendChild(button);
  }
}

function selectDay(date) {
  selectedDate = isoDate(date);
  selectedTime = '';
  document.querySelector('#appointment-date').value = selectedDate;
  document.querySelector('#appointment-time').value = '';
  document.querySelector('#selected-date-label').textContent = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  const slots = document.querySelector('#slots');
  slots.innerHTML = '';
  exactAvailability[selectedDate].forEach(time => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'slot';
    button.textContent = time;
    button.addEventListener('click', () => {
      slots.querySelectorAll('.slot').forEach(item => item.classList.remove('selected'));
      button.classList.add('selected');
      selectedTime = time;
      document.querySelector('#appointment-time').value = time;
    });
    slots.appendChild(button);
  });
  document.querySelector('#slots-panel').classList.remove('hidden');
  renderCalendar();
}

function clearAppointment() {
  selectedDate = '';
  selectedTime = '';
  document.querySelector('#appointment-date').value = '';
  document.querySelector('#appointment-time').value = '';
  document.querySelector('#slots-panel').classList.add('hidden');
}

document.querySelector('#prev-month').addEventListener('click', () => {
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  if (calendarDate > currentMonth) {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
  }
});

document.querySelector('#next-month').addEventListener('click', () => {
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  renderCalendar();
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  errorBox.textContent = '';
  const service = form.elements.service.value;
  const modality = service === 'tarocchi' ? form.elements.modality.value : 'call';
  const payment = form.elements.payment.value;
  if (!service) return showError('Scegli il servizio che desideri prenotare.');
  if (service === 'tarocchi' && !modality) return showError('Scegli telefonata oppure audio personalizzato.');
  if (service !== 'natale' && !payment) return showError('Seleziona il metodo di pagamento che preferisci.');
  if (!form.checkValidity()) {
    form.reportValidity();
    return showError('Controlla i campi richiesti prima di continuare.');
  }
  const needsAppointment = service === 'nascita' || (service === 'tarocchi' && modality === 'call');
  if (needsAppointment && (!selectedDate || !selectedTime)) return showError('Seleziona un giorno e un orario disponibili.');

  const name = form.elements.name.value.trim().split(' ')[0];
  const serviceNames = { tarocchi: 'PsicoTarocchi', nascita: 'lettura della data di nascita', natale: 'percorso integrato del tema natale', flash: 'consulto flash scritto' };
  const serviceName = serviceNames[service];
  const paymentNames = { paypal: 'PayPal', satispay: 'Satispay', postepay: 'PostePay' };
  let details = service === 'natale'
    ? `abbiamo ricevuto la tua richiesta per la ${serviceName}. Ti contatteremo via email con modalità, disponibilità e prezzo.`
    : service === 'flash'
    ? `abbiamo ricevuto le tue tre domande per il ${serviceName}. Riceverai la risposta scritta su WhatsApp tra 2 ore e un massimo di 24 ore, in base alle richieste e alla lista d’attesa.`
    : modality === 'audio'
    ? `abbiamo ricevuto la richiesta per il tuo audio ${serviceName}.`
    : `abbiamo ricevuto la richiesta per la ${serviceName} del ${new Date(`${selectedDate}T12:00:00`).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })} alle ${selectedTime}.`;
  const paymentDetails = service === 'natale'
    ? ''
    : service === 'flash'
    ? ` Riceverai via email le indicazioni per pagare subito con ${paymentNames[payment]}. La richiesta sarà confermata soltanto alla ricezione dell’importo; senza pagamento entro 12 ore verrà annullata.`
    : ` Riceverai via email le indicazioni per pagare subito con ${paymentNames[payment]}. Lo slot rimane riservato per 12 ore e la prenotazione sarà confermata soltanto alla ricezione dell’importo; senza pagamento entro 12 ore verrà annullata.`;

  const submitButton = form.querySelector('.submit-button');
  const originalButtonLabel = submitButton.innerHTML;
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.privacy = form.elements.privacy.checked;

  submitButton.disabled = true;
  submitButton.innerHTML = 'Invio in corso…';
  try {
    await fetch(BOOKING_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      credentials: 'omit',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonLabel;
    return showError('Non è stato possibile inviare la richiesta. Controlla la connessione e riprova.');
  }

  submitButton.disabled = false;
  submitButton.innerHTML = originalButtonLabel;
  document.querySelector('#success-summary').textContent = `${name}, ${details}${paymentDetails}`;
  document.querySelector('#success-modal').hidden = false;
  document.body.style.overflow = 'hidden';
});

function showError(message) {
  errorBox.textContent = message;
  errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeModal() {
  document.querySelector('#success-modal').hidden = true;
  document.body.style.overflow = '';
}

document.querySelector('.modal-close').addEventListener('click', closeModal);
document.querySelector('.modal-done').addEventListener('click', closeModal);
document.querySelector('#success-modal').addEventListener('click', event => {
  if (event.target.id === 'success-modal') closeModal();
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
document.querySelector('#year').textContent = new Date().getFullYear();
birthdate.max = isoDate(today);
natalBirthdate.max = isoDate(today);
