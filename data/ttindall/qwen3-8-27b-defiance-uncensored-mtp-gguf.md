# ttindall/Qwen3.8-27B-Defiance-Uncensored-MTP-GGUF

## Resumen

Qwen3.8-27B Defiance Uncensored (MTP, GGUF) es una distribución en formato GGUF de un modelo Qwen3.8 de 27.000 millones de parámetros, publicada por el usuario ttindall. El modelo combina dos linajes: los pesos sin censura de HauhauCS (Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF) y la plantilla de chat con "constructos" de DavidAU (Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF). La aportación propia del autor es un parche de plantilla (fichero `defiance-27b.jinja`), el empaquetado y las pruebas de funcionamiento.

El modelo está pensado para inferencia local con llama.cpp y se distribuye con cuantizaciones que caben en tarjetas de 24 GB (IQ4_XS) y de 32 GB o más (Q6_K_P). Incorpora decodificación especulativa mediante cabezas MTP (multi-token prediction), un proyector de visión en BF16 que habilita entrada imagen-texto, y una ventana de contexto de hasta 131.072 tokens con caché K/V cuantizada en q8_0.

Su relevancia actual reside en tres factores: la disponibilidad de pesos "sin rechazo" (refusal layer eliminada por HauhauCS), un conjunto de 40 modos de personalidad seleccionables mediante una sola palabra en la petición, y correcciones específicas para agentes de código (Claude Code, OpenCode, Pi, Codex) que envían múltiples mensajes de sistema. La licencia es Apache 2.0 y el repo acumula cerca de un millón de descargas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8) con cabeza MTP para decodificación especulativa; proyector de visión multimodal |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (configuración recomendada, caché K/V q8_0) |
| Tipos de cuantización | IQ4_XS, Q6_K_P (mencionadas en la model card); otras no disponibles |
| Idiomas soportados | no disponible (la model card no los enumera) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión en BF16; plantilla de chat en Jinja (`defiance-27b.jinja`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de 27,3 B parámetros de la familia Qwen3.8, con una cabeza de predicción multi-token (MTP) que permite decodificación especulativa: el modelo propone varios tokens por paso y un verificador los acepta o rechaza. El autor no ha entrenado pesos; los GGUF son idénticos byte a byte a los de HauhauCS (verificó los 866 tensores). La capa de rechazo fue eliminada por HauhauCS en los pesos originales, no por ttindall.

La contribución técnica de esta ficha es la plantilla de chat: un parche de tipo buscar-y-reemplazar sobre la plantilla de DavidAU que corrige siete líneas de advertencia, una errata, un mensaje de error, el preámbulo y, en la versión v2, la gestión de múltiples mensajes de sistema para agentes. Los modos de personalidad (Joker, Dr. House, Vader, coder, profesor socrático, panel de 20 agentes Einstein, entre otros) son system prompts de entre 9.000 y 13.000 caracteres (aproximadamente 2.500 a 3.600 tokens) que se insertan en cada turno. Los niveles de esfuerzo `xhigh` y `low` añaden una frase cada uno; `medium` no añade nada, igual que en Qwen3.8 estándar. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable mediante `--reasoning-format deepseek` y presupuesto de razonamiento (`--reasoning-budget 16384`).
- Visión imagen-texto: el proyector BF16 incluido en el repo permite leer imágenes añadiendo `--mmproj`.
- Roleplay y conversación multi-turno con 40 constructos de personalidad seleccionables por palabra clave.
- Modo sin censura: los pesos no aplican rechazo y la plantilla instruye a responder sin advertencias ni moralina.
- Soporte de agentes de código: acepta múltiples mensajes de sistema (hook output y recordatorios de Claude Code, OpenCode, Pi y Codex) y nombres de esfuerzo como `high` y `none`.
- Tool calling / function calling: compatible con el ecosistema llama.cpp y endpoints compatibles (tag `endpoints_compatible`).
- Decodificación especulativa MTP: bien con la cabeza propia del modelo, bien con el draft FastMTP-32K de HauhauCS (37-56% de tokens aceptados en las pruebas del autor).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia conversacional sin filtros editoriales: para prototipos de escritura creativa, guiones o diálogo de personajes donde se necesita que el modelo no introduzca disclaimers; los pesos de HauhauCS y la plantilla están diseñados para ello.
- Agentes de código en local: integración con Claude Code, OpenCode, Pi o Codex gracias a la corrección v2 que renderiza múltiples mensajes de sistema; encaja en flujos donde el agente envía recordatorios y salidas de hooks en cada turno.
- Roleplay y simulación de personajes: los 40 constructos (Joker, Dr. House, Vader, tutor socrático, panel Einstein de 20 agentes) se activan con una palabra y se mantienen en contexto durante toda la sesión.
- Análisis de imágenes en local: con `--mmproj` el modelo responde preguntas sobre capturas, diagramas o fotos; útil en entornos air-gapped donde no se puede enviar contenido a una API externa.
- Despliegue en estación de trabajo de 24 GB: con IQ4_XS, FastMTP-32K y proyector se alcanzan 85-110 tok/s con 22,75 GB de pico, suficiente para asistentes interactivos de baja latencia.
- Investigación sobre alineación y censura: permite comparar respuestas con y sin capa de rechazo sobre el mismo conjunto de prompts, ya que los pesos son idénticos a los de HauhauCS y la plantilla es la única variable modificada.
- Procesamiento de documentos largos: la ventana de 131K tokens con caché K/V q8_0 permite resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta métricas de inferencia medidas en su propia tarjeta de 24 GB:

| Configuración | Contexto | VRAM pico | Throughput |
|---|---|---|---|
| IQ4_XS + proyector, llama.cpp estándar (MTP propio) | 131K, q8_0 K/V | no disponible | 99,2 tok/s |
| IQ4_XS + FastMTP-32K + proyector | 131K, q8_0 K/V | 22,75 GB | 85-110 tok/s |
| IQ4_XS + FastMTP-32K, solo texto | 131K, q8_0 K/V | 21,4 GB | 86-90 tok/s |
| Q6_K_P + FastMTP-32K + proyector | 131K | no ejecutado (no cabe en 24 GB) | no disponible |

Tasa de aceptación del draft FastMTP-32K: 37-56% de tokens aceptados en las pruebas del autor. Prueba de visión: 3 de 3 imágenes con respuesta conocida acertadas.

## Requisitos de hardware

- VRAM estimada: 21,4 GB (IQ4_XS, solo texto), 22,75 GB (IQ4_XS + FastMTP-32K + proyector, 131K contexto). Q6_K_P requiere 32 GB o más.
- GPU recomendadas: RTX 3090/4090 (24 GB) para IQ4_XS; A100 40 GB, H100 o RTX 6000 Ada para Q6_K_P.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con IQ4_XS. No cabe en 16 GB ni en 12 GB con contexto completo.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio (pegando `defiance-27b.jinja` en el campo de plantilla), Open WebUI; endpoints compatibles según los tags.
- Latencia y throughput: 85-110 tok/s con FastMTP-32K en 24 GB; 99,2 tok/s con MTP propio en llama.cpp estándar.
- Nota: el draft FastMTP-32K requiere aplicar el parche de HauhauCS a llama.cpp y recompilar; en llama.cpp estándar hay que omitir `-md` y `-ngld`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.8-27B Defiance Uncensored (este) | 27,3 B | 131K | Apache 2.0 | Sin censura + 40 constructos + visión + agentes |
| HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF | 27,3 B | no disponible | no disponible | Pesos sin censura, sin capa de constructos |
| DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF | 27,3 B | no disponible | no disponible | Constructos de razonamiento sobre pesos con censura |
| Qwen3.8-27B base (referencia de familia) | 27,3 B | no disponible | no disponible | Modelo alineado estándar |

Los tres primeros comparten pesos o plantilla y difieren en el grado de modificación; los datos de rendimiento comparativo entre ellos no están publicados en la información disponible.

## Limitaciones y advertencias

- Modelo sin censura: los pesos eliminan la capa de rechazo y la plantilla instruye a responder sin disclaimers. El usuario es responsable del contenido generado y del cumplimiento legal en su jurisdicción.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; al ser un modelo sin alineación estándar, la verificación de hechos corre por cuenta del usuario.
- Idiomas: la model card no documenta la cobertura lingüística; no se puede asumir un rendimiento multilingüe equivalente al de Qwen3.8 estándar.
- Contexto: 131K tokens es la configuración recomendada con caché q8_0; contextos mayores o caché en precisión completa pueden exceder la VRAM de 24 GB.
- Dependencia de la plantilla: sin `--jinja` y `defiance-27b.jinja` se pierden los modos y las correcciones para agentes; cualquier otra plantilla descarta los 40 constructos.
- Dependencia del parche: el draft FastMTP-32K no carga en llama.cpp estándar; requiere recompilar con el parche de HauhauCS.
- Licencia Apache 2.0 declarada, pero los pesos derivan de un modelo base cuyo linaje conviene verificar antes de uso comercial en producción.
- El autor reconoce que su prueba de rechazo no separa pesos de prompt: parte del efecto "sin censura" proviene de la plantilla, no solo de los pesos.

## Enlaces

- Repo Hugging Face: https://huggingface.co/ttindall/Qwen3.8-27B-Defiance-Uncensored-MTP-GGUF
- Pesos base (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Plantilla de constructos (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Parche de llama.cpp para FastMTP: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/blob/main/HauhauCS-FastMTP-llama.cpp.patch
