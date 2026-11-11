# tahamajs/llava-qwen-0.5b-svd-llm-v2-attention-scienceqa

## Resumen

`llava-qwen-0.5b-svd-llm-v2-attention-scienceqa` es un checkpoint multimodal de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante la tecnica de "attention surgery" `svd_llm_v2_attention` del framework NeuralOps, desarrollado por el autor tahamajs. No se trata de un modelo entrenado desde cero, sino de un artefacto quirurgico: se sustituyen las capas de atencion de 18 de las 24 capas del decoder Qwen2 por versiones factorizadas via SVD (con buffers explicitos U, Sigma y V^H) y adaptadores LoRA entrenables para recuperar capacidad, manteniendo congelado el vision tower SigLIP y el proyector multimodal.

El modelo resuelve un problema de investigacion concreto: comprimir y modularizar las capas de atencion de un VLM pequeno (0,5B parametros) reduciendo el peso serializado a 94,82 MB (frente a 1,66 GB del base FP16, un 94,4 % menos), y evaluar cuanto rendimiento se conserva tras la cirugia y una destilacion de conocimiento en dos etapas sobre ScienceQA. Es relevante para quienes investigan compresion de modelos, atencion eficiente o tecnicas de destilacion aplicadas a VLMs, no como modelo de produccion general.

El checkpoint se publica con licencia MIT, solo soporta ingles, y su evaluacion se limita al subconjunto STEM con imagenes del split de validacion de ScienceQA. El autor declara 38,12 % de accuracy y perplejidad 3,04, partiendo de un teacher de 63,75 % de accuracy, lo que indica una perdida sustancial de capacidad pese a la recuperacion parcial via KD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decoder Qwen2 de 24 capas) con atencion SVD-factorizada (`SVDLLMV2Attention`) en 18/24 capas |
| Parametros totales | 0,5B (modelo base); el artefacto serializado contiene 498 tensores de atencion + layernorms (~99,4 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP16; formato `attention_only_fp16`) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta de atencion en FP16) + `surgical_manifest.json` |

## Arquitectura y entrenamiento

La arquitectura base es LLaVA-Interleave con Qwen2-0.5B: un vision tower SigLIP congelado de 27 capas, un proyector multimodal de 2 capas MLP y un decoder Qwen2 de 24 capas con dimension oculta D=1024, 16 cabezas de atencion y head_dim=64. La intervencion quirurgica sustituye las capas `self_attn` de 18 de las 24 capas del decoder (esquema `hybrid_3_1`) por `SVDLLMV2Attention`, que factoriza la atencion en matrices U, Sigma y V^H explicitas y anade adaptadores LoRA entrenables. Se mantienen como anclas cuadraticas 6 capas sin modificar: `[3, 7, 11, 15, 19, 23]`. Quedan congelados el vision tower, el proyector, los MLP del decoder y los embeddings.

El entrenamiento consistio en una destilacion de conocimiento en dos etapas (120 + 154 = 274 pasos) sobre ScienceQA, ejecutada en una RTX 3090 (24 GB) en 120,2 segundos con un pico de VRAM de 17.252 MB. Se parte de un teacher baseline (63,75 % accuracy, PPL 2,45) y se recupera parcialmente el rendimiento tras la cirugia: de 37,50 % accuracy / PPL 11,61 en zero-shot a 38,12 % / PPL 3,04 tras KD. La innovacion principal es el empaquetado modular: solo se serializan los tensores modificados (delta de atencion + layernorms entrenados), no el modelo completo.

## Capacidades

- Generacion de texto e image-text-to-text (pipeline `image-text-to-text`).
- Razonamiento visual sobre preguntas de ciencia con imagen (ScienceQA, subconjunto STEM con imagenes).
- Respuesta a preguntas de opcion multiple con formato de letra (segun el ejemplo de la model card).
- Conversacional: incluye `chat_template.json` para formateo de chat.
- Capacidades multilingues: limitadas al ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Thinking mode, vision avanzada o audio: no disponible (solo vision basica via SigLIP).
- Capacidad de compresion modular: el artefacto es un delta de atencion reutilizable sobre el modelo base.

## Casos de uso

- Investigacion en compresion de atencion: usar el checkpoint como referencia reproducible para medir el impacto de `svd_llm_v2_attention` sobre un VLM de 0,5B, comparando accuracy y perplejidad frente al teacher y al zero-shot.
- Destilacion de conocimiento aplicada a VLMs: el par de metricas pre-KD/post-KD permite estudiar la eficacia de KD en capas de atencion factorizadas con pocos pasos (274).
- Prototipado de VQA educativo: responder preguntas de ciencia con imagen y opcion multiple en entornos de bajo recurso, dado el tamano del artefacto (94,82 MB) y su ejecucion en una unica RTX 3090.
- Experimentos de atencion hibrida: servir como banco de pruebas para el esquema `hybrid_3_1` (18 capas factorizadas + 6 anclas cuadraticas) y evaluar trade-offs de velocidad/calidad.
- Auditoria de artefactos quirurgicos: validar el `surgical_manifest.json` (schema `neuralops.surgery/v2`, 498 tensores) en pipelines de verificacion de integridad de pesos.
- Ensenanza y demos de "attention surgery": ilustrar en un curso o taller como se sustituye una capa de atencion por su descomposicion SVD con adaptadores LoRA, usando un modelo pequeno que cabe en consumer GPU.
- Despliegue experimental en pipelines NeuralOps: integrar el checkpoint via `neuralops.hub.load_surgeried_model` para tareas de VQA controladas en ingles.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados externamente), sobre ScienceQA (Image-Bearing STEM Subset, validation):

| Metrica | Teacher baseline | Pre-KD / Zero-shot | Post-KD / Final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 37,50 | 38,12 | +0,62 |
| Perplejidad (PPL) | 2,45 | 11,61 | 3,04 | -8,57 |

Telemetria de entrenamiento declarada: 274 pasos (120 + 154), 120,2 s, pico de VRAM 17.252 MB en RTX 3090.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto serializado pesa 94,82 MB, pero requiere cargar el modelo base LLaVA-Qwen-0.5B (1,66 GB en FP16) para funcionar; en la practica el consumo total ronda varios GB incluyendo el vision tower y activaciones.
- GPU recomendadas: el autor entreno en una NVIDIA RTX 3090 (24 GB); el modelo cabe holgadamente en GPUs consumer de 8-16 GB.
- Cabe en consumer GPU: si, incluidas RTX 3060/4060 (8 GB) y superiores, dado el tamano del modelo base.
- Opciones de despliegue: la model card documenta `neuralops.hub.load_surgeried_model`; no se indica soporte oficial para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible. Solo se reporta tiempo de entrenamiento (120,2 s para 274 pasos), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ScienceQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-svd-llm-v2-attention-scienceqa` | 0,5B | no disponible | 38,12 % accuracy / PPL 3,04 | MIT | Hugging Face (0 descargas) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (teacher/base) | 0,5B | no disponible | 63,75 % accuracy / PPL 2,45 | no disponible | Hugging Face |
| Otros VLMs de ~0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros para comparar con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de rendimiento significativa: el modelo final (38,12 %) queda muy por debajo del teacher (63,75 %), con una brecha de ~25,6 puntos de accuracy.
- Evaluacion muy limitada: solo se mide en el subconjunto STEM con imagenes de ScienceQA (validacion); no hay evidencia de generalizacion a otras tareas.
- Solo ingles: no soporta castellano ni otros idiomas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo pequeno y comprimido, se espera un riesgo elevado.
- Longitud de contexto: no disponible; no se documenta la ventana efectiva del modelo base.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` tiene su propia licencia no detallada en la informacion; verificar antes de produccion.
- Dependencia del framework NeuralOps: la carga requiere `neuralops.hub`; no hay conversion documentada a GGUF ni a formatos estandar de vLLM/TGI.
- Artefacto delta: no es un modelo autonomo; necesita el base para reconstruirse.
- Sin verificacion externa: los benchmarks estan marcados como `verified: false` en el model-index.
- Cero traccion: 0 descargas y 0 likes en el momento de la consulta; sin comunidad de validacion.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-svd-llm-v2-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de la capa: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/svd_llm_v2_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
