# Urdatorn/sphragis-alm-olmo1b-sentence-sophocles

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-sophocles` es un modelo de lenguaje autorial (ALM, por sus siglas en inglés) desarrollado por Urdatorn para la atribución de autoría en griego antiguo. Forma parte de un conjunto de 28 modelos, cada uno entrenado sobre la obra de un autor clásico, siguiendo la metodología de Huang, Murakami y Grieve (2025) publicada en PLoS ONE. Este modelo concreto se especializa en Sófocles y se utiliza para puntuar la perplejidad de frases y determinar si pertenecen a dicho autor.

Se basa en el modelo `allenai/OLMo-1B-hf`, un transformer decoder-only de 1.176.764.416 parámetros (aproximadamente 1,17 mil millones), sobre el que se realiza un further-pretraining completo con 3.100 frases de entrenamiento de Sófocles (141.896 tokens puntuados). El entrenamiento se optimiza no para minimizar la perplejidad del propio autor, sino para maximizar la precisión de atribución conjunta del conjunto de 28 modelos, lo que constituye una innovación frente al enfoque original de épocas fijas.

La relevancia de este modelo reside en su aplicación al benchmark Sphragis, un recurso de referencia para la atribución de autoría en textos clásicos. Aunque no es un modelo de propósito general, su diseño específico lo hace útil para investigación filológica y para el desarrollo de herramientas de análisis estilométrico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | Other (derivado de Apache-2.0 con restricciones por datos de entrenamiento) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf`, un transformer causal con 1,17 mil millones de parámetros. Sobre esta base se realiza un further-pretraining completo (no un fine-tuning superficial) utilizando únicamente las filas de entrenamiento correspondientes a Sófocles del dataset Sphragis. Cada secuencia de entrenamiento sigue el formato `<|endoftext|> frase <|endoftext|>`, con una frase por secuencia, y el objetivo es el modelado de lenguaje causal estándar.

El entrenamiento se realizó durante 2 épocas con una tasa de aprendizaje constante de 5e-05 tras 25 pasos de calentamiento, un tamaño de lote efectivo de 16 frases, y precisión mixta (pesos maestros en fp32, cómputo en bf16) utilizando FSDP con sharding completo en 2 GPUs GH200. La duración del entrenamiento se seleccionó mediante ascenso de coordenadas sobre la atribución de validación (macro-F1 sobre los 28 modelos), en lugar de usar un número fijo de épocas como en el trabajo original de Huang y colaboradores. Esta elección busca optimizar la capacidad discriminativa del modelo frente a los demás autores, no su ajuste individual.

## Capacidades

- Atribución de autoría: dado un texto en griego antiguo, el modelo calcula la log-verosimilitud negativa por token y la compara con la de otros 27 modelos autoriales para asignar la autoría.
- Puntuación de frases individuales: puede evaluar frases sueltas (división `sentence_1`) o agrupaciones de 5, 10 o 50 frases (`sentence_5`, `sentence_10`, `sentence_50`), con mayor precisión cuanto más texto se proporciona.
- Especialización en Sófocles: el modelo está entrenado exclusivamente sobre la obra de este autor, por lo que su perplejidad es significativamente menor para textos sofocleos que para otros autores.
- No es un modelo generativo: no está diseñado para generar texto, sino para puntuar la probabilidad de secuencias dadas.
- Sin soporte de tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Atribución de autoría en textos clásicos: un investigador puede puntuar un fragmento de dudosa procedencia con este modelo y comparar la perplejidad con la de los otros 27 modelos del conjunto para determinar si es de Sófocles.
- Análisis estilométrico: el modelo permite cuantificar la distancia estilística entre un texto anónimo y el corpus sofocleo, útil en estudios filológicos.
- Verificación de autenticidad: en la autenticación de manuscritos o inscripciones, el modelo puede ayudar a detectar interpolaciones o falsificaciones.
- Benchmarking de métodos de atribución: sirve como componente del benchmark Sphragis para evaluar nuevas técnicas de atribución de autoría en griego antiguo.
- Investigación en humanidades digitales: integrable en pipelines de análisis de corpus clásicos para clasificación automática de autoría.
- Educación y divulgación: puede utilizarse en herramientas didácticas para ilustrar la variación estilística entre autores griegos antiguos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. Sin embargo, la model card reporta el rendimiento conjunto de los 28 modelos del benchmark Sphragis:

| Métrica | Valor |
|---|---|
| Test macro-F1 en sentence_1 | 62.36 |
| Test macro-F1 en sentence_5 | 86.84 |
| Test macro-F1 en sentence_10 | 89.53 |
| Test macro-F1 en sentence_50 | 92.44 |

Estos resultados corresponden al conjunto completo de modelos, no a este modelo en particular, y demuestran la eficacia del enfoque cuando se combinan todos los ALMs.

## Requisitos de hardware

- Inferencia: con 1,17 mil millones de parámetros en bf16, el modelo ocupa aproximadamente 2,3 GB de memoria. Cabe en GPUs de consumo con 4-6 GB de VRAM, como una RTX 3060 o RTX 4060.
- Entrenamiento: el autor utilizó 2 GPUs GH200 con FSDP, pero esto no es un requisito para la inferencia.
- Despliegue: al ser un modelo estándar de HuggingFace, puede ejecutarse con la librería `transformers` en Python. También es posible convertirlo a GGUF para usarlo con `llama.cpp` u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no se han publicado datos específicos, pero para un modelo de 1B en una GPU moderna se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información detallada sobre otros ALMs individuales del mismo benchmark para realizar una comparación directa. El modelo es uno de los 28 entrenados sobre diferentes autores (p. ej., Esquilo, Eurípides, etc.) con la misma arquitectura base y metodología. La comparación relevante se establece a nivel de conjunto, donde los 28 modelos alcanzan los resultados de macro-F1 mencionados anteriormente. Frente al modelo base `OLMo-1B-hf`, este modelo está especializado en Sófocles y no es útil para tareas generales de lenguaje.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo licencia `other` debido a que los datos de entrenamiento incluyen material con licencia CC BY-NC-SA. Esto impide su uso comercial sin una revisión exhaustiva de las licencias de las fuentes originales (ver `LICENSES.md` del dataset).
- Especialización extrema: el modelo solo es útil para atribuir autoría a Sófocles; no sirve para otros autores ni para tareas de generación o comprensión general del griego antiguo.
- Riesgo de sobreajuste: al entrenarse únicamente sobre un autor, el modelo puede mostrar perplejidades anómalamente bajas para textos que imiten el estilo sofocleo, lo que podría llevar a falsos positivos en la atribución.
- Dependencia del formato de entrada: la puntuación debe realizarse exactamente como en el entrenamiento (una frase por secuencia con tokens especiales), lo que limita su uso directo en textos largos sin preprocesamiento.
- Sin datos de contexto: no se especifica la longitud máxima de contexto soportada, aunque al ser OLMo-1B probablemente sea de 2048 tokens, pero este dato no está confirmado en la información proporcionada.
- Alucinación: al ser un modelo de puntuación, no genera texto, por lo que el riesgo de alucinación es nulo en ese sentido, pero la perplejidad puede ser engañosa si el texto de entrada no pertenece a la misma distribución que el corpus de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-sophocles
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y puntuación: https://github.com/Urdatorn/sphragis_models
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B-hf
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
- Referencia metodológica: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081.
