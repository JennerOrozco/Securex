/**
 * @function base64ToBuffer
 * @description Convierte una cadena codificada en base64 (formato URL safe) a un ArrayBuffer.
 * Esta utilidad es esencial para el manejo de datos criptográficos en WebAuthn.
 * @param {string} base64Url - Cadena base64 con formato URL-safe (guiones y guiones bajos).
 * @returns {ArrayBuffer} El buffer de bytes resultante.
 */
export function base64ToBuffer(base64Url: string): ArrayBuffer {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = window.atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

/**
 * @function bufferToBase64
 * @description Convierte un ArrayBuffer a una cadena codificada en base64 (formato URL safe).
 * Es la operación inversa a base64ToBuffer, necesaria para el envío de datos criptográficos a la API.
 * @param {ArrayBuffer} buffer - El buffer de bytes a convertir.
 * @returns {string} La cadena base64 resultante.
 */
export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * @function extractBase64
 * @description Extrae el contenido base64 de una cadena que sigue el formato MIME "Quoted-Printable" de Apple (RFC 2047).
 * Esta función es específica para limpiar datos que vienen con este prefijo/sufijo y permitir su correcta decodificación.
 * @param {string} str - La cadena que puede contener el prefijo de codificación MIME.
 * @returns {string} La cadena sin el prefijo/sufijo de codificación MIME, o la cadena original si no coincide con el patrón.
 */
export function extractBase64(str: string): string {
  if (typeof str !== 'string') return str;
  const match = str.match(/^=\?BINARY\?B\?(.+)\?=$/);
  return match ? match[1] : str;
}
