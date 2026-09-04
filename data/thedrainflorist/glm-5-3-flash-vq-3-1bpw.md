# TheDrainFlorist/GLM-5.3-Flash-VQ-3.1bpw

## Resumen

GLM-5.3-Flash-VQ-3.1bpw es una cuantización vectorial (VQ) del modelo multimodal GLM-5.3-Flash, desarrollada por TheDrainFlorist. El modelo base, creado por Z.AI (Zhipu AI), es el primer multimodal nativo de la serie GLM-5, con una arquitectura híbrida de alta eficiencia que combina 320B parámetros totales con solo 18B activos. Esta versión cuantizada reduce el checkpoint bf16 original de 598.5 GiB a 116.3 GiB mediante VQ sin datos de calibración, lo que permite ejecutarlo en hardware de Apple Silicon, incluyendo clusters exo de dos nodos o Macs de 192 GB de RAM.

La relevancia de este modelo radica en su técnica de cuantización: la VQ data-free supera a la cuantización afín a igualdad de bytes por debajo de 6 bits, según el paper del autor. El checkpoint mantiene la torre de visión en bf16, la atención y embeddings en 8-bit affine, y los expertos MoE en códigos VQ de 11 bits. Incluye además un sidecar para decodificación especulativa (MTP head) que aún no ha sido validado en este rung.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) multimodal con visión, arquitectura híbrida GLM-5.3-Flash |
| Parámetros totales | 320B (modelo base); 40.402.818.878 elementos en el checkpoint cuantizado |
| Parámetros activos | 18B |
| Longitud de contexto | no disponible |
| Tipos de cuantización | VQ 3.1 bpw (d=4/K=2048); atención, embeddings y head en 8-bit affine; normas, routers y torre de visión en bf16; MTP head en q6 (sidecar) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un MoE multimodal nativo con 320B parámetros totales y 18B activos. La documentación de Z.AI lo describe como una arquitectura híbrida de alta eficiencia, aunque no se detallan los componentes internos. El checkpoint cuantizado se construyó a partir del bf16 original (598.5 GiB) con la herramienta VQLab, sin corpus de calibración (data-free). Los expertos MoE se almacenan uniformemente con d=4 y K=2048 en códigos VQ de 11 bits. La atención, los embeddings y la cabeza de salida permanecen en 8-bit affine; las normas, los routers y la torre de visión completa (347 tensores) se mantienen en bf16. La capa de predicción multi-token (MTP, layers.45) nunca se cuantiza. No se ha proporcionado información sobre los datos de entrenamiento del modelo base ni sobre procesos de RLHF o DPO.

## Capacidades

- Multimodal: acepta imágenes y texto (pipeline image-text-to-text). La torre de visión se conserva en bf16 para preservar la fidelidad visual.
- Generación de texto y razonamiento: el modelo base supera a GLM-5.2 en benchmarks y se acerca a Claude Opus 4.8 en tareas de código y agentes, según la documentación de Cloudflare.
- Soporte de agentes: las capacidades agentic del modelo base permiten razonamiento multi-paso, aunque no se especifica soporte explícito de tool calling en la información disponible.
- Multilingüe: soporte nativo de inglés y chino.
- Decodificación especulativa: incluye un sidecar `mtp-head-q6.safetensors` (6.09 GiB) con la cabeza MTP de GLM, empaquetada en q6. Esta no se nombra en el índice de pesos y solo se activa explícitamente con `--sidecar`.
- Cuantización VQ data-free: no requiere corpus de calibración, lo que simplifica el proceso de compresión.

## Casos de uso

- Inferencia distribuida en clusters exo de Apple Silicon: este rung está diseñado para 2 nodos (por ejemplo, M3 Ultra 96 GB + M4 128 GB) vía Thunderbolt. Es adecuado para entornos de servidores locales sin GPUs NVIDIA.
- Análisis de imágenes en local: gracias a la torre de visión bf16 y al pipeline image-text-to-text, permite describir, analizar o responder preguntas sobre imágenes sin enviar datos a la nube.
- Asistentes conversacionales bilingües: con soporte nativo de inglés y chino, es útil para aplicaciones de atención al cliente o chatbots que necesiten alternar entre ambos idiomas.
- Generación de código en entornos de investigación: el modelo base destaca en tareas de código y agentes; esta cuantización permite ejecutarlo en hardware de Apple con un coste de memoria reducido.
- Investigación en compresión de modelos: la técnica VQ data-free es el objeto de estudio de este checkpoint. Sirve como referencia para comparar la fidelidad de la cuantización afín frente a VQ a igualdad de bytes.
- Prototipado de agentes: las capacidades agentic del modelo base permiten construir flujos de razonamiento multi-paso; la cuantización reduce la barrera de hardware para experimentación.
- Procesamiento de documentos con visión: combinar texto e imagen para extraer información de documentos escaneados, capturas de pantalla o diagramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye métricas internas de fidelidad al profesor bf16, medidas sobre 2048 tokens de referencia (prosa de WikiText, código de un corpus público de MLX y literario de Gutenberg). La divergencia KL se calcula contra los logits top-64 del profesor bf16 (masa capturada 0.9906 por fila).

| Build | Tamaño | KL a bf16 (mnats/tok) | Acuerdo top-1 | PPL prosa | PPL código | PPL literario |
|---|---|---|---|---|---|---|
| VQ 2.7bpw (mixed best-8) | 101.9 GiB | 293.84 | 85.7% | 2.4014 | 1.6671 | 1.4811 |
| **VQ 3.1bpw (d4/K2048)** | **116.3 GiB** | **199.53** | **88.6%** | **2.1954** | **1.6187** | **1.3402** |
| affine q3 (ours) | 129 GiB | 377.08 | 83.1% | 2.6824 | 1.7842 | 1.4731 |
| VQ 3.6bpw (d4/K8192) | 134.0 GiB | 94.54 | 92.1% | 2.0379 | 1.5475 | 1.2154 |
| affine q4 (ours) | 166 GiB | 98.34 | 91.9% | 2.0263 | 1.5718 | 1.2025 |
| affine q6 (ours) | 239 GiB | 13.47 | 97.1% | 1.9285 | 1.4929 | 1.1660 |
| bf16 teacher | 598.5 GiB | 0 | 100% | 1.9024 | 1.4888 | 1.1580 |

El autor advierte que las puntuaciones de perplejidad absoluta no son comparables entre familias de modelos y están contaminadas por la memorización del corpus de referencia por parte del profesor bf16. La divergencia KL es la métrica recomendada para comparar builds del mismo modelo.

## Requisitos de hardware

- VRAM estimada: la descarga ocupa 116.3 GiB (19 shards). La memoria residente esperada es similar al tamaño de descarga una vez que el enrutamiento ha tocado todos los expertos. No cabe en una Mac de 128 GB; requiere 2 nodos exo o una Mac de 192 GB.
- GPU recomendadas: Apple Silicon (M3 Ultra, M4) con MLX. No se mencionan GPUs NVIDIA; el modelo está optimizado para el ecosistema MLX.
- No cabe en GPUs de consumo (RTX 4090, etc.) por tamaño.
- Opciones de despliegue: `mlx-vlm` 0.6.17 (instalación estándar vía pip), `vqlab serve` para inferencia, y la rama `vq-serving` de exo para clusters.
- Latencia y throughput: no existen datos de throughput single-box para este rung. El MTP head en el rung 2.7bpw midió 19.99 tok/s frente a 19.7 tok/s en decodificación simple, pero esta medición no aplica a este checkpoint.

## Comparativa con modelos similares

Las alternativas más directas son las otras builds de cuantización del mismo modelo base GLM-5.3-Flash, ya que comparten arquitectura y se evaluaron con el mismo procedimiento.

| Build | Tamaño | KL a bf16 (mnats/tok) | Acuerdo top-1 | Licencia |
|---|---|---|---|---|
| VQ 2.7bpw (mixed best-8) | 101.9 GiB | 293.84 | 85.7% | MIT |
| **VQ 3.1bpw (d4/K2048)** | **116.3 GiB** | **199.53** | **88.6%** | **MIT** |
| VQ 3.6bpw (d4/K8192) | 134.0 GiB | 94.54 | 92.1% | MIT |
| affine q4 (ours) | 166 GiB | 98.34 | 91.9% | MIT |
| affine q6 (ours) | 239 GiB | 13.47 | 97.1% | MIT |

Este rung de 3.1bpw es 13 GiB más pequeño que affine q3 y un 47% mejor en KL. Sin embargo, se queda corto frente a la calidad de affine q4; para ese nivel, el rung de 3.6bpw iguala o supera a affine q4 en todos los ejes con 32 GiB menos.

## Limitaciones y advertencias

- Sesgos: no se han publicado evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación: no se han reportado evaluaciones de alucinación; como todo modelo de lenguaje, existe riesgo en generación libre.
- Limitaciones de contexto: la longitud de contexto no está especificada en la documentación disponible.
- Idiomas: el soporte declarado es solo inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Licencia: el checkpoint cuantizado se publica bajo MIT, que permite uso comercial. No obstante, se debe verificar la licencia del modelo base zai-org/GLM-5.3-Flash para asegurar el cumplimiento en producción.
- Caveat de despliegue: este rung excede la memoria de una sola máquina de 128 GB; requiere un cluster exo de 2 nodos o una Mac de 192 GB. No se han medido throughputs single-box para este checkpoint.
- MTP head no testeado: la cabeza de decodificación especulativa incluida como sidecar no ha sido validada en este rung; solo se probó en el rung 2.7bpw.
- Perplejidad contaminada: las métricas de perplejidad absoluta están dominadas por la memorización del corpus de referencia por parte del profesor bf16, por lo que no deben usarse para comparar entre familias de modelos.

## Enlaces

- HuggingFace: https://huggingface.co/TheDrainFlorist/GLM-5.3-Flash-VQ-3.1bpw
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- VQLab: https://github.com/noahzelezny/VQLab
- Paper de cuantización VQ: https://doi.org/10.5281/zenodo.22136000
- Documentación de Cloudflare sobre GLM-5.3-Flash: https://developers.cloudflare.com/workers-ai/models/glm-5.3-flash/
- Documentación de Z.AI: https://docs.z.ai/guides/vlm/glm-5.3-flash
- Rama vq-serving de exo: https://github.com/noahzelezny/exo/tree/vq-serving
