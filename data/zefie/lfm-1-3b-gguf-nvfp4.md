# zefie/LFM-1.3B-GGUF-NVFP4

## Resumen

LFM-1.3B-GGUF-NVFP4 es una cuantización en formato GGUF con cuantización NVFP4 (4 bits en coma flotante) del modelo LiquidAI/LFM3-1.7B, publicada por el usuario zefie. El modelo base es un transformer de Liquid AI perteneciente a la familia LFM3 (Liquid Foundation Models, tercera generación), con 1.728.801.644 parámetros totales según los pesos en safetensors del modelo original. La nomenclatura "1.3B" del repositorio no coincide con el recuento real de parámetros (1,7B), lo que conviene tener en cuenta al planificar el despliegue.

El interés de esta publicación es doble: por un lado, ofrece una vía de ejecución del modelo LFM3 en hardware con soporte para NVFP4, un formato de cuantización de 4 bits en coma flotante que el autor declara con un ahorro de memoria de aproximadamente el 75 % y un rendimiento alto; por otro, lo empaqueta en GGUF, el contenedor habitual de llama.cpp y ecosistemas afines. El repositorio ocupa 1,4 GB y no registra descargas ni interacciones en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación comunitaria.

La información disponible es muy limitada: la model card se reduce a una declaración de cuantización y no incluye datos de arquitectura interna, contexto, idiomas, benchmarks ni instrucciones de uso específicas. Todo lo que se detalla a continuación proviene de los metadatos del repositorio y de la ficha del modelo base, y se marca explícitamente como no disponible cuando no hay dato.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; familia LFM3 de Liquid AI) |
| Parámetros totales | 1.728.801.644 (1,7B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (4 bits, coma flotante, método nvfp4); empaquetado GGUF |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face; enlace a la licencia del modelo base) |
| Formato de pesos | GGUF (cuantización NVFP4); el modelo base se distribuye en safetensors |
| Tamaño del repositorio | 1,4 GB |
| Librería declarada | transformers |
| Pipeline | no disponible |
| Fecha de creación | 2026-11-01 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en los datos proporcionados. El identificador de la familia (LFM3) y la etiqueta "liquid" sugieren la línea de Liquid Foundation Models de Liquid AI, pero no se confirma en la información disponible si emplea atención estándar, capas recurrentes de tipo líquido, arquitectura híbrida u otra variante. Tampoco consta el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u optimización similar.

Respecto a esta publicación concreta, la única innovación documentada es la cuantización NVFP4 aplicada sobre los pesos del modelo base y su empaquetado en GGUF. El autor declara un ahorro de memoria de aproximadamente el 75 % y un rendimiento "alto", sin aportar mediciones de perplejidad, evaluaciones de calidad ni comparaciones con otras cuantizaciones (Q4_K_M, Q5_K_M, etc.). No hay información sobre calibración de la cuantización, capas excluidas ni tratamiento especial de embeddings o de la cabeza de salida.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" del repositorio indica uso previsto para diálogo, aunque no se detallan capacidades específicas.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue en local con llama.cpp u Ollama: el formato GGUF permite cargar el modelo en entornos de inferencia de CPU/GPU sin necesidad de un stack de transformers completo, adecuado para prototipos y pruebas en máquinas de desarrollo.
- Experimentación con cuantización NVFP4: útil para investigadores que quieran medir la degradación de calidad de NVFP4 frente a otras cuantizaciones de 4 bits sobre un modelo de 1,7B, siempre que se validen los resultados con evaluaciones propias.
- Generación de texto conversacional en entornos con memoria limitada: el tamaño de 1,4 GB del repositorio facilita su integración en aplicaciones de chat con presupuesto de VRAM reducido, aunque la calidad debe verificarse.
- Pruebas de integración en pipelines con transformers: la librería declarada es transformers, por lo que puede servir para validar la compatibilidad del contenedor GGUF con herramientas del ecosistema.
- Evaluación comparativa de cuantizaciones: como artefacto de referencia para comparar NVFP4 con GGUF Q4 y Q5 sobre el mismo modelo base en tareas de generación y razonamiento.
- Base para fine-tuning o destilación sobre modelos pequeños: el modelo base LFM3-1.7B, no esta cuantización, sería el punto de partida adecuado si se necesita adaptar el modelo; esta versión NVFP4 no es apta para reentrenamiento directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB para los pesos en NVFP4 (4 bits sobre 1,7B de parámetros), más el overhead de contexto y del runtime; no hay mediciones publicadas.
- GPU recomendadas: no disponible. NVFP4 requiere soporte de hardware específico (generaciones recientes de GPU NVIDIA); en GPUs sin soporte nativo el formato puede degradarse a emulación o no ser utilizable.
- GPU de consumo: el tamaño reducido sugiere que podría caber en GPUs consumer con suficiente soporte de NVFP4, pero no hay confirmación del autor ni pruebas publicadas.
- Opciones de despliegue: llama.cpp y ecosistemas compatibles con GGUF (Ollama, entre otros); la librería declarada es transformers, aunque la compatibilidad real con NVFP4 GGUF en cada runtime no está documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zefie/LFM-1.3B-GGUF-NVFP4 | 1,7B | no disponible | GGUF NVFP4 | lfm1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible | safetensors | lfm1.0 | Hugging Face (modelo base) |
| Otras cuantizaciones GGUF de LFM3-1.7B | 1,7B | no disponible | GGUF (Q4, Q5, etc.) | lfm1.0 | no disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización NVFP4 a 4 bits puede introducir degradación de calidad frente a los pesos originales en safetensors; no se han publicado evaluaciones que lo cuantifiquen.
- El repositorio no registra descargas ni interacciones, por lo que no existe validación comunitaria de su funcionamiento.
- La model card es mínima y no documenta el proceso de cuantización, la calibración ni las capas tratadas.
- El nombre del repositorio ("1.3B") no coincide con el recuento real de parámetros (1,7B), lo que puede inducir a error en la planificación de recursos.
- Licencia lfm1.0: es necesario revisar los términos del modelo base antes de cualquier uso comercial; la etiqueta "other" en Hugging Face no aclara por sí sola las restricciones.
- No se especifican idiomas soportados; el rendimiento en castellano es desconocido.
- No se documenta la longitud de contexto efectiva tras la cuantización.
- El soporte de NVFP4 depende del hardware y del runtime; en entornos sin soporte nativo el modelo puede no cargar o degradarse.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zefie/LFM-1.3B-GGUF-NVFP4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
