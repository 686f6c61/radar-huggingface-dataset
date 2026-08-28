# Urdatorn/sphragis-alm-olmo1b-sentence-antiphon

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-sentence-antiphon` es un modelo de lenguaje autorial (ALM, por sus siglas en inglés) desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` sobre las frases de entrenamiento de un único autor, Antiphon, con el objetivo de medir la perplejidad de cada frase y atribuirla al autor que mejor la explique. El modelo forma parte de un conjunto de 28 modelos, uno por autor, que en conjunto alcanzan una precisión macro-F1 de 62,36 en frases individuales y hasta 92,44 cuando se agrupan 50 frases.

La relevancia de este modelo radica en su aplicación a la filología computacional y la estilometría: permite atribuir autoría de textos griegos antiguos de forma cuantitativa, siguiendo la metodología de Huang, Murakami y Grieve (2025). Arquitectónicamente es un transformer decoder-only de 1.176.764.416 parámetros (aproximadamente 1,17 mil millones), con una ventana de contexto heredada del modelo base OLMo-1B (no especificada en la documentación del autor). Está entrenado exclusivamente en griego antiguo (código `grc`) y se distribuye con licencia `other` debido a las licencias mixtas de los textos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (heredada de OLMo-1B, no especificada en la ficha) |
| Tipos de cuantizacion | bf16 (pesos publicados) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other (derivado de Apache-2.0 con restricciones por datos de entrenamiento) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf`, un transformer decoder-only de 1,17 mil millones de parámetros desarrollado por el Allen Institute for AI (AI2). Sobre esta base se realiza un ajuste fino completo (further-pretraining) con un objetivo de modelado de lenguaje causal, donde cada secuencia de entrenamiento consiste en una única frase precedida y seguida por el token especial `<|endoftext|>`. El entrenamiento se llevó a cabo durante 2 épocas con una tasa de aprendizaje constante de 5e-05 tras 25 pasos de calentamiento, un tamaño de lote efectivo de 16 frases, precisión fp32 en los pesos maestros y bf16 en el cómputo, utilizando FSDP con particionado completo en 2 GPU GH200. Los pesos finales se guardan en bf16.

La selección de la duración del entrenamiento (número de épocas) y del modelo base (si se parte del OLMo-1B original o de una versión adaptada al griego) se realizó mediante ascenso por coordenadas sobre la métrica de atribución en validación, concretamente el macro-F1 de atribución sobre los 28 modelos del conjunto. Esto difiere del enfoque fijo de 100 épocas del artículo original de Huang y colaboradores, priorizando el rendimiento en atribución sobre el ajuste a la perplejidad del propio autor.

## Capacidades

- Modelado de lenguaje causal en griego antiguo: calcula la probabilidad de una secuencia de tokens y, por tanto, la perplejidad por token de una frase dada.
- Atribución de autoría: al comparar la perplejidad de una frase entre los 28 modelos del conjunto Sphragis, se puede asignar la frase al autor cuyo modelo la encuentra menos sorprendente.
- Especialización en un único autor (Antiphon): el modelo está optimizado para capturar el estilo idiosincrásico de este autor, no para generación de texto general.
- No dispone de capacidades de tool calling, visión, audio ni razonamiento multi-paso; su uso está restringido a tareas de evaluación de verosimilitud.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: dado un corpus de frases sin atribuir, se puntúa cada frase con los 28 modelos del benchmark y se asigna al autor con menor perplejidad. El modelo es adecuado porque fue entrenado específicamente para maximizar la discriminación entre autores.
- Análisis estilométrico cuantitativo: investigadores en filología pueden usar la perplejidad de este modelo como una medida objetiva de similitud estilística con Antiphon, complementando métodos tradicionales basados en frecuencias léxicas.
- Evaluación de hipótesis de autoría dudosa: para obras de autoría disputada, se puede comparar la perplejidad media de sus frases entre los modelos de los candidatos, ayudando a decidir con evidencia estadística.
- Investigación en metodología de atribución: el modelo sirve como caso de estudio para comparar estrategias de entrenamiento (selección por validación frente a épocas fijas) en tareas de atribución.
- Construcción de sistemas de recuperación de información filológica: integrado en pipelines de procesamiento de texto griego antiguo, puede filtrar o clasificar fragmentos según su probable autor.
- Benchmarking de modelos de lenguaje para lenguas clásicas: al ser parte de un conjunto estandarizado, permite comparar el rendimiento de diferentes arquitecturas (OLMo-1B, OLMo-3-7B, etc.) en la tarea de atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. Sin embargo, la model card reporta el rendimiento conjunto de los 28 modelos del benchmark Sphragis sobre el conjunto de test, que se reproduce a continuación:

| Tarea | Macro-F1 |
|---|---|
| sentence_1 (frase individual) | 62,36 |
| sentence_5 (agrupación de 5 frases) | 86,84 |
| sentence_10 (agrupación de 10 frases) | 89,53 |
| sentence_50 (agrupación de 50 frases) | 92,44 |

Estos valores corresponden al sistema completo de 28 modelos, no a este modelo de forma aislada. No se dispone de datos de MMLU, HumanEval u otros benchmarks generales, ya que el modelo no está diseñado para tareas de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4 GB en bf16 (tamaño del repositorio), por lo que cabe en GPUs de consumo con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, RTX 4090). Para procesar lotes grandes o agrupaciones de 50 frases, se recomienda al menos 8 GB.
- También puede ejecutarse en CPU, aunque con mayor latencia; el modelo es lo suficientemente pequeño para inferencia en tiempo real en hardware moderno.
- Opciones de despliegue: compatible con la librería `transformers` de Hugging Face, así como con `vLLM` y `TGI` para servir múltiples peticiones. Para entornos ligeros, se puede convertir a formato GGUF y usar `llama.cpp` u `Ollama`.
- Latencia y throughput estimados: no disponibles en la documentación proporcionada. Como referencia, un modelo de 1,17B en bf16 en una GPU RTX 4090 puede procesar decenas de frases por segundo, pero este dato no está confirmado por el autor.

## Comparativa con modelos similares

El modelo pertenece a una familia de 28 ALMs del mismo autor (Urdatorn) para el benchmark Sphragis, que comparten metodología pero difieren en el autor objetivo y, en algunos casos, en el modelo base. También se puede comparar con el modelo base OLMo-1B y con otros ALMs de la literatura.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Uso principal |
|---|---|---|---|---|---|
| Urdatorn/sphragis-alm-olmo1b-sentence-antiphon | 1,17B | no disponible | grc | other | Atribución de autoría (Antiphon) |
| Urdatorn/sphragis-alm-olmo3-7b-aristophanes | 7B (según nombre) | no disponible | grc | other | Atribución de autoría (Aristophanes) |
| allenai/OLMo-1B-hf | 1,17B | 2048 (según documentación de AI2) | multilingüe (principalmente inglés) | Apache-2.0 | Modelo base de lenguaje general |

No se dispone de comparativas de rendimiento individual entre estos modelos, ya que los resultados publicados son del conjunto completo. La elección entre el modelo de 1B y el de 7B dependerá de los recursos disponibles y de la precisión requerida; el de 7B probablemente ofrezca mejor rendimiento en atribución, pero con mayor coste computacional.

## Limitaciones y advertencias

- Entrenado exclusivamente en griego antiguo: no es útil para otros idiomas ni para tareas de generación general.
- Licencia restrictiva (`other`): los textos de entrenamiento incluyen material con licencia CC BY-NC-SA, lo que puede impedir el uso comercial del modelo. Es necesario revisar el archivo `LICENSES.md` del dataset Sphragis antes de cualquier reutilización.
- Sobreajuste potencial al autor: al estar entrenado solo con frases de Antiphon, el modelo puede tener un sesgo extremo hacia su estilo, lo que limita su generalización a otros autores o variantes dialectales.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar texto plausible pero incorrecto si se usa para generación, aunque su propósito principal es la puntuación de verosimilitud, no la generación.
- Sin datos de rendimiento individual: no se han publicado benchmarks específicos para este modelo, por lo que su calidad relativa frente a otros ALMs no puede evaluarse de forma aislada.
- Dependencia del conjunto de 28 modelos: para la atribución real es necesario desplegar los 28 modelos, lo que multiplica los requisitos de hardware y complejidad operativa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-antiphon)
- [Dataset Sphragis](https://huggingface.co/datasets/Urdatorn/sphragis)
- [Código de entrenamiento y atribución (GitHub)](https://github.com/Urdatorn/sphragis_models)
- [Leaderboard del benchmark Sphragis](https://urdatorn-sphragis-leaderboard.static.hf.space/index.html)
- [Modelo base OLMo-1B en Hugging Face](https://huggingface.co/allenai/OLMo-1B)
- [Repositorio OLMo de AI2 (GitHub)](https://github.com/allenai/OLMo)
- [Página oficial de OLMo en AI2](https://allenai.org/olmo)
