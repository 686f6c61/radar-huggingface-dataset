# Urdatorn/sphragis-alm-olmo1b-sentence-paul

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-paul` es un modelo de lenguaje autorial (ALM, por sus siglas en inglés) desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` de AI2, especializado en modelar el estilo lingüístico del autor bíblico Pablo (Paul) a partir de oraciones individuales. Su propósito no es la generación de texto general, sino calcular la perplejidad de una oración para determinar si es probable que haya sido escrita por ese autor concreto.

El modelo forma parte de un conjunto de 28 ALMs, cada uno entrenado sobre las filas de entrenamiento de un único autor del corpus Sphragis. La metodología sigue el trabajo de Huang, Murakami y Grieve (2025) sobre atribución de autoría mediante perplejidad de modelos de lenguaje autoriales, pero con una innovación clave: la duración del entrenamiento (número de épocas) se selecciona mediante validación sobre la propia tarea de atribución, en lugar de usar un número fijo de épocas como en el artículo original. Con 1.176.764.416 parámetros (aproximadamente 1,17 mil millones), el modelo está disponible en formato safetensors con pesos en bf16 y ocupa unos 2,4 GB en el repositorio.

La relevancia de este modelo radica en su contribución a la estilometría computacional y a los estudios filológicos del griego antiguo, ofreciendo una herramienta reproducible y abierta (con restricciones de licencia) para la atribución de autoría en textos clásicos. Su diseño, centrado en una sola autor y en oraciones aisladas, lo hace especialmente útil para tareas de verificación de autoría en fragmentos cortos, un problema habitual en la crítica textual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la documentación) |
| Tipos de cuantizacion | bf16 (formato nativo de los pesos publicados); no se proporcionan cuantizaciones adicionales |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivada de fuentes con licencias mixtas, incluyendo CC BY-NC-SA; no apta para uso comercial sin verificación) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de `allenai/OLMo-1B-hf`, un transformer decoder-only de 1,17 mil millones de parámetros desarrollado por el Allen Institute for AI (AI2). OLMo-1B es un modelo de lenguaje abierto y totalmente reproducible, entrenado con datos públicos y código disponible. En este caso, el ALM se somete a un further-pretraining sobre un corpus muy reducido y especializado: 700 filas de entrenamiento correspondientes al autor Paul, con un total de 37.389 tokens puntuados, extraídos de la división `sentence_1` del dataset Sphragis.

El entrenamiento se realizó con el objetivo de modelado de lenguaje causal sobre secuencias del formato `<|endoftext|> sentence <|endoftext|>`, es decir, una oración por secuencia. Se utilizaron 3 épocas, un learning rate constante de 5e-05 tras 25 pasos de calentamiento, un batch efectivo de 16 oraciones y precisión mixta (pesos maestros en fp32, cómputo en bf16) con FSDP full shard sobre 2 GPU GH200. La selección del número de épocas y del modelo base (si se partía del OLMo-1B original o de una versión adaptada al griego) se realizó mediante ascenso de coordenadas sobre la macro-F1 de atribución en el conjunto de validación, considerando los 28 modelos del benchmark. Esta estrategia difiere del enfoque original de Huang y colaboradores, que fijaban 100 épocas, y busca optimizar directamente la capacidad discriminativa del modelo entre autores, no solo su ajuste al autor propio.

## Capacidades

- Atribución de autoría en griego antiguo: el modelo calcula la perplejidad (o log-verosimilitud negativa por token) de una oración, permitiendo comparar qué tan "sorprendente" resulta para el estilo de Pablo frente a otros autores.
- Modelado de estilo autorial: captura patrones léxicos, sintácticos y de frecuencia propios del autor, entrenado exclusivamente con sus textos.
- Puntuación de oraciones individuales: diseñado para procesar una oración a la vez, tal como se hizo en el entrenamiento, lo que lo hace adecuado para fragmentos cortos.
- Integración en pipelines de atribución: puede usarse junto con los otros 27 ALMs del benchmark para atribuir un texto al autor más probable mediante comparación de perplejidades.
- Especialización monolingüe: opera únicamente en griego antiguo, sin capacidades multilingües ni de generación general.
- No dispone de tool calling, ni de capacidades de agente, visión o audio; su función es exclusivamente de scoring de texto.

## Casos de uso

- Investigación filológica sobre autoría de textos paulinos: el modelo permite evaluar si un fragmento disputado (por ejemplo, una carta del Nuevo Testamento de atribución dudosa) es más consistente con el estilo de Pablo que con el de otros autores del corpus. Se usaría puntuando la oración con este modelo y con los demás ALMs, y asignando la autoría al que ofrezca menor perplejidad.
- Análisis de estilo literario en griego antiguo: los investigadores pueden emplear el modelo para cuantificar la similitud estilística entre diferentes obras o autores, comparando las perplejidades medias sobre conjuntos de oraciones.
- Autenticación de fragmentos en papiros o inscripciones: cuando se descubre un texto fragmentario, el modelo puede ayudar a determinar si su lenguaje se acerca al de Pablo, lo que orienta la atribución histórica.
- Crítica textual y edición de textos: en la preparación de ediciones críticas, el modelo puede servir como herramienta de apoyo para decidir entre variantes de lectura, evaluando cuál se ajusta mejor al estilo del autor.
- Benchmarking de métodos de atribución de autoría: como parte del conjunto Sphragis, este modelo contribuye a evaluar y comparar diferentes técnicas de estilometría computacional sobre un corpus estandarizado de griego antiguo.
- Docencia en humanidades digitales: el modelo y su código asociado pueden utilizarse en cursos de estilometría para ilustrar cómo los modelos de lenguaje autoriales abordan problemas de atribución, con un caso práctico sobre un autor histórico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. Sin embargo, el conjunto completo de 28 ALMs del benchmark Sphragis reporta los siguientes resultados de atribución de autoría sobre el conjunto de test, medidos como macro-F1:

| Tarea | Macro-F1 |
|---|---|
| sentence_1 (oraciones individuales) | 62,36 |
| sentence_5 (ventanas de 5 oraciones) | 86,84 |
| sentence_10 (ventanas de 10 oraciones) | 89,53 |
| sentence_50 (ventanas de 50 oraciones) | 92,44 |

Estos valores corresponden al rendimiento agregado de los 28 modelos trabajando en conjunto, no a este modelo en particular. No se dispone de datos de rendimiento individual ni de comparaciones con otros modelos de atribución de autoría en griego antiguo.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 2,35 GB (1.176.764.416 parámetros × 2 bytes). Considerando overhead de activaciones y memoria intermedia, se recomienda al menos 4-6 GB de VRAM para inferencia en secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo, por ejemplo una NVIDIA RTX 2060, RTX 3060, RTX 4060, o GPUs de datacenter como A10, A100 o H100. En el entrenamiento se usaron 2× GH200, pero para inferencia no se requiere tanta capacidad.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en GPUs consumer de gama media y alta (RTX 3060 12GB, RTX 4070, etc.) sin necesidad de cuantización adicional.
- Opciones de despliegue: al ser un modelo basado en OLMo-1B, es compatible con el ecosistema Hugging Face Transformers. También puede servirse con vLLM o TGI si se desea un throughput mayor, aunque no se ha verificado explícitamente en la documentación. Para uso local, llama.cpp u Ollama podrían funcionar si se convierte a GGUF, pero no se proporcionan conversiones oficiales.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño del modelo y la naturaleza de la tarea (puntuación de oraciones cortas), se espera una latencia baja en GPUs modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

El modelo se puede comparar con otros ALMs del mismo benchmark y con el modelo base OLMo-1B. No se dispone de datos de rendimiento individual para este modelo, por lo que la comparación se limita a características técnicas.

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo1b-sentence-paul | 1,17 B | no disponible | other (CC BY-NC-SA) | Autoría de Pablo en griego antiguo |
| Urdatorn/sphragis-alm-olmo3-7b-plato | 7 B (aprox.) | no disponible | other (presumiblemente similar) | Autoría de Platón en griego antiguo |
| allenai/OLMo-1B-hf (modelo base) | 1,17 B | 2048 (según documentación de OLMo) | Apache-2.0 | Modelo general de inglés |

La comparación con el modelo de Platón (7B) muestra una diferencia de tamaño significativa, pero no se conocen los resultados de atribución de cada uno por separado. El modelo base OLMo-1B es un modelo general de inglés, por lo que no es directamente comparable en la tarea de atribución en griego antiguo. La licencia del modelo base es Apache-2.0, mientras que este ALM tiene una licencia más restrictiva debido a los datos de entrenamiento.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo licencia `other` porque el texto de entrenamiento proviene de fuentes con licencias mixtas, incluyendo material CC BY-NC-SA. Esto impide su uso comercial sin una revisión exhaustiva de los términos de cada fuente. Se recomienda consultar el archivo `LICENSES.md` del dataset Sphragis antes de cualquier reutilización.
- Especialización extrema: el modelo está entrenado exclusivamente con oraciones de un único autor (Pablo) y en un dominio muy concreto (griego antiguo). No es adecuado para tareas de generación de texto, traducción o análisis de otros idiomas o autores.
- Riesgo de sobreajuste: al entrenarse sobre solo 700 oraciones y 37.389 tokens, el modelo puede memorizar patrones específicos del corpus y no generalizar bien a textos del mismo autor que difieran en estilo o temática.
- Limitación de contexto: el entrenamiento se realizó con una oración por secuencia, por lo que el modelo no está optimizado para procesar documentos largos de una sola vez. Para textos extensos, se recomienda dividirlos en oraciones o ventanas.
- Sesgos del corpus: el benchmark Sphragis se basa en textos antiguos con transmisión manuscrita compleja; los resultados de atribución pueden verse afectados por la calidad de las ediciones utilizadas y por la posible presencia de interpolaciones o errores de copia.
- Sin garantías de precisión: aunque el conjunto de 28 modelos alcanza una macro-F1 de 62,36 en oraciones individuales, esto implica una tasa de error considerable en fragmentos cortos. No debe usarse como única evidencia en decisiones académicas o legales.
- Dependencia del modelo base: al ser un ajuste de OLMo-1B, cualquier limitación del modelo base (por ejemplo, su vocabulario o su capacidad de representación) se hereda en este ALM.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-paul
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento, puntuación y atribución: https://github.com/Urdatorn/sphragis_models
- Modelo base OLMo-1B-hf: https://huggingface.co/allenai/OLMo-1B-hf
- Paper de OLMo (AI2): https://arxiv.org/abs/2402.00838
- Referencia metodológica: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081.
