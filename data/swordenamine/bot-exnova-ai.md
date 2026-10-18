# swordenamine/bot-exnova-ai

## Resumen

`swordenamine/bot-exnova-ai` no es un modelo de IA en el sentido habitual del término: es un repositorio de código Python (un bot de trading de opciones binarias) publicado en HuggingFace bajo la categoría de modelo. El README describe un sistema automatizado que opera en la plataforma Exnova combinando varias estrategias de análisis técnico (ICT, VA-MOD, RSI, Bandas de Bollinger, correlación y sentimiento) con un módulo denominado "Auto-Regulation System" que ajusta parámetros en tiempo real según rachas de victorias y derrotas. No se publican pesos, tokenizador, arquitectura de red neuronal ni dataset de entrenamiento en la información disponible.

El autor es `swordenamine` y el repositorio no registra descargas ni likes en el momento de la consulta. El proyecto se distribuye como código fuente (Python 3.10+) con integración de notificaciones asíncronas vía Telegram y gestión de configuración mediante `.env` y JSON. El término "AI" del nombre hace referencia a la lógica adaptativa heurística del motor de autorregulación, no a un modelo entrenado con descenso de gradiente.

Su relevancia ahora es limitada desde el punto de vista de la investigación en IA: no hay artefactos de modelo, benchmarks ni especificaciones técnicas publicadas. Resulta útil únicamente como ejemplo de arquitectura de software para bots de trading (circuit breaker, back-off exponencial, colas de notificación no bloqueantes) o como objeto de estudio de sistemas de trading de alto riesgo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es una aplicación Python con módulos de estrategia y autorregulación heurística) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica; el artefacto es código fuente Python) |
| Idiomas soportados | no disponible (README en inglés; no se declaran idiomas en la metadata de HuggingFace) |
| Licencia | no disponible en la metadata de HuggingFace; el badge del README indica "All Rights Reserved" |
| Formato de pesos | no disponible (no hay pesos; el repositorio contiene código fuente, `requirements.txt`, `.env.example` y ficheros JSON de configuración) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es una aplicación modular en Python con cinco componentes principales: `BotEngine` (bucle principal, gestión de conexión y circuit breaker), `AutoRegulationSystem` (ajuste adaptativo de parámetros según rachas y rendimiento por hora y por activo), `TelegramNotifier` (cola asíncrona de notificaciones con reintentos 3× y back-off), `ConfigService` (carga tipada de configuración con prioridad `.env` → variables de entorno → `config_real.json`) y `ExnovaBot` (conexión con el bróker, ejecución de estrategias y seguimiento de resultados). Sobre esta base se apoyan los módulos de estrategia ICT (Order Blocks, Fair Value Gaps, Liquidity Sweeps, BOS, OTE, detección de pullback), el feed VA-MOD con integración de precios reales de Deriv en arquitectura de doble feed, RSI, Bandas de Bollinger y análisis de correlación y sentimiento.

No existe entrenamiento en el sentido de machine learning: el sistema de "autorregulación" opera con reglas de tres niveles (Normal → Cautious → Emergency) con recuperación automática, aprendizaje de confianza óptima por hora del día y por activo, snapshots de configuración con rollback y pruebas A/B de variantes de estrategia en condiciones reales. No se documentan tokens de entrenamiento, composición de dataset, RLHF ni DPO porque no hay modelo entrenado. Entre los mecanismos de robustez descritos figuran el circuit breaker para evitar bucles de reconexión, el back-off exponencial (5 s → 10 s → 30 s → 60 s → 120 s) y la persistencia del modo de emergencia tras un reinicio.

## Capacidades

- Ejecución automatizada de operaciones de opciones binarias en la plataforma Exnova mediante conexión con el bróker (cuenta PRACTICE o REAL).
- Confluencia multi-estrategia: solo se abre operación cuando varias estrategias coinciden, con temporización de entrada precisa dentro de la vela.
- Análisis ICT: Order Blocks, Fair Value Gaps, Liquidity Sweeps, Break of Structure (BOS), OTE y detección de pullback.
- Feed VA-MOD con integración de precios reales de Deriv mediante arquitectura de doble feed.
- Estrategias de recuperación Martingale y Soros, configurables.
- Autorregulación en tres niveles (Normal, Cautious, Emergency) con recuperación automática y persistencia del estado de emergencia.
- Aprendizaje de rendimiento por hora del día y por activo, con ajuste del nivel de confianza óptimo.
- Snapshots de configuración y rollback a los mejores ajustes tras una racha negativa.
- Pruebas A/B de variantes de estrategia en condiciones de mercado reales.
- Notificaciones en tiempo real por Telegram (apertura, victoria, derrota, emergencia, resumen diario) con cuatro niveles (ALL, TRADES, ALERTS, CRITICAL), sin bloquear la ejecución.
- Configuración mediante `.env`, variables de entorno y JSON, con validación tipada al arranque.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades de agente en el sentido de los LLM.

## Casos de uso

- **Operativa automatizada en cuenta de prácticas:** ejecutar `python main.py` con `EXNOVA_ACCOUNT_TYPE=PRACTICE` para validar la lógica de confluencia de estrategias y el motor de autorregulación sin riesgo de capital real, usando el modo de emergencia y el rollback para observar cómo reacciona el sistema ante rachas negativas.
- **Monitorización remota mediante Telegram:** configurar `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` con `TELEGRAM_LEVEL=TRADES` para recibir cada apertura, victoria y derrota en el móvil; útil cuando el bot corre en un VPS sin supervisión presencial y se necesita saber con inmediatez si entra en modo Emergency.
- **Estudio del módulo de autorregulación:** reutilizar `core/auto_regulation_system.py` como referencia de máquina de estados con umbrales adaptativos y snapshots de configuración en proyectos de sistemas reactivos, independientemente del dominio financiero.
- **Investigación de estrategias ICT sobre datos de Deriv:** emplear el feed VA-MOD y los detectores de Order Blocks y Fair Value Gaps para generar señales sobre series de precios reales y evaluarlas offline, sin enviar órdenes al bróker.
- **Pruebas A/B de variantes de estrategia:** activar el modo de comparación en vivo para decidir entre dos configuraciones de niveles de confianza o de gestión de riesgo antes de fijar una versión en producción.
- **Patrón de integración de notificaciones asíncronas:** reutilizar `core/telegram_notifier.py` (cola no bloqueante, reintentos 3× con back-off, cuatro niveles de severidad) como plantilla para alertas en cualquier sistema de ejecución de tareas de larga duración.
- **Análisis de rendimiento por franja horaria:** explotar el aprendizaje por hora y por activo para identificar en qué ventanas el sistema obtiene mejores resultados y restringir la operativa a esas franjas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de win rate, profit factor, drawdown máximo ni comparaciones cuantitativas con otras implementaciones, y al no existir un modelo entrenado no procede evaluar MMLU, HumanEval, GSM8K ni tareas equivalentes.

## Requisitos de hardware

- No requiere GPU ni VRAM: es una aplicación Python que ejecuta lógica de reglas y llamadas de red. No hay inferencia de red neuronal.
- Entorno mínimo: Python 3.10 o superior con las dependencias de `requirements.txt`; un VPS modesto (1–2 vCPU, 1–2 GB de RAM) es suficiente para el bucle principal y la cola de notificaciones.
- GPU recomendadas: ninguna. Un equipo de sobremesa con CPU estándar puede ejecutar el bot.
- Cabe en cualquier equipo consumer: sí, incluidos mini-PC, Raspberry Pi de gama alta o instancias cloud de bajo coste.
- Opciones de despliegue: ejecución directa con `python main.py`, servicio systemd, contenedor Docker (el repositorio no documenta Dockerfile en la información disponible) o despliegue en VPS con las credenciales en `.env`.
- Latencia y throughput: no disponibles como cifras; el rendimiento efectivo depende de la latencia de red hacia la API de Exnova y del feed Deriv, y la temporización de entrada se describe como "espera al punto óptimo dentro de la vela" sin cuantificar.
- Requisito operativo crítico: conectividad estable y credenciales válidas (`EXNOVA_EMAIL`, `EXNOVA_PASSWORD`); el circuit breaker y el back-off exponencial (5 s, 10 s, 30 s, 60 s, 120 s) están diseñados para tolerar caídas transitorias.

## Comparativa con modelos similares

No se dispone de datos verificables de alternativas comparables en la información proporcionada. La tabla siguiente recoge únicamente lo que puede afirmarse del artefacto analizado frente a categorías genéricas.

| Criterio | Bot Exnova AI | Modelo LLM open source típico | Bot de trading open source típico |
|---|---|---|---|
| Naturaleza del artefacto | Código Python de trading | Pesos + tokenizador | Código Python de trading |
| Parámetros | no disponible (no aplica) | Miles de millones | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) | 8k–128k tokens | no disponible (no aplica) |
| Benchmarks publicados | Ninguno | MMLU, HumanEval, GSM8K | Habitualmente ninguno |
| Licencia | "All Rights Reserved" según README; no declarada en HuggingFace | Apache 2.0, MIT, Llama, etc. | Variable |
| Disponibilidad | Repositorio en HuggingFace; código en GitHub | HuggingFace, repositorios espejo | GitHub |

No se identifican en la información disponible modelos comparables concretos con parámetros, contexto y rendimiento publicados.

## Limitaciones y advertencias

- **No es un modelo de IA:** no hay pesos, arquitectura neuronal ni entrenamiento documentado; el uso del término "AI" responde a lógica heurística y de reglas. Cualquier evaluación como modelo de lenguaje carece de sentido.
- **Riesgo financiero severo:** se trata de un bot de opciones binarias, instrumentos de altísimo riesgo y prohibidos o restringidos en numerosas jurisdicciones, incluida España y la mayor parte del Espacio Económico Europeo para clientes minoristas. Las estrategias Martingale y Soros amplifican las pérdidas en rachas adversas.
- **Ausencia total de validación publicada:** cero descargas, cero likes, ningún benchmark, ningún informe de resultados auditado. No hay evidencia de rentabilidad ni de comportamiento en condiciones de mercado reales a escala.
- **Licencia restrictiva:** el badge del README indica "All Rights Reserved", lo que impide el uso comercial, la modificación o la redistribución sin autorización expresa del autor, pese a que el repositorio sea públicamente visible.
- **Credenciales sensibles:** el bot requiere el correo y la contraseña de la cuenta de Exnova en `.env`, además del token de Telegram. Un manejo incorrecto expone la cuenta del bróker; el README insiste en no incluir secretos en el JSON versionado.
- **Inconsistencias en los metadatos:** la fecha de creación registrada (2026-10-17) es posterior a la de actualización (2026-02-16), lo que sugiere metadatos poco fiables. La URL de clonado del README (`github.com/swordenkisk/bot-exnova-ai`) no coincide exactamente con el nombre de usuario de HuggingFace (`swordenamine`).
- **Dependencia de terceros no controlados:** el funcionamiento depende de la API de Exnova y del feed de Deriv, sujetos a cambios, bloqueos geográficos o interrupciones que romperían el bot sin aviso.
- **Sin soporte multilingüe ni de contexto:** no aplica ninguna de las capacidades habituales de un LLM; no hay alucinación en sentido técnico, pero sí riesgo de señales falsas por sobreajuste de parámetros a datos históricos.
- **Idiomas y documentación:** la documentación está en inglés y no se declaran idiomas soportados en la metadata de HuggingFace.
- **Estado del proyecto:** el badge indica "Active Development", lo que implica cambios incompatibles frecuentes y ausencia de garantías de estabilidad en producción.

## Enlaces

- HuggingFace: https://huggingface.co/swordenamine/bot-exnova-ai
- Repositorio GitHub indicado en el README: https://github.com/swordenkisk/bot-exnova-ai
- Plataforma del bróker: https://exnova.com
- Telegram (servicio de notificaciones): https://telegram.org
- Python 3.10+: https://python.org
- Paper, blog técnico, demo o documentación adicional: no disponible en la información proporcionada.
