# tahamajs/llava-qwen-0.5b-sink-attention-scienceqa

## Resumen

`llava-qwen-0.5b-sink-attention-scienceqa` es un checkpoint multimodal de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante técnicas de "cirugía de atención" implementadas en la librería NeuralOps. El autor, `tahamajs`, sustituye el mecanismo de atención estándar de 18 de las 24 capas del decodificador Qwen2 por una variante denominada `SinkAttention`, inspirada en StreamingLLM, que retiene un conjunto de tokens sumidero junto con una ventana deslizante del KV-cache. El objetivo no es tanto maximizar la precisión como demostrar un flujo reproducible de compresión y destilación de atención sobre un VLM pequeño.

El modelo combina una torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y `head_dim` 64. Tras la intervención se aplica una destilación de conocimiento en dos etapas sobre el subconjunto con imágenes de ScienceQA (validación), con 376 pasos de optimización en una única RTX 3090. El resultado es un artefacto de pesos de solo 370,62 MB (frente a 1,66 GB del modelo base en FP16), con una precisión final del 28,12 % y una perplejidad de 1,21.

Su relevancia es fundamentalmente metodológica: sirve como referencia para investigar atención con tokens sumidero, poda de KV-cache y destilación de atención en VLMs de menos de mil millones de parámetros. No es un modelo pensado para producción generalista, sino un experimento reproducible dentro del ecosistema NeuralOps (Attention Zoo), publicado bajo licencia MIT y con un tamaño de repositorio de 0,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decoder Qwen2) con `SinkAttention` en 18/24 capas |
| Parametros totales | no disponible (modelo base Qwen2-0.5B + torre SigLIP; el checkpoint solo guarda pesos de atención modificados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la ventana de atención se define por `window_size` y `num_sink_tokens`, valores no publicados) |
| Tipos de cuantizacion | FP16 en el artefacto publicado; no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `weights_format=attention_only_fp16`) |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: una torre visual SigLIP congelada de 27 capas, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con `D=1024`, `H=16` y `head_dim=64`. La intervención reemplaza la atención cuadrática por `SinkAttention` en 18 de las 24 capas (esquema `hybrid_3_1`), manteniendo seis capas ancla cuadráticas en los índices `[3, 7, 11, 15, 19, 23]`. En `SinkAttention`, la query se calcula sobre la secuencia completa de `hidden_states`, mientras que K/V se acumulan en caché y se podan conservando los primeros `num_sink_tokens` más los últimos `window_size - num_sink_tokens`, preservando las posiciones absolutas para el enmascaramiento causal. El mecanismo funciona tanto en contextos bidireccionales como causales.

El entrenamiento consistió en una destilación de conocimiento en dos etapas (179 y 197 pasos, respectivamente, 376 en total) sobre el subconjunto con imágenes de ScienceQA en validación, ejecutada en una RTX 3090 de 24 GB con un pico de VRAM de 11.903 MB y una duración total de 120,1 s. Se entrenaron las atenciones modificadas y las `layernorm` del decodificador; permanecieron congelados la torre visual, el proyector, las seis capas ancla, los MLP y los embeddings. El manifiesto `surgical_manifest.json` (`schema_version=neuralops.surgery/v2`) registra 714 tensores guardados. No se documentan detalles sobre el dataset de destilación más allá de ScienceQA ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto e imagen-texto en inglés, con foco en razonamiento visual sobre material STEM.
- Respuesta a preguntas visuales (VQA) sobre diagramas e imágenes científicas de ScienceQA.
- Conversación multimodal multi-turno (pipeline `image-text-to-text`, plantilla de chat incluida).
- Atención con ventana deslizante y tokens sumidero, orientada a contextos largos con KV-cache acotada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documentan capacidades de audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación en eficiencia de atención: el checkpoint permite reproducir el flujo de sustitución de atención cuadrática por `SinkAttention` en un VLM pequeño y comparar precisión y perplejidad frente al profesor, útil para estudiar el compromiso entre compresión y calidad.
- Experimentos de poda de KV-cache: sirve como banco de pruebas para evaluar políticas de retención de tokens sumidero y ventana deslizante en modelos multimodales con recursos limitados.
- Destilación de atención en VLMs: el par de métricas (precisión 28,12 %, PPL 1,21) y la telemetría de entrenamiento permiten analizar cómo la KD recupera perplejidad a costa de precisión.
- Docencia y prototipado de cirugía de modelos: al ocupar 370,62 MB en disco y caber en una RTX 3090, es adecuado para talleres donde se enseña a modificar capas de atención y serializar deltas.
- Evaluación comparativa en ScienceQA: útil como línea base de un VLM de 0,5B con atención modificada frente a variantes del Attention Zoo.
- Pruebas de integración con la API `neuralops.hub`: permite validar el cargador `load_surgeried_model` y el formato `surgical_manifest.json` en pipelines internos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (Image-Bearing STEM, validation) | 63,75 | 30,00 | 28,12 | -1,88 |
| Perplejidad (PPL) | 2,45 | 4,57 | 1,21 | -3,36 |

Telemetría de entrenamiento: 376 pasos (179 en etapa 1, 197 en etapa 2), 120,1 s, pico de VRAM 11.903 MB en RTX 3090 (24 GB).

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto de pesos ocupa 370,62 MB en FP16, por lo que la inferencia cabe holgadamente en GPUs de 8 GB o menos; el modelo base completo en FP16 ocupa 1,66 GB.
- GPU recomendadas: RTX 3090 (usada en el entrenamiento), RTX 4090, A100 o H100 para mayor throughput; cualquier GPU con al menos 8 GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores con 8 GB o más.
- Opciones de despliegue: la model card documenta la API `neuralops.hub.load_surgeried_model`; no se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, STEM con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-sink-attention-scienceqa` | ~0,5B (Qwen2) + SigLIP | no disponible | 28,12 % acc / 1,21 PPL | MIT | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B + SigLIP | no disponible | 63,75 % acc / 2,45 PPL (según el autor) | no disponible en la información | Hugging Face |
| Otros VLMs de ~0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Precisión baja: 28,12 % en ScienceQA (STEM con imagen), muy por debajo del 63,75 % del profesor; no es apto para tareas de razonamiento visual en producción.
- La destilación mejora la perplejidad (1,21 frente a 4,57 pre-KD) pero degrada la precisión (-1,88 puntos), lo que sugiere sobreajuste al conjunto de validación.
- Solo soporta inglés; no se documentan otros idiomas.
- Riesgo de alucinación elevado dado el tamaño reducido y la intervención agresiva en la atención.
- La ventana de contexto efectiva depende de `window_size` y `num_sink_tokens`, valores no publicados; el comportamiento en secuencias largas no está caracterizado.
- El checkpoint solo contiene pesos de atención modificados (`attention_only_fp16`); requiere el modelo base y la librería NeuralOps para cargarse correctamente.
- Licencia MIT: permite uso comercial, pero el modelo base puede tener condiciones adicionales no detalladas en la información disponible.
- No hay resultados de benchmarks verificados (`verified: false` en model-index); los números provienen del propio autor.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-sink-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Implementación de `SinkAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/sink_attention.py
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
