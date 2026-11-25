# turion-ai/turion-jev-2b

## Resumen

Turion Jev 2B es un modelo de decisión desarrollado por Turion AI mediante ajuste fino supervisado (LoRA) sobre Qwen/Qwen3.5-2B. No es un modelo generativo: dado un estado (texto libre) y un conjunto de preguntas tipadas (elección múltiple, sí/no o puntuación de 0 a 5), devuelve una distribución de probabilidad sobre cada opción leída en un único forward pass. Esto lo convierte en una pieza de infraestructura para enrutamiento, clasificación y toma de decisiones automatizada, no en un asistente conversacional.

Su relevancia radica en el coste: es el hermano pequeño de Turion Jev 31B, entrenado con los mismos datos, prompt y mecanismo de lectura, pero sobre una base de 1.881.825.088 parámetros que puede ejecutarse en un portátil mediante GGUF y llama.cpp, o en GPU con vLLM o transformers. Frente a un LLM generativo que habría que promptear y parsear, Jev 2B produce directamente probabilidades normalizadas sobre las opciones, con latencias declaradas de mediana 74 ms y media 65 ms por petición en un H200.

La arquitectura subyacente es la del transformer de Qwen3.5-2B (etiqueta `qwen3_5_text`), sin la torre de visión: el checkpoint contiene únicamente el modelo de lenguaje. La licencia es Apache-2.0, igual que la del modelo base, y el formato de pesos principal es safetensors, con una variante GGUF publicada en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-2B, etiqueta `qwen3_5_text`), ajuste fino LoRA r128 sobre todas las capas lineales |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (las peticiones que superan ese límite se rechazan); las entradas de hasta 12.000 caracteres se repiten una vez en el prompt |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M en el repositorio `turion-ai/turion-jev-2b-GGUF`); pesos principales en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (las fuentes de datos de entrenamiento conservan sus propias licencias) |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte del transformer decoder-only de Qwen3.5-2B y se ajusta con LoRA de rango 128 (alpha 256) aplicado a todas las capas lineales del modelo de lenguaje, con learning rate 5e-05, 1.500 pasos de aproximadamente 65.000 tokens cada uno y secuencias de hasta 16.384 tokens. La pérdida es entropía cruzada contra objetivos suaves (distribuciones de probabilidad) sobre los códigos de opción. Tras el entrenamiento se realiza un "model soup" uniforme de tres checkpoints (pasos 1400, 1450 y el último), fusionado en la base a escala 0,85 y guardado en BF16. Todo el cómputo de entrenamiento se declara como aproximadamente 3,5 horas en una NVIDIA H200.

El mecanismo de inferencia es la innovación central. Cada pregunta del request se lista antes del estado, y cada opción recibe un código de un solo token (A–Z y luego códigos de dos letras que también son tokens únicos), permitiendo hasta 255 opciones por pregunta en un solo paso. La lectura consiste en las log-probabilidades del siguiente token para los códigos de opción, normalizadas sobre las opciones mostradas, con una temperatura por tipo de pregunta fijada en `calibration.json` (elección 1,16; sí/no 1,20; puntuación 1,10). El conjunto de entrenamiento es el de Turion Jev 31B sin cambios: 157.106 filas, verificadas contra la suite 0.3 del Decision Index mediante coincidencia de línea, solapamiento de 13-gramas y coincidencia exacta.

## Capacidades

- Clasificación y enrutamiento: asignación de probabilidad a cada opción de una pregunta de elección múltiple en un único forward pass.
- Preguntas booleanas (sí/no) con probabilidad calibrada por temperatura específica del tipo.
- Puntuación ordinal de 0 a 5 sobre un estado dado.
- Lectura de hasta 255 opciones por pregunta en una sola pasada.
- Procesamiento de estados de hasta 12.000 caracteres con repetición del input en el prompt.
- Ejecución sin generación de texto: no produce cadenas libres, solo distribuciones sobre opciones predefinidas.
- Despliegue en CPU, Apple silicon o GPU pequeña vía GGUF y llama.cpp; en GPU vía vLLM o transformers.
- Servidor HTTP compatible con endpoints (`/v1/systemone`) y paquete `turion_jev.serve`.
- No incluye tool calling, agentes multi-paso, visión ni audio; el checkpoint es solo texto.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo devuelve la probabilidad de cada equipo (`billing`, `tech`, `sales`, `other`) y una etiqueta de urgencia sí/no, como muestra el ejemplo de la model card, con latencia de decenas de milisegundos por petición.
- Triaje de urgencia en atención al cliente: una pregunta `noul` ("¿necesita respuesta hoy?") permite priorizar colas sin invocar un LLM generativo, reduciendo coste por petición.
- Moderación y etiquetado de contenido: clasificación de textos en categorías predefinidas con probabilidades calibradas, útil para pipelines de revisión por umbral.
- Puntuación de calidad o riesgo: preguntas de tipo `score` de 0 a 5 para valorar leads, reseñas o respuestas de soporte de forma consistente y auditable.
- Filtro previo en pipelines RAG o de agentes: decidir con un modelo de 2B si una consulta requiere recuperación, escalado a un modelo mayor o respuesta directa, antes de gastar tokens en un LLM generativo.
- Evaluación offline de políticas de decisión: el repositorio `decision-index` permite correr la suite pública 0.3 contra este modelo para comparar su índice (39,3 estimado) con el de Turion Jev 31B.
- Despliegue en el borde: con GGUF Q4_K_M y llama.cpp, el modelo puede ejecutarse en portátiles o equipos sin GPU para clasificación local de baja latencia.

## Benchmarks y rendimiento

| Metrica | Turion Jev 2B |
|---|---|
| Decision Index, suite pública 0.3 (estimado sobre muestra estratificada de 4.214 peticiones) | 39,3 |
| Proxy Full en conjuntos held-out (0,6 × dominios vistos + 0,4 × dominios nuevos) | 74,58 |
| Tiempo por petición en held-out, una petición a la vez (mediana) | 74 ms |
| Tiempo por petición en held-out, una petición a la vez (media) | 65 ms |
| Hardware de las mediciones | una NVIDIA H200 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no es generativo y las métricas publicadas son específicas de la tarea de decisión.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,8 GB en BF16 para los pesos completos; la variante GGUF Q4_K_M reduce el requisito a alrededor de 1,2–1,5 GB, más overhead de contexto.
- GPU recomendadas: H200 (hardware de referencia de las mediciones), A100 o H100 para máximo throughput con vLLM; cualquier GPU con 4 GB o más de VRAM para BF16.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y similares; también en Apple silicon y CPU vía llama.cpp.
- Opciones de despliegue: llama.cpp (backend `gguf`), vLLM (backend `vllm`), transformers (backend `hf`), mediante `python -m turion_jev.serve`; también existe servicio hospedado por Turion con clave de API.
- Latencia y throughput: mediana 74 ms y media 65 ms por petición en H200, una petición a la vez, según el autor; no se publican cifras de throughput agregado ni de latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Turion Jev 2B | 1.881.825.088 | 65.536 tokens | Modelo de decisión (probabilidades sobre opciones), fine-tune de Qwen3.5-2B | Apache-2.0 | Hugging Face, GGUF, servicio hospedado |
| Turion Jev 31B | no disponible en la información | no disponible en la información | Mismo enfoque y datos, base mayor; mejor en razonamiento difícil | no disponible en la información | Hugging Face |
| Qwen3.5-2B (base) | ~2B | no disponible en la información | LLM generativo decoder-only | no disponible en la información | Hugging Face |

La comparación con clasificadores dedicados tipo BERT o DeBERTa no está disponible en la información proporcionada; la diferencia clave frente a un LLM generativo es que Jev 2B no produce texto y devuelve directamente distribuciones normalizadas sobre opciones, con calibración por tipo de pregunta.

## Limitaciones y advertencias

- Modelo pequeño: el propio autor indica que queda por detrás de Turion Jev 31B en razonamiento difícil y en dominios alejados de sus datos de entrenamiento; recomienda el 31B cuando la precisión prima sobre el coste.
- Las peticiones de más de 65.536 tokens se rechazan; además, las entradas de más de 12.000 caracteres no se repiten en el prompt.
- La atención es la del modelo base y no es bidireccional: el modelo no relee el prompt en ambos sentidos.
- Las probabilidades están calibradas sobre los datos held-out del autor; es necesario verificar la calibración sobre datos propios antes de fijar umbrales en producción.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto libre), pero sí existe riesgo de asignar alta probabilidad a opciones incorrectas en dominios fuera de distribución.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse sobre 157.106 filas de fuentes diversas, puede heredar sesgos de esos datos.
- Idiomas soportados no declarados; el rendimiento multilingüe no está documentado.
- Licencia Apache-2.0 permite uso comercial, pero las fuentes de datos de entrenamiento conservan sus propias licencias y deben revisarse en la model card de Turion Jev 31B.
- El checkpoint no incluye la torre de visión de Qwen3.5; no admite entradas de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turion-ai/turion-jev-2b
- Variante GGUF: https://huggingface.co/turion-ai/turion-jev-2b-GGUF
- Modelo hermano 31B: https://huggingface.co/turion-ai/turion-jev-31b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Sitio del autor: https://turion.ai
- Precios y límites del servicio: https://turion.ai/models/
- Guía de modelos de decisión: https://turion.ai/docs/guides/decision-models/
- Repositorio Decision Index: https://github.com/apolinario/decision-index
