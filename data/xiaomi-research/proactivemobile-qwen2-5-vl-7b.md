# xiaomi-research/ProactiveMobile-Qwen2.5-VL-7B

## Resumen

ProactiveMobile-Qwen2.5-VL-7B es un modelo multimodal (imagen-texto a texto) desarrollado por xiaomi-research, fine-tuned a partir de Qwen2.5-VL-7B-Instruct sobre el benchmark ProactiveMobile. Su objetivo es resolver un problema concreto de la inteligencia artificial en dispositivos móviles: decidir de forma proactiva cuándo un asistente debe actuar por iniciativa propia y cuándo debe permanecer en silencio, evitando recomendaciones innecesarias o intrusivas.

Dado el contexto de un usuario (perfil, estado del teléfono, conocimiento del mundo y una traza de operación que puede ser capturas de pantalla de la GUI o una secuencia textual de acciones), el modelo emite una secuencia estructurada de function calls, o bien una respuesta de no-acción cuando no procede recomendar nada. El formato de salida tiene tres bloques: razonamiento (`<think>`), recomendación en lenguaje natural (`<rec>`) y funciones (`<function>` en JSON).

Su relevancia actual radica en la tendencia hacia agentes móviles proactivos: la mayoría de asistentes solo reaccionan a comandos explícitos, mientras que este modelo aborda la decisión de "cuándo actuar" con métricas específicas como la tasa de falsos disparos (FTR). Se distribuye en safetensors (16,6 GB de repositorio), es compatible con la librería transformers y su licencia heredada es Apache 2.0, aunque con una restricción importante derivada de la licencia del dataset de entrenamiento (uso no comercial).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer multimodal vision-language) |
| Parametros totales | 848.896 según metadatos de safetensors (dato posiblemente erróneo; el modelo base Qwen2.5-VL-7B-Instruct ronda los 8.290 millones de parámetros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-VL-7B soporta 32.768 tokens, ampliables a 128.000 con YaRN, pero no consta en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh, según la model card) |
| Licencia | Apache 2.0 (pesos), con restricción de uso no comercial derivada del dataset ProactiveMobile (CC BY-NC-SA 4.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, una arquitectura transformer multimodal que combina un codificador de visión (ViT) con un LLM decoder, capaz de procesar capturas de pantalla e imágenes junto con texto. Sobre esta base, xiaomi-research ha realizado un fine-tuning supervisado con el dataset ProactiveMobile, un benchmark diseñado para evaluar la inteligencia proactiva en dispositivos móviles. No se ha publicado información sobre el número de tokens de entrenamiento, la composición detallada del dataset más allá de lo descrito, ni sobre el uso de técnicas como RLHF o DPO.

La innovación principal no está en la arquitectura sino en la tarea: el modelo aprende a emitir juicios de oportunidad de acción. Su salida estructurada incluye un bloque de razonamiento (`<think>`), una recomendación en lenguaje natural (`<rec>`) y una secuencia de function calls en JSON (`<function>` con la clave `model_recommendation`). En la evaluación solo se puntúa el bloque `<function>`, lo que permite medir con precisión la capacidad de decisión sobre qué funciones invocar (o no invocar).

## Capacidades

- Decisión proactiva: dado un contexto de usuario, determina si debe actuar o permanecer en silencio (no-action), una capacidad poco común en asistentes reactivos.
- Function calling estructurado: genera secuencias de llamadas a funciones en formato JSON, con coincidencia exacta de nombres de funciones evaluada en el benchmark.
- Comprensión de GUI móvil: procesa capturas de pantalla como traza de operación (modo GUI), además de secuencias de acciones textuales (modo TEXT).
- Razonamiento intermedio: emite un bloque de razonamiento explícito antes de la recomendación.
- Generación de recomendaciones en lenguaje natural para el usuario.
- Pipeline image-text-to-text compatible con transformers (`Qwen2_5_VLForConditionalGeneration` y `AutoProcessor`).
- Hereda las capacidades generales multimodales de Qwen2.5-VL-7B-Instruct (comprensión de imágenes, OCR, generación de texto), aunque el fine-tuning se ha orientado a la tarea proactiva.

## Casos de uso

- Asistente móvil proactivo: el modelo monitoriza el estado del teléfono y el contexto del usuario y decide si sugerir una acción (por ejemplo, enviar un recordatorio o abrir una app) sin que el usuario lo pida, gracias a su entrenamiento específico en decisiones de no-acción.
- Reducción de notificaciones intrusivas: su métrica objetivo FTR (tasa de falsos disparos) lo hace adecuado para sistemas donde disparar una acción innecesaria tiene coste de confianza del usuario; en contextos TEXT su FTR es de solo 1,31 %.
- Automatización de flujos en el móvil: a partir de una traza de acciones textuales, puede encadenar function calls para completar tareas multi-paso en apps.
- Interpretación de capturas de pantalla: en modo GUI, analiza la interfaz visible y propone acciones sobre ella, útil para agentes de automatización de interfaz.
- Investigación en agentes proactivos: sirve como baseline reproducible (decodificación greedy, temperatura 0) sobre el benchmark ProactiveMobile de 3.658 instancias.
- Prototipado de asistentes contextuales: el formato de salida en tres bloques (razonamiento, recomendación, funciones) facilita la integración en pipelines donde se quiere auditar el razonamiento antes de ejecutar acciones.
- Evaluación comparativa de políticas de acción: el script de evaluación incluido (`inference_and_eval.py`) permite medir Type-Acc, Precision, Recall, F1 y FTR de forma estandarizada.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados sobre el benchmark ProactiveMobile completo (3.658 instancias) con decodificación greedy (temperatura 0). Todas las puntuaciones son porcentajes; FTR es menor es mejor.

| Split | Type-Acc | Precision | Recall | F1 | FTR↓ |
|-------|:-------:|:--------:|:------:|:----:|:----:|
| Overall | 49,29 | 54,23 | 54,19 | 53,83 | 8,86 |
| L1 | 72,41 | 75,20 | 75,33 | 75,16 | 6,98 |
| L2 | 57,93 | 63,52 | 63,44 | 63,10 | 7,12 |
| L3 | 38,99 | 43,90 | 43,85 | 43,45 | 11,23 |
| TEXT | 64,04 | 65,60 | 65,58 | 65,46 | 1,31 |
| GUI | 34,57 | 42,88 | 42,81 | 42,23 | 24,37 |

- Type-Acc: coincidencia exacta de la secuencia de nombres de funciones frente a la intención gold más cercana.
- Precision / Recall / F1: solapamiento de conjuntos de nombres de funciones predichos frente a los gold.
- FTR (False Trigger Rate): en instancias de no-acción, fracción en la que el modelo predijo una acción indebidamente.

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente; siendo un derivado de Qwen2.5-VL-7B en precisión completa (bf16), cabe estimar en torno a 16-18 GB solo de pesos, más la memoria de activación y las imágenes procesadas.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para inferencia cómoda en bf16; no disponible un dato oficial.
- Consumer GPU: debería caber en una RTX 4090 de 24 GB en bf16; con cuantización (no publicada oficialmente para este checkpoint) podría ejecutarse en GPUs de 12-16 GB.
- Opciones de despliegue: transformers (código de ejemplo en la model card con `Qwen2_5_VLForConditionalGeneration` y `AutoProcessor`); al ser compatible con la arquitectura Qwen2.5-VL, es plausible su uso con vLLM, llama.cpp (mediante conversiones GGUF no oficiales) y Ollama, aunque no se anuncia soporte oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Contexto | Licencia |
|---|---|---|---|---|
| ProactiveMobile-Qwen2.5-VL-7B | Qwen2.5-VL-7B-Instruct | Agente móvil proactivo con function calling | no disponible (base: 32.768 tokens) | Apache 2.0 / uso no comercial por dataset |
| Qwen2.5-VL-7B-Instruct | — | Multimodal general (visión + texto) | 32.768-128.000 tokens | Apache 2.0 |
| Qwen2.5-VL-3B-Instruct | — | Multimodal general, versión ligera | 32.768 tokens | Apache 2.0 |

La diferencia clave frente al modelo base es la especialización en la decisión proactiva de actuar o no actuar y en la generación de function calls sobre contextos móviles (TEXT y GUI), a costa de las capacidades generales de chat. No hay otros modelos comparables publicados en la información disponible.

## Limitaciones y advertencias

- Restricción de licencia crítica: aunque los pesos se publican bajo Apache 2.0, el dataset de entrenamiento (ProactiveMobile) está bajo CC BY-NC-SA 4.0, lo que implica uso no comercial, atribución obligatoria y compartir bajo la misma licencia. No es apto para productos comerciales sin revisar esta restricción.
- Rendimiento limitado en modo GUI: con un F1 de 42,23 % y un FTR de 24,37 % en el split GUI, el modelo dispara acciones incorrectas con frecuencia cuando la entrada son capturas de pantalla; su fiabilidad es notablemente menor que en modo TEXT.
- Degradación en tareas complejas: el rendimiento cae de 72,41 % de Type-Acc en L1 a 38,99 % en L3, por lo que escenarios de razonamiento profundo o multi-paso complejo no son su punto fuerte.
- Riesgo de alucinación: al heredar de Qwen2.5-VL-7B-Instruct y ser un fine-tuning orientado a tareas, puede generar function calls incorrectas o recomendaciones no respaldadas por el contexto; no hay datos publicados sobre tasas de alucinación.
- Idioma: la model card declara únicamente chino (zh); no hay garantías de rendimiento en castellano u otros idiomas.
- Sesgos: no documentados; al entrenarse sobre un benchmark sintético de interacciones móviles, puede heredar los sesgos de composición del dataset.
- Producción: la evaluación se realiza con decodificación greedy (temperatura 0); otros ajustes de muestreo no están caracterizados. El bloque `<rec>` no se puntúa en el benchmark, por lo que la calidad de la recomendación en lenguaje natural no está medida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xiaomi-research/ProactiveMobile-Qwen2.5-VL-7B
- Dataset ProactiveMobile: https://huggingface.co/datasets/xiaomi-research/ProactiveMobile
- Repositorio de código: https://github.com/xiaomi-research/proactive-mobile
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Paper: "ProactiveMobile: A Comprehensive Benchmark for Boosting Proactive Intelligence on Mobile Devices" (CVPR 2026); enlace directo no disponible.
