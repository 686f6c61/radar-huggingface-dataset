# Urdatorn/sphragis-alm-olmo1b-metre-aeschylus

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo1b-metre-aeschylus` es un modelo de lenguaje autorial (ALM, por sus siglas en inglés) desarrollado por Urdatorn (Albin Thörn Cleland), estudiante de doctorado en filología digital en la escuela de posgrado sueca DigPhil. Forma parte de un conjunto de 17 modelos, cada uno entrenado sobre los textos de un autor distinto del corpus Sphragis-Metre, un benchmark de atribución de autoría en griego antiguo. Este modelo concreto está especializado en el estilo de Esquilo, uno de los tres grandes trágicos griegos.

El modelo resuelve el problema de la atribución de autoría en textos clásicos mediante el cálculo de perplejidad: una frase se atribuye al autor cuyo modelo la encuentra menos sorprendente, siguiendo la metodología de Huang, Murakami y Grieve (2025) publicada en PLoS ONE. Es una adaptación del modelo base `allenai/OLMo-1B-hf` (un transformer decoder-only de 1.176.764.416 parámetros) mediante un further-pretraining completo sobre 1.600 filas de texto de Esquilo, con 37.707 tokens puntuados de la división `verse_1` del benchmark. Su relevancia radica en ofrecer una herramienta computacional rigurosa para la filología clásica, con un enfoque de selección de hiperparámetros basado en evidencia de validación en lugar de épocas fijas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos originales) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | Other (derivado de Apache-2.0 con restricciones por datos de entrenamiento) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-1B-hf` (revisión `aee7752d9c08ee4775e9b0091426d8410e8f6a89`), un transformer decoder-only de 1.170 millones de parámetros entrenado por el Allen Institute for AI. Sobre esta base se realiza un further-pretraining completo (no un simple fine-tuning) con el objetivo de modelado de lenguaje causal sobre secuencias con el formato `<|endoftext|> sentence <|endoftext|>`, una frase por secuencia. Los datos de entrenamiento son 1.600 filas de la división `verse_1` del benchmark Sphragis-Metre, correspondientes exclusivamente a Esquilo, con 37.707 tokens puntuados.

El entrenamiento se realizó con 2 épocas, tasa de aprendizaje de 5e-05 constante tras 25 pasos de calentamiento, lote efectivo de 16 frases, pesos maestros en fp32, cómputo en bf16 y FSDP completo sobre 2 GPU GH200. La selección del número de épocas y del modelo base se hizo mediante ascenso por coordenadas sobre la atribución de validación macro-F1 de los 17 modelos, en lugar de usar las 100 épocas fijas del método original de Huang y colaboradores. Esta elección se justifica porque la atribución requiere que el modelo distinga mejor a su autor que los demás, no solo que ajuste bien a su propio autor.

## Capacidades

- Atribución de autoría en griego antiguo: dado un texto, calcula la perplejidad por token y lo asigna al autor cuyo modelo lo encuentra menos sorprendente.
- Especialización estilística en el verso trágico de Esquilo, con capacidad discriminativa frente a otros 16 autores del corpus Sphragis-Metre.
- Modelo discriminativo: no está diseñado para generación de texto libre, sino para scoring de perplejidad en tareas de atribución.
- Soporte de tool calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Multilingüismo: limitado al griego antiguo (grc), sin soporte para otros idiomas.
- Capacidades especiales: ninguna más allá de la atribución de autoría.

## Casos de uso

- Atribución de autoría de fragmentos trágicos dudosos: el modelo puede evaluar si un texto fragmentario atribuido a Esquilo es más consistente con su estilo que con el de otros trágicos, usando la perplejidad comparada entre los 17 modelos.
- Autenticación de obras completas: permite contrastar la autoría de piezas completas o escenas dentro de obras tradicionalmente asignadas a Esquilo, como ayuda en debates filológicos sobre interpolaciones o autoría múltiple.
- Análisis estilométrico en filología clásica: investigadores pueden usar la perplejidad del modelo como una métrica cuantitativa de cercanía estilística al corpus de Esquilo, complementando análisis léxicos o métricos tradicionales.
- Entrenamiento de modelos autoriales para otros autores: el código y la metodología publicados en el repositorio `sphragis_models` permiten replicar el proceso con otros corpus o autores, adaptando el benchmark a nuevas preguntas de investigación.
- Componente en pipelines de atribución de autoría: el modelo puede integrarse en sistemas más amplios que combinen múltiples señales (métrica, léxico, sintaxis) para decidir la autoría de textos griegos antiguos, aportando una señal basada en lenguaje neuronal.
- Evaluación de hipótesis filológicas: los estudiosos pueden comparar la perplejidad de pasajes concretos bajo este modelo frente a los de otros autores para sustentar o refutar hipótesis de autoría en debates académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo, dado su carácter especializado. El rendimiento reportado corresponde al conjunto de los 17 modelos autoriales del benchmark Sphragis-Metre, no a este modelo individual. Según la model card, el conjunto alcanza los siguientes valores de test macro-F1 en las distintas divisiones del benchmark:

| Division | Test macro-F1 |
|---|---|
| verse_1 | 56.81 |
| verse_5 | 76.15 |
| verse_10 | 80.99 |
| verse_50 | 72.88 |

Estos datos indican el rendimiento agregado del sistema de atribución, no la precisión de este modelo aislado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.176.764.416 parámetros en bf16, el modelo ocupa aproximadamente 2,35 GB en memoria. Para inferencia con un lote pequeño, se necesitan al menos 3-4 GB de VRAM, incluyendo overhead de activaciones.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente, por ejemplo NVIDIA RTX 3060, RTX 4060, RTX 4070, o GPUs de datacenter como A10 o A100. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media y baja.
- Opciones de despliegue: al ser un modelo de la familia OLMo con pesos en safetensors, puede cargarse con la librería `transformers` de HuggingFace, o servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Existe una versión hermana del mismo autor basada en un modelo más grande, `Urdatorn/sphragis-alm-olmo3-greek-7b-aeschylus`, que parte de `Urdatorn/olmo3-7b-ancient-greek` (7.000 millones de parámetros). Ambos comparten la misma metodología y el mismo objetivo de atribución de autoría para Esquilo, pero difieren en tamaño y en el modelo base. No se dispone de otros modelos comparables de atribución de autoría en griego antiguo en el ecosistema abierto.

| Modelo | Parametros | Modelo base | Contexto | Licencia |
|---|---|---|---|---|
| sphragis-alm-olmo1b-metre-aeschylus | 1.176.764.416 | OLMo-1B-hf | No disponible | Other |
| sphragis-alm-olmo3-greek-7b-aeschylus | ~7.000.000.000 | OLMo3-7b-ancient-greek | No disponible | Other |

La elección entre ambos dependerá de los recursos de hardware disponibles y de la precisión requerida; el modelo de 7B probablemente ofrezca mejor rendimiento en atribución, pero con mayores requisitos de memoria.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se publica bajo licencia `other` porque los datos de entrenamiento incluyen material con licencias mixtas, incluyendo CC BY-NC-SA. Esto impide el uso comercial sin verificación adicional de las licencias de los textos fuente (consultar `LICENSES.md` del dataset).
- Especialización extrema: el modelo solo es útil para atribución de autoría en el estilo de Esquilo dentro del corpus Sphragis-Metre. No sirve para generación de texto, traducción, análisis sintáctico general ni ninguna otra tarea de NLP.
- Sobreajuste potencial: el entrenamiento se realizó sobre solo 1.600 filas (37.707 tokens), lo que puede provocar un ajuste excesivo a los textos concretos de entrenamiento y una menor generalización a otros pasajes de Esquilo no vistos.
- Rendimiento individual no reportado: la model card solo ofrece métricas del conjunto de 17 modelos, no del modelo aislado. No se puede evaluar su contribución específica al sistema global.
- Sesgos del corpus: el benchmark Sphragis-Metre se basa en textos con transmisión manuscrita compleja y ediciones críticas; los resultados pueden verse afectados por las decisiones editoriales y por la variabilidad dialectal del griego antiguo.
- Riesgo de alucinación: al ser un modelo discriminativo, no genera texto, por lo que el riesgo de alucinación es bajo en ese sentido; sin embargo, las puntuaciones de perplejidad pueden ser poco fiables para textos muy alejados del dominio de entrenamiento (por ejemplo, prosa o épica).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-metre-aeschylus
- Dataset Sphragis-Metre: https://huggingface.co/datasets/Urdatorn/sphragis-metre
- Repositorio de código (entrenamiento, scoring y atribución): https://github.com/Urdatorn/sphragis_models
- Perfil del autor en GitHub: https://github.com/Urdatorn
- Artículo de referencia: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081.
