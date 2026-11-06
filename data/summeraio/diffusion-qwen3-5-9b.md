# summerAIO/Diffusion-Qwen3.5-9B

## Resumen

Diffusion-Qwen3.5-9B es un checkpoint de investigación publicado por el usuario summerAIO (bajo la serie "summerMC Diffusion") que convierte el modelo autorregresivo Qwen/Qwen3.5-9B en un modelo de lenguaje de difusión enmascarada (masked diffusion LM) al estilo LLaDA / Dream. En lugar de generar token a token de izquierda a derecha, el modelo produce texto mediante desemascarado paralelo iterativo: parte de una secuencia llena de tokens `[MASK]` y va comprometiendo posiciones según un umbral de confianza. Además, fusiona `facebook/bart-base` como módulo de refinamiento guiado por atención cruzada con puerta inicializada a cero.

El modelo tiene 8.953.803.264 parámetros (~9B) en bf16, con pesos en safetensors y un repositorio de 18,1 GB. No es un MoE: es un transformer denso heredado de Qwen3.5 con capas de atención completa (máscara causal eliminada, bidireccional) y capas Gated DeltaNet adaptadas con un escaneo inverso adicional. La longitud de contexto no está especificada en la información disponible.

Es relevante ahora porque explora una alternativa no autorregresiva a la generación de texto sobre una base Qwen moderna, con código de parcheo (`dqwen`), kernels Triton para acelerar el forward bidireccional y un sampler con refinamiento BART. Aun así, el propio autor lo etiqueta como experimental, sin benchmarks y no apto para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5 (atención completa bidireccional + capas Gated DeltaNet con escaneo inverso), convertido a masked diffusion LM; fusión con BART-base |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos publicados); 4-bit NF4 usado solo durante el entrenamiento QLoRA; el autor menciona carga en 4-bit como opción |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, 4 shards), más `fusion.pt` (BART fusion) y `dqwen_rev_gates.safetensors` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y aplica un parche bidireccional: en las capas de atención completa se elimina la máscara causal, y en las capas Gated DeltaNet se añade un escaneo en dirección inversa combinado con el directo mediante `out = orig(h) + g ⊙ flip(orig(flip(h)))`, con una `rev_gate` por canal inicializada a cero. El token `[MASK]` es `<|fim_pad|>` con embedding aprendido. La pérdida es entropía cruzada sobre tokens enmascarados con ponderación 1/t y predicción desplazada (posición j desde el hidden j−1) para mantener alineado el `lm_head` autorregresivo original.

La decodificación es por bloques con remasking y compromiso de tokens según un umbral de confianza (`thr`), seguida de un refinamiento guiado por BART: `facebook/bart-base` en FP32 congelado codifica el borrador y un módulo de atención cruzada con puerta cero inyecta esa información en los embeddings de respuesta para una pasada de refinamiento sobre el 30% de tokens de menor confianza. El entrenamiento fue muy ligero: LoRA r=8, alpha=16 con QLoRA 4-bit NF4 y cómputo bf16, sobre 256 muestras de HuggingFaceTB/smoltalk (`all`), longitud de secuencia 256 (prompt ≤ 128), en dos etapas de 10 pasos cada una (etapa 1: LoRA, gates y mask embedding; etapa 2: solo fusión). Los pesos LoRA se fusionan en bf16. El repositorio incluye kernels Triton (`dqwen/accel.py`, `dqwen/triton_kernels.py`) que fusionan proyecciones, convoluciones y escaneos, capturan el forward como CUDA graph y evitan materializar logits fp32 sobre el vocabulario de 248k tokens.

## Capacidades

- Generación de texto no autorregresiva mediante desemascarado paralelo iterativo por bloques.
- Streaming de generación con `stream()`, exponiendo tokens comprometidos y tokens aún no decididos (`dlm.mask_id`).
- Refinamiento automático con BART cuando `fusion.pt` está presente; `return_draft=True` devuelve borrador y resultado final.
- Control de calidad/velocidad mediante el umbral de confianza `thr` en cada paso.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a en y ja según la model card.
- Modo thinking, visión o audio: no disponible.
- Aceleración Triton con validación interna (`dlm._dqwen_fast_report`, `accel.report`) y fallback automático a PyTorch en entrenamiento, máscaras de padding, fusión BART, batch > 1, 4-bit o GPUs pre-Ampere.

## Casos de uso

- Investigación en modelos de difusión para texto: sirve como banco de pruebas para comparar decodificación por desemascarado frente a generación autorregresiva sobre una base Qwen3.5, usando `thr` para trazar la curva calidad/velocidad.
- Experimentos de generación paralela y streaming: el sampler por bloques con `stream()` permite estudiar cómo se comprometen tokens a lo largo de los pasos y visualizar el proceso de refinamiento.
- Estudio de fusión entre modelos: la integración con BART-base mediante atención cruzada con puerta cero es un caso concreto para analizar destilación o guiado de un decoder por un encoder externo.
- Prototipado de relleno de huecos (infilling) y edición de texto: la formulación de difusión enmascarada encaja de forma natural en tareas de completar o reescribir fragmentos, aunque sin benchmarks que respalden la calidad.
- Evaluación de kernels Triton para DeltaNet bidireccional: el repositorio incluye comparativas de validación entre el camino rápido y el original, útil para quienes trabajan en `flash-linear-attention`.
- Docencia y divulgación: ejemplo reproducible de conversión de un LLM autorregresivo a difusión enmascarada con código incluido y requisitos de hardware moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el checkpoint no ha sido evaluado y que se espera una calidad inferior a la del modelo base.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18 GB en bf16 para inferencia, según la model card.
- GPU recomendadas: A100 o L4 en clase de 18 GB; el camino Triton requiere Ampere o superior (A100, L4, RTX 30xx+, H100).
- Cabe en GPU de consumo: sí, en modelos con al menos ~18 GB en bf16 (por ejemplo RTX 3090/4090 de 24 GB); el autor menciona que la carga en 4-bit permite GPUs más pequeñas, aunque el camino rápido Triton no se aplica en 4-bit.
- Opciones de despliegue: carga mediante `dqwen.hub.load_pretrained` con `transformers`, `accelerate`, `safetensors` y `huggingface_hub`; `flash-linear-attention` muy recomendado. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y `AutoModelForCausalLM.from_pretrained` devuelve un modelo causal, no de difusión.
- Latencia y throughput: no disponibles. El coste depende del número de pasos de desemascarado y del umbral `thr`; el forward bidireccional no usa caché KV/estado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Diffusion-Qwen3.5-9B (este) | ~9B | no disponible | Masked diffusion + fusión BART | apache-2.0 | Hugging Face, experimental |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Autorregresivo | no disponible en la información | Hugging Face |
| Diffusion-Qwen3.5-4B (misma serie) | ~4B | no disponible | Masked diffusion + fusión BART | no disponible en la información | Hugging Face |
| Diffusion-Qwen3.8-27B (misma serie) | ~27B | no disponible | Masked diffusion (sin fusión BART) | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- No evaluado: no se ha ejecutado ningún benchmark y se espera calidad inferior al modelo base Qwen3.5-9B.
- Entrenamiento mínimo: 256 muestras de smoltalk y 10+10 pasos; el ajuste es superficial y no garantiza comportamiento robusto.
- Sin `generate()` autorregresivo: el parche bidireccional funciona sin caché KV/estado, lo que penaliza latencia y throughput frente a un decoder causal.
- Fragilidad ante actualizaciones: cambios en la implementación de Qwen en `transformers` pueden romper el parche.
- Idiomas limitados a inglés y japonés según la model card; el resto de idiomas no está cubierto explícitamente.
- Riesgo de alucinación y sesgos: no documentados ni medidos; al no haber evaluación, no pueden descartarse.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el estado experimental y la ausencia de benchmarks desaconsejan producción; conviene revisar también las condiciones del modelo base Qwen y de `facebook/bart-base`.
- El camino rápido Triton no cubre entrenamiento, máscaras de padding, fusión BART, batch > 1, 4-bit ni GPUs pre-Ampere, y se desactiva si la validación interna no coincide.
- La model card original contiene una sección de "Safety" truncada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerAIO/Diffusion-Qwen3.5-9B
- Repositorio de la serie (referenciado en la model card): https://huggingface.co/summerMC/Diffusion-Qwen3.5-9B
- Variante 4B: https://huggingface.co/summerMC/Diffusion-Qwen3.5-4B
- Variante 27B: https://huggingface.co/summerMC/Diffusion-Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo de fusión: https://huggingface.co/facebook/bart-base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
