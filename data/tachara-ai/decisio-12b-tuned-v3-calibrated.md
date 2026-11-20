# tachara-ai/Decisio-12b-tuned-v3-calibrated

## Resumen

Decisio-12b-tuned-v3-calibrated es un ajuste fino supervisado del modelo google/gemma-4-12B-it, desarrollado por Tachara AI Lab, diseñado específicamente para actuar como motor de decisión probabilística dentro de [decisio](https://github.com/aminry/decisio), un servidor open source que recibe un texto y preguntas tipadas (sí/no, elección entre opciones, puntuación en una escala definida) y devuelve una probabilidad por opción en un único forward pass por pregunta. No es un modelo conversacional de propósito general: es un clasificador generativo especializado en responder preguntas cerradas sobre un texto con probabilidades calibradas.

El modelo parte de la base Gemma 4 12B instruct (11.959.730.224 parámetros, pesos en bf16, repositorio de 24 GB) y se entrena mediante un adaptador LoRA de rango 32 y alpha 64 durante una época sobre 463.859 preguntas, fusionado posteriormente en float32 con redondeo estocástico con semilla a bf16. La relevancia actual radica en que mejora de forma medible tanto al modelo base como a la versión anterior de Decisio en tareas de lectura y decisión cerrada, con calibración explícita por tipo de pregunta y soporte de un bloque de calculadora para preguntas aritméticas y temporales.

La licencia es Apache 2.0, heredada de la base, y el modelo se distribuye con un fichero `decision_config.json` que define el layout de prompt, el readout, la configuración de calculadora (`calc-v1`) y las temperaturas por tipo de pregunta (elección 1.08, sí/no 1.43, puntuación 1.10). Requiere decisio 0.50.1 o superior para servirse correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma 4 12B) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de google/gemma-4-12B-it en la revisión `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`, un transformer decoder-only de aproximadamente 12.000 millones de parámetros. Sobre esa base se entrena un adaptador LoRA con rango 32 y alpha 64 durante una única época sobre 463.859 preguntas, que posteriormente se fusiona en el modelo base en float32 aplicando redondeo estocástico con semilla a bf16. El proceso de ajuste está orientado a un formato de pregunta tipada con un readout concreto, no a instrucciones abiertas.

La innovación principal no está en la arquitectura sino en el pipeline de calibración: las temperaturas se ajustan por tipo de pregunta (elección, sí/no, puntuación) minimizando la log-loss sobre una mitad del conjunto de validación, y se aplican en el servidor decisio. Además, el modelo incorpora un bloque de calculadora (`calc-v1`) que mejora la precisión en preguntas sobre fechas, horas y aritmética cuando el texto incluye un bloque numérico. El fichero `SHA256SUMS` permite verificar la integridad de los pesos, y `decision_config.json` registra la fusión y la configuración de servicio.

## Capacidades

- Respuesta a preguntas cerradas sobre un texto: sí/no, elección única entre opciones y puntuación en una escala definida por el usuario.
- Devolución de una probabilidad por opción en un único forward pass por pregunta, sin regla de commit aplicada.
- Probabilidades calibradas a las temperaturas publicadas por tipo de pregunta.
- Soporte de bloque de calculadora (`calc-v1`) para preguntas sobre fechas, horas y aritmética con bloque numérico.
- Robustez frente a variaciones de redacción y orden de opciones (81,2% en 1.050 preguntas de sondeo).
- Capacidad de lectura general conservada de la base (73,4% en 1.028 preguntas de lectura general).
- No soporta visión: las imágenes no forman parte del entrenamiento del modelo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo thinking más allá del bloque de calculadora.

## Casos de uso

- Moderación y clasificación de contenido: el modelo puede evaluar si un texto cumple una política concreta formulando preguntas sí/no y obteniendo probabilidades calibradas, lo que permite fijar umbrales de decisión con error cuadrático conocido (Brier 0,234).
- Enrutamiento de tickets de soporte: dado un texto de incidencia, elegir entre categorías predefinidas con probabilidad por categoría, útil para derivar automáticamente al equipo correcto con umbrales ajustables.
- Extracción de atributos verificables: responder preguntas cerradas sobre documentos (por ejemplo, si una cláusula está presente o si una cifra supera un umbral) con probabilidad asociada, apto para pipelines de validación documental.
- Evaluación de formularios y encuestas: asignar una puntuación en una escala definida a respuestas abiertas, con calibración específica para el tipo "score" (62,2% de acierto en la distribución de entrenamiento).
- Verificación de datos numéricos y temporales: con el bloque de calculadora activo, responder preguntas sobre fechas, horas y aritmética a partir de un bloque numérico, con precisión en torno al 83% en 874 preguntas de este tipo.
- Análisis de sentimiento o postura acotada: formular preguntas de elección entre opciones (positivo/neutro/negativo) sobre reseñas o comentarios, aprovechando la calibración por tipo de pregunta para umbralizar decisiones.
- Control de calidad en anotación: usar las probabilidades como señal de confianza para priorizar revisiones humanas en tareas de etiquetado cerrado.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 5.000 preguntas held-out de la distribución de entrenamiento, en bf16 y medidas a través de decisio con batch-invariant mode desactivado. No son resultados de un benchmark independiente.

| Conjunto | Base Gemma 4 12B | Decisio tuned 12B anterior | Decisio v3 |
|---|---:|---:|---:|
| Todas las preguntas | 67,7% | 71,6% | 78,8% |
| Elección (2.792) | 68,9% | 71,7% | 79,8% |
| Sí/no (1.220) | 83,0% | 84,7% | 89,8% |
| Puntuación (988) | 45,1% | 55,2% | 62,2% |

| Prueba adicional | Base | Anterior | Decisio v3 |
|---|---:|---:|---:|
| Sondeo de redacción y orden (1.050) | 71,5% | 75,6% | 81,2% |
| Fuera de distribución (1.178) | 83,2% | no disponible | 83,9% |
| Lectura general (1.028) | 70,5% | no disponible | 73,4% |

- Ganancia frente al modelo anterior: +7,2 puntos, con extremo inferior del intervalo del 90% en +6,2.
- Brier score con temperaturas por tipo: 0,234 (frente a 0,316 con temperatura única de 3,592).
- Con calculadora activa: precisión de aproximadamente 57-60% a aproximadamente 83% en 874 preguntas con bloque numérico.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 24 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 40 GB para servicio cómodo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o similares con al menos 40 GB de VRAM para bf16.
- En GPU de consumo: posible en RTX 4090 (24 GB) solo con cuantización, que no está documentada oficialmente en este repositorio; en bf16 no cabe con margen.
- Despliegue: servidor decisio con extra de vLLM (`uv run python -m decisio.serve.vllm_engine --base tachara-ai/Decisio-12b-tuned-v3-calibrated`), probado con decisio 0.50.2 y vLLM 0.31.0.
- Otros servidores que no apliquen las temperaturas del repositorio producirán probabilidades más planas o más agudas que las declaradas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decisio-12b-tuned-v3-calibrated | 11,96 B | no disponible | Clasificación probabilística calibrada sobre Gemma 4 12B | Apache 2.0 | Hugging Face |
| google/gemma-4-12B-it | 12 B (aprox.) | no disponible | Modelo instruct generalista | Apache 2.0 | Hugging Face |
| Decisio tuned 12B anterior | 12 B (aprox.) | no disponible | Versión previa del ajuste Decisio | no disponible | no disponible |

La comparación directa con modelos generalistas de propósito similar no está disponible en la información proporcionada; el autor solo reporta comparaciones contra el modelo base y la versión anterior de Decisio.

## Limitaciones y advertencias

- Las cifras publicadas proceden de preguntas held-out de la propia distribución de entrenamiento, no de un benchmark independiente; pueden no trasladarse a dominios distintos.
- La calibración solo se mantiene a las temperaturas publicadas y cuando el modelo se sirve mediante decisio; otros servidores producen probabilidades distintas de las declaradas.
- No soporta imágenes: la visión no forma parte del entrenamiento.
- El modelo está especializado en preguntas cerradas y tipadas; no es adecuado como modelo conversacional abierto ni para generación libre de texto.
- Requiere decisio 0.50.1 o superior; versiones anteriores sirven el modelo sin el bloque de calculadora.
- Las revisiones posteriores del repositorio pueden cambiar `decision_config.json` (por ejemplo, la configuración de calculadora) sin modificar los pesos; conviene fijar un commit con `--base ...@<commit>` y verificar con `SHA256SUMS`.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento en dominios fuera de la distribución de entrenamiento.
- Licencia Apache 2.0, que permite uso comercial, pero el `NOTICE` obliga a nombrar el repositorio y la revisión de la base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tachara-ai/Decisio-12b-tuned-v3-calibrated
- Repositorio decisio: https://github.com/aminry/decisio
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Organización Tachara AI Lab: https://huggingface.co/tachara-ai
