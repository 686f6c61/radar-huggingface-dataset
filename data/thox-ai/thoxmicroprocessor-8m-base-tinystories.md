# Thox-ai/ThoxMicroprocessor-8M-Base-TinyStories

## Resumen

ThoxMicroprocessor-8M-Base-TinyStories es un modelo de lenguaje de tipo decoder, entrenado desde cero por THOX.ai, con 8.093.520 parámetros totales (5.472.080 no correspondientes a embeddings). Se publica como checkpoint de validación de arquitectura de la línea de modelos diminutos de THOX, no como un modelo de producto: el objetivo declarado es servir de base para trabajo de enrutamiento local, extracción estructurada y control de dispositivos en el futuro, pero este checkpoint concreto no implementa ninguna de esas capacidades.

La arquitectura, denominada `thox-microprocessor-v0.2`, es un transformer decoder con atención dominante, `d_model` de 320, 21 capas, 8 cabezas de atención y 2 cabezas KV (GQA), normalización RMS en QK, normalización tipo sándwich y un mezclador blockwise Walsh-Hadamard. La longitud de contexto es de 1024 tokens. El modelo se ha entrenado únicamente con el corpus TinyStories (historias infantiles sintéticas), con 98,3 millones de tokens.

Su relevancia práctica es limitada y muy específica: sirve para estudiar el comportamiento de una arquitectura propia a escala de 8 millones de parámetros, validar la cuantización INT4 de THOX (payload de pesos de 4,45 MB) y experimentar con despliegue en dispositivos de borde. No es un modelo apto para generación de texto general, razonamiento, código ni ninguna tarea de dominio real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (atención dominante), `thox-microprocessor-v0.2` |
| Parámetros totales | 8.093.520 (5.472.080 no-embedding) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | INT4 (group size 64), INT4 con embedding INT8; pesos originales en safetensors (fp32/fp16 según repo) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (datos de entrenamiento TinyStories bajo CDLA-Sharing-1.0, implicaciones share-alike en revisión) |
| Formato de pesos | Safetensors (`model.safetensors`, 32.400.144 B) |
| `d_model` | 320 |
| Capas | 21 |
| Cabezas de atención / KV | 8 / 2 |
| Normalización | QK RMS norm, sandwich norm |
| Mezclador especial | Blockwise Walsh-Hadamard mixer |
| Tokens de entrenamiento | 98,3M (TinyStories) |
| Payload INT4 | 4,45 MB (4,40 bits efectivos por parámetro) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de 21 capas con `d_model` de 320, 8 cabezas de consulta y 2 cabezas KV (atención con query grouping). Incorpora dos innovaciones destacables respecto a un transformer estándar de este tamaño: normalización RMS aplicada a queries y keys (QK RMS norm) y normalización tipo sándwich (pre y post normalización en cada bloque). Además, incluye un mezclador blockwise Walsh-Hadamard, una transformación ortogonal de bajo coste computacional que sustituye o complementa parte del procesamiento de mezcla de tokens.

El entrenamiento se realizó desde cero, sin modelo base externo, sobre el corpus TinyStories, un conjunto de historias infantiles sintéticas generadas para estudiar el aprendizaje lingüístico en modelos pequeños. Se utilizaron 98,3 millones de tokens. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación posterior. La implementación de referencia incluida en el repositorio (`trust_remote_code=True`) recalcula el prefijo en cada paso de decodificación en lugar de mantener una caché KV, priorizando la portabilidad entre versiones de `transformers`; para decodificación con caché se indica el paquete `thox_microprocessor`.

## Capacidades

- Generación de texto narrativo simple en inglés, limitada al dominio de historias infantiles sintéticas del corpus TinyStories.
- No dispone de capacidades de razonamiento, matemáticas, código ni visión; el autor lo declara explícitamente fuera de alcance.
- No soporta tool calling ni function calling en este checkpoint.
- No soporta comportamiento de agente ni razonamiento multi-paso.
- Multilingüismo: únicamente inglés.
- No dispone de modo thinking, audio ni ninguna modalidad adicional.
- Sirve como banco de pruebas de la arquitectura `thox-microprocessor-v0.2` y de la cuantización INT4 de THOX.

## Casos de uso

- Validación de arquitectura: investigadores que quieran reproducir o auditar el diseño `thox-microprocessor-v0.2` (QK RMS norm, sandwich norm, Walsh-Hadamard mixer) pueden cargar los pesos y comparar su comportamiento frente a un transformer decoder convencional de 8M parámetros.
- Estudio de aprendizaje lingüístico en modelos diminutos: el modelo permite analizar qué estructuras gramaticales y de vocabulario adquiere un decoder de 8M parámetros entrenado con 98,3M tokens de TinyStories, siguiendo la línea de investigación original de ese corpus.
- Evaluación de cuantización: con métricas publicadas de pérdida held-out (1,6956 en precisión original, +0,0366 con INT4 y +0,0162 con INT4 + embedding INT8), sirve para estudiar el compromiso entre tamaño (4,45 MB vs 5,76 MB) y calidad en modelos de muy baja escala.
- Pruebas de despliegue en dispositivos de borde: el payload INT4 de 4,45 MB permite experimentar con pipelines de inferencia en microcontroladores o SBCs, midiendo código, overhead del allocator, activaciones y caché KV, tal como advierte el autor.
- Docencia y divulgación: un modelo de 8M parámetros entrenado desde cero es un caso didáctico manejable para explicar tokenización, atención con GQA, normalización y decodificación autoregresiva sin requerir hardware especializado.
- Generación de cuentos sintéticos para pruebas de pipelines: puede emplearse para producir texto de relleno con estructura narrativa simple en entornos de test de sistemas de procesamiento de lenguaje, siempre que no se requiera coherencia factual.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Pérdida held-out (TinyStories validation, 2.095.104 tokens objetivo) | 1,6956 |
| Perplejidad held-out | 5,4499 |
| Coste de cuantización INT4 | +0,0366 de pérdida held-out (4,45 MB) |
| Coste de cuantización INT4 + embedding INT8 | +0,0162 de pérdida held-out (5,76 MB) |
| THOX GATE49 | No publicado para este modelo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precisión original (pesos de 32,4 MB más activaciones y caché KV de 1024 tokens); aproximadamente 5-6 MB de payload de pesos en INT4.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo está pensado para CPU y dispositivos de borde más que para aceleradores de datacenter.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650) e incluso en SBCs y microcontroladores con suficiente memoria, según la cualificación que el autor deja pendiente de medir.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (implementación de referencia sin caché KV), paquete `thox_microprocessor` para decodificación con caché. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La implementación de referencia, al recalcular el prefijo en cada paso, es sensiblemente más lenta que una decodificación con caché KV.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxMicroprocessor-8M-Base-TinyStories | 8,09M | 1024 | 98,3M tokens TinyStories | Apache-2.0 | Hugging Face |
| TinyStories-1M (variantes de la literatura) | ~1M | no disponible | TinyStories | variable | Hugging Face |
| TinyStories-33M (variantes de la literatura) | ~33M | no disponible | TinyStories | variable | Hugging Face |
| Modelos decoder de 8-10M parámetros de propósito general | ~8-10M | variable | corpora mixtos | variable | no disponible |

La comparación con alternativas de la misma categoría es difícil porque los modelos de 8M parámetros entrenados desde cero son escasos y rara vez publican métricas comparables. Los modelos de la familia TinyStories de la literatura (1M, 9M, 33M) son los referentes más cercanos, pero no se dispone en la información proporcionada de sus resultados de perplejidad en el mismo split para establecer una comparación numérica rigurosa.

## Limitaciones y advertencias

- Entrenado exclusivamente con TinyStories; cualquier salida fuera de ese dominio carece de sentido, tal como advierte el autor.
- No tiene capacidades de enrutamiento, tool calling, control de dispositivos ni conocimiento de dominio THOX, pese a lo que sugiere el nombre del modelo.
- Riesgo alto de errores factuales y de producir afirmaciones seguras pero incorrectas; verificar cualquier respuesta.
- Solo inglés; no hay soporte multilingüe.
- Contexto limitado a 1024 tokens.
- La cuantización INT4 degrada la calidad (+0,0366 de pérdida held-out), aunque el coste es moderado.
- Licencia Apache-2.0 declarada, pero los datos de entrenamiento (TinyStories, CDLA-Sharing-1.0) tienen implicaciones share-alike que el autor indica que están en revisión; conviene aclarar esto antes de un uso comercial.
- Uso previsto exclusivamente para investigación y validación de arquitectura; fuera de alcance cualquier uso en producción, médico, legal, financiero o de seguridad crítica.
- La implementación de referencia sin caché KV puede ser inaceptablemente lenta para generación de secuencias largas.
- El repositorio no incluye resultados de benchmarks estándar que permitan situar el modelo frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxMicroprocessor-8M-Base-TinyStories
- Corpus TinyStories (referencia del dataset de entrenamiento): https://huggingface.co/datasets/roneneldan/TinyStories
- Paper TinyStories (Eldan y Li, 2023): https://arxiv.org/abs/2305.07759
- Sitio del autor: https://thox.ai
