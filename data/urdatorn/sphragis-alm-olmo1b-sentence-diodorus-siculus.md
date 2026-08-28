# Urdatorn/sphragis-alm-olmo1b-sentence-diodorus-siculus

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-diodorus-siculus` es un modelo de lenguaje autorial (ALM, por sus siglas en inglés) desarrollado por Urdatorn (Albin Thörn Cleland) como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` sobre las filas de entrenamiento correspondientes a un único autor, Diodoro Sículo, con el objetivo de medir la sorpresa (perplejidad) de cada frase y atribuirla al autor que mejor la explique.

El modelo sigue la metodología de Huang, Murakami y Grieve (2025), que propone atribuir autoría mediante la perplejidad de modelos de lenguaje autoriales. A diferencia del enfoque original de 100 épocas fijas, aquí la duración del entrenamiento se selecciona mediante validación sobre la propia tarea de atribución, lo que optimiza la discriminación entre autores en lugar de solo el ajuste al autor individual. Con 1.176.764.416 parámetros, es un modelo compacto pensado para investigación filológica y estilométrica, no para generación de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la ficha) |
| Tipos de cuantizacion | bf16 (pesos publicados); no se ofrecen cuantizaciones GGUF/AWQ |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivado de Apache-2.0, con restricciones por datos CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf`, un transformer decoder-only de 1.170 millones de parámetros desarrollado por el Allen Institute for AI (AI2) como parte de la familia OLMo, caracterizada por su apertura total (datos, código y pesos). Sobre esta base se realiza un further-pretraining completo con objetivo de modelado de lenguaje causal, presentando cada secuencia como `<|endoftext|> sentence <|endoftext|>`, es decir, una sola frase por secuencia.

El entrenamiento se llevó a cabo con 1.000 filas y 113.963 tokens puntuados de la partición `sentence_1` del dataset Sphragis, durante 2 épocas, con una tasa de aprendizaje de 5e-05 constante tras 25 pasos de calentamiento, un batch efectivo de 16 frases y precisión mixta (pesos maestros en fp32, cómputo en bf16) usando FSDP con sharding completo en 2 GPU GH200. La selección de épocas y del modelo base (si se parte del OLMo-1B estándar o de una versión adaptada al griego) se realizó mediante ascenso por coordenadas sobre la atribución de validación, priorizando la mejora en macro-F1 de atribución sobre la perplejidad individual del autor.

## Capacidades

- Atribución de autoría: dado un texto en griego antiguo, el modelo calcula la log-verosimilitud negativa por token y permite comparar qué modelo autorial (entre los 28 del benchmark) encuentra la frase menos sorprendente.
- Modelado de lenguaje causal específico de autor: captura patrones estilísticos y léxicos propios de Diodoro Sículo.
- Puntuación de frases individuales: diseñado para evaluar frases completas, no documentos largos.
- No soporta generación de texto libre, tool calling, agentes, visión ni audio; su uso es exclusivamente como scorer de perplejidad.

## Casos de uso

- Investigación en atribución de autoría de textos griegos antiguos: el modelo se integra en el pipeline del benchmark Sphragis para decidir, entre 28 autores, cuál es el más probable para cada frase o conjunto de frases.
- Análisis estilométrico de obras de Diodoro Sículo: permite estudiar la variación estilística dentro de su corpus y comparar pasajes dudosos.
- Detección de interpolaciones o pasajes espurios en manuscritos: al puntuar frases, se pueden identificar segmentos que se desvían del estilo del autor.
- Estudios filológicos cuantitativos: sirve como herramienta de apoyo para datar o autenticar fragmentos atribuidos a Diodoro.
- Comparación de modelos autoriales: junto con los otros 27 ALMs del benchmark, permite evaluar qué tan distintivo es el estilo de cada autor.
- Docencia e investigación en NLP para lenguas clásicas: como ejemplo de aplicación de modelos de lenguaje a tareas de estilometría en un idioma de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. La model card indica que el conjunto completo de 28 modelos alcanza los siguientes resultados de test macro-F1 en el benchmark Sphragis:

| Particion | Macro-F1 |
|---|---|
| sentence_1 | 62.36 |
| sentence_5 | 86.84 |
| sentence_10 | 89.53 |
| sentence_50 | 92.44 |

Estos valores corresponden al rendimiento agregado del sistema de atribución, no a este modelo en particular.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~1.17B parámetros en bf16, los pesos ocupan aproximadamente 2.4 GB; con overhead de activaciones y KV cache, se recomiendan al menos 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (p. ej., RTX 2060, RTX 3060, RTX 4090) es suficiente para inferencia; el entrenamiento se realizó en 2x GH200, pero no es necesario para uso.
- Opciones de despliegue: al ser un modelo de HuggingFace en formato safetensors, puede cargarse con transformers estándar; también es compatible con vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no se han publicado mediciones específicas; para un modelo de este tamaño, la inferencia en GPU moderna es de decenas de frases por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo1b-sentence-diodorus-siculus | 1.17B | no disponible | other | Atribución de autoría en griego antiguo |
| Urdatorn/sphragis-alm-olmo3-7b-diodorus-siculus | 7B (aprox.) | no disponible | other | Atribución de autoría en griego antiguo (versión mayor) |
| allenai/OLMo-1B-hf | 1.17B | 2048 (según documentación de OLMo) | Apache-2.0 | Modelo base de lenguaje general en inglés |

La comparativa con el modelo de 7B del mismo autor muestra que la versión de 1B es más ligera y adecuada para entornos con recursos limitados, aunque probablemente con menor capacidad de capturar matices estilísticos. Frente al modelo base OLMo-1B, este ALM está especializado exclusivamente en griego antiguo y en la tarea de puntuación de perplejidad, perdiendo la capacidad de generación general.

## Limitaciones y advertencias

- Entrenado únicamente con datos de un solo autor (Diodoro Sículo) y un volumen reducido (1.000 frases); su capacidad de generalización a otros autores o variedades del griego antiguo es limitada.
- No es un modelo de generación de texto; intentar usarlo para producir prosa en griego antiguo dará resultados pobres o incoherentes.
- La licencia `other` restringe el uso comercial: los datos de entrenamiento incluyen material CC BY-NC-SA, por lo que cualquier uso derivado debe respetar esas condiciones.
- Riesgo de alucinación en tareas de atribución si se aplica fuera del dominio de entrenamiento (p. ej., textos de épocas o dialectos muy diferentes).
- No se proporcionan cuantizaciones de menor precisión, lo que puede limitar su despliegue en dispositivos con poca memoria.
- La fecha de creación (2026) y la ausencia de descargas o likes sugieren que es un modelo muy reciente y poco validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-diodorus-siculus
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Repositorio de código (entrenamiento, puntuación y atribución): https://github.com/Urdatorn/sphragis_models
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B-hf
- Página de OLMo en AI2: https://allenai.org/olmo
- Paper de OLMo: https://arxiv.org/html/2402.00838v1
- Paper de referencia sobre atribución por perplejidad (Huang, Murakami y Grieve, 2025): PLoS ONE 20(7): e0327081 (no se proporciona enlace directo)
