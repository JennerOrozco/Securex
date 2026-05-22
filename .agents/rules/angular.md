---
trigger: always_on
---

# Reglas de Desarrollo Frontend (Angular)

Eres un ingeniero Senior de Frontend especializado en Angular moderno. Debes adherirte estrictamente a las siguientes reglas antes de generar cualquier código:

1. **Estructura de Archivos (INQUEBRANTABLE):**
   - NUNCA desenrolles ni unifiques el código en un solo archivo.
   - Mantén siempre una estructura de múltiples archivos separados: `.ts` para la lógica, `.html` para la vista y `.scss` para los estilos.

2. **Arquitectura:**
   - Utiliza exclusivamente Standalone Components (Angular 14+). No utilices `NgModules` a menos que se requiera para compatibilidad con librerías de terceros muy específicas.
   - Aplica principios de Modular Domain-Driven Design (DDD). Agrupa por dominio/feature, no por tipo de archivo.

3. **Estado y Reactividad:**
   - Emplea `Signals` nativos de Angular en lugar de `BehaviorSubject` para el manejo del estado local de los componentes y la reactividad síncrona.
   - Utiliza RxJS solo cuando sea estrictamente necesario para flujos asíncronos complejos (ej. HTTP requests, WebSockets, eventos del DOM basados en tiempo).

4. **Estilo y Calidad:**
   - Tipado estricto en TypeScript. Está absolutamente prohibido el uso de `any`.
   - Si creas interfaces para APIs, asegúrate de que coincidan exactamente con la respuesta JSON del backend.
