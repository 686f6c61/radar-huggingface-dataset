# tahamajs/tinyllama-1.1b-block-transformer-hiba-wikitext2

## Resumen

`tinyllama-1.1b-block-transformer-hiba-wikitext2` es un checkpoint experimental publicado por Taha Majlesi (tahamajs) dentro del proyecto NeuralOps, un "attention surgery zoo" que sustituye mecanismos de atención estándar en modelos LLaMA por variantes subcuadráticas. En concreto, este artefacto parte de `TinyLlama/TinyLlama_v1.1` (decoder LLaMA de 22 capas, hidden_size 2048, GQA 32Q:4KV) y reemplaza la atención de 17 de sus 22 capas por el operador `BlockTransformerHIBA`, una atención jerárquica por bloques con softmax único sobre puntuaciones intra-bloque e inter-bloque.

El modelo no es un modelo base entrenado desde cero ni un fine-tune convencional: es un delta quirúrgico de pesos que solo contiene las atenciones modificadas y los layernorms entrenados, serializado en FP16 (310,80 MB) frente a los 2,05 GB del TinyLlama original. El objetivo es demostrar que es posible recuperar calidad tras una cirugía agresiva de atención mediante destilación de conocimiento, pasando de una perplejidad de 231,91 en zero-shot a 22,01 tras el proceso de KD, frente al baseline del profesor de 8,73.

Su relevancia es principalmente metodológica y de investigación: documenta de forma reproducible (manifiesto, telemetría de entrenamiento, métricas) cómo afeitar atención cuadrática en un transformer pequeño y cuantificar la pérdida. No está pensado como modelo de producción: tiene 0 descargas, está entrenado y evaluado solo en inglés y su evaluación se limita a WikiText-2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaMA decoder (TinyLlama-1.1B) con atención `BlockTransformerHIBA` en 17/22 capas; 5 capas ancla cuadráticas [3, 7, 11, 15, 19] |
| Parámetros totales | 1,1B (modelo base TinyLlama_v1.1); el artefacto guardado contiene 265 tensores de atención y layernorms |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `weights_format=attention_only_fp16`) |

## Arquitectura y entrenamiento

La base es el decoder LLaMA de TinyLlama_v1.1: 22 capas, hidden_size 2048, GQA con ratio 8:1 (32 cabezas de query, 4 de key/value), head_dim 64 y sin bias. Sobre esa base, NeuralOps aplica "attention surgery": en las 17 capas seleccionadas (esquema `hybrid_3_1`) se sustituye la atención densa por `BlockTransformerHIBA`, que combina atención densa intra-bloque con atención dispersa top-k entre bloques no locales, unificadas bajo un único softmax sobre la concatenación de puntuaciones intra e inter. Las 5 capas restantes permanecen cuadráticas como anclas. Los MLPs, `embed_tokens` y `lm_head` quedan congelados y no se incluyen en el artefacto.

El entrenamiento es una destilación de conocimiento en dos etapas (66 pasos la primera, 155 la segunda; 221 pasos totales) ejecutada en una única RTX 3090 de 24 GB, con 18.381 MB de VRAM pico y 150,4 segundos de duración. La evaluación se realiza sobre la partición de validación de WikiText-2 (`wikitext-2-raw-v1`). El resultado clave es la recuperación de perplejidad: 231,91 antes de KD y 22,01 después, frente a 8,73 del profesor TinyLlama original. El delta guardado ocupa 310,80 MB, un 85,2 % menos que el checkpoint FP16 completo.

## Capacidades

- Generación de texto causal en inglés, heredada del tokenizador y vocabulario de TinyLlama.
- Modelado de lenguaje y evaluación de perplejidad sobre corpus tipo WikiText-2.
- Atención subcuadrática experimental: el interés es medir el comportamiento de `BlockTransformerHIBA` frente a atención densa en las mismas capas.
- Carga modular mediante la API `neuralops.hub.load_surgeried_model`, que recompone el modelo a partir del delta y del base.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe: no disponible; la model card declara únicamente inglés.

## Casos de uso

- Investigación en atención eficiente: comparar la perplejidad de `BlockTransformerHIBA` (22,01) con la del profesor (8,73) en WikiText-2 para cuantificar el coste de sustituir atención densa por atención jerárquica dispersa.
- Reproducción de experimentos de attention surgery: el manifiesto `surgical_manifest.json` y `training_metrics.json` permiten replicar la topología de capas modificadas y las métricas de las dos etapas de destilación.
- Estudio de destilación de conocimiento: analizar la brecha entre el estado zero-shot (PPL 231,91) y el estado post-KD (PPL 22,01) con solo 221 pasos de optimización en una GPU de consumo.
- Benchmarking de operadores en el zoo NeuralOps: servir como punto de comparación frente a otros operadores de la misma familia `adaptive` sobre la misma base TinyLlama.
- Prototipado de pipelines de evaluación de perplejidad: usar el checkpoint como sujeto de prueba en herramientas que midan PPL sobre `wikitext-2-raw-v1` validation.
- Docencia y divulgación técnica: ejemplo compacto (310,80 MB de delta) para explicar GQA, atención dispersa por bloques y destilación en un modelo de 1,1B que cabe en una sola GPU.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`):

| Métrica | Profesor (TinyLlama_v1.1) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Perplejidad WikiText-2 (validation) | 8,73 | 231,91 | 22,01 | -209,90 |

| Telemetría de entrenamiento | Valor |
|---|---|
| Hardware | NVIDIA GeForce RTX 3090 (24 GB) |
| Pasos de optimización | 221 (etapa 1: 66; etapa 2: 155) |
| Duración | 150,4 s |
| VRAM pico | 18.381 MB |
| Tamaño del delta en disco | 310,80 MB (325.896.304 bytes) |
| Ahorro frente a FP16 completo (2,05 GB) | 1,75 GB (-85,2 %, 6,75x más pequeño) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 18.381 MB pico en una RTX 3090, pero la inferencia del modelo recompuesto (1,1B en FP16) requiere bastante menos.
- GPU recomendadas: cualquier GPU con al menos 24 GB para reproducir el entrenamiento (RTX 3090, A100, H100); para inferencia, una GPU consumer moderna con suficiente VRAM para un modelo de 1,1B en FP16.
- Cabe en GPU consumer: sí, el modelo base de 1,1B es apto para GPUs consumer; el delta por sí solo ocupa 310,80 MB.
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model` con PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato `attention_only_fp16` no es directamente compatible con esos motores sin reconstruir el modelo completo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinyllama-1.1b-block-transformer-hiba-wikitext2 | 1,1B (delta de 265 tensores) | no disponible | 22,01 | MIT | Hugging Face (0 descargas) |
| TinyLlama/TinyLlama_v1.1 (profesor) | 1,1B | no disponible en esta ficha | 8,73 (declarado por el autor) | Apache-2.0 (según el modelo base) | Hugging Face |
| Otros operadores del NeuralOps Attention Surgery Zoo | 1,1B | no disponible | no disponible | MIT | Hugging Face |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación de calidad respecto al profesor: la perplejidad final (22,01) es 2,5 veces la del TinyLlama original (8,73); no es un sustituto equivalente.
- Evaluación muy limitada: solo WikiText-2 validation y solo perplejidad; no hay evidencia sobre tareas downstream, código, matemáticas o instrucciones.
- Solo inglés: la model card declara `language: en`; no hay soporte multilingüe documentado.
- Artefacto incompleto por diseño: contiene únicamente atenciones modificadas y layernorms; requiere el modelo base TinyLlama_v1.1 y la librería `neuralops` para reconstruirse.
- Ecosistema restringido: formato `attention_only_fp16` y API propietaria del proyecto; no hay soporte documentado en vLLM, llama.cpp, Ollama o TGI.
- Resultados no verificados: la métrica de perplejidad está marcada como `verified: false` y procede del propio autor.
- Madurez: 0 descargas y 0 likes; sin validación externa ni adopción comunitaria.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo de 1,1B entrenado sobre datos de TinyLlama, hereda sus sesgos y su propensión a errores factuales.
- Licencia MIT: permite uso comercial, pero al derivar de TinyLlama_v1.1 conviene revisar las condiciones del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/tinyllama-1.1b-block-transformer-hiba-wikitext2
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama_v1.1
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/block_transformer_hiba.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset de evaluación: https://huggingface.co/datasets/Salesforce/wikitext
