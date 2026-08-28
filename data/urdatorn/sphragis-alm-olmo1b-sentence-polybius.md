# Urdatorn/sphragis-alm-olmo1b-sentence-polybius

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-polybius` es un modelo de lenguaje autorial (ALM, por sus siglas en inglés) desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Sigue la metodología propuesta por Huang, Murakami y Grieve (2025) en su artículo "Attributing authorship via the perplexity of authorial language models", publicada en PLoS ONE. El objetivo es atribuir la autoría de un texto comparando la perplejidad que le asignan distintos modelos, cada uno entrenado exclusivamente con las obras de un autor concreto.

Este modelo concreto se ha entrenado sobre las obras de Polibio, historiador griego del siglo II a.C., a partir de una continuación del preentrenamiento de `allenai/OLMo-1B-hf`, un transformer causal de 1.176.764.416 parámetros. La particularidad frente al método original es que la duración del entrenamiento (4 épocas) no se fija arbitrariamente, sino que se selecciona mediante ascenso por coordenadas sobre la atribución de validación, optimizando directamente la macro-F1 de atribución en lugar de la perplejidad del propio autor. El modelo forma parte de un conjunto de 28 ALMs que, trabajando conjuntamente, alcanzan una macro-F1 de 62,36 en la tarea de atribución sobre frases individuales (`sentence_1`), 86,84 sobre 5 frases, 89,53 sobre 10 y 92,44 sobre 50.

La relevancia de este modelo reside en su enfoque metodológico: demuestra que la selección de hiperparámetros basada en la tarea final de atribución mejora los resultados frente a esquemas fijos, y proporciona una herramienta específica para la investigación filológica y estilométrica sobre textos clásicos griegos. Su licencia es `other` debido a las licencias mixtas de las fuentes del corpus de entrenamiento, lo que limita su uso comercial sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basado en OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de `allenai/OLMo-1B-hf`, un transformer causal de 1.170 millones de parámetros desarrollado por el Allen Institute for AI. Sobre esta base se realiza un further-pretraining completo (no un fine-tuning ligero) utilizando únicamente las filas de entrenamiento correspondientes a Polibio dentro del dataset Sphragis. Cada secuencia de entrenamiento consiste en una única frase delimitada por tokens especiales: `<|endoftext|> sentence <|endoftext|>`, con el objetivo de modelar la probabilidad de cada frase de forma independiente.

El entrenamiento se realizó con 4 épocas sobre 3.000 filas y 336.523 tokens puntuados de la división `sentence_1`. Se usó una tasa de aprendizaje constante de 5e-05 tras 25 pasos de warmup, un tamaño de batch efectivo de 16 frases, y precisión mixta con pesos maestros en fp32 y cómputo en bf16, empleando FSDP con sharding completo sobre 2 GPU GH200. La elección del número de épocas y del modelo base (si se partía del OLMo-1B vanilla o de una versión adaptada al griego) se realizó mediante ascenso por coordenadas sobre la macro-F1 de atribución en el conjunto de validación, un enfoque que difiere del método original de Huang y colaboradores, que fijaba 100 épocas sin criterio de selección.

## Capacidades

- Atribución de autoría: dado un texto en griego antiguo, el modelo puede puntuar su perplejidad por token y compararla con la de otros 27 modelos autoriales para asignar la autoría más probable.
- Modelado de lenguaje causal: al ser un LM entrenado con objetivo causal, puede generar texto en griego antiguo, aunque su propósito principal no es la generación sino la evaluación de probabilidades.
- Especialización en un autor concreto: está optimizado para capturar el estilo de Polibio, lo que lo hace especialmente sensible a las características idiosincrásicas de su prosa.
- Integración en pipelines de atribución: el código de entrenamiento, puntuación y atribución está disponible en el repositorio `Urdatorn/sphragis_models`, permitiendo reproducir el flujo completo.
- No dispone de tool calling, ni capacidades multimodales, ni soporte para agentes; su funcionalidad se limita al modelado de lenguaje y a la puntuación de perplejidad.

## Casos de uso

- Atribución de autoría de textos clásicos: el modelo puede emplearse para determinar si un fragmento anónimo o de dudosa autoría pertenece a Polibio, puntuando su perplejidad y comparándola con la de otros ALMs del conjunto Sphragis.
- Análisis estilométrico cuantitativo: investigadores en filología clásica pueden utilizar la perplejidad como métrica de similitud estilística entre diferentes obras o pasajes.
- Evaluación de hipótesis de interpolación textual: en la crítica textual, se puede comprobar si un pasaje sospechoso de ser una interpolación posterior muestra una perplejidad significativamente mayor bajo el modelo de Polibio que bajo otros modelos de autores contemporáneos.
- Benchmarking de métodos de atribución: el modelo sirve como componente de referencia para comparar nuevas técnicas de atribución de autoría en griego antiguo, dado que forma parte de un benchmark estandarizado con resultados publicados.
- Entrenamiento de modelos autoriales para otros autores: la metodología de selección de épocas basada en atribución puede replicarse para crear ALMs de otros autores clásicos, usando este modelo como ejemplo de implementación.
- Investigación sobre la influencia de la longitud del contexto en la atribución: al existir variantes del benchmark con 1, 5, 10 y 50 frases, el modelo permite estudiar cómo mejora la precisión al aumentar el contexto disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. Sin embargo, el conjunto completo de 28 modelos autoriales del benchmark Sphragis, del que este modelo forma parte, alcanza los siguientes resultados en el conjunto de test:

| Tarea | Macro-F1 |
|---|---|
| sentence_1 (1 frase) | 62,36 |
| sentence_5 (5 frases) | 86,84 |
| sentence_10 (10 frases) | 89,53 |
| sentence_50 (50 frases) | 92,44 |

Estos valores corresponden al rendimiento agregado del sistema de 28 modelos, no a este modelo de forma aislada. No se dispone de comparaciones con otros modelos de atribución de autoría en griego antiguo en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 2,35 GB (1.176.764.416 parámetros × 2 bytes). Con overhead de activaciones y memoria del runtime, se recomienda al menos 4 GB de VRAM para inferencia en lotes pequeños.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM, como una NVIDIA GTX 1650 Super, RTX 3050 o superior. Para inferencia con mayor throughput, una RTX 3060 12 GB o superior es suficiente.
- Entrenamiento: el modelo se entrenó con 2 GPU NVIDIA GH200, pero para fine-tuning adicional se necesitarían GPUs con al menos 16 GB de VRAM (por ejemplo, A100, RTX 4090) dependiendo del tamaño de lote.
- Opciones de despliegue: al ser un modelo basado en OLMo, es compatible con el ecosistema de HuggingFace Transformers. Puede cargarse con `AutoModelForCausalLM` y ejecutarse en frameworks como vLLM o llama.cpp, aunque no hay confirmación explícita de compatibilidad en la documentación del modelo.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la inferencia de una frase de longitud media (50-100 tokens) debería completarse en decenas de milisegundos, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| `sphragis-alm-olmo1b-sentence-polybius` (este) | OLMo-1B | 1,17B | No disponible | other | Atribución de autoría en griego antiguo |
| `sphragis-alm-olmo3-7b-polybius` | OLMo-3-1025-7B | 7B (aprox.) | No disponible | other | Atribución de autoría en griego antiguo (misma metodología, mayor tamaño) |
| `allenai/OLMo-1B-hf` (base) | - | 1,17B | 2048 (según documentación de OLMo) | Apache-2.0 | Modelo de lenguaje general en inglés |

La comparativa se limita a los modelos disponibles en la información proporcionada. El modelo de 7B es una versión más grande del mismo enfoque, pero no se dispone de sus resultados individuales. El modelo base OLMo-1B no está especializado en griego antiguo ni en atribución de autoría, por lo que no es directamente comparable en la tarea.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo licencia `other` debido a que el corpus de entrenamiento incluye material con licencia CC BY-NC-SA. Cualquier uso comercial requiere verificar las licencias de las fuentes en el archivo `LICENSES.md` del dataset Sphragis.
- Especialización extrema: el modelo está entrenado únicamente con textos de Polibio, por lo que su capacidad de generalización a otros autores o estilos es nula. No debe usarse como modelo de lenguaje general para griego antiguo.
- Riesgo de sobreajuste: al entrenarse sobre un único autor y con un número reducido de tokens (336.523), el modelo puede memorizar pasajes concretos en lugar de aprender patrones estilísticos generales, lo que podría inflar las métricas de atribución en el corpus de entrenamiento.
- Sesgos del corpus: no se ha documentado ningún análisis de sesgos sobre el texto de Polibio. Dado que se trata de un corpus histórico, pueden existir sesgos temáticos o lingüísticos inherentes a la obra del autor.
- Alucinación: al ser un modelo causal, puede generar texto plausible pero no fiel a las fuentes históricas si se usa para generación, aunque este no es su propósito previsto.
- Limitaciones de contexto: no se ha especificado la longitud máxima de contexto, pero al tratarse de un modelo de 1B basado en OLMo, es probable que herede el límite de 2048 tokens de su base, lo que limita el análisis de pasajes largos en una sola pasada.
- Sin soporte para producción: el modelo es un artefacto de investigación, sin garantías de estabilidad, mantenimiento o soporte técnico. No se recomienda su uso en entornos productivos sin una evaluación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-polybius
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y atribución: https://github.com/Urdatorn/sphragis_models
- Leaderboard del benchmark: https://huggingface.co/spaces/Urdatorn/sphragis-leaderboard
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B-hf
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
- Artículo de referencia (Huang, Murakami y Grieve, 2025): PLoS ONE 20(7): e0327081 (DOI no proporcionado en la información disponible)
