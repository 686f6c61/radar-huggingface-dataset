# taharmasmaliyev07/Qwen3.5-35B-ASR-E2-BF16

## Resumen

Qwen3.5-35B-ASR-E2-BF16 es un ajuste fino (finetune) publicado por el usuario taharmasmaliyev07 sobre la arquitectura Qwen3.5 MoE, según indican los tags del repositorio (`qwen3_5_moe`). El modelo cuenta con 35.951.822.704 parámetros totales en formato safetensors BF16 y está orientado a tareas de imagen-a-texto y generación de texto conversacional, de ahí su pipeline `image-text-to-text`. La model card es extremadamente escueta y no documenta el proceso de entrenamiento, los datos utilizados ni los resultados obtenidos.

El nombre del repositorio sugiere un ajuste orientado a reconocimiento automático del habla (ASR), aunque el pipeline declarado es multimodal (imagen-texto), lo que genera cierta ambigüedad sobre la tarea real para la que fue entrenado. El modelo emplea la etiqueta `unsloth`, lo que indica que el entrenamiento se realizó con la librería Unsloth y TRL de Hugging Face, y la licencia es Apache 2.0.

Su relevancia es limitada en el momento de redacción: cuenta con 0 descargas y 0 likes, fue creado y actualizado el mismo día (23 de noviembre de 2026) y no incluye documentación técnica, benchmarks ni detalles del dataset. Debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (mixture of experts), segun tag `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (~35,95 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3.5 MoE, una variante de mezcla de expertos de la familia Qwen 3.5, según el tag `qwen3_5_moe` del repositorio. El modelo tiene 35.951.822.704 parámetros totales en BF16 y un tamaño de repositorio de 72 GB. No se dispone de información sobre el número de parámetros activos por token, la dimensión oculta, el número de capas ni la configuración de los expertos.

El entrenamiento se realizó mediante ajuste fino con Unsloth y la librería TRL de Hugging Face, según declara el autor. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF, DPO o SFT, ni la naturaleza exacta de la tarea de ajuste (el nombre "ASR" sugiere reconocimiento de voz, pero el pipeline declarado es imagen-texto). El modelo base declarado es el propio repositorio (`taharmasmaliyev07/Qwen3.5-35B-ASR-E2-BF16`), lo que indica una referencia circular sin información sobre el checkpoint original de Qwen.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`).
- Compatibilidad con Transformers y con endpoints de Hugging Face (`endpoints_compatible`).
- Compatibilidad declarada con text-generation-inference (TGI).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (thinking mode, audio, etc.): no disponible en la información.

## Casos de uso

- Descripción automática de imágenes en inglés: el pipeline `image-text-to-text` permite generar descripciones textuales a partir de imágenes, adecuado para catalogación de contenido visual en inglés.
- Asistentes conversacionales en inglés: el tag `conversational` y la compatibilidad con TGI lo hacen desplegable como backend de chat, aunque sin documentación sobre contexto máximo no puede garantizarse el manejo de conversaciones largas.
- Experimentación e investigación sobre arquitecturas MoE: al ser un finetune de Qwen3.5 MoE con 35,95 mil millones de parámetros, sirve como base para estudiar el comportamiento de modelos MoE ajustados con Unsloth.
- Prototipado de pipelines multimodales con Transformers: la integración nativa con la librería `transformers` permite cargarlo en scripts de inferencia estándar para pruebas de concepto.
- Evaluación comparativa de finetunes comunitarios: útil para medir el impacto de ajustes con Unsloth frente al modelo base, siempre que se disponga del checkpoint original para comparar.
- Despliegue en endpoints de Hugging Face: la etiqueta `endpoints_compatible` permite probar el modelo como servicio gestionado sin infraestructura propia, útil para demos internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 72 GB solo para los pesos (35,95 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: alrededor de 36 GB para pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: alrededor de 18-20 GB para pesos, más overhead (no se han publicado versiones GGUF ni cuantizadas oficiales).
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB con sharding).
- GPU de consumo: no cabe en una única RTX 4090 (24 GB) en BF16; podría caber en cuantización de 4 bits si se generan pesos cuantizados, aunque no se ofrecen en el repositorio.
- Opciones de despliegue: Transformers, text-generation-inference (TGI) y endpoints de Hugging Face. No se ha confirmado compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible en la información.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-35B-ASR-E2-BF16 (este) | 35,95 mil millones | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3-30B-A3B | ~30 mil millones (MoE) | 32k-128k segun variante | Apache 2.0 | Ampliamente disponible |
| Mixtral 8x7B | 46,7 mil millones (MoE) | 32k | Apache 2.0 | Ampliamente disponible |
| Qwen2.5-32B | 32,5 mil millones (denso) | 128k | Apache 2.0 | Ampliamente disponible |

La comparativa se limita a parámetros y licencia, ya que no hay datos de rendimiento publicados para este finetune. Los modelos alternativos citados cuentan con documentación técnica completa, benchmarks publicados y comunidades activas, a diferencia de este repositorio.

## Limitaciones y advertencias

- Model card prácticamente vacía: sin información sobre dataset, hiperparámetros, evaluación ni tarea exacta de ajuste.
- Ambigüedad de propósito: el nombre sugiere ASR (reconocimiento de voz) pero el pipeline declarado es imagen-texto; no está claro qué tarea resuelve realmente.
- Referencia circular al modelo base: el campo `base_model` apunta al propio repositorio, sin identificar el checkpoint original de Qwen.
- Idiomas: solo se declara inglés, sin soporte documentado de castellano ni otras lenguas.
- Riesgo de alucinación: no cuantificado ni evaluado por el autor.
- Sesgos: no documentados; al ser un finetune comunitario sin evaluación, los sesgos del modelo base y del dataset de ajuste son desconocidos.
- Contexto máximo desconocido: no puede garantizarse el manejo de conversaciones o documentos largos.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones de 4/8 bits, lo que dificulta el despliegue en hardware de consumo.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación traslada todo el riesgo de evaluación al usuario.
- Cero descargas y cero likes: sin validación comunitaria ni evidencia de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/taharmasmaliyev07/Qwen3.5-35B-ASR-E2-BF16
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Repositorio de Qwen (familia de modelos base): https://github.com/QwenLM/Qwen3
