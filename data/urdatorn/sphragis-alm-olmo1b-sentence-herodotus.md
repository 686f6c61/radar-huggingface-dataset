# Urdatorn/sphragis-alm-olmo1b-sentence-herodotus

## Resumen

`sphragis-alm-olmo1b-sentence-herodotus` es un modelo de lenguaje autoría (authorial language model, ALM) desarrollado por Urdatorn para el benchmark de atribución de autoría en griego antiguo Sphragis. Forma parte de un conjunto de 28 modelos, cada uno entrenado exclusivamente sobre las oraciones de un autor clásico; este en particular modela la prosa de Heródoto. El modelo parte de `allenai/OLMo-1B-hf` y se somete a un further-pretraining completo sobre 5.900 oraciones (396.563 tokens puntuados) de la partición `sentence_1` del dataset Sphragis.

La relevancia de este modelo radica en su enfoque metodológico: en lugar de entrenar durante un número fijo de épocas como en trabajos previos, la duración del entrenamiento se selecciona mediante ascenso por coordenadas sobre la atribución de validación, optimizando directamente la capacidad discriminativa entre autores. Con 1.176.764.416 parámetros, es un modelo compacto pero especializado, diseñado para calcular la perplejidad de oraciones y atribuirlas al autor cuyo modelo las encuentra menos sorprendentes. Su licencia es `other` debido a las licencias mixtas de los textos fuente, que incluyen material CC BY-NC-SA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (hereda la de OLMo-1B, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de fuentes con licencias mixtas, incl. CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `allenai/OLMo-1B-hf` (revisión `aee7752d9c08ee4775e9b0091426d8410e8f6a89`), un transformer decoder-only de 1.000 millones de parámetros desarrollado por el Allen Institute for AI. El entrenamiento se realiza con objetivo de modelado de lenguaje causal sobre secuencias de la forma `<|endoftext|> sentence <|endoftext|>`, una oración por secuencia. Se emplean 2 épocas, una tasa de aprendizaje de 5e-05 constante tras 25 pasos de calentamiento, un batch efectivo de 16 oraciones, y precisión mixta con pesos maestros en fp32 y cómputo en bf16, usando FSDP con sharding completo sobre 2 GPU GH200.

La innovación principal es la selección de hiperparámetros: el número de épocas y el modelo base (vanilla OLMo-1B o la versión adaptada al griego) se eligen mediante ascenso por coordenadas sobre la macro-F1 de atribución en validación, en lugar de fijar 100 épocas como en el trabajo de Huang, Murakami y Grieve (2025). Esto responde a que la atribución no requiere maximizar el ajuste al autor propio, sino maximizar la diferencia de ajuste frente a los otros 27 modelos.

## Capacidades

- Generación de texto en griego antiguo con estilo similar al de Heródoto, aunque su propósito principal no es la generación sino la evaluación de perplejidad.
- Cálculo de perplejidad por token (negative log-likelihood) para oraciones completas, siguiendo el formato exacto de entrenamiento.
- Discriminación estilométrica: al comparar la perplejidad de una oración entre los 28 modelos del conjunto, permite atribuir la autoría al modelo que la encuentra menos sorprendente.
- Especialización en un único autor: el modelo solo conoce la prosa de Heródoto, no es multiuso ni multilingüe.
- No soporta tool calling, agentes, ni razonamiento multi-paso; es un modelo de investigación pura.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: dado un corpus de oraciones sin atribuir, se puntúa cada oración con los 28 modelos y se asigna al autor con menor perplejidad media. Es el caso de uso principal y el que motivó su creación.
- Análisis estilométrico filológico: investigadores pueden usar la perplejidad de este modelo como una medida cuantitativa de la proximidad estilística de un texto dudoso con la prosa de Heródoto, complementando métodos tradicionales de crítica textual.
- Evaluación de hipótesis de autoría en fragmentos: para obras completas o fragmentos atribuidos de forma incierta, el modelo proporciona una puntuación objetiva basada en la probabilidad de las secuencias, útil en debates académicos sobre autoría.
- Investigación en estilometría computacional: el modelo sirve como referencia para estudiar cómo la longitud de contexto (sentence_1, sentence_5, sentence_10, sentence_50) afecta a la precisión de atribución, como se refleja en los resultados agregados del benchmark.
- Reproducción de experimentos de atribución: dado que el código de entrenamiento y evaluación está publicado en GitHub, otros investigadores pueden replicar el proceso o adaptarlo a otros autores o lenguas.
- Comparación de métodos de atribución: el modelo puede usarse como baseline frente a técnicas basadas en n-gramas, vectores de estilo o clasificadores supervisados, dentro del marco del benchmark Sphragis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. La model card indica que el conjunto completo de 28 modelos alcanza una macro-F1 de 62,36 en la partición `sentence_1`, 86,84 en `sentence_5`, 89,53 en `sentence_10` y 92,44 en `sentence_50` del test de Sphragis. Estos valores son agregados del conjunto, no de este modelo en particular, y no se desglosan por autor. No se dispone de comparaciones con otros modelos de atribución en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 2,4 GB (tamaño del repositorio). Con overhead de activaciones y KV cache, se puede ejecutar en una GPU con 6-8 GB de VRAM para secuencias cortas (una oración).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, etc.) es suficiente para inferencia. Para entrenamiento se usaron 2x GH200, pero no es necesario para uso del modelo.
- Cabe en GPUs consumer: sí, en prácticamente cualquier GPU moderna de 8 GB o más.
- Opciones de despliegue: al ser un modelo HuggingFace estándar, puede cargarse con transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama. Para el uso previsto (scoring de perplejidad), basta con la API de `transformers` y cálculo de loss.
- Latencia y throughput: no disponible. Dado el tamaño (1B) y la longitud de secuencia (una oración), la inferencia es rápida en GPU, del orden de milisegundos por oración, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `sphragis-alm-olmo1b-sentence-herodotus` (este) | 1,17B | no disponible | other | ALM sobre OLMo-1B, 2 épocas |
| `sphragis-alm-olmo3-greek-7b-herodotus` | 7B (aprox.) | no disponible | other | ALM sobre OLMo-3 7B adaptado al griego, mismo autor |
| `allenai/OLMo-1B-hf` (base) | 1,17B | 2048 (conocido, pero no en la ficha) | Apache-2.0 | Modelo general en inglés, sin especialización |

La comparación directa con el modelo de 7B muestra que ambos persiguen el mismo objetivo (atribución de Heródoto) pero con distinta capacidad y probablemente distinto rendimiento. El modelo base OLMo-1B no es útil para atribución en griego antiguo sin fine-tuning. No se dispone de datos de rendimiento individuales para comparar numéricamente.

## Limitaciones y advertencias

- Es un modelo de investigación, no un modelo de propósito general: no genera texto útil fuera del ámbito de la prosa de Heródoto y no entiende instrucciones ni mantiene conversaciones.
- Sesgo de autor: entrenado exclusivamente con oraciones de Heródoto, por lo que su perplejidad será baja para textos de ese autor y alta para otros; no debe usarse para medir calidad lingüística general.
- Riesgo de sobreajuste: al entrenar solo 2 épocas sobre 5.900 oraciones, el modelo puede memorizar patrones superficiales; la selección por atribución mitiga esto, pero no lo elimina.
- Licencia restrictiva: la licencia `other` impide su uso comercial sin verificar las licencias de las fuentes del dataset Sphragis (incluye CC BY-NC-SA). Cualquier redistribución o uso comercial requiere revisar `LICENSES.md` del dataset.
- Limitación de idioma: solo griego antiguo; no soporta otros idiomas ni variantes modernas.
- Sin garantías de producción: no hay documentación sobre latencia, robustez o seguridad; no está pensado para entornos productivos.
- Dependencia del formato de entrada: para obtener puntuaciones válidas, las oraciones deben procesarse exactamente como en el entrenamiento (`<|endoftext|> sentence <|endoftext|>`), lo que requiere seguir el código de scoring publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-herodotus
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y evaluación: https://github.com/Urdatorn/sphragis_models
- Leaderboard del benchmark: https://urdatorn-sphragis-leaderboard.static.hf.space/index.html
- Paper de referencia (Huang, Murakami y Grieve, 2025): PLoS ONE 20(7): e0327081 (DOI no proporcionado)
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B-hf
- Paper de OLMo: https://arxiv.org/html/2402.00838v1
- Repositorio de OLMo: https://github.com/allenai/OLMo
