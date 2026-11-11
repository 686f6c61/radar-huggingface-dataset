# tahamajs/llava-qwen-0.5b-primal-attention-scienceqa

## Resumen

`llava-qwen-0.5b-primal-attention-scienceqa` es un checkpoint multimodal de tipo visión-lenguaje publicado por el usuario tahamajs dentro del ecosistema NeuralOps, un framework experimental de "cirugía de atención" (attention surgery) que sustituye mecanismos de self-attention cuadrática por operadores lineales alternativos. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (torre visual SigLIP congelada, proyector MLP de 2 capas y decodificador Qwen2 de 24 capas con dimensión 1024) y reemplaza la atención en 18 de sus 24 capas por el operador `PrimalAttention`, basado en SVD asimétrica de kernel en representación primal.

El problema que aborda es doble: por un lado, explorar la viabilidad de operadores de atención lineales en modelos visión-lenguaje pequeños; por otro, demostrar un flujo de destilación de conocimiento que recupera el rendimiento del modelo original tras la sustitución quirúrgica. Según la model card, el checkpoint pasa de un 32,50 % de accuracy zero-shot tras la cirugía a un 64,38 % tras la destilación, superando ligeramente el 63,75 % del profesor en el subconjunto con imagen de ScienceQA (validación).

Es relevante ahora como artefacto de investigación reproducible: el autor documenta telemetría completa de entrenamiento (294 pasos, 120,4 s, 15.796 MB de VRAM pico en una RTX 3090) y un manifiesto quirúrgico verificable. No obstante, se trata de un modelo de 0,5B parámetros orientado a evaluación académica, no a producción general, y su licencia MIT y su naturaleza de delta quirúrgico condicionan su uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre visual SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); atención sustituida por `PrimalAttention` (familia lineal) en 18/24 capas |
| Parámetros totales | No disponible (modelo base de 0,5B; el artefacto serializado contiene 498 tensores de atención y layernorms) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en FP16; `weights_format=attention_only_fp16`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (delta quirúrgico de atención, FP16), más `surgical_manifest.json`, `config.json` y tokenizer BPE |

## Arquitectura y entrenamiento

El modelo es un VLM LLaVA-interleaved estándar en su esqueleto: torre SigLIP congelada que extrae parches visuales, proyector MLP que los alinea al espacio del decodificador, y un transformer Qwen2 de 24 capas como lenguaje. La intervención quirúrgica reemplaza la self-attention cuadrática por `PrimalAttention` en 18 de las 24 capas (esquema `hybrid_3_1`), manteniendo seis capas "ancla" cuadráticas en los índices `[3, 7, 11, 15, 19, 23]` para preservar capacidad expresiva. Quedan congelados la torre visual, el proyector, los MLP del decodificador y los embeddings; solo se entrenan y serializan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento se realizó mediante destilación de conocimiento offline con la arquitectura de caché de representaciones de NeuralOps, sobre una única NVIDIA GeForce RTX 3090 de 24 GB y sin VRAM de profesor en GPU (0 MB). Fueron 294 pasos de optimización en dos etapas (130 + 164), con una duración total de 120,4 s y un pico de 15.796 MB de VRAM. El dataset de evaluación y entrenamiento es `derek-thomas/ScienceQA`, en su subconjunto con imagen de validación. El artefacto final ocupa 259,12 MB (271.703.152 bytes) frente a los 1,66 GB del base FP16, lo que supone un 84,8 % de reducción (6,57× más pequeño).

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en inglés.
- Respuesta a preguntas visuales de tipo STEM (ciencia, matemáticas básicas, geografía con figuras) sobre el formato ScienceQA.
- Razonamiento multimodal de un solo turno con imagen y pregunta; el formato de chat está definido en `chat_template.json`.
- Conversación multi-turno básica heredada del pipeline LLaVA-interleaved del modelo base.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni vídeo.
- Capacidades multilingües limitadas al inglés (único idioma declarado).
- No se documentan capacidades de código ni matemáticas simbólicas más allá del dominio ScienceQA.

## Casos de uso

- Investigación en eficiencia de atención: servir como punto de comparación reproducible entre `PrimalAttention` y atención cuadrática en un VLM de 0,5B, con métricas de accuracy y perplejidad ya publicadas sobre ScienceQA.
- Destilación de operadores lineales: usar el par (base LLaVA-Qwen-0.5B, este checkpoint) para estudiar curvas de recuperación tras cirugía de atención en entornos con una sola GPU de 24 GB.
- Evaluación académica de VLM pequeños en tareas STEM: el modelo está calibrado sobre ScienceQA, por lo que es adecuado para replicar experimentos de razonamiento visual en ese benchmark concreto.
- Prototipado de asistentes educativos con imagen: dado su tamaño reducido (artefacto de 259 MB), puede desplegarse en entornos de laboratorio para responder preguntas sobre diagramas científicos simples.
- Auditoría de artefactos quirúrgicos: el `surgical_manifest.json` y `training_metrics.json` permiten verificar la topología de pesos modificados, útil en pipelines de validación de checkpoints.
- Docencia y demostraciones: su reducido peso y su licencia MIT lo hacen adecuado para talleres sobre cirugía de atención y destilación con hardware consumer.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre ScienceQA, subconjunto con imagen STEM, split de validación:

| Métrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 32,50 | 64,38 | +31,88 |
| Perplejidad (PPL) | 2,45 | 5,12 | 2,30 | -2,82 |

Telemetría de entrenamiento declarada: 294 pasos (130 en etapa 1, 164 en etapa 2), 120,4 s de duración, 15.796 MB de VRAM pico en RTX 3090, timestamp 2026-11-11T08:50:11Z. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El artefacto quirúrgico pesa 259,12 MB en FP16; el modelo base completo ocupa 1,66 GB, por lo que la inferencia requiere cargar el base más el delta.
- Entrenamiento validado en una NVIDIA GeForce RTX 3090 (24 GB) con 15.796 MB de VRAM pico; cabe en GPUs consumer de gama alta (RTX 3090, 4090, 4080) y en GPUs de datacenter (A100, H100) con holgura.
- Para inferencia en FP16 se estima un consumo de VRAM en el rango de 2-4 GB incluyendo activaciones, aunque no se proporciona una cifra oficial.
- Despliegue: la librería declarada es `neuralops` con la API `neuralops.hub.load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- No se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-primal-attention-scienceqa` | ~0,5B (base) | No disponible | 64,38 % accuracy / 2,30 PPL | MIT | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (base) | ~0,5B | No disponible | 63,75 % accuracy / 2,45 PPL (profesor) | No disponible en la información | Hugging Face |
| Otros VLM pequeños de la familia LLaVA-Qwen | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita al par base/cirugía porque la información proporcionada no incluye datos de otros modelos comparables.

## Limitaciones y advertencias

- Modelo de investigación: el checkpoint es un delta quirúrgico de atención, no un modelo autónomo; requiere cargar el base `llava-hf/llava-interleave-qwen-0.5b-hf` junto con el artefacto.
- Solo inglés: no se declara soporte multilingüe.
- Dominio estrecho: entrenado y evaluado únicamente sobre ScienceQA (subconjunto con imagen); el rendimiento fuera de ese benchmark no está caracterizado.
- Riesgo de alucinación no evaluado: no se publican métricas de fidelidad, calibración ni tasas de error fuera de ScienceQA.
- Sesgos no documentados: no hay análisis de sesgos demográficos, culturales o de género.
- Métricas no verificadas: los resultados de accuracy y perplejidad están marcados como `verified: false` en el model-index.
- Licencia MIT: permite uso comercial, pero el modelo base puede tener condiciones adicionales no detalladas en la información disponible; conviene revisar la licencia del base antes de producción.
- Dependencia de la librería `neuralops`: el formato de pesos y la API de carga son específicos de ese framework, lo que puede dificultar la integración con stacks estándar (transformers, vLLM).
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-primal-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `PrimalAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/primal_attention.py
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
