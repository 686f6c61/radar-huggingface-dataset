# tahamajs/llava-qwen-0.5b-triton-cosformer-scienceqa

## Resumen

`llava-qwen-0.5b-triton-cosformer-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps. No es un modelo entrenado desde cero, sino el resultado de una intervención quirúrgica sobre el VLM `llava-hf/llava-interleave-qwen-0.5b-hf`: se sustituye la atención cuadrática estándar de 18 de las 24 capas del decodificador Qwen2 por una atención lineal implementada en Triton (`TritonCosformerAttention`, familia `cosformer`), manteniendo 6 capas ancla cuadráticas en los índices 3, 7, 11, 15, 19 y 23 (esquema `hybrid_3_1`). El objetivo es demostrar que es posible reducir drásticamente el coste de atención sin destruir el rendimiento, mediante una segunda fase de destilación de conocimiento.

El modelo conserva intactos el torreón de visión SigLIP congelado (27 capas), el proyector MLP de dos capas y los MLPs y embeddings del decodificador. Solo se guardan los pesos modificados de atención y los layernorms del decodificador, lo que reduce el artefacto a 144,22 MB frente a los 1,66 GB del modelo base en FP16 (un 91,5 % menos, 11,8 veces más pequeño).

Es relevante como prueba de concepto de "cirugía de atención" y destilación sobre VLMs pequeños: entrena en una sola RTX 3090 en 120 segundos y publica resultados verificables en ScienceQA. No obstante, el propio autor marca las métricas como no verificadas y el modelo está pensado para investigación, no para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decodificador Qwen2) con atención lineal Triton Cosformer en 18/24 capas y 6 capas cuadráticas ancla (`hybrid_3_1`) |
| Parámetros totales | No disponible (el modelo base LLaVA-Qwen-0.5B ronda los 0,5B; el checkpoint solo guarda 174 tensores de atención y layernorms) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible (los pesos se distribuyen en FP16 safetensors; el modelo base admite las cuantizaciones estándar de Hugging Face, pero no se documentan aquí) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, solo atención y layernorms del decodificador) + `surgical_manifest.json` (`schema_version=neuralops.surgery/v2`) |

## Arquitectura y entrenamiento

El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, compuesto por un torreón de visión SigLIP congelado de 27 capas, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta D=1024, 16 cabezas de atención y `head_dim=64`. La intervención sustituye la self-attention de 18 capas por `TritonCosformerAttention`, una atención lineal acelerada con Triton que soporta autograd completo, RoPE y atención enmascarada. Las 6 capas restantes (índices 3, 7, 11, 15, 19, 23) conservan atención cuadrática como anclas para preservar capacidad expresiva. El torreón de visión, el proyector, los MLPs y los embeddings permanecen congelados y no se serializan en el checkpoint.

El entrenamiento se realizó en dos etapas de destilación de conocimiento sobre el subconjunto de ScienceQA con imágenes (split de validación): 76 pasos en la etapa 1 y 157 en la etapa 2, 233 pasos totales en 120,3 segundos sobre una NVIDIA GeForce RTX 3090 (24 GB), con un pico de VRAM de 12.465 MB. El resultado es un artefacto de 144,22 MB (151.226.208 bytes) con 174 tensores guardados. No se documentan el número de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`) para preguntas de razonamiento visual.
- Respuesta a preguntas de opción múltiple sobre figuras STEM (el caso evaluado es ScienceQA con imágenes).
- Razonamiento multimodal básico: combina la representación visual de SigLIP con el decodificador Qwen2.
- Conversación multi-turno mediante plantilla de chat (`chat_template.json` incluido).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo está orientado a VQA de un solo turno.
- Capacidades multilingües: solo inglés declarado.
- Modo "thinking", visión adicional, audio: no disponible.
- Capacidad especial: atención lineal Triton Cosformer con RoPE y atención enmascarada, cargable mediante `neuralops.hub.load_surgeried_model`.

## Casos de uso

- Investigación en eficiencia de atención: sirve como banco de pruebas reproducible para medir el impacto de sustituir atención cuadrática por atención lineal en un VLM pequeño, con métricas de precisión y perplejidad antes y después de la destilación.
- Destilación de conocimiento sobre VLMs: el pipeline de dos etapas (pre-KD y post-KD) y las telemetrías publicadas permiten replicar el experimento en otras capas o proporciones híbridas.
- Evaluación de ScienceQA con imágenes: útil para comparar variantes de atención sobre el subconjunto STEM con figuras, usando el split de validación como referencia.
- Prototipado de asistentes educativos STEM: el modelo puede responder preguntas de opción múltiple sobre diagramas científicos, aunque con una precisión del 42,5 % que limita su uso a demos.
- Pruebas de integración de NeuralOps: el checkpoint valida la API `load_surgeried_model` y el formato de manifiesto `neuralops.surgery/v2` para cargar pesos quirúrgicos modulares.
- Estudio de compresión de artefactos: con 144,22 MB frente a 1,66 GB del base, es útil para analizar el trade-off entre tamaño en disco y calidad en entornos con almacenamiento limitado.
- Docencia y divulgación: ejemplo didáctico de cómo se modifica un transformer multimodal capa a capa y cómo se mide el efecto con perplejidad y precisión.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Métrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Precisión (%) en ScienceQA (subconjunto STEM con imágenes, validación) | 63,75 | 39,38 | 42,50 | +3,12 |
| Perplejidad (PPL) | 2,45 | 238,57 | 3,17 | -235,40 |

Telemetría de entrenamiento: 233 pasos (76 etapa 1, 157 etapa 2), 120,3 s, RTX 3090, pico de VRAM 12.465 MB.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El entrenamiento consumió 12.465 MB en una RTX 3090; la inferencia con el modelo base de 0,5B en FP16 debería caber holgadamente en GPUs consumer de 8 GB o más, pero no se documenta una cifra concreta.
- GPU recomendadas: NVIDIA RTX 3090 (validada para entrenamiento); para inferencia, cualquier GPU con al menos 8 GB de VRAM es plausible, aunque no está confirmado.
- Cabe en GPU consumer: sí, según el perfil de entrenamiento (RTX 3090, 24 GB); no se confirma para GPUs de gama baja.
- Opciones de despliegue: `neuralops.hub.load_surgeried_model` (API pública de NeuralOps). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión ScienceQA (val, con imágenes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-triton-cosformer-scienceqa` | ~0,5B (base) | No disponible | 42,50 % (no verificado) | MIT | Hugging Face (0 descargas) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (teacher) | ~0,5B | No disponible | 63,75 % (baseline del autor) | No disponible en la información | Hugging Face |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Métricas no verificadas: el `model-index` marca `verified: false`; los resultados los declara el autor sin validación independiente.
- Pérdida de calidad frente al teacher: 42,50 % frente a 63,75 % de precisión en ScienceQA, una caída de más de 21 puntos.
- Perplejidad aún superior al baseline: 3,17 frente a 2,45 del teacher, lo que indica calibración imperfecta tras la destilación.
- Solo inglés: no se declaran capacidades multilingües.
- Solo se distribuyen pesos de atención y layernorms: requiere el modelo base y la librería NeuralOps para reconstruir el modelo completo; no es un checkpoint autónomo.
- Sin datos de sesgos, alucinación o robustez fuera de ScienceQA; no se ha evaluado en dominios generales.
- Contexto máximo no documentado: no se puede planificar su uso en conversaciones largas sin verificación empírica.
- Licencia MIT: permite uso comercial, pero al derivar de `llava-hf/llava-interleave-qwen-0.5b-hf` conviene revisar la licencia del modelo base y del dataset ScienceQA.
- Cero descargas y cero likes en el momento de la ficha: sin comunidad ni soporte.
- Uso recomendado: investigación y experimentación, no producción.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-triton-cosformer-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación `TritonCosformerAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/triton_cosformer.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
