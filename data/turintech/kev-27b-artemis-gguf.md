# turintech/Kev-27B-Artemis-GGUF

## Resumen

Kev-27B-Artemis-GGUF es una versión cuantizada en formato GGUF del modelo base `jaredpalmer/kev-27b`, publicada por TurinTech. No es un modelo conversacional al uso: se trata de un modelo de decisión que responde a preguntas tipadas (sí/no, elección única, puntuación) devolviendo una probabilidad para cada respuesta en una sola pasada, a través del endpoint `/v1/systemone` de `llama-server`. Su pipeline declarado es `text-classification` y no soporta chat.

El modelo cuenta con 25.627.222.016 parámetros reales (aproximadamente 25,6 mil millones, comercializado como "27B") y ha sido comprimido mediante la técnica propietaria Artemis de TurinTech para caber en una única GPU de 24 GB. El fichero principal IQ4_XS ocupa 13,91 GB y requiere unos 19,0 GiB de memoria de GPU, frente a los 57,1 GiB que necesitaba el original repartido en dos GPUs.

La relevancia actual radica en su enfoque: en lugar de generar texto libre, el modelo emite decisiones estructuradas con probabilidad asociada, lo que lo hace adecuado para enrutamiento, triaje y comprobaciones tipadas en producción. Está disponible bajo licencia Apache 2.0 y se sirve con llama.cpp desde el 9 de octubre de 2026, además de estar empaquetado para Ollama y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin confirmar en la informacion) |
| Parametros totales | 25.627.222.016 (~25,6 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens (configuracion recomendada `-c 16384`; contexto de entrenamiento completo no disponible) |
| Tipos de cuantizacion | GGUF, incluye IQ4_XS (13,91 GB); otras variantes no detalladas |
| Idiomas soportados | no disponible (solo texto; idiomas no declarados) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `jaredpalmer/kev-27b`. Por el nombre y el recuento de parámetros se trata de un transformer de aproximadamente 25,6 mil millones de parámetros, pero no se confirma en la documentación proporcionada si emplea atención estándar, atención lineal u otra variante. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación destacable es el proceso de compresión Artemis de TurinTech, que reduce el modelo original de 57,1 GiB (repartido en dos GPUs) a 13,91 GB en cuantización IQ4_XS, manteniendo un 97,8 % de coincidencia con las respuestas del original. El modelo está diseñado específicamente para inferencia de decisiones tipadas en una sola pasada, con salida de probabilidad por respuesta, lo que difiere del paradigma generativo habitual.

## Capacidades

- Clasificación y decisión tipada: responde preguntas de tipo sí/no (`noul`), elección única y puntuación, devolviendo probabilidad por cada respuesta.
- Enrutamiento y triaje: diseñado para decidir categorías o rutas a partir de un estado textual de entrada.
- Comprobaciones tipadas: validación de condiciones sobre texto de entrada con salida estructurada.
- Procesamiento solo de texto: no admite imágenes, audio ni otros modos.
- Sin soporte de chat: no funciona como modelo conversacional; el endpoint `/v1/chat/completions` no lo ejecuta como modelo de decisión.
- Sin soporte declarado de tool calling ni de agentes multi-paso en la información proporcionada.
- Capacidades multilingües: no disponibles (idiomas no declarados).

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket como `state` y responde preguntas tipadas como "¿expresa urgencia?" o "¿qué categoría corresponde?", devolviendo probabilidad por respuesta para priorizar la cola de atención.
- Enrutamiento de peticiones en pipelines: dado un mensaje de entrada, decidir a qué servicio o equipo derivarlo mediante preguntas de elección única, aprovechando la salida probabilística para umbrales de confianza.
- Moderación y clasificación de contenido: aplicar comprobaciones tipadas (por ejemplo, "¿es spam?", "¿es tóxico?") con probabilidad asociada, útil para decidir si se requiere revisión humana.
- Validación de formularios y datos: comprobar condiciones sobre texto libre (por ejemplo, "¿menciona una integración de pago?") en flujos de ingesta, usando el endpoint `/v1/systemone` con lotes de 4096 tokens.
- Extracción de señales en analítica: clasificar mensajes de clientes en categorías predefinidas para agregación de métricas, gracias a la inferencia en una sola pasada y a los 16.384 tokens de contexto configurados.
- Despliegue en hardware de consumo: servir el modelo IQ4_XS en una única GPU de 24 GB con llama.cpp, Ollama o LM Studio para prototipos y entornos de borde donde no hay dos GPUs disponibles.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Acuerdo con el original | LocalLLaMA/typed-decisions (Test decisions) | Misma respuesta (%) | 97,8 |
| Acuerdo con el original | LocalLLaMA/typed-decisions (Test decisions) | Cambios en respuestas confiadas | 0 |
| Decisiones tipadas | LocalLLaMA/typed-decisions (Test decisions) | Precision (%) | 74,05 |

Comparativa de cuantizaciones según la model card: la versión Artemis IQ4_XS logra un 97,8 % de coincidencia con el original, frente al 97,0 % de la cuantización Q4_K_M de kdercksen.

## Requisitos de hardware

- VRAM estimada: 19,0 GiB para la cuantización IQ4_XS (frente a 57,1 GiB del original en dos GPUs).
- GPU recomendadas: una única GPU de 24 GB (por ejemplo, RTX 4090 o A10G) es suficiente; el modelo está pensado para "one 24 GB GPU".
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB de VRAM como la RTX 4090.
- Opciones de despliegue: `llama-server` (llama.cpp, probado en `fcac190`/b11609), Ollama (0.40.4 probado), LM Studio (0.4.26 probado, motor CPU 2.64.0).
- Configuración de servidor: `-c 16384 -ub 4096 -b 4096`; con el valor por defecto de 512, `/v1/systemone` rechaza entradas de más de 512 tokens.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kev-27B-Artemis-GGUF | ~25,6 mil millones | 16.384 (config.) | GGUF | Apache 2.0 | Decisiones tipadas |
| Kev-27B original (jaredpalmer/kev-27b) | ~25,6 mil millones | no disponible | safetensors | no disponible | Decisiones tipadas |
| Cuantizacion kdercksen Q4_K_M | ~25,6 mil millones | no disponible | GGUF | no disponible | Decisiones tipadas (97,0 % coincidencia) |

No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: el endpoint `/v1/chat/completions` y la ventana de chat no lo ejecutan como modelo de decisión; solo funciona vía `/v1/systemone`.
- Solo procesa texto; no admite visión ni audio.
- Con `-ub 512` (valor por defecto), rechaza entradas de más de 512 tokens; hay que configurar `-ub 4096 -b 4096`.
- La precisión en decisiones tipadas es del 74,05 % según el autor, lo que implica un margen de error considerable en producción.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Idiomas soportados no declarados; el rendimiento multilingüe es desconocido.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `jaredpalmer/kev-27b`, cuya licencia no se detalla.
- Los tags de Ollama no son revisiones inmutables; el contenido puede cambiar.

## Enlaces

- Hugging Face: https://huggingface.co/turintech/Kev-27B-Artemis-GGUF
- Modelo base: https://huggingface.co/jaredpalmer/kev-27b
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Ollama: https://ollama.com/turintech/kev-27b-artemis
- LM Studio: https://lmstudio.ai/turintech/kev-27b-artemis
- Discord: https://discord.gg/5mCDSyU9sT
- LinkedIn: https://www.linkedin.com/company/turintechai
- Resultados declarados: https://huggingface.co/turintech/Kev-27B-Artemis-GGUF#results
