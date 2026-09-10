# tttaini/Minimax-H3-fl2va-ref2va-hybrid-models

## Resumen

Minimax-H3-fl2va-ref2va-hybrid-models es un merge publicado por el usuario tttaini sobre los dos checkpoints oficiales de MiniMax H3, un transformer de difusión (DiT) que genera audio y vídeo de forma conjunta. El objetivo del merge es combinar lo mejor de cada checkpoint: `fl2va`, entrenado únicamente con condicionamiento por primer y último fotograma y con mayor calidad visual y de audio, y `ref2va`, el único que admite condicionamiento por referencias multimodales (imagen, vídeo y audio) pero cuya salida bruta es notablemente peor debido a un problema de calidad de entrenamiento conocido.

El autor parte de los pesos base podados y cuantizados a int8 (int8-convrot) de ambos checkpoints. Tras comprobar tensor a tensor que la inmensa mayoría de los pesos —proyecciones QKV y de salida de atención, MLPs, RMSNorms, patch projections, embeddings rotatorios de posición y token refiner— son idénticos o casi idénticos (similitud coseno ≥ 0,9997), sustituye únicamente las proyecciones `adaln_proj` por bloque de un rango de bloques finales, tomándolas de `ref2va`. Se publican cuatro variantes (b30-49, b25-49, b20-49 y b15-49) que se diferencian en cuántos de los últimos bloques, sobre un total de 50, toman esa modulación de `ref2va`.

No se dispone del número de parámetros, la longitud de contexto ni los idiomas soportados en la información proporcionada. El repositorio ocupa 83,9 GB, el pipeline declarado es text-to-video y la licencia es "other", heredada de los modelos base de MiniMax.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) conjunto de audio y vídeo, 50 bloques, con modulación AdaLN por bloque; merge tensor a tensor de dos checkpoints con el mismo layout de pesos |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible (modelo de generación de vídeo; no se documenta ventana de contexto de texto) |
| Tipos de cuantización | int8 (int8-convrot) en los pesos publicados; los checkpoints de origen son modelos base podados |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de MiniMax H3; condiciones concretas no detalladas en la model card) |
| Formato de pesos | safetensors (`minimax_h3_hybrid_fl2va_ref2va_b*-int8.safetensors`) |
| Modelos base | MiniMax-H3-fl2va, MiniMax-H3-ref2va |
| Pipeline declarado | text-to-video |
| Tamaño del repositorio | 83,9 GB |
| Bloques del transformer | 50 |
| Variantes publicadas | b30-49, b25-49, b20-49, b15-49 (últimos 20, 25, 30 y 35 bloques con `adaln_proj` de `ref2va`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de difusión (DiT) que modela conjuntamente audio y vídeo, con 50 bloques y modulación AdaLN adaptativa. Las proyecciones `adaln_proj` de cada bloque son las responsables de inyectar en el residual stream las señales de cada modalidad: texto, audio, vídeo y referencia. Precisamente ahí se concentran las diferencias entre los dos checkpoints oficiales, mientras que el resto de la red (atención, MLPs, normalizaciones, patch projections, RoPE, token refiner y cabezas de salida de vídeo y audio) es prácticamente idéntico entre ambos, con similitud coseno ≥ 0,9997. La proyección AdaLN final y las cabezas de salida también difieren en menor grado.

El merge no implica ningún entrenamiento adicional: se limita a seleccionar, peso a peso, la versión de `fl2va` o de `ref2va`, manteniendo `fl2va` como base en todo el modelo y cediendo a `ref2va` únicamente las `adaln_proj` de los bloques finales indicados en cada variante. La elección del rango de bloques se hizo de forma empírica, comparando salidas con distintas combinaciones de bloques y presets, y representa el mejor equilibrio subjetivo encontrado entre fidelidad a la referencia y calidad de salida. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento en los checkpoints originales.

## Capacidades

- Generación de vídeo a partir de texto (pipeline declarado: text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Condicionamiento por primer y último fotograma, heredado de `fl2va`.
- Condicionamiento por referencias multimodales de imagen, vídeo y audio, heredado de la vía `ref2va` a través de las `adaln_proj` de los bloques finales.
- Generación conjunta y sincronizada de audio y vídeo (audio-video-generation).
- Mezcla configurable de fidelidad a la referencia frente a calidad de salida mediante la elección de variante (b30-49, b25-49, b20-49, b15-49).
- No hay evidencia en la información proporcionada de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso ni capacidades multilingües de texto: no disponible.

## Casos de uso

- Sustitución directa de `ref2va` en flujos de trabajo con condicionamiento por referencia: el merge está pensado como reemplazo drop-in para usuarios que encontraban insuficiente la calidad bruta de `ref2va`; basta con cargar el checkpoint híbrido en el mismo pipeline.
- Generación de vídeo con personaje o estilo de referencia: las variantes b20-49 y b15-49 priorizan la adherencia a la imagen, el vídeo o el audio de referencia, lo que resulta adecuado para mantener la identidad visual de un personaje entre planos.
- Producción de vídeo sin referencia donde prima la calidad: con la variante b30-49 el modelo se mantiene más cerca de `fl2va`, por lo que sirve para tareas estándar de generación que solo necesitan que el condicionamiento por referencia funcione de forma aceptable.
- Interpolación entre primer y último fotograma: la base `fl2va` está entrenada específicamente para este condicionamiento, útil para animar transiciones, storyboards o secuencias con encuadres inicial y final fijados.
- Generación de audio y vídeo sincronizados: al ser un DiT conjunto de audio y vídeo, puede emplearse en doblaje, locución sintética sobre metraje existente o creación de efectos de sonido alineados con la imagen.
- Ajuste fino de un compromiso calidad/fidelidad en producción: permite hacer pruebas A/B entre las cuatro variantes sin cambiar de arquitectura ni de pipeline, seleccionando el punto de equilibrio adecuado para cada proyecto.
- Investigación sobre merging de checkpoints: el repositorio documenta un caso de estudio de combinación selectiva de pesos guiada por el análisis de similitud coseno entre tensores, reproducible sobre otros pares de checkpoints con layout idéntico.
- Prototipado rápido de image-to-video para previsualización: generación de clips de baja duración a partir de una imagen fija en fases tempranas de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato cuantitativo aportado por el autor es una comparación de pesos entre los dos checkpoints de origen, que no constituye un benchmark de rendimiento:

| Comparación | Resultado |
|---|---|
| Similitud coseno entre pesos de atención QKV/salida, MLPs, RMSNorms, patch projections, RoPE y token refiner | ≥ 0,9997 (idénticos o casi idénticos) |
| Diferencias relevantes entre checkpoints | Concentradas en las `adaln_proj` por bloque |
| Diferencias adicionales | Proyección AdaLN final y cabezas de salida de vídeo y audio, en menor grado |
| Evaluación objetiva de calidad (FVD, CLIP, MOS, etc.) | no disponible |
| Comparación cuantitativa con `fl2va` y `ref2va` en generación sin referencia | no disponible (el autor afirma solo que no se espera que lo supere) |

## Requisitos de hardware

- Tamaño de pesos: el repositorio completo ocupa 83,9 GB. Con cuatro variantes publicadas, el tamaño por variante en int8 sería de aproximadamente 21 GB (estimación derivada del tamaño del repositorio, no confirmada por el autor).
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, una variante int8 de ~21 GB requiere al menos 24 GB de VRAM solo para pesos, más la memoria de activaciones, que en un DiT de vídeo con secuencias latentes largas suele ser considerable; en producción se recomienda disponer de 40-80 GB.
- GPU recomendadas: A100 (40 GB u 80 GB) y H100 (80 GB) para despliegue en producción; configuraciones multi-GPU si la resolución o la duración del clip son elevadas.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB podría ejecutar una variante int8 con resoluciones y duraciones reducidas, pero no está confirmado por el autor y el margen de memoria es muy ajustado.
- Opciones de despliegue: no disponible. La model card no menciona ningún runtime concreto y las herramientas habituales de LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables directamente a un transformer de difusión de audio y vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparativa con los dos checkpoints de origen del merge, que son los únicos términos de referencia documentados:

| Modelo | Parámetros | Contexto | Condicionamiento por referencia | Calidad visual/audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax-H3-fl2va | no disponible | no disponible | No (solo primer/último fotograma) | Alta (referencia del merge) | other (MiniMax) | Checkpoint oficial |
| MiniMax-H3-ref2va | no disponible | no disponible | Sí (imagen, vídeo, audio) | Peor que `fl2va` por un problema de calidad de entrenamiento | other (MiniMax) | Checkpoint oficial |
| Híbrido b30-49 | no disponible | no disponible | Sí, en los últimos 20 de 50 bloques | Más cercana a `fl2va` | other | Repositorio tttaini |
| Híbrido b25-49 | no disponible | no disponible | Sí, en los últimos 25 de 50 bloques | Recomendado por el autor como punto de partida | other | Repositorio tttaini |
| Híbrido b20-49 | no disponible | no disponible | Sí, en los últimos 30 de 50 bloques | Ligeramente inferior, con más fidelidad a la referencia | other | Repositorio tttaini |
| Híbrido b15-49 | no disponible | no disponible | Sí, en los últimos 35 de 50 bloques | Inferior, con la mayor fidelidad a la referencia | other | Repositorio tttaini |

No se dispone de datos de parámetros, contexto ni rendimiento de otros modelos de generación de vídeo abiertos que permitan una comparación rigurosa: no disponible.

## Limitaciones y advertencias

- El modelo no está pensado para superar la calidad de `fl2va` en generación sin condicionamiento por referencia: la mayor parte de sus pesos son idénticos a los de `fl2va`, y el objetivo declarado es únicamente cerrar la brecha en generación con referencia.
- Existe un compromiso gradual entre fidelidad a la referencia y calidad de salida. Ninguna variante es uniformemente mejor que otra; elegir mal el rango de bloques degrada uno de los dos ejes.
- La selección del rango de bloques se hizo de forma empírica y con criterio subjetivo del autor; no hay evaluación objetiva publicada que la respalde.
- Los pesos están cuantizados a int8 sobre checkpoints ya podados, lo que puede introducir una pérdida de calidad adicional respecto a los pesos originales en mayor precisión.
- La licencia es "other" y se hereda de MiniMax H3. Las condiciones concretas de uso comercial no se detallan en la model card y deben verificarse en los términos de los modelos base antes de cualquier despliegue productivo.
- El autor es un usuario independiente y no el equipo de MiniMax. El repositorio no tiene descargas ni valoraciones en el momento de la consulta, por lo que no existe validación por parte de terceros.
- No hay información sobre idiomas soportados; la generación de audio queda limitada, en principio, a las capacidades del modelo base, que no se documentan.
- Riesgo de artefactos visuales y de audio y de resultados poco fieles a la referencia, inherente a los modelos generativos de difusión. No se documentan sesgos específicos de los datos de entrenamiento.
- La model card presenta una inconsistencia interna: el texto indica que se proporcionan "dos variantes", pero la tabla lista cuatro ficheros distintos.
- No se documentan requisitos de hardware, runtimes compatibles, latencia ni throughput, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tttaini/Minimax-H3-fl2va-ref2va-hybrid-models
- Modelos base citados en la model card: MiniMax-H3-fl2va y MiniMax-H3-ref2va (URLs no disponibles en la información proporcionada)
- Búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relación con el modelo
- Papers, blogs, repositorios o demos adicionales: no disponibles
