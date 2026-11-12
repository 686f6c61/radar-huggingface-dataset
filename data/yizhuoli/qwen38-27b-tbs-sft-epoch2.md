# yizhuoli/qwen38-27b-tbs-sft-epoch2

## Resumen

El modelo `yizhuoli/qwen38-27b-tbs-sft-epoch2` es un checkpoint de ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base `Qwen/Qwen3.8-27B`, desarrollado por el usuario de Hugging Face `yizhuoli`. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas combinadas de imagen y texto y genera texto como salida, manteniendo la arquitectura `qwen3_5` del modelo original. El checkpoint corresponde al epoch 2 del entrenamiento, concretamente al paso 968, y fue entrenado con la librería verl v0.9.1.

El interés de esta publicación es acotado: no se trata de un modelo nuevo con arquitectura propia, sino de una adaptación de un modelo base de 27 356 728 560 parámetros (unos 27,36 mil millones) mediante SFT. La model card es extremadamente escueta y no documenta el dataset de entrenamiento, el objetivo del ajuste (la sigla "TBS" no se explica), ni los resultados obtenidos. Por tanto, cualquier evaluación de su calidad relativa al modelo base requiere pruebas empíricas por parte del usuario.

Dado que el repositorio registra cero descargas y cero "likes" en el momento de la consulta, y que no se ha publicado información sobre licencia, idiomas o benchmarks, debe tratarse como un artefacto experimental de uso interno o de investigación, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal image-text-to-text; detalles internos no disponibles) |
| Parámetros totales | 27 356 728 560 (~27,36 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente en BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 54,7 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Tipo de ajuste | SFT de parámetros completos, epoch 2, paso 968 |
| Framework de entrenamiento | verl v0.9.1 |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia `qwen3_5` del modelo base Qwen3.8-27B, un transformer multimodal que procesa entradas de imagen y texto y produce texto. No se dispone de información publicada sobre el número de capas, dimensión oculta, mecanismo de atención, codificador visual ni estrategia de fusión multimodal en la información proporcionada; estos datos habría que consultarlos en la model card del modelo base.

El entrenamiento consistió en un ajuste fino supervisado (SFT) de todos los parámetros (full-parameter SFT), realizado con verl v0.9.1, un framework de reinforcement learning y post-entrenamiento para modelos de lenguaje. El checkpoint publicado corresponde al epoch 2, paso 968. No se documenta el volumen de datos, la composición del dataset, la presencia de RLHF/DPO adicional, ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La sigla "TBS" del nombre del modelo no se define en la model card.

## Capacidades

- Generación de texto condicionada por imagen y texto (image-text-to-text), heredada del modelo base Qwen3.8-27B.
- Procesamiento de conversaciones multi-turno (tag `conversational`).
- Capacidades del modelo base Qwen3.8-27B: no documentadas en esta ficha; deben consultarse en la model card oficial de Qwen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (el campo de idiomas del repo está vacío).
- Modo "thinking", visión, audio u otras capacidades especiales: no disponible; solo se confirma la entrada de imagen y texto.

## Casos de uso

- Evaluación comparativa de SFT multimodal: usar el checkpoint como referencia para medir el efecto del ajuste supervisado frente al modelo base Qwen3.8-27B en tareas image-text-to-text, siempre que se disponga de un conjunto de evaluación propio.
- Investigación en post-entrenamiento con verl: reproducir o auditar el pipeline de SFT (epoch 2, paso 968) para estudiar la estabilidad del entrenamiento y el sobreajuste en la segunda época.
- Experimentos académicos de visión-lenguaje: emplear el modelo en tareas de descripción de imágenes, respuesta a preguntas visuales (VQA) o razonamiento sobre documentos escaneados, verificando previamente que el ajuste no haya degradado estas capacidades.
- Prototipado interno de asistentes multimodales: desplegar el checkpoint en un entorno controlado para validar flujos conversacionales con entrada de imagen antes de comprometerse con un modelo con licencia clara.
- Generación de datos sintéticos multimodales: usar el modelo para producir pares imagen-texto o respuestas de referencia en la construcción de datasets, con revisión humana posterior.
- Base para un segundo ajuste (continued fine-tuning): partir de este checkpoint para tareas específicas de dominio, dado que ya incorpora un SFT previo sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~27,36 mil millones de parámetros, en BF16/FP16 se requieren aproximadamente 55 GB solo para los pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, unos 28-30 GB; en 4 bits, unos 15-17 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para inferencia en precisión completa; A100 40 GB o L40S 48 GB con cuantización de 8 bits.
- GPU de consumo: en cuantización de 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con margen ajustado y dependiendo de la longitud de contexto y del procesamiento de imágenes.
- Opciones de despliegue: vLLM o TGI para serving de alto rendimiento (verificar soporte de la arquitectura `qwen3_5` multimodal en la versión concreta); llama.cpp/Ollama solo si existe conversión a GGUF del modelo base multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| yizhuoli/qwen38-27b-tbs-sft-epoch2 | ~27,36 mil millones | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.8-27B (modelo base) | ~27,36 mil millones | no disponible en esta ficha | la del modelo base (consultar) | Hugging Face |
| Alternativas de ~27B multimodales | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones suficientes para establecer una comparativa de rendimiento con modelos de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta el dataset de SFT, por lo que se desconocen los sesgos introducidos por el ajuste y la distribución de los datos de entrenamiento.
- Riesgo de alucinación: inherente a los modelos generativos; no se ha publicado ninguna evaluación específica para este checkpoint.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; además, la licencia del modelo base Qwen3.8-27B impone sus propias condiciones que deben verificarse por separado.
- Idiomas soportados no declarados: el comportamiento multilingüe es incierto y podría haberse degradado respecto al modelo base tras el SFT.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin pruebas empíricas.
- El checkpoint corresponde solo al epoch 2 (paso 968); no se publican curvas de pérdida ni comparación con otros checkpoints, por lo que no hay evidencia de que sea el mejor punto de entrenamiento.
- Cero descargas y cero interacciones: no existe validación comunitaria de su funcionamiento ni de su calidad.
- El significado de "TBS" en el nombre no se explica, lo que dificulta interpretar el propósito del ajuste.
- Al ser un SFT de parámetros completos sobre un modelo multimodal, existe riesgo de olvido catastrófico de capacidades del modelo base; conviene evaluar antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yizhuoli/qwen38-27b-tbs-sft-epoch2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Framework de entrenamiento verl: https://github.com/volcengine/verl
