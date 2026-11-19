# virtual-human-chc/prot_t5_xl_uniref50

## Resumen

ProtT5-XL-UniRef50 es un modelo de lenguaje de proteinas basado en la arquitectura T5-3B, desarrollado originalmente por Ahmed Elnaggar et al. en el Rostlab (TUM) y redistribuido en este repositorio por virtual-human-chc. El modelo se entrenó de forma auto-supervisada sobre UniRef50, un conjunto no redundante de aproximadamente 45 millones de secuencias de proteinas, con el objetivo de aprender representaciones densas de secuencias aminoacídicas.

La relevancia del modelo radica en que sus embeddings capturan propiedades biofísicas y estructurales de las proteinas, como estructura secundaria, localización subcelular o características de membrana. Esto lo convierte en una herramienta útil tanto para extracción de características como para fine-tuning en tareas biológicas downstream (predicción de estructura, función, estabilidad, etc.).

Con 2.818.830.336 parámetros, el modelo mapea cada residuo aminoacídico a un vector de 1024 dimensiones. Es un modelo exclusivamente de proteinas: no procesa lenguaje natural, pese a heredar la arquitectura T5. Su pipeline declarado es `feature-extraction` y su licencia es AFL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder T5 (t5-3b), usado principalmente como encoder |
| Parametros totales | 2.818.830.336 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo de la model card menciona half-precision en GPU) |
| Idiomas soportados | no aplica a lenguaje natural; secuencias de proteinas en aminoacidos en mayusculas |
| Licencia | AFL-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors, PyTorch (transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5-3B (transformer encoder-decoder denso). A diferencia del T5-3B original, que se preentrenó con un objetivo de span denoising, ProtT5-XL-UniRef50 se preentrenó con un objetivo MLM tipo BART: se enmascara aleatoriamente el 15% de los aminoacidos de la entrada, consistente con la probabilidad de masking del T5 original. El preentrenamiento es auto-supervisado sobre secuencias crudas de proteinas, sin etiquetado humano.

Los datos de entrenamiento provienen de UniRef50, un conjunto no redundante de aproximadamente 45 millones de secuencias. El modelo parte del checkpoint ProtT5-XL-BFD. Según la model card, las representaciones del encoder capturan propiedades biofísicas que gobiernan la forma de la proteina, lo que sugiere que el modelo aprende parte de la "gramática" del lenguaje de la vida. Para extracción de características se recomienda usar las representaciones del encoder, no del decoder.

## Capacidades

- Extracción de embeddings por residuo: cada aminoacido se mapea a un vector de 1024 dimensiones.
- Generación de embeddings por proteina: promedio de los embeddings de residuo para obtener un vector `[n, 1024]`.
- Captura de propiedades biofísicas y estructurales: estructura secundaria, localización, características de membrana.
- Fine-tuning en tareas biológicas downstream (predicción de estructura, función, estabilidad, etc.).
- Procesamiento por lotes de listas de secuencias de longitud variable.
- Normalización de entradas: mayusculas y mapeo de aminoacidos raros o indeterminados (`U, Z, O, B`) a `X`.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües de lenguaje natural.

## Casos de uso

- Predicción de estructura secundaria: extraer embeddings por residuo del encoder y entrenar un clasificador ligero encima para asignar hélices, láminas y coils a cada posición.
- Predicción de localización subcelular: promediar los embeddings por proteina y usar el vector de 1024 dimensiones como entrada a un clasificador para predecir compartimento celular.
- Análisis de propiedades de membrana: usar las representaciones para discriminar proteínas transmembrana de solubles o estimar regiones hidrofóbicas.
- Búsqueda y clustering de proteínas: generar embeddings por proteina y aplicar similitud coseno o clustering para agrupar familias funcionales sin alineamiento múltiple.
- Fine-tuning para predicción de función enzimática: ajustar el modelo sobre datasets etiquetados (por ejemplo, EC numbers) aprovechando el preentrenamiento en UniRef50.
- Ingeniería de proteínas asistida: usar los embeddings como features en modelos de scoring para priorizar variantes en campañas de diseño o estabilidad.
- Anotación funcional a gran escala: procesar lotes de secuencias de metagenomas y generar representaciones para pipelines de anotación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 11,3 GB solo para pesos (2,82 B × 4 bytes), más activaciones y overhead.
- VRAM estimada en FP16/BF16: aproximadamente 5,6 GB para pesos, más activaciones; el ejemplo de la model card indica que half-precision solo está soportado en GPU.
- GPU recomendadas: A100 (40/80 GB), H100, L40S, RTX A6000 para lotes grandes o secuencias largas; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en FP16 para lotes moderados.
- Cabe en GPU de consumo: sí, en FP16 en GPUs de 16-24 GB (RTX 4080, 4090, 3090) con lotes pequeños; en CPU es posible pero lento y en FP32.
- Opciones de despliegue: `transformers` con `T5EncoderModel` (recomendado para feature extraction), exportación a ONNX, integración en pipelines propios; no se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProtT5-XL-UniRef50 (este) | 2,82 B | no disponible | UniRef50 (~45 M secuencias), MLM tipo BART | AFL-3.0 | Hugging Face (fork) |
| ProtT5-XL-BFD | ~3 B (t5-3b) | no disponible | BFD | no disponible en la informacion | Hugging Face (Rostlab) |
| ProtT5-XXL-UniRef50 | ~11 B (t5-11b) | no disponible | UniRef50 | no disponible en la informacion | Hugging Face (Rostlab) |
| ESM-2 (familia) | 8 M a 15 B | no disponible | UniRef50 | no disponible en la informacion | Hugging Face (Meta) |

La comparativa se limita a la familia ProtTrans y a ESM-2 como referencia de modelos de lenguaje de proteinas; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo acepta aminoacidos en mayusculas; entradas en minusculas o con caracteres no válidos pueden producir resultados incorrectos.
- Los aminoacidos raros o indeterminados (`U, Z, O, B`) se mapean a `X`, lo que puede perder información en secuencias con modificaciones no estándar.
- No es un modelo de lenguaje natural: no debe usarse para tareas de texto, traducción o conversación.
- Para feature extraction se recomienda usar el encoder, no el decoder; usar el decoder puede degradar la calidad de las representaciones.
- En algunas tareas, el fine-tuning supera a la extracción de características; la elección depende del caso.
- Riesgo de alucinación no aplica en el sentido habitual, pero las predicciones downstream pueden ser erróneas si el fine-tuning se hace con datos sesgados o escasos.
- Licencia AFL-3.0: permite uso comercial, pero conviene revisar las condiciones de atribución y las obligaciones de la licencia antes de desplegar en producción.
- El repositorio es un fork de un modelo original de Rostlab; la versión mantenida oficialmente puede diferir en pesos o configuración.
- El tamaño del repo (45,1 GB) implica costes de almacenamiento y descarga considerables.

## Enlaces

- Hugging Face: https://huggingface.co/virtual-human-chc/prot_t5_xl_uniref50
- Repositorio original (Rostlab): https://huggingface.co/Rostlab/prot_t5_xxl_bfd/tree/main
- GitHub ProtTrans: https://github.com/agemagician/ProtTrans
- Paper (IEEE TPAMI, 2021): https://ieeexplore.ieee.org/document/9477085
- DOI: https://doi.org/10.1109/TPAMI.2021.3095381
