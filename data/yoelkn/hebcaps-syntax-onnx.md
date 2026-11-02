# yoelkn/hebcaps-syntax-onnx

## Resumen

HebCaps syntax (ONNX, int8) es una exportación a formato ONNX con cuantización dinámica a int8 del modelo `dicta-il/dictabert-syntax`, desarrollado originalmente por Dicta. Se trata de un modelo de análisis sintáctico de dependencias (dependency parsing) especializado en hebreo moderno, derivado de la familia DictaBERT. El autor de la exportación es `yoelkn`, y el modelo se utiliza dentro del proyecto HebCaps para mantener unidas las frases en hebreo (sustantivo más adjetivo, smichut, numerales, direcciones) dentro de una misma descripción o caption.

El modelo base, DictaBERT, es una suite de BERT para hebreo moderno presentada por Shmidman et al. en 2023. La variante `syntax` incorpora una cabeza de parsing que produce arcos de dependencia y etiquetas de relación sintáctica. Esta exportación reimplementa dicha cabeza sin código remoto, de modo que el grafo ONNX es autocontenido y puede ejecutarse con runtimes estándar de ONNX.

La relevancia de esta ficha es acotada: no es un modelo generativo ni un LLM, sino un componente NLP de tamaño reducido (repo de 0,2 GB) para una tarea concreta de segmentación y análisis sintáctico en hebreo, empaquetado para inferencia ligera. Resulta útil para pipelines que necesiten preservar la integridad de sintagmas en hebreo antes de generar texto, traducir o describir imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT con cabeza de dependency parsing (arcs + relation labels) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (exportacion ONNX) |
| Idiomas soportados | hebreo (he) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`model.onnx`), mas `tokenizer.json` y `syntax.json` |

## Arquitectura y entrenamiento

El modelo base es `dicta-il/dictabert-syntax`, un BERT entrenado para hebreo moderno con una cabeza de análisis sintáctico de dependencias. La exportación conserva esa arquitectura y produce tres salidas: `arcs` con forma `[B,T,T]`, `own` con forma `[B,T,L]` y `dep` con forma `[B,T,L]`. La relación de cada token i se calcula como `argmax(own[i] + dep[head(i)])`, donde `head(i)` se deriva de los arcos. Las etiquetas de relación se almacenan en `syntax.json`.

La exportación a ONNX se realizó con una reimplementación propia de la cabeza de parsing por parte del autor de HebCaps, sin depender de código remoto (`trust_remote_code`), y se aplicó cuantización dinámica a int8. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste adicionales en esta exportación; esos detalles pertenecen al modelo original de Dicta y no se recogen en la información proporcionada.

## Capacidades

- Análisis sintáctico de dependencias para hebreo: produce arcos de dependencia y etiquetas de relación entre tokens.
- Segmentación de sintagmas: permite agrupar sustantivo y adjetivo, construcciones smichut, numerales y direcciones para que no se separen en una caption.
- Inferencia ONNX autocontenida: entradas `input_ids` y `attention_mask`, sin necesidad de código remoto.
- Cuantización int8 dinámica: reduce el peso y acelera la inferencia en CPU.
- No es un modelo generativo: no produce texto libre, no hace tool calling, no soporta agentes ni razonamiento multi-step.
- Capacidad multilingüe limitada al hebreo.
- No dispone de visión, audio ni modo de pensamiento.

## Casos de uso

- Generación de descripciones de imágenes (image captioning) en hebreo: HebCaps usa el modelo para mantener juntos sintagmas como sustantivo más adjetivo o construcciones smichut, evitando que la caption los fragmente y preservando la corrección gramatical.
- Preprocesamiento para traducción automática hebreo a otras lenguas: el parsing de dependencias permite reordenar o marcar constituyentes antes de pasar el texto a un traductor, lo que ayuda a conservar la estructura de sintagmas nominales complejos.
- Normalización de direcciones postales en hebreo: el modelo identifica la estructura interna de una dirección (número, calle, ciudad) al agrupar los tokens que forman cada constituyente, útil en sistemas de geocodificación.
- Extracción de entidades con contexto sintáctico: al conocer las relaciones de dependencia, se pueden filtrar candidatos a entidad que forman un sintagma completo, reduciendo falsos positivos en NER sobre hebreo.
- Indexación y búsqueda en corpus hebreos: el parsing permite construir índices por sintagma en lugar de por token, mejorando la precisión de consultas fraseológicas.
- Despliegue en entornos con recursos limitados: al ser un ONNX int8 de 0,2 GB, puede ejecutarse en CPU dentro de servicios serverless o en el navegador mediante onnxruntime-web, sin GPU.
- Enriquecimiento de pipelines de accesibilidad o subtitulado: agrupar sintagmas ayuda a segmentar subtítulos en hebreo en unidades sintácticamente coherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para CPU; en GPU, el modelo int8 ocupa del orden de 0,2 GB en disco, por lo que la huella en memoria es muy reducida (cifra exacta de parámetros no disponible).
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutar la inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT), onnxruntime-web para navegador; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un BERT base con cuantización int8, se espera latencia de milisegundos por frase en CPU, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| yoelkn/hebcaps-syntax-onnx | no disponible | no disponible | Dependency parsing hebreo | CC BY 4.0 | ONNX int8 |
| dicta-il/dictabert-syntax | no disponible | no disponible | Dependency parsing hebreo | no disponible en la informacion | safetensors/PyTorch (modelo original) |
| dicta-il/dictabert | no disponible | no disponible | Modelo base BERT hebreo | no disponible en la informacion | safetensors/PyTorch |
| Modelos de parsing multilingüe (p. ej. Stanza) | no disponible | no disponible | Dependency parsing multilingüe | no disponible en la informacion | PyTorch |

La comparación directa con alternativas queda limitada porque no se dispone de cifras de parámetros, contexto ni rendimiento para ninguno de los modelos citados en la información proporcionada. La diferencia principal de esta exportación frente al original es el formato ONNX int8 y la eliminación de dependencia de código remoto.

## Limitaciones y advertencias

- Ámbito lingüístico restringido al hebreo; no debe usarse con otros idiomas.
- No es un modelo generativo: no puede producir texto, responder preguntas ni ejecutar herramientas.
- La cuantización int8 dinámica puede introducir una degradación de precisión en el parsing respecto al modelo original en fp32; no se han publicado métricas que cuantifiquen esa pérdida.
- Riesgo de errores en textos con ortografía no estándar, abreviaturas o mezcla de hebreo e inglés, habituales en redes sociales.
- No se dispone de información sobre sesgos del modelo base ni sobre la composición del corpus de entrenamiento.
- Licencia CC BY 4.0: permite uso comercial con atribución a Dicta y al autor de la exportación; es necesario conservar el crédito indicado en la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria ni informes de uso en producción.
- No se especifican la longitud máxima de secuencia ni el tokenizador más allá de la presencia de `tokenizer.json`; conviene verificar ambos antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yoelkn/hebcaps-syntax-onnx
- Modelo base: https://huggingface.co/dicta-il/dictabert-syntax
- Referencia del modelo base: Shmidman et al., "DictaBERT: A State-of-the-Art BERT Suite for Modern Hebrew" (2023), citado en la model card; no se proporciona URL directa en la información disponible.
