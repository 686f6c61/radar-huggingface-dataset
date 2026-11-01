# thealper2/mlx-gemma-3-270m-support-ticket-router

## Resumen

`thealper2/mlx-gemma-3-270m-support-ticket-router` es un adaptador LoRA para el modelo `unsloth/gemma-3-270m-it` (copia de `google/gemma-3-270m-it`) que realiza clasificación de intenciones en mensajes de soporte al cliente. El adaptador lee un mensaje tal cual, sin instrucción previa, y responde con el nombre de la cola a la que pertenece: `api`, `billing`, `cancellation`, `complaint`, `technical` o `upgrade`. Está entrenado y pensado para ejecutarse con Apple MLX (`mlx-lm`) sobre Apple Silicon.

El modelo base es un transformer Gemma 3 de 270 millones de parámetros, con 18 bloques y dimensión oculta de 640. El adaptador se aplica sobre las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y las proyecciones del MLP (`gate_proj`, `up_proj`, `down_proj`) de todos los bloques, con rango LoRA 128. El repositorio contiene únicamente el adaptador (`adapters.safetensors` + `adapter_config.json`), no un modelo autónomo.

Su relevancia es acotada y experimental: demuestra que un modelo de 270M parámetros puede resolver una tarea de enrutamiento de tickets con alta precisión sobre datos sintéticos, en un entrenamiento de 73 segundos y 2,6 GB de memoria pico en un Apple M1 de 8 GB. No obstante, la evaluación se realizó sobre mensajes sintéticos del mismo generador que los datos de entrenamiento, por lo que el rendimiento en tickets reales es desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (`gemma3_text`), transformer, 18 bloques, hidden size 640 |
| Parametros totales | 270M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con max sequence length 2048) |
| Tipos de cuantizacion | no disponible (adaptador en bf16 sobre base bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | `adapters.safetensors` + `adapter_config.json` (formato MLX-LM LoRA); no incluye pesos del modelo base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el modelo base Gemma 3 de 270M parámetros, un transformer denso con 18 bloques y dimensión oculta de 640. La finura LoRA utiliza rango 128, escala 1.0 (alpha/rank) y dropout 0.0, aplicada a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de todos los bloques. El entrenamiento se realizó con MLX-LM sobre Apple Silicon (Metal), con optimizador AdamW, weight decay 0.001, learning rate 0.0001, 5 pasos de warmup y decaimiento lineal a cero, durante 300 pasos con batch 8 (acumulación 1), longitud máxima de secuencia 2048, enmascaramiento del prompt y gradient checkpointing activados, semilla 3407.

Los datos de entrenamiento provienen del dataset `cngchis/Support-Ticket-Router-12K-Cleaned` (licencia Apache-2.0), con 9354 filas de entrenamiento, 1169 de validación y 1170 de test, sin solapamiento entre particiones. Los mensajes son sintéticos, generados con modelos de lenguaje y limpiados por el autor del dataset, con seis intenciones balanceadas (entre 1498 y 1579 ejemplos por clase). El formato es JSONL de chat MLX-LM: turno de usuario con el mensaje desnudo y turno de asistente con el nombre de la cola, calculando la pérdida solo sobre el turno del asistente. La pérdida final de entrenamiento fue 0.001, con un tiempo de pared de 73 segundos y una huella de memoria pico de 2,6 GB en un Apple M1 de 8 GB.

## Capacidades

- Clasificación de intenciones de soporte al cliente en seis colas: `api`, `billing`, `cancellation`, `complaint`, `technical`, `upgrade`.
- Generación de la etiqueta como texto libre a partir del mensaje desnudo, sin instrucción previa (así fue entrenado).
- Enrutamiento de un único ticket por inferencia, con una sola etiqueta de salida.
- Funcionamiento en Apple Silicon mediante MLX-LM.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés.
- No es un modelo de propósito general: es un adaptador especializado en una tarea de clasificación.

## Casos de uso

- Triaje inicial de tickets de soporte en una SaaS o producto IT: el adaptador recibe el mensaje del cliente y devuelve la cola correspondiente, que un humano revisa antes de asignar. Es adecuado por su bajo coste computacional (2,6 GB de memoria pico en entrenamiento) y su velocidad en Apple Silicon.
- Enrutamiento en un pipeline de atención al cliente: integrado como primer paso antes de un sistema de ticketing, clasifica mensajes cortos en inglés y deriva a los equipos de API, facturación, cancelación, quejas, técnico o upgrades.
- Prototipado y docencia: sirve como ejemplo reproducible de fine-tuning LoRA con MLX sobre un modelo pequeño, con un coste de entrenamiento de 73 segundos en un M1.
- Filtrado previo en un sistema de respuesta automatizada: la etiqueta de cola puede condicionar la plantilla de respuesta o el agente conversacional posterior.
- Clasificación por lotes de históricos de tickets sintéticos o anonimizados para análisis de distribución de intenciones.
- Experimentación con modelos pequeños en producción: permite evaluar si un modelo de 270M parámetros basta para una tarea de clasificación acotada antes de escalar a modelos mayores.
- Enrutamiento en entornos con recursos limitados: al ejecutarse en Apple Silicon con MLX, es viable en portátiles Mac sin GPU dedicada.

## Benchmarks y rendimiento

Evaluación sobre los 1170 mensajes de test del dataset, nunca usados en entrenamiento. Decodificación greedy, máximo 12 tokens nuevos; la respuesta es la primera palabra que sea un nombre de cola (si no hay ninguna, se cuenta como error). El modelo base recibe una instrucción delante de cada mensaje; el adaptador recibe el mensaje desnudo.

| Modelo | Accuracy | Macro F1 | Respuestas sin cola | Fecha |
|---|---|---|---|---|
| Base `unsloth/gemma-3-270m-it` (con instrucción) | 293 / 1170 (25,0%) | 0,2001 | 40 | 2026-10-29 |
| Base + este adaptador (mensaje desnudo) | 1159 / 1170 (99,1%) | 0,9906 | 0 | 2026-10-29 |

El intervalo de confianza del 95% a 1170 tickets es de hasta aproximadamente ±2,9 puntos porcentuales. Los mensajes de test provienen del mismo generador sintético que los datos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 2,6 GB de memoria pico en un Apple M1 de 8 GB de memoria unificada, por lo que la inferencia del adaptador sobre la base de 270M es holgada en ese hardware.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con Metal; no se documenta soporte para GPU NVIDIA en la información proporcionada.
- Cabe en GPU de consumo: sí, en Apple Silicon de 8 GB o más; no hay datos para GPU NVIDIA consumer.
- Opciones de despliegue: MLX-LM (`mlx-lm>=0.32.2,<0.33`) sobre macOS en Apple Silicon; requiere descargar el adaptador y cargarlo sobre `unsloth/gemma-3-270m-it` en la revisión `23cf460f6bb16954176b3ddcc8d4f250501458a9`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el entrenamiento completo tardó 73 segundos en un M1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Base `unsloth/gemma-3-270m-it` (con instrucción) | 270M | no disponible | 25,0% accuracy, 0,2001 macro F1 | Gemma | HuggingFace |
| Base + este adaptador LoRA | 270M (base) + LoRA r=128 | no disponible | 99,1% accuracy, 0,9906 macro F1 | Gemma | HuggingFace (solo adaptador) |
| Alternativas de clasificación de intenciones | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Selecciona exactamente una cola incluso cuando el mensaje contiene varias intenciones (por ejemplo, una pregunta de facturación dentro de una solicitud de cancelación).
- Entrenado y evaluado con mensajes sintéticos de un único generador; la precisión en tickets reales es desconocida y probablemente inferior.
- La respuesta es texto libre; debe mapearse siempre a una cola permitida y gestionarse la ausencia de cola en la respuesta.
- Solo inglés y un único dominio de producto SaaS/IT.
- No debe usarse para acciones automáticas sobre cuentas de clientes (cancelaciones, reembolsos) sin supervisión humana.
- No debe usarse con otros conjuntos de etiquetas o dominios sin reentrenamiento.
- Licencia Gemma Terms of Use: revisar las condiciones para uso comercial antes de desplegar.
- El repositorio contiene solo el adaptador; requiere el modelo base exacto en la revisión indicada.
- El intervalo de confianza del 95% es de ±2,9 puntos porcentuales, y la evaluación se hizo sobre datos del mismo generador sintético.
- Proyecto en estado experimental/educativo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/thealper2/mlx-gemma-3-270m-support-ticket-router
- Modelo base: https://huggingface.co/unsloth/gemma-3-270m-it
- Dataset de entrenamiento: https://huggingface.co/datasets/cngchis/Support-Ticket-Router-12K-Cleaned
- Repositorio MLX-LM: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
