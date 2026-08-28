# Urdatorn/sphragis-alm-olmo1b-sentence-euripides

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-euripides` es un modelo de lenguaje autorial (authorial language model, ALM) desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` sobre las oraciones de entrenamiento atribuidas a Eurípides, siguiendo la metodología de Huang, Murakami y Grieve (2025) que utiliza la perplejidad de modelos de lenguaje específicos de autor para atribuir autoría. El modelo tiene 1.176.764.416 parámetros (aproximadamente 1,17 mil millones) y está especializado exclusivamente en griego antiguo (código `grc`).

Este modelo resuelve el problema de la atribución de autoría en textos clásicos: dado un conjunto de 28 autores, cada oración se asigna al modelo que la encuentra menos sorprendente (menor log-verosimilitud negativa por token). Su relevancia radica en que es parte de un enfoque novedoso que selecciona la duración del entrenamiento mediante evidencia de validación en lugar de fijar un número arbitrario de épocas, y que optimiza directamente la métrica de atribución (macro-F1) en lugar de la perplejidad del propio autor. El modelo se libera con licencia `other` debido a las licencias mixtas de los textos fuente, que incluyen material CC BY-NC-SA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (pesos en bf16, sin cuantizaciones publicadas) |
| Idiomas soportados | griego antiguo (grc) |
| Licencia | other (derivada de OLMo-1B Apache-2.0, pero con restricciones por CC BY-NC-SA en los datos) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf`, un transformer decoder-only de 1,17 mil millones de parámetros desarrollado por el Allen Institute for AI (AI2) como parte de la familia OLMo, diseñado para ser completamente abierto (datos, código y pesos). Sobre esta base, se realizó un further-pretraining completo (no un ajuste fino ligero) utilizando únicamente las filas de entrenamiento de Eurípides del dataset Sphragis: 600 filas y 26.649 tokens puntuados de la división `sentence_1`. El objetivo de entrenamiento fue el modelado de lenguaje causal sobre secuencias de una sola oración con delimitadores `<|endoftext|>`, es decir, cada secuencia contiene exactamente una oración del autor.

La selección del modelo base (si se partía del OLMo-1B vanilla o de una versión adaptada al griego) y el número de épocas se determinaron mediante ascenso de coordenadas sobre la atribución de validación, evaluando el macro-F1 conjunto de los 28 modelos. El entrenamiento se realizó con 2 épocas, una tasa de aprendizaje constante de 5e-05 tras 25 pasos de calentamiento, un batch efectivo de 16 oraciones, precisión mixta (pesos maestros en fp32, cómputo en bf16) y paralelismo FSDP completo en 2 GPUs GH200. Los pesos finales se guardaron en bf16. A diferencia del método original de Huang y colaboradores, que fijaba 100 épocas, aquí la duración se elige por evidencia de validación y se optimiza la atribución en lugar de la perplejidad del autor, porque lo que importa es cuánto mejor ajusta el modelo a su autor en comparación con los demás.

## Capacidades

- Modelado de lenguaje causal en griego antiguo, especializado en el estilo de Eurípides.
- Cálculo de perplejidad (log-verosimilitud negativa por token) para puntuar oraciones, lo que permite atribuir autoría comparando con otros 27 modelos del conjunto Sphragis.
- Generación de texto en griego antiguo con sesgo estilístico hacia Eurípides, aunque no es su propósito principal.
- Integración en pipelines de atribución de autoría: dado un texto, se puntúa con cada modelo y se asigna al autor cuyo modelo produce menor sorpresa.
- Soporte para evaluación de fragmentos de distinta longitud (sentence_1, sentence_5, sentence_10, sentence_50) según el benchmark.
- No incluye capacidades de tool calling, agentes, visión ni audio; es un modelo puramente de lenguaje.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: dado un fragmento de dudosa autoría, se puntúa con los 28 modelos del conjunto y se asigna al autor cuyo modelo produce menor perplejidad. Es el caso de uso principal y el que motivó el entrenamiento.
- Investigación filológica y estilométrica: análisis de variación estilística entre autores clásicos, comparando cómo cada modelo asigna probabilidades a diferentes construcciones sintácticas o léxicas.
- Detección de interpolaciones o pasajes espurios en obras transmitidas: si un pasaje atribuido a Eurípides produce alta perplejidad en su modelo, podría indicar una intervención posterior.
- Estudio de la evolución del estilo de un autor: al entrenar modelos sobre diferentes corpus (por ejemplo, obras tempranas vs. tardías), se pueden comparar las perplejidades para detectar cambios estilísticos.
- Generación de texto de estilo clásico para entornos educativos: aunque no es su fin, el modelo puede generar oraciones en griego antiguo con rasgos euripideos, útil para ejercicios de composición o reconstrucción de lagunas.
- Evaluación de modelos de lenguaje en lenguas de bajos recursos: el griego antiguo es un idioma con pocos recursos digitales; este modelo sirve como referencia para estudiar el comportamiento de modelos pequeños en dominios especializados.

## Benchmarks y rendimiento

El modelo forma parte de un conjunto de 28 ALMs que, en conjunto, alcanzan los siguientes resultados de atribución de autoría (macro-F1) en el test de Sphragis:

| Longitud de oración | Macro-F1 |
|---|---|
| sentence_1 | 62,36 |
| sentence_5 | 86,84 |
| sentence_10 | 89,53 |
| sentence_50 | 92,44 |

Estos resultados corresponden al rendimiento conjunto de los 28 modelos, no a este modelo individualmente. No se han publicado resultados de benchmarks específicos para este modelo aislado (como MMLU, HumanEval u otros), ya que su propósito no es el razonamiento general sino la atribución de autoría.

## Requisitos de hardware

- El modelo tiene 1,17 mil millones de parámetros y los pesos en bf16 ocupan aproximadamente 2,4 GB (tamaño del repositorio).
- Para inferencia en bf16, se requiere al menos 3-4 GB de VRAM (considerando overhead de activaciones), por lo que cabe en GPUs consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores.
- Con cuantización a 8 bits o 4 bits (no publicada oficialmente, pero posible mediante herramientas como llama.cpp o bitsandbytes), podría ejecutarse en GPUs con 4-6 GB de VRAM.
- El entrenamiento se realizó en 2x GH200, pero la inferencia es mucho más ligera.
- Opciones de despliegue: al ser un modelo basado en OLMo-1B, es compatible con el ecosistema HuggingFace Transformers, así como con vLLM, llama.cpp, Ollama y TGI, aunque no se han publicado configuraciones específicas.
- No se dispone de datos de latencia o throughput medidos; se estima que en una GPU moderna (por ejemplo, RTX 4090) la inferencia de una oración corta tomaría decenas de milisegundos, pero esto no está confirmado.

## Comparativa con modelos similares

El modelo pertenece a una familia de 28 ALMs del proyecto Sphragis, todos basados en OLMo-1B (o en versiones adaptadas al griego). Algunos modelos comparables:

| Modelo | Base | Parámetros | Propósito | Licencia |
|---|---|---|---|---|
| `sphragis-alm-olmo1b-sentence-euripides` (este) | OLMo-1B-hf | 1,17B | Atribución de autoría (Eurípides) | other |
| `sphragis-alm-olmo3-7b-plato` | OLMo-3-1025-7B | 7B | Atribución de autoría (Platón) | other |
| `allenai/OLMo-1B-hf` (modelo base) | - | 1,17B | Modelo de lenguaje general en inglés | Apache-2.0 |

La comparación directa con otros ALMs del mismo proyecto no es posible sin datos de rendimiento individuales, ya que los resultados publicados son conjuntos. Frente al modelo base OLMo-1B, este modelo está especializado en griego antiguo y en el estilo de Eurípides, pero pierde la capacidad multilingüe y de propósito general. No se dispone de información sobre otros modelos de atribución de autoría en griego antiguo fuera de este proyecto.

## Limitaciones y advertencias

- Sesgos de estilo: el modelo está entrenado exclusivamente con textos de Eurípides, por lo que su capacidad de generalización a otros autores o géneros es nula; solo es útil para comparar con los otros 27 ALMs del conjunto.
- Riesgo de alucinación: al ser un modelo de lenguaje causal, puede generar texto gramaticalmente plausible pero históricamente falso; no debe usarse para reconstruir pasajes perdidos sin verificación filológica.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al entrenarse con una sola oración por secuencia, el modelo no está optimizado para manejar dependencias de largo alcance entre oraciones.
- Restricciones de licencia: la licencia `other` se debe a que los textos fuente incluyen material CC BY-NC-SA, lo que impide el uso comercial sin verificar los términos exactos en el archivo `LICENSES.md` del dataset Sphragis.
- Dependencia del conjunto de modelos: la atribución de autoría requiere ejecutar los 28 modelos en paralelo; este modelo aislado no proporciona una decisión de autoría por sí solo.
- Fecha de creación futura (2026-08-27) en los metadatos, lo que sugiere que el modelo es muy reciente y puede tener poca validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-euripides
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y atribución: https://github.com/Urdatorn/sphragis_models
- Leaderboard del benchmark: https://huggingface.co/spaces/Urdatorn/sphragis-leaderboard
- Paper de OLMo (modelo base): https://arxiv.org/html/2402.00838v1
- Modelo base en HuggingFace: https://huggingface.co/allenai/OLMo-1B-hf
