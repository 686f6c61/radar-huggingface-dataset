# tahamajs/llava-qwen-0.5b-hybrid-local-kernel-scienceqa

## Resumen

`llava-qwen-0.5b-hybrid-local-kernel-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps, un marco de trabajo centrado en la cirugía de mecanismos de atención en modelos multimodales. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` y sustituye el mecanismo de atención cuadrática de 18 de sus 24 capas del decodificador por un operador híbrido denominado `HybridLocalKernelAttention`, manteniendo seis capas ancla con atención cuadrática estándar.

No se trata de un modelo de propósito general, sino de un artefacto de investigación que empaqueta únicamente los pesos delta modificados (62,84 MB en safetensors FP16) junto con el manifiesto de topología quirúrgica. Se evalúa en el subconjunto con imagen de ScienceQA (validación) mediante destilación de conocimiento desde el modelo profesor original.

Su relevancia es acotada pero técnica: documenta de forma reproducible el impacto de reemplazar atención cuadrática por kernels locales híbridos en un VLM pequeño, con telemetría completa de entrenamiento (88 pasos, 121,3 s, 17.124 MB de VRAM pico en una RTX 3090). El resultado empírico es un empate exacto con el checkpoint pre-destilación (31,25 % de accuracy), lo que sugiere que la destilación no aportó mejora medible en este régimen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas); atención híbrida `HybridLocalKernelAttention` en 18/24 capas |
| Parametros totales | 0,5 B (modelo base); el artefacto publicado contiene solo pesos delta de atención (~62,84 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16) + manifiesto JSON; requiere `neuralops` para carga |
| Dimension del decodificador | D=1024, H=16 cabezas, head_dim=64 |
| Capas modificadas | 18/24 (esquema `hybrid_3_1`); anclas cuadráticas en `[3, 7, 11, 15, 19, 23]` |
| Componentes congelados | `vision_tower.*` (27 capas SigLIP), `multi_modal_projector.*`, MLPs y embeddings del decodificador |

## Arquitectura y entrenamiento

La arquitectura base es LLaVA-Interleave con un decodificador Qwen2 de 0,5 B. La intervención quirúrgica reemplaza el módulo `self_attn` en 18 de las 24 capas del decodificador por `HybridLocalKernelAttention`, un operador de la familia `hybrid` implementado en `neuralops/layers/hybrid/hybrid_local_kernel_attention.py`. Se conservan seis capas con atención cuadrática completa como anclas (índices 3, 7, 11, 15, 19 y 23), presumiblemente para preservar capacidad de mezcla global de información. La torre visual SigLIP, el proyector multimodal, los MLPs y los embeddings permanecen congelados; solo se entrenan las atenciones sustituidas y los layernorms del decodificador.

El entrenamiento se realizó en dos etapas (29 + 59 pasos, 88 en total) sobre una NVIDIA RTX 3090 de 24 GB, con un pico de 17.124 MB de VRAM y una duración total de 121,3 segundos. Se aplicó destilación de conocimiento desde el modelo profesor `llava-hf/llava-interleave-qwen-0.5b-hf`, cuyo baseline se reporta en 63,75 % de accuracy y perplejidad 2,45. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset más allá de ScienceQA, ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto e imagen-a-texto conversacional (`image-text-to-text`) sobre pares imagen-pregunta.
- Respuesta a preguntas visuales de tipo STEM con selección de opción (formato ScienceQA).
- Razonamiento multimodal básico limitado a la tarea de elección múltiple sobre figuras.
- Soporte de plantilla de chat (`chat_template.json` incluido).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: únicamente inglés (`en`).
- No se documentan modos especiales (thinking, audio, vídeo).

## Casos de uso

- Investigación en eficiencia de atención: comparar el rendimiento de `HybridLocalKernelAttention` frente a atención cuadrática en un VLM de 0,5 B usando ScienceQA como banco de pruebas controlado.
- Reproducción de experimentos de cirugía de atención: el manifiesto `surgical_manifest.json` permite reconstruir la topología exacta de capas modificadas y verificar resultados de ablación.
- Estudio de destilación de conocimiento en modelos pequeños: el delta nulo (31,25 % → 31,25 %) es un dato útil para analizar cuándo la KD no aporta mejora en arquitecturas ya degradadas por la sustitución del operador.
- Benchmarking de kernels híbridos: servir como referencia cuantitativa (accuracy, PPL, VRAM pico, tiempo de entrenamiento) para comparar futuros operadores de la familia `hybrid` del zoo NeuralOps.
- Docencia y formación: ejemplo didáctico de cómo se sustituye un módulo de atención en un transformer multimodal y se empaqueta el delta de pesos de forma reproducible.
- Validación de pipelines de carga con `neuralops.hub.load_surgeried_model`: probar la API pública del hub con un checkpoint real y pequeño (78 MB totales) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Modelo / checkpoint | Dataset | Métrica | Valor |
|---|---|---|---|
| Profesor (`llava-interleave-qwen-0.5b-hf`) | ScienceQA (Image-Bearing STEM Subset, validation) | Accuracy (%) | 63,75 |
| Pre-KD / zero-shot (híbrido) | ScienceQA (Image-Bearing STEM Subset, validation) | Accuracy (%) | 31,25 |
| Post-KD / final (híbrido) | ScienceQA (Image-Bearing STEM Subset, validation) | Accuracy (%) | 31,25 |
| Profesor | — | Perplejidad | 2,45 |

Delta de la destilación: +0,00 %. La sustitución de atención cuadrática por `hybrid_local_kernel` en 18/24 capas reduce la accuracy a la mitad respecto al profesor, y la KD en dos etapas no recupera capacidad en este régimen.

## Requisitos de hardware

- VRAM de inferencia: no disponible de forma explícita; el modelo base de 0,5 B en FP16 ocupa aproximadamente 1,66 GB según el propio autor, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU de entrenamiento documentada: NVIDIA GeForce RTX 3090 (24 GB), con pico de 17.124 MB.
- Cabe en GPUs de consumo: sí, cualquier GPU con ≥4 GB de VRAM debería manejar el modelo base en FP16; el delta publicado (62,84 MB) es mínimo.
- Opciones de despliegue: la carga requiere la librería `neuralops` (`load_surgeried_model`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El tiempo de entrenamiento (121,3 s para 88 pasos) no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-hybrid-local-kernel-scienceqa` | 0,5 B (delta de atención) | no disponible | 31,25 % | MIT | Hugging Face (neuralops) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5 B | no disponible | 63,75 % | no disponible en la información | Hugging Face (transformers) |
| Otros checkpoints del zoo NeuralOps | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Degradación severa de rendimiento: la accuracy cae del 63,75 % al 31,25 % respecto al profesor, una pérdida de 32,5 puntos porcentuales.
- La destilación de conocimiento no aporta mejora medible (delta 0,00 %), lo que cuestiona la utilidad del checkpoint para tareas reales.
- El artefacto publicado contiene solo pesos delta de atención; no es un modelo autónomo y requiere el modelo base y la librería `neuralops` para funcionar.
- Idioma limitado a inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación no cuantificado, pero esperable en un VLM de 0,5 B con atención degradada.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia MIT permite uso comercial, pero el estado experimental y el bajo rendimiento desaconsejan producción.
- Sin datos de benchmarks más allá de ScienceQA; no se ha evaluado en MMLU, HumanEval, GSM8K ni tareas generales.
- Fecha de creación declarada (2026-11-11) y telemetría con timestamp futuro; verificar la procedencia antes de confiar en los resultados.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-hybrid-local-kernel-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/hybrid_local_kernel_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
