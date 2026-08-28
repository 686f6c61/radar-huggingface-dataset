# Urdatorn/sphragis-alm-olmo1b-sentence-menander

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-menander` es un modelo de lenguaje autoría (Authorial Language Model, ALM) desarrollado por Albin Thörn Cleland (Urdatorn), investigador en filología digital en la Universidad de Gotemburgo. Forma parte de un conjunto de 28 modelos diseñados para el benchmark Sphragis de atribución de autoría en griego antiguo, siguiendo la metodología de Huang, Murakami y Grieve (2025) que atribuye un texto al autor cuyo modelo lo encuentra menos sorprendente (menor perplejidad).

Se trata de un fine-tuning completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` sobre las frases de entrenamiento de Menandro, uno de los autores del corpus. Con 1.176.764.416 parámetros (aproximadamente 1,17 mil millones), el modelo está especializado en modelar el estilo de Menandro y se utiliza exclusivamente para tareas de atribución de autoría, no como un modelo de propósito general. Su relevancia radica en que permite evaluar la autoría de textos griegos antiguos con una precisión notable, alcanzando el conjunto completo de 28 modelos un 62,36 % de macro-F1 en la tarea de atribución a nivel de frase individual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de OLMo-1B, no especificada) |
| Tipos de cuantizacion | bf16 (pesos originales); otras cuantizaciones no disponibles |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-1B, un transformer decoder-only con 1,17 mil millones de parámetros, desarrollado por el Allen Institute for AI. Sobre esta base se realizó un further-pretraining completo (todas las capas) utilizando únicamente las filas de entrenamiento correspondientes a Menandro del dataset Sphragis: 700 frases con un total de 20.947 tokens puntuados, extraídas de la partición `sentence_1`.

El entrenamiento se realizó con el objetivo de modelado de lenguaje causal sobre secuencias de una sola frase, con formato `<|endoftext|> sentence <|endoftext|>`. Se emplearon 2 épocas, una tasa de aprendizaje constante de 5e-5 tras 25 pasos de calentamiento, un batch efectivo de 16 frases, y precisión mixta con pesos maestros en fp32 y cómputo en bf16, utilizando FSDP con sharding completo en 2 GPUs GH200. La elección del número de épocas y del modelo base (si se partía del OLMo-1B original o de una versión adaptada al griego) se realizó mediante ascenso por coordenadas sobre la atribución de validación, optimizando el macro-F1 del conjunto de 28 modelos, no la perplejidad individual del autor. Esta es una innovación metodológica respecto al trabajo original de Huang et al., que fijaba 100 épocas sin validación.

## Capacidades

- Atribución de autoría: el modelo calcula la perplejidad (negative log-likelihood por token) de una frase dada, permitiendo comparar qué modelo de autor la encuentra menos sorprendente.
- Modelado de estilo autoría: captura patrones léxicos, sintácticos y estilísticos específicos de Menandro en griego antiguo.
- Generación de texto condicionada al autor: aunque no es su propósito principal, puede generar texto con sesgo estilístico hacia Menandro.
- Multilingüe: no, está entrenado exclusivamente en griego antiguo.
- Tool calling, agentes, visión, audio: no soportado.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: dado un fragmento de texto, se puntúa con los 28 modelos del conjunto y se atribuye al autor cuyo modelo produce menor perplejidad. Es el caso de uso principal y el que valida el benchmark Sphragis.
- Análisis estilométrico comparativo: investigadores pueden usar el modelo para medir la distancia estilística entre Menandro y otros autores del corpus, cuantificando qué tan "sorprendente" resulta un texto para cada modelo.
- Verificación de autenticidad de fragmentos dudosos: en filología clásica, se puede aplicar a pasajes de atribución incierta (p. ej., fragmentos de comedia nueva) para obtener una evidencia cuantitativa adicional a los métodos tradicionales.
- Estudio de evolución estilística dentro de un autor: al entrenar modelos por particiones (p. ej., por obra o por período), se podría analizar cómo cambia el estilo de Menandro, aunque este modelo concreto solo cubre el conjunto completo de sus frases.
- Investigación en metodología de atribución: sirve como componente reproducible para experimentos que comparen diferentes estrategias de entrenamiento (épocas, selección de modelo base) en tareas de autoría.
- Docencia e investigación en humanidades digitales: como ejemplo de aplicación de modelos de lenguaje a problemas filológicos, con código de entrenamiento y puntuación disponible en GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. El conjunto completo de 28 modelos (incluido este) alcanza los siguientes resultados en el benchmark Sphragis sobre el conjunto de test:

| Tarea | Macro-F1 |
|---|---|
| sentence_1 | 62,36 % |
| sentence_5 | 86,84 % |
| sentence_10 | 89,53 % |
| sentence_50 | 92,44 % |

Estos valores corresponden al rendimiento agregado del conjunto, no a este modelo en particular. No se dispone de comparaciones con otros modelos de atribución de autoría en griego antiguo.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 2,35 GB (1,17B × 2 bytes). En fp32 serían unos 4,7 GB. La inferencia de una sola frase requiere menos de 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia (p. ej., RTX 3050, RTX 3060, GTX 1080 Ti). Para entrenamiento se usaron 2× GH200, pero no es necesario para uso inferencial.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer modernas (RTX 3060 12GB, RTX 4070, etc.) e incluso en algunas con 6 GB.
- Opciones de despliegue: al ser un modelo HuggingFace estándar, se puede cargar con transformers, vLLM, llama.cpp (si se convierte a GGUF), o TGI. También se puede usar directamente con el código de puntuación del repositorio `Urdatorn/sphragis_models`.
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 1,17B en una GPU consumer, la latencia por frase es del orden de decenas de milisegundos, pero depende del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Uso |
|---|---|---|---|---|---|
| `Urdatorn/sphragis-alm-olmo1b-sentence-menander` | 1,17B | no disponible | Further-pretraining sobre frases de Menandro (grc) | other | Atribución de autoría |
| `allenai/OLMo-1B-hf` (modelo base) | 1,17B | 2048 (típico de OLMo-1B) | Preentrenamiento general en inglés | Apache-2.0 | Generación general, no especializado en griego |
| `Urdatorn/sphragis-alm-olmo3-greek-7b-herodotus` | 7B (OLMo-3) | no disponible | Further-pretraining sobre frases de Heródoto (grc) | other | Atribución de autoría (otro autor) |

La comparación directa con el modelo base muestra que este ALM está especializado en un único autor y en una única lengua, mientras que OLMo-1B es multilingüe (aunque con dominio en inglés) y de propósito general. Frente al modelo de Heródoto de 7B, la diferencia de tamaño (1,17B vs 7B) puede implicar menor capacidad de modelado, pero el rendimiento del conjunto sugiere que el tamaño no es determinante para la tarea de atribución.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente con las frases de Menandro del corpus Sphragis, por lo que su capacidad de generalización a otros géneros, dialectos o períodos del griego antiguo es muy limitada.
- Riesgo de alucinación: al ser un modelo de lenguaje causal, puede generar texto plausible pero no verificado; no debe usarse para producir ediciones críticas sin supervisión filológica.
- Limitaciones de contexto: la longitud de contexto no está documentada; se asume la de OLMo-1B (probablemente 2048 tokens), pero no se ha verificado. Para frases largas, podría ser insuficiente.
- Restricciones de licencia: la licencia `other` se debe a que los textos de entrenamiento provienen de fuentes con licencias mixtas, incluyendo material CC BY-NC-SA. Esto impide el uso comercial del modelo y de sus derivados sin verificar la licencia de cada fuente.
- Sobreajuste al autor: el modelo está optimizado para distinguir a Menandro de otros 27 autores; su uso fuera de ese marco (p. ej., atribuir textos de autores no incluidos en el conjunto) no está validado y puede producir resultados engañosos.
- Dependencia del preprocesado: la puntuación debe realizarse exactamente como en el entrenamiento (una frase por secuencia con tokens `<|endoftext|>`), de lo contrario los resultados de perplejidad no son comparables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-menander
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Repositorio de código (entrenamiento, puntuación y atribución): https://github.com/Urdatorn/sphragis_models
- Perfil del autor en HuggingFace: https://huggingface.co/Urdatorn
- Perfil del autor en GitHub: https://github.com/Urdatorn
- Artículo de referencia (Huang, Murakami y Grieve, 2025): "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081.
