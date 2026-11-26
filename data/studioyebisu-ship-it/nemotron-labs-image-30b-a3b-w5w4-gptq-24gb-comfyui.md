# StudioYebisu-ship-it/Nemotron-Labs-Image-30B-A3B-W5W4-GPTQ-24GB-ComfyUI

## Resumen

Nemotron-Labs-Image-30B-A3B W5/W4 Mixed GPTQ (24GB ComfyUI) es una cuantización de precisión mixta del modelo de generación de imágenes `nvidia/Nemotron-Labs-Image-30B-A3B`, publicada por el usuario `StudioYebisu-ship-it`. Se trata de un modelo autorregresivo de texto a imagen con arquitectura de mezcla de expertos (MoE), diseñado para ejecutarse íntegramente en una GPU de 24 GB dentro de ComfyUI, incluyendo los 128 expertos enrutados de cada una de las 23 capas MoE, sin poda.

La relevancia del artefacto reside en el equilibrio que logra entre fidelidad y huella de memoria: según la model card, alcanza un KL de `all4_own = 0.03382` frente al modelo BF16 de 60,8 GiB, superando la referencia `ALL-W5 RTN` (`0.03464`) que además no cabe en 24 GB. El repositorio incluye los pesos en formato safetensors (`22.900 GiB`) y un parche de nodos para ComfyUI con kernels CUDA NVRTC propios que implementan la asignación de precisión asimétrica por capa.

La licencia es la NVIDIA License (sección 3.3), que restringe el uso a fines no comerciales de investigación y evaluación, salvo para NVIDIA y sus filiales. El repositorio se creó el 26 de noviembre de 2026 y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoregresiva de texto a imagen con mezcla de expertos (MoE); componentes Mamba2, Attention y vision `lm_head` en BF16 |
| Parámetros totales | 30B (según el nombre del modelo base; no se detalla desglose) |
| Parámetros activos | 3B (A3B en el nombre del modelo base; no se detalla desglose) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W5A8 y W4A8 mixtos (ConvRot-GPTQ); capas MoE en `w5/w5` (10), `w5/w4` (4) y `w4/w4` (9); expertos compartidos en int8 ConvRot (grupo 64) |
| Idiomas soportados | no disponible (la evaluación de fidelidad incluye prompts en inglés y japonés) |
| Licencia | NVIDIA License (sección 3.3): solo uso no comercial, investigación y evaluación |
| Formato de pesos | safetensors (`nemotron_labs_image_30b_a3b_w5w4_gptq_24gb.safetensors`, 24.589.186.044 bytes, `22.900 GiB`), más parche de ComfyUI |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura autorregresiva de texto a imagen con mezcla de expertos: 23 capas MoE con 128 expertos enrutados por capa, junto con componentes Mamba2, Attention y un `lm_head` de visión. La cuantización publicada mantiene Mamba2, Attention y el `lm_head` de visión en BF16, mientras que los expertos compartidos se almacenan en int8 ConvRot con grupo de 64. La asignación de precisión es asimétrica dentro de cada capa: `up_proj` y `down_proj` reciben bits distintos según un plan de sensibilidad calculado por programación dinámica (`routed_budget = 17.25 GiB`, `total_routed = 18.492.589.440` bytes).

El proceso de cuantización combina GPTQ con Hessiano en espacio ConvRot (transformada de Hadamard de 64×64, `damp = 0.05`, hasta 4096 tokens de visión por imagen sobre 16 prompts, shrinkage `/512.0`). Según la model card, se calibró con `n_cal=4096`. No se especifican en la información disponible los datos de entrenamiento originales del modelo base (número de tokens, composición del dataset ni si hubo RLHF/DPO). La innovación destacable es la retención del 100 % de los expertos (128/128 en las 23 capas) sin poda, junto con kernels CUDA NVRTC personalizados que permiten la precisión mixta por capa.

## Capacidades

- Generación de imágenes a partir de texto (pipeline `text-to-image`) en formato compatible con ComfyUI.
- Generación autorregresiva con decodificación rápida (`FastDecoder`), con paridad de logits frente a `forward_sequence` de `cos = 0.999994`.
- Ejecución con todos los expertos residentes en tarjeta (`experts_on_card=True`), sin descarga a RAM (`experts_in_ram=False`).
- Soporte de `batch=1` y `batch=4` en generación a `1024x1024`.
- Capacidades multilingües parciales: la evaluación de fidelidad incluye prompts en inglés (EN3) y japonés (JP), aunque no se declara una lista oficial de idiomas.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes ni modos de razonamiento explícito.

## Casos de uso

- Investigación en cuantización de modelos generativos: el artefacto sirve como referencia reproducible para estudiar asignación de bits por capa y su impacto en la fidelidad KL frente al modelo BF16, gracias a los planes de asignación y perfiles de sensibilidad incluidos en `metadata/`.
- Evaluación de modelos de texto a imagen en hardware de consumo: permite probar un modelo de 30B con MoE en una única GPU de 24 GB, sin poda de expertos, para comparar calidad visual y diversidad frente a alternativas más pequeñas.
- Prototipado de pipelines de generación de imágenes en ComfyUI: el parche de nodos y los pesos en safetensors permiten montar flujos de trabajo con `batch=1` o `batch=4` a `1024x1024` con un pico de VRAM de `20.7790 GiB`.
- Estudio de capacidades multilingües en generación visual: la evaluación incluida con prompts en inglés y japonés permite analizar la preservación de capacidades no inglesas al cuantizar, algo que la retención de los 128 expertos busca proteger.
- Benchmarking de kernels CUDA personalizados: los kernels NVRTC del parche permiten medir latencia y paridad numérica de la decodificación rápida frente a la ruta estándar en entornos de investigación.
- Docencia y formación en técnicas GPTQ: el repositorio documenta ablaciones (`V2-C`, `V3-3`, `V3-6a` a `V3-6d`) y métricas de fidelidad que pueden usarse como material didáctico sobre cuantización de precisión mixta.

## Benchmarks y rendimiento

Fidelidad cuantitativa medida como KL frente al modelo BF16 de 60,8 GiB (imágenes held-out con 4096 tokens, `T=0.9`; menor es mejor):

| Variante | Cabe en 24 GB | `module_bytes` | `all4_own` ↓ | `EN3_own` ↓ | `JP_own` ↓ | `all4_frc` ↓ | `EN3_frc` ↓ |
|---|---|---:|---:|---:|---:|---:|---:|
| `ALL-W4 RTN` | Sí | — | 0.05299 | 0.03988 | 0.09231 | 0.03814 | 0.03100 |
| `V2-C` | Sí | 20.35 GiB | 0.04467 | 0.03467 | 0.07466 | — | — |
| `V3-3` | Sí | 20.5644 GiB | 0.03813 | 0.02732 | 0.07053 | 0.02329 | 0.01899 |
| `V3-6a` | Sí | 20.5644 GiB | 0.03407 | 0.02539 | 0.06010 | 0.02120 | 0.01751 |
| **`V3-6b` (publicado)** | **Sí** | **20.6033 GiB** | **0.03382** | **0.02575** | **0.05803** | **0.02135** | **0.01778** |
| `V3-6c` | Sí | 20.5667 GiB | 0.03493 | 0.02636 | 0.06064 | 0.02180 | 0.01813 |
| `V3-6d` | Sí | 20.5313 GiB | 0.03475 | 0.02659 | 0.05924 | 0.02211 | 0.01837 |
| `ALL-W5 RTN` (referencia) | No | >23.7 GiB | 0.03464 | 0.02787 | 0.05496 | 0.02265 | 0.02010 |
| `ALL-W6 RTN` (referencia) | No | ~28+ GiB | 0.02613 | 0.02195 | 0.03868 | 0.01603 | 0.01488 |

Métricas de ejecución en Colab (GPU G4) con ComfyUI y el parche incluido:

| Métrica | Valor |
|---|---|
| `experts_on_card` | `True` |
| `module_bytes` | 20.6033 GiB |
| Pico de VRAM en generación aislada (`batch=1`, `1024x1024`, solo LM) | 20.7790 GiB (reservado 20.8809 GiB; 18,17 s) |
| Pico de VRAM en generación aislada (`batch=4`) | 21.0014 GiB |
| Pico de VRAM en decodificación VAE L24SQ (tras descargar el LM) | 5.0031 GiB |
| Paridad de logits `FastDecoder` vs `forward_sequence` | `cos = 0.999994`, `top1 = (176505, 176505)` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: `20.7790 GiB` de pico en generación aislada a `1024x1024` con `batch=1`; `21.0014 GiB` con `batch=4`; decodificación VAE adicional de `5.0031 GiB` tras descargar el modelo de lenguaje.
- GPU recomendadas: cualquier GPU con al menos 24 GB de VRAM; la model card valida el funcionamiento en una GPU G4 de Colab.
- Cabe en GPU de consumo: sí, en modelos de 24 GB (por ejemplo, la familia RTX 4090 según el requisito de VRAM; la model card no nombra modelos concretos de consumo).
- Opciones de despliegue: ComfyUI con el nodo `PedroMarinhoDev/ComfyUI-Nemotron-Image` y el parche `patches/comfyui_nemotron_pruned_mixed.patch`; `engine="auto"`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: generación aislada de `18,17 s` a `1024x1024` con `batch=1` en G4; no se proporcionan cifras de throughput para otros lotes o GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Nemotron-Labs-Image-30B-A3B W5/W4 GPTQ (esta ficha)** | 30B (3B activos) | no disponible | safetensors, 22.900 GiB | NVIDIA License, solo no comercial | Hugging Face, 0 descargas |
| `nvidia/Nemotron-Labs-Image-30B-A3B` (BF16) | 30B (3B activos) | no disponible | BF16, 60,8 GiB | NVIDIA License | Hugging Face (modelo base) |
| `ALL-W5 RTN` (referencia de cuantización) | 30B (3B activos) | no disponible | W5A8 uniforme, >23.7 GiB | no disponible | no disponible como artefacto independiente |
| `ALL-W6 RTN` (referencia de cuantización) | 30B (3B activos) | no disponible | W6A8 uniforme, ~28+ GiB | no disponible | no disponible como artefacto independiente |

No se dispone de información sobre otros modelos comparables de la misma categoría (texto a imagen autorregresivos con MoE) en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la NVIDIA License (sección 3.3) limita el uso a fines no comerciales de investigación y evaluación, salvo para NVIDIA Corporation y sus filiales. No apto para producción comercial.
- Artefacto derivado: los pesos son una cuantización de terceros, no afiliada, patrocinada ni respaldada por NVIDIA.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la ficha, lo que reduce la validación comunitaria del artefacto.
- Dependencia de parche: requiere aplicar el parche de ComfyUI (GPL v3.0 sobre `PedroMarinhoDev/ComfyUI-Nemotron-Image`) y kernels NVRTC personalizados; no funciona con el nodo estándar sin el parche.
- Pérdida de fidelidad frente al BF16: el KL `all4_own` de 0.03382 implica desviaciones medibles respecto al modelo original, especialmente en japonés (`JP_own = 0.05803`).
- Riesgo de alucinación y sesgos: no se documentan análisis específicos de sesgos ni tasas de alucinación en la información disponible.
- Idiomas: no se declara una lista oficial de idiomas soportados; la evaluación se limita a inglés y japonés.
- Longitud de contexto: no disponible, lo que impide planificar usos con prompts o imágenes de referencia de longitud conocida.
- Validación acotada: las métricas se obtuvieron en una GPU G4 de Colab con `batch=1` y `batch=4`; el rendimiento en otras GPUs de 24 GB puede variar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StudioYebisu-ship-it/Nemotron-Labs-Image-30B-A3B-W5W4-GPTQ-24GB-ComfyUI
- Modelo base: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B
- Nodo de ComfyUI parcheado: https://github.com/PedroMarinhoDev/ComfyUI-Nemotron-Image
- Parche incluido en el repositorio: `patches/comfyui_nemotron_pruned_mixed.patch`
- Licencia NVIDIA: `LICENSE` (en el repositorio)
- Atribuciones: `NOTICE`, `licenses/Apache-2.0.txt`, `patches/LICENSE-GPLv3.txt`, `patches/NOTICE-ComfyUI-Nemotron-Image.txt`
- Metadatos de asignación y ablaciones: `metadata/allocation_plan.json`, `metadata/sensitivity_profile_v3.json`, `metadata/v3_ablation_results.json`, `metadata/visual_bench_metrics.json`
