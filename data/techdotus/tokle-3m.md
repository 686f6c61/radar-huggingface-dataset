# techdotus/Tokle-3M

## Resumen

Tokle-3M es un modelo de lenguaje decoder-only de 2,91 millones de parámetros desarrollado por el equipo Tech.us y publicado en Hugging Face. Se trata de un artefacto de investigación orientado al estudio de modelos de lenguaje a muy pequeña escala, no de un asistente conversacional. Su interés técnico principal reside en la técnica de entrenamiento empleada: una matriz estática de sesgo de atención por pares de tokens (SPAB, *Static Pairwise Attention Bias*) construida a partir de información mutua puntual (PMI) sobre el corpus de entrenamiento, que se utiliza durante el preentrenamiento y luego se destila en los pesos del modelo.

La arquitectura es un transformer decoder-only convencional con RMSNorm, RoPE, atención multi-query (GQA con una sola KV head) y SwiGLU, con 9 capas, dimensión oculta de 144 y una longitud máxima de secuencia de 512 tokens. El entrenamiento se realizó en dos fases: 12.000 millones de tokens con la tabla SPAB activa (11,3 millones de parámetros totales, de los cuales 8,39 millones son la tabla congelada) y 500 millones de tokens adicionales sin SPAB para destilar ese conocimiento en los 2,91 millones de parámetros finales.

El modelo es relevante para investigadores interesados en sesgos inductivos externos y en cómo transferirlos a modelos pequeños, así como para quienes estudian metodologías de evaluación de SLMs (el autor publica resultados siguiendo la metodología del Open SLM Leaderboard). Su licencia CC BY-NC-SA 4.0 restringe el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RMSNorm, RoPE, GQA, SwiGLU) |
| Parámetros totales | 2.908.944 (2,91 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | No disponible (pesos en FP32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Pesos: CC BY-NC-SA 4.0; código, tokenizer y scripts: MIT |
| Formato de pesos | safetensors (transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 9 capas con dimensión oculta de 144, 3 cabezas de atención de dimensión 48, una única KV head (atención multi-query), FFN con tamaño intermedio de 432 y SwiGLU, normalización RMSNorm y embeddings de posición rotatorios (RoPE). Los embeddings de palabras están atados (*tied*). El tokenizer es BPE con un vocabulario de 5.048 tokens.

La innovación principal es SPAB: una tabla congelada de 8,39 millones de puntuaciones de asociación entre pares de tokens, calculadas mediante información mutua puntual sobre el corpus de entrenamiento. Durante el preentrenamiento (12.000 millones de tokens), para cada par query-key se aplicaba un hash sobre los dos IDs de token, se recuperaba su valor PMI, se escalaba por un factor aprendido por cabeza y se sumaba a los logits de atención antes del softmax. En una segunda fase de destilación (500 millones de tokens) se eliminó la tabla y se entrenó el modelo para absorber ese prior en sus propias capas, de modo que la versión publicada es autocontenida y funciona únicamente con sus 2,91 M de parámetros. No se documenta uso de RLHF, DPO ni ajuste por instrucciones.

Los datos de entrenamiento son una mezcla curada: FineWeb-Edu (43,1 %), Cosmopedia (24,3 %), OpenMathInstruct-2 (13,5 %), Tiny Strange Textbooks (9,0 %), MegaScience de medicina y biología de curación propia (5,0 %), High-Quality English Sentences (3,0 %), ScienceQA (1,2 %) y Orca-Math Word Problems 200k (0,9 %). Se reservó un 1 % para validación.

## Capacidades

- Generación de texto autoregresiva en inglés, con decodificación greedy o por muestreo.
- Razonamiento aritmético básico (evaluado con ArithMark-3, 40,80 %).
- Conocimiento factual y de sentido común a nivel muy elemental (HellaSwag 27,20 %, PIQA 55,01 %).
- Comprensión de preguntas científicas de nivel escolar (ARC-Easy 34,85 %, ARC-Challenge 23,98 %).
- Continuación de texto con penalización de repetición configurable.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo *thinking*, visión ni audio.
- Multilingüismo limitado al inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Investigación sobre sesgos inductivos en atención: el modelo permite reproducir el experimento SPAB (comparar Tokle-SPAB-3M con tabla activa frente a Tokle-3M destilado) para estudiar cuánto conocimiento estructural puede transferirse a un modelo minúsculo.
- Docencia y divulgación de arquitecturas transformer: con 9 capas y dimensión 144, es viable inspeccionar todos los pesos, mapas de atención y activaciones en un portátil sin GPU dedicada.
- Experimentos de destilación de priors: sirve como caso base para probar técnicas de eliminación de componentes auxiliares en entrenamiento (tablas, adaptadores, módulos externos) y medir la pérdida de rendimiento.
- Evaluación comparativa de SLMs: sus resultados publicados bajo la metodología del Open SLM Leaderboard permiten integrarlo como referencia en estudios de modelos por debajo de 5 M de parámetros.
- Pruebas de pipelines de inferencia en CPU: al ocupar unos pocos megabytes en FP32, es útil para validar integraciones con `transformers` y `trust_remote_code` en entornos con recursos mínimos.
- Generación de texto de relleno o sintético para pruebas de *software*: útil para validar *front-ends*, sistemas de streaming de tokens o herramientas de logging sin coste de GPU, aceptando la baja coherencia del resultado.
- Estudio de tokenizadores pequeños: su vocabulario BPE de 5.048 tokens permite analizar el efecto del tamaño de vocabulario en modelos de muy baja escala.

## Benchmarks y rendimiento

Resultados publicados por el autor, 0-shot acc_norm con la metodología del Open SLM Leaderboard:

| Modelo | Parámetros | Int Index | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark-3 |
|---|---|---|---|---|---|---|---|
| Tokle-3M | 2,91 M | 8,91 | 27,20 % | 34,85 % | 23,98 % | 55,01 % | 40,80 % |
| pulvis-v2 | 2,96 M ×3 | 8,62 | 27,93 % | 31,86 % | 22,78 % | 56,86 % | 37,40 % |
| Purrence-3M | 2,99 M ×6 | 8,49 | 27,81 % | 34,55 % | 23,63 % | 56,64 % | 34,80 % |
| Ember-2 | 2,96 M ×2 | 7,21 | 27,28 % | 33,42 % | 22,01 % | 55,11 % | 35,90 % |

Ablación SPAB frente a destilado:

| Modelo | Parámetros | Int Index | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark-3 |
|---|---|---|---|---|---|---|---|
| Tokle-SPAB-3M | 11,3 M (2,91 M entrenables + 8,39 M congelados) | 9,16 | 27,22 % | 34,68 % | 24,49 % | 54,95 % | 41,70 % |
| Tokle-3M | 2,91 M | 8,91 | 27,20 % | 34,85 % | 23,98 % | 55,01 % | 40,80 % |

## Requisitos de hardware

- Inferencia en FP32: aproximadamente 11,6 MB de pesos (2,91 M × 4 bytes), más overhead de activaciones y tokenizer; cabe holgadamente en cualquier CPU moderna.
- No requiere GPU: puede ejecutarse en CPU con `transformers` en milisegundos por token.
- GPU recomendadas: cualquiera con al menos 1 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, A100, H100); el modelo no aprovecha la capacidad de cómputo de GPU de gama alta por su tamaño.
- Cabe en cualquier GPU de consumo e incluso en dispositivos embebidos (Raspberry Pi, móviles) con el runtime adecuado.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF publicados limita el uso en esos entornos sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | HellaSwag | ARC-Easy | PIQA | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Tokle-3M | 2,91 M | 512 | CC BY-NC-SA 4.0 | 27,20 % | 34,85 % | 55,01 % | Hugging Face |
| pulvis-v2 | 2,96 M ×3 | No disponible | No disponible | 27,93 % | 31,86 % | 56,86 % | Open SLM Leaderboard |
| Purrence-3M | 2,99 M ×6 | No disponible | No disponible | 27,81 % | 34,55 % | 56,64 % | Open SLM Leaderboard |
| Ember-2 | 2,96 M ×2 | No disponible | No disponible | 27,28 % | 33,42 % | 55,11 % | Open SLM Leaderboard |

Los modelos comparables son todos del entorno del Open SLM Leaderboard, con parámetros efectivos similares. Tokle-3M obtiene el mejor índice de inteligencia (8,91) y los mejores resultados en ARC-Easy, ARC-Challenge y ArithMark-3, mientras que pulvis-v2 y Purrence-3M superan ligeramente en PIQA y HellaSwag. La notación "×N" indica, según la fuente, configuraciones con múltiples instancias o componentes; el detalle no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo minúsculo: con 2,91 M de parámetros y estados ocultos de 144 dimensiones, las generaciones suelen ser repetitivas, incoherentes o factualmente incorrectas. El propio autor lo describe como artefacto de investigación, no como asistente.
- Contexto muy corto: 512 tokens máximo; las tablas RoPE no se construyen más allá de esa longitud.
- Solo inglés: entrenado exclusivamente con texto en inglés (web, educativo, sintético y matemático).
- Sin ajuste por instrucciones ni alineamiento de seguridad: puede reproducir sesgos presentes en los datos web y no rechaza peticiones dañinas.
- Licencia de pesos CC BY-NC-SA 4.0: uso no comercial únicamente, con atribución obligatoria y obligación de compartir derivados (incluidos fine-tunes) bajo la misma licencia. El código, tokenizer y scripts son MIT.
- Requiere `trust_remote_code=True` por su arquitectura personalizada, lo que implica ejecutar código del repositorio; conviene auditar el código antes de desplegarlo.
- Riesgo elevado de alucinación factual dada la escala y la ausencia de alineamiento.
- No apto para producción en tareas de atención al cliente, generación de código, agentes o cualquier escenario que requiera fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/techdotus/Tokle-3M
- Modelo de la fase 1 (SPAB activo): https://huggingface.co/techdotus/Tokle-SPAB-3M
- Open SLM Leaderboard (metodología de evaluación citada): no disponible como URL en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Repositorio de código: no disponible como URL independiente en la información proporcionada (el código se distribuye con el modelo bajo licencia MIT)
