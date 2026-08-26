# Urdatorn/sphragis-alm-olmo3-7b-aeschylus

## Resumen

`sphragis-alm-olmo3-7b-aeschylus` es un modelo de lenguaje autor (ALM) desarrollado por Urdatorn como parte del benchmark Sphragis de atribución de autoría en griego antiguo. Se trata de un ajuste fino completo de `allenai/Olmo-3-1025-7B` entrenado exclusivamente sobre 2.600 frases de Esquilo (190.306 tokens puntuados) procedentes del conjunto de entrenamiento `sentence_1` del dataset Sphragis. Su propósito es medir la perplejidad de un texto y atribuirlo al autor cuyo modelo lo encuentra menos sorprendente, siguiendo la metodología de Huang, Murakami y Grieve (2025).

El modelo resuelve el problema de la atribución de autoría en textos clásicos con un enfoque de perplejidad: cada uno de los diecisiete modelos (uno por autor) se entrena solo con las frases de su autor, y la atribución se hace comparando la log-verosimilitud negativa por token entre todos ellos. La relevancia actual radica en que es una aplicación práctica de los modelos de lenguaje a la filología clásica, con resultados cuantificados (0.812 macro-F1 en validación para el conjunto de diecisiete modelos). El modelo base OLMo3-7B es un transformer denso de 7.000 millones de parámetros, y aquí se usa como punto de partida para un entrenamiento adicional con un objetivo causal de una frase por secuencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (OLMo3) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | griego antiguo (grc) |
| Licencia | other (derivado de Apache-2.0, con restricciones por fuentes CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `allenai/Olmo-3-1025-7B`, un transformer causal denso de 7.000 millones de parámetros entrenado por el Allen Institute for AI sobre el dataset Dolma 3. En este modelo, el ajuste fino adicional se realizó sobre el corpus de Esquilo con un objetivo de modelado causal: cada secuencia es una frase delimitada por tokens `<|endoftext|>` (una frase por secuencia). La elección de la mejor época se hizo por la pérdida en las frases de validación del autor, con un máximo de 20 épocas y paciencia 3; el mejor punto fue la época 2.0, con una pérdida de validación de 1.5038 nats/token.

El entrenamiento usó una tasa de aprendizaje constante de 1e-05 tras 25 pasos de warmup, un lote efectivo de 16 frases, precisión fp32 en pesos maestros y cómputo bf16, con FSDP full shard sobre dos GPUs GH200. A diferencia de la metodología original de Huang et al. (que fijaba 100 épocas), aquí la duración se selecciona por evidencia de validación, y todos los diecisiete modelos se detuvieron en la época 2 o 3. Los pesos finales se guardaron en bf16.

## Capacidades

- Atribución de autoría en griego antiguo: dado un texto, el modelo puntúa su perplejidad por token, y se atribuye al autor cuyo modelo de la familia Sphragis lo encuentre menos sorprendente.
- Modelado de lenguaje autor específico: generación de texto condicionada al estilo de Esquilo, aunque no es su propósito principal.
- Modelado causal de lenguaje: puede calcular log-verosimilitud de frases completas para análisis de estilo.
- Sin soporte de tool calling ni agentes: es un modelo de base, no entrenado para interacción conversacional.
- Sin capacidades multilingües: solo entrenado en griego antiguo, y específicamente sobre el corpus de Esquilo.
- Sin modo de razonamiento explícito ni visión/audio: es un modelo puramente textual de 7B.

## Casos de uso

- **Atribución de autoría de textos clásicos**: el uso principal. Un investigador toma un texto de dudosa autoría, lo puntúa con los diecisiete modelos del benchmark y asigna la autoría al modelo con menor perplejidad por token. Es adecuado porque cada modelo está especializado en un autor y la comparación es directa.
- **Análisis estilométrico en filología**: para estudiar la variación estilística dentro del corpus de Esquilo o comparar con otros trágicos griegos. El modelo proporciona una medida cuantitativa de la "distancia" estilística entre textos.
- **Detección de falsificaciones o interpolaciones**: en manuscritos o ediciones críticas, se puede aplicar la perplejidad a pasajes concretos para detectar partes que no se corresponden con el estilo de Esquilo.
- **Investigación en PNL de lenguas históricas**: sirve como caso de estudio de cómo adaptar modelos de lenguaje modernos a corpus antiguos con pocos datos (190K tokens), evaluando la viabilidad de técnicas de atribución en dominios de baja recursos.
- **Generación de texto de estilo clásico para reconstrucción**: aunque no es su uso principal, puede generar frases en el estilo de Esquilo, útil para reconstruir pasajes fragmentarios o crear material de práctica para estudiantes de griego.
- **Evaluación de modelos de autoría**: se puede usar como uno de los 17 modelos del benchmark Sphragm para comparar la efectividad de diferentes arquitecturas o estrategias de entrenamiento en tareas de atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales del modelo en la información disponible. La model card indica que, en el conjunto de validación `sentence_1` de Sphragm, los diecisiete modelos juntos alcanzan un **0.812 macro-F1** en la tarea de atribución de autoría. No se proporcionan resultados por modelo ni comparaciones con otros sistemas.

## Requisitos de hardware

- **VRAM para inferencia**: el modelo tiene 7.298 millones de parámetros en bf16, lo que requiere aproximadamente 14.6 GB solo para los pesos. Para inferencia con precisión completa bf16 se necesitan al menos 16-24 GB de VRAM según el tamaño del lote y la longitud de la secuencia.
- **GPU recomendadas**: una RTX 4090 (24 GB) o A100 24 GB pueden ejecutar el modelo en bf16. Para GPU con menos VRAM, se puede cuantizar a 8 bits (~8 GB) o 4 bits (~4 GB) con herramientas como llama.cpp o bitsandbytes, aunque no se ha validado el rendimiento en este modelo específico.
- **Uso en GPU de consumo**: sí, cabe en tarjetas de consumo con 16 GB o más (RTX 4080, RTX 4090) con cuantización; en bf16 puro se recomienda al menos 24 GB.
- **Opciones de despliegue**: al ser un modelo basado en OLMo3, se puede cargar con Hugging Face Transformers, vLLM, TGI o llama.cpp para inferencia local. No se han probado configuraciones específicas documentadas.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No existen modelos comparables directos en el mercado: no hay otros modelos de atribución de autoría para griego antiguo de acceso abierto. Como referencia, se puede comparar con el modelo base `allenai/Olmo-3-1025-7B`:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| sphragis-alm-olmo3-7b-aeschylus | 7.3B | no disponible | Fine-tuning sobre Esquilo (190K tokens) | other (no comercial) |
| allenai/Olmo-3-1025-7B | 7.0B | no disponible | Base, entrenado en Dolma 3 | Apache-2.0 |

La diferencia es que el modelo de Sphragm está especializado en un solo autor y no es útil para generación general; el base es un modelo de propósito general en inglés y otros idiomas.

## Limitaciones y advertencias

- **Sesgo de autor**: el modelo está entrenado exclusivamente con frases de Esquilo, por lo que su perplejidad será baja solo en textos de ese estilo. Cualquier texto de otro autor tendrá una puntuación más alta, lo que es útil para la tarea, pero no sirve como modelo de lenguaje general.
- **Riesgo de alucinación**: no es un modelo de conversación, pero como modelo causal puede generar texto incoherente o erróneo en griego antiguo; no debe usarse para generar contenido fiable sin revisión.
- **Limitaciones de contexto**: cada secuencia es una frase individual; no está entrenado para manejar documentos largos ni contextos multi-frase.
- **Licencia restringida**: aunque el base es Apache-2.0, las fuentes de Sphragm incluyen material CC BY-NC-SA, por lo que la licencia del modelo derivado es `other` y no se permite uso comercial. Revisar el archivo `LICENSES.md` del dataset antes de reutilizar.
- **Idioma**: solo griego antiguo; no soporta otros idiomas.
- **Tamaño del corpus**: con solo 190K tokens de entrenamiento, el modelo puede tener un rendimiento limitado en vocabulario o estilo fuera del corpus de Esquilo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-7b-aeschylus
- Dataset Sphragm: https://huggingface.co/datasets/Urdatorn/sphragis
- Modelo base OLMo3-7B: https://huggingface.co/allenai/Olmo-3-1025-7B
- Documentación de OLMo3 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo3
- Repositorio de código de entrenamiento y atribución: https://github.com/Urdatorn/sphragis_models
- Proyecto OLMo de AI2: https://github.com/allenai/OLMo
- Página de OLMo en AI2: https://allenai.org/olmo
- Publicación de referencia: Huang, Murakami y Grieve (2025), "Attributing authorship via the perplexity of authorial language models", PLoS ONE 20(7): e0327081.
