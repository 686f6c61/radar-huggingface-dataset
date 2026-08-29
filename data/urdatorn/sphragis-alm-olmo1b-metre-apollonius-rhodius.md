# Urdatorn/sphragis-alm-olmo1b-metre-apollonius-rhodius

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-metre-apollonius-rhodius` es un modelo de lenguaje autorial (ALM) especializado en la atribución de autoría de textos en griego antiguo, desarrollado por Urdatorn (Albin Thörn Cleland) como parte del benchmark Sphragis-Metre. Se trata de un ajuste fino completo (further-pretraining) del modelo base `allenai/OLMo-1B-hf` de AI2, entrenado exclusivamente con las frases atribuidas al poeta épico helenístico Apolonio de Rodas. El objetivo no es generar texto general, sino modelar el estilo de un autor concreto para que, junto a otros 16 modelos análogos, permita atribuir la autoría de un texto desconocido comparando la perplejidad de cada modelo.

El modelo sigue la metodología propuesta por Huang, Murakami y Grieve (2025) en su artículo "Attributing authorship via the perplexity of authorial language models", pero con una innovación clave: la duración del entrenamiento (4 épocas) se selecciona mediante validación sobre la propia tarea de atribución, en lugar de fijar un número arbitrario de épocas como en el trabajo original. Con 1.176.764.416 parámetros (1,17 mil millones) y un peso en bf16 de aproximadamente 2,3 GB, es un modelo compacto que puede ejecutarse en hardware de consumo. Su relevancia radica en que aborda un problema filológico complejo —la atribución de autoría en una lengua muerta con corpus fragmentario— con técnicas modernas de modelado del lenguaje, y lo hace de forma totalmente abierta y reproducible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base OLMo-1B soporta 2048 tokens, pero no se especifica en la documentación) |
| Tipos de cuantizacion | no disponible (los pesos se publican en bf16; no se mencionan cuantizaciones GGUF, int8, etc.) |
| Idiomas soportados | griego antiguo (grc) |
| Licencia | other (derivado de Apache-2.0, pero con restricciones por datos de entrenamiento bajo CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura OLMo-1B de AI2, un transformer decoder-only con 1.170 millones de parámetros, entrenado originalmente sobre 2,1 billones de tokens en inglés. Sobre esta base, Urdatorn realizó un further-pretraining completo (no un simple fine-tuning) utilizando únicamente las filas de entrenamiento correspondientes a Apolonio de Rodias dentro del benchmark Sphragis-Metre: 4.650 frases y 149.070 tokens puntuados de la división `verse_1`. El objetivo de entrenamiento es el modelado causal del lenguaje sobre secuencias con el formato `<|endoftext|> sentence <|endoftext|>`, una frase por secuencia.

El entrenamiento se realizó con precisión mixta (pesos maestros en fp32, cómputo en bf16) y paralelismo FSDP completo sobre 2 GPUs GH200. Se usó una tasa de aprendizaje constante de 5e-05 tras 25 pasos de calentamiento, un batch efectivo de 16 frases y 4 épocas. La elección del número de épocas y del modelo base (si el OLMo-1B original o una versión adaptada al griego) se hizo mediante ascenso por coordenadas sobre la macro-F1 de atribución en validación, un criterio más alineado con el objetivo final que la perplejidad del propio autor. Esta es la principal diferencia metodológica con el trabajo de Huang et al., que fijaba 100 épocas de forma arbitraria.

## Capacidades

- Modelado del estilo de Apolonio de Rodias: el modelo captura patrones léxicos, sintácticos y métricos específicos de este autor, lo que permite distinguir sus textos de los de otros autores griegos antiguos.
- Atribución de autoría: al comparar la perplejidad por token de una frase dada entre los 17 modelos del benchmark, se puede asignar la autoría al modelo que la encuentra menos sorprendente.
- Procesamiento de griego antiguo: el modelo trabaja con texto en griego antiguo, incluyendo caracteres y convenciones ortográficas propias de esta lengua.
- Evaluación de similitud estilística: puede utilizarse para medir la proximidad estilística entre textos, no solo para atribución binaria.
- No dispone de capacidades generales de generación de texto, tool calling, visión, audio ni razonamiento multi-paso; es un modelo especializado de una sola tarea.

## Casos de uso

- Atribución de autoría en textos fragmentarios: dado un fragmento de poesía épica griega de autoría dudosa, se puede puntuar con los 17 modelos del benchmark y asignar la autoría al modelo con menor perplejidad. Es útil para papiros o citas sin atribución clara.
- Verificación de autoría en ediciones críticas: los filólogos pueden contrastar si un texto atribuido tradicionalmente a Apolonio de Rodias presenta patrones estilísticos consistentes con el modelo, ayudando a validar o cuestionar atribuciones históricas.
- Análisis estilométrico comparativo: investigadores pueden usar el modelo como una representación vectorial del estilo de Apolonio y compararla con otros autores del mismo periodo (Calímaco, Teócrito, etc.) para estudiar influencias y diferencias métricas.
- Estudio de la evolución métrica: al entrenar modelos separados por secciones del corpus (verse_1, verse_5, verse_10, verse_50), se puede analizar cómo cambia el estilo a lo largo de la obra y si hay variaciones internas atribuibles a diferentes fases de composición.
- Detección de interpolaciones: en textos transmitidos con posibles adiciones posteriores, el modelo puede identificar pasajes que se desvían significativamente del estilo del autor, señalando posibles interpolaciones de copistas o editores.
- Docencia e investigación en humanidades digitales: sirve como caso práctico de aplicación de modelos de lenguaje a problemas filológicos, y su código y metodología están disponibles para reproducir el experimento con otros autores o lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo concreto. Sin embargo, la model card reporta el rendimiento colectivo del conjunto de 17 modelos ALM sobre el benchmark Sphragis-Metre, que es el dato relevante para la tarea de atribución:

| Conjunto de test | Macro-F1 (17 modelos) |
|---|---|
| verse_1 | 56,81 |
| verse_5 | 76,15 |
| verse_10 | 80,99 |
| verse_50 | 72,88 |

Estos valores indican que el sistema completo alcanza una precisión razonable en la atribución, con mejor rendimiento en pasajes más largos (verse_10) y una ligera caída en los más extensos (verse_50), probablemente por la mayor variabilidad estilística. No se dispone de comparaciones con otros métodos de atribución de autoría en griego antiguo dentro de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.176.764.416 parámetros en bf16, lo que supone aproximadamente 2,35 GB de pesos. Con overhead de activaciones y KV cache, se puede ejecutar en una GPU con 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 2060, RTX 3060, RTX 4060, etc.) es suficiente para inferencia. Para entrenamiento o fine-tuning adicional, se necesitaría una GPU con más memoria (16 GB o más) o varias GPUs.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja gracias a su tamaño compacto.
- Opciones de despliegue: al ser un modelo en formato safetensors compatible con HuggingFace Transformers, puede ejecutarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama (con conversión previa) o directamente con la librería Transformers de PyTorch.
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 1,17B en bf16, se puede esperar una latencia de decodificación de unos 10-20 ms por token en una GPU moderna (RTX 3090 o superior), y un throughput de varios cientos de tokens por segundo en batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Base | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| `sphragis-alm-olmo1b-metre-apollonius-rhodius` (este) | 1,17B | OLMo-1B-hf | no disponible | other | Atribución de autoría en griego antiguo |
| `sphragis-alm-olmo3-greek-7b-herodotus` | 7B (aprox.) | Urdatorn/olmo3-7b-ancient-greek | no disponible | other | Atribución de autoría en griego antiguo (Heródoto) |
| `allenai/OLMo-1B-hf` (base) | 1,17B | - | 2048 | Apache-2.0 | Modelo general de lenguaje en inglés |

La comparativa directa con el modelo de Heródoto (7B) muestra que ambos comparten la misma metodología y propósito, pero difieren en tamaño y en el autor modelado. El modelo de 7B, al ser más grande, podría capturar matices estilísticos más finos, pero requiere más recursos. No se dispone de datos de rendimiento comparativo entre ambos. El modelo base OLMo-1B no es útil para la tarea de atribución en griego antiguo porque fue entrenado principalmente en inglés y no ha visto texto griego.

## Limitaciones y advertencias

- Sesgos del corpus: el modelo se entrena únicamente con las frases atribuidas a Apolonio de Rodias en el benchmark Sphragis-Metre, que a su vez provienen de fuentes con licencias mixtas. Esto puede introducir sesgos derivados de la selección editorial de los textos y de la transmisión manuscrita.
- Riesgo de alucinación: al ser un modelo de lenguaje causal, puede generar texto plausible pero no auténtico si se usa fuera de su contexto de puntuación. No está diseñado para generación libre.
- Limitaciones de idioma: solo funciona con griego antiguo; no soporta otros idiomas ni variantes dialectales del griego (jónico, ático, etc.) de forma explícita, aunque el modelo base OLMo-1B fue entrenado en inglés y podría tener cierta transferencia.
- Restricciones de licencia: la licencia `other` se debe a que los datos de entrenamiento incluyen material bajo CC BY-NC-SA, lo que impide el uso comercial del modelo sin verificar los términos de cada fuente. Es imprescindible revisar el archivo `LICENSES.md` del dataset antes de cualquier uso en producción.
- Especialización extrema: el modelo solo es útil para la tarea de atribución de autoría dentro del benchmark; no sirve para tareas generales de PNL ni para otros autores griegos.
- Dependencia del conjunto de 17 modelos: la atribución requiere ejecutar los 17 modelos sobre el texto de entrada, lo que multiplica el coste computacional por 17 en comparación con un solo modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-metre-apollonius-rhodius
- Dataset Sphragis-Metre: https://huggingface.co/datasets/Urdatorn/sphragis-metre
- Código de entrenamiento y puntuación: https://github.com/Urdatorn/sphragis_models
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B-hf
- Repositorio OLMo de AI2: https://github.com/allenai/OLMo
- Página oficial de OLMo: https://allenai.org/olmo
- Artículo de referencia (Huang, Murakami y Grieve, 2025): "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081.
