export const TIMEZONE = "America/Bogota";
export const LOCALE = "es-CO";

/**
 * Crea un ISO string respetando la hora local de Colombia.
 * Sigue el patrón: new Date(year, month-1, day, hours, minutes, 0, 0)
 * pero garantiza que el resultado sea el tiempo correcto en UTC para Bogotá.
 */
export function buildScheduledAt(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Usamos el constructor local y luego ajustamos si es necesario, 
  // o usamos el constructor con offset que es más directo.
  // Pero para seguir la instrucción exacta del usuario de usar el constructor de componentes numéricos:
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  
  // Si estamos en un servidor que no es Bogotá, 'date' tendrá un UTC diferente.
  // Para forzar Bogotá sin importar el sistema, podemos hacer:
  const bogotaDate = new Date(date.toLocaleString('en-US', { timeZone: TIMEZONE }));
  const diff = date.getTime() - bogotaDate.getTime();
  date.setTime(date.getTime() + diff);
  
  return date.toISOString();
}

/**
 * Formatea la hora en formato 12h (AM/PM) para Colombia.
 */
export function formatTime(isoString: string): string {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: TIMEZONE
  });
}

/**
 * Formatea la fecha larga en español para Colombia.
 * Maneja tanto ISO strings como fechas del calendario (YYYY-MM-DD).
 */
export function formatDate(dateInput: string): string {
  if (!dateInput) return '';
  
  let date: Date;
  if (dateInput.includes('T')) {
    // Es un ISO string
    date = new Date(dateInput);
  } else if (dateInput.includes('-')) {
    // Es una fecha del calendario YYYY-MM-DD
    const [y, m, d] = dateInput.split('-').map(Number);
    date = new Date(y, m - 1, d);
  } else {
    date = new Date(dateInput);
  }

  return date.toLocaleDateString(LOCALE, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: TIMEZONE
  });
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD para Colombia.
 */
export function getTodayString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

/**
 * Obtiene la fecha de un ISO string en formato YYYY-MM-DD para Colombia.
 */
export function getLocalDay(isoString: string): string {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}
