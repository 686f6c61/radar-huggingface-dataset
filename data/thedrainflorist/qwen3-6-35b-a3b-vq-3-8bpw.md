# TheDrainFlorist/Qwen3.6-35B-A3B-VQ-3.8bpw

## Resumen

Qwen3.6-35B-A3B-VQ-3.8bpw es una cuantización vectorial (vector quantization, VQ) del modelo MoE Qwen3.6-35B-A3B de Alibaba, publicada por el usuario TheDrainFlorist. El artefacto está diseñado específicamente para Apple Silicon y se ejecuta con la librería MLX sin necesidad de parches, ya que el runtime VQ se incluye dentro del propio checkpoint como `model.py`. Su objetivo es reducir drásticamente el tamaño en disco (15,7 GiB frente a los 65,4 GiB del bf16) manteniendo una fidelidad distribucional alta respecto al profesor bf16, con una divergencia KL de 53,0 mnats/token, inferior a la del build comunitario de 4 bits (78,6) y a un tamaño 3,3 GiB menor.

El modelo base es un Mixture-of-Experts con 35 mil millones de parámetros totales y 3 mil millones activos por token, con 256 expertos (8 enrutados + 1 compartido). Esta versión cuantiza uniformemente los tensores de los expertos con VQ (d=4, K=8192, codebooks fp16 y escalas fp16 por fila de 64 pesos), dejando los tensores no expertos en 8 bits y el router en bf16. Incluye además la torre de visión del modelo original (0,83 GiB), aunque el pipeline declarado es text-generation. Es relevante porque ofrece una alternativa de alta compresión para ejecución local en hardware Apple, con una calidad medida frente al profesor que supera a las cuantizaciones convencionales de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con 256 expertos, 8 enrutados + 1 compartido; cuantizacion VQ de los expertos (d=4, K=8192) |
| Parametros totales | 35B (modelo base); 4.734.195.056 parametros almacenados en safetensors (codebooks e indices) |
| Parametros activos | 3B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | VQ 3.8 bpw (este build); tambien existen VQ 4.6 bpw, 8-bit y 4-bit de la comunidad |
| Idiomas soportados | en (segun model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con runtime VQ incluido como model.py |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer MoE con 256 expertos, de los cuales 8 se enrutan por token más un experto compartido, activando 3B parámetros de un total de 35B. Esta versión cuantizada aplica vector quantization uniforme a todos los tensores de los expertos: cada subvector de 4 pesos se codifica con un índice de 13 bits en un codebook de 8192 entradas fp16 por tensor, con una escala fp16 por cada fila de 64 pesos. Los tensores no expertos se cuantizan a 8 bits y el router se mantiene en bf16, una asimetría deliberada que la model card reconoce como no medida en su efecto.

Los codebooks se ajustan mediante k-means en el espacio de pesos, sin usar Hessian, estadísticas de activación ni corpus de calibración. El ajuste no está seedeado, por lo que el artefacto es reproducible en receta y geometría pero no bit a bit; el margen de 25 mnats frente al build de 4 bits se cita como muy superior al suelo de variación entre ajustes (0,214 mnats). No se dispone de información sobre el entrenamiento del modelo base (datos, tokens, RLHF, etc.) en la documentación proporcionada.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es text-generation y el ejemplo de uso muestra generación de código Python.
- Soporte de código: el prompt de ejemplo en la model card pide escribir una función Python, indicando capacidad para tareas de programación.
- Incluye torre de visión del modelo base (333 tensores, 0,83 GiB), aunque no se documenta su uso en este artefacto.
- Ejecución en Apple Silicon mediante MLX, sin parches externos.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni modos de pensamiento explícitos en la documentación del artefacto.

## Casos de uso

- Generación de código en local: el modelo puede usarse con `mlx-lm` para completar o generar funciones Python y otros fragmentos de código directamente en una Mac, aprovechando su tamaño reducido (15,7 GiB) y su compatibilidad con MLX.
- Asistente conversacional embebido: al ser un MoE con 3B activos, es adecuado para aplicaciones de chat en dispositivos Apple con 16-24 GB de RAM, manteniendo una latencia razonable en contextos cortos.
- Prototipado rápido de aplicaciones de IA: su instalación simple (`pip install mlx-lm` y un comando) permite integrarlo en entornos de desarrollo sin infraestructura GPU dedicada.
- Investigación en cuantización: el artefacto sirve como referencia para estudiar el impacto de la VQ en la fidelidad distribucional frente a cuantizaciones lineales, con métricas KL y perplexity publicadas.
- Despliegue en clústeres exo: aunque cabe en una sola máquina, puede shardearse en un clúster exo con el parche PR #2268, útil para entornos con múltiples Macs.
- Evaluación de calidad de modelos cuantizados: los datos de KL, top-1 agreement y perplexity permiten comparar objetivamente este build con alternativas de 4 y 8 bits.

## Benchmarks y rendimiento

La model card no reporta scores de tareas (MMLU, HumanEval, GSM8K, etc.). En su lugar, proporciona métricas de fidelidad frente al profesor bf16, medidas sobre un corpus de referencia con ventanas de 2048 tokens y evaluadas con `mlx-lm` sin modificar:

| Build | Tamano | KL a bf16 (mnats/tok) | Top-1 agreement | Perplexity |
|---|---|---|---|---|
| bf16 | 65,4 GiB | 0 | 100% | 4,7215 |
| mlx-community 8-bit | 35,1 GiB | 7,4 | 96,18% | 4,7150 |
| **Este modelo (VQ 3.8bpw)** | **15,7 GiB** | **53,0** | **89,55%** | 4,7090 |
| mlx-community 4-bit | 19,0 GiB | 78,6 | 85,61% | 4,9154 |

La model card advierte que la perplexidad es un agregado que puede absorber errores compensados, y que la KL es la métrica directa de distancia al profesor. El top-1 agreement es inferior al del 8-bit (89,55% vs 96,18%), algo esperable en un MoE de 256 expertos donde el enrutamiento discreto cambia tokens plausibles. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: el tamaño en disco es de 15,7 GiB (16,8 GB en el repo); la memoria pico será cercana a esa cifra menos la torre de visión, que `mlx-lm` no carga.
- GPU recomendadas: diseñado para Apple Silicon (cualquier Mac con chip M-series). No requiere GPU NVIDIA.
- Compatibilidad con hardware de consumo: cabe cómodamente en una máquina con 24 GB de RAM unificada; es utilizable en 16 GB con contextos cortos.
- Opciones de despliegue: `mlx-lm` (comando `python -m mlx_lm generate`), y opcionalmente clústeres exo con el parche PR #2268 para replicar codebooks.
- Latencia y throughput: no medidos en este artefacto; la model card indica explícitamente que no se cita el rendimiento de builds hermanos.

## Comparativa con modelos similares

Comparación con otros builds del mismo modelo base (Qwen3.6-35B-A3B):

| Build | Tamano | KL a bf16 | Top-1 agreement | Perplexity | Licencia |
|---|---|---|---|---|---|
| bf16 | 65,4 GiB | 0 | 100% | 4,7215 | Apache-2.0 |
| mlx-community 8-bit | 35,1 GiB | 7,4 | 96,18% | 4,7150 | Apache-2.0 |
| **VQ 3.8bpw (este)** | **15,7 GiB** | **53,0** | **89,55%** | 4,7090 | Apache-2.0 |
| mlx-community 4-bit | 19,0 GiB | 78,6 | 85,61% | 4,9154 | Apache-2.0 |

No se dispone de comparación con otros modelos MoE de tamaño similar (p. ej., Qwen3-30B-A3B, DeepSeek-V3-Lite) en la información proporcionada.

## Limitaciones y advertencias

- Top-1 agreement del 89,55%, inferior al 96,18% del build de 8 bits; si la aplicación es sensible a la elección exacta de token, el 8-bit es más cercano al bf16.
- Sin medición de throughput ni latencia en este artefacto; no se debe extrapolar el rendimiento de builds hermanos.
- Sin scores de tareas (MMLU, HumanEval, etc.); la evaluación se limita a métricas de fidelidad distribucional.
- El router se mantiene en bf16 mientras el resto se cuantiza; el efecto de esta asimetría no está medido.
- En despliegues multi-máquina con exo, los codebooks VQ deben replicarse, no particionarse; el `model.py` incluido falla explícitamente si se intenta un sharding incorrecto, pero requiere aplicar el PR #2268 o usar la imagen `noahzelezny/exo:vq-codebook-replicate`.
- El ajuste k-means no está seedeado, por lo que reconstrucciones bit a bit no son posibles; las métricas se citan contra un suelo de variación medido.
- Solo se declara soporte para inglés en la model card, aunque el modelo base podría tener capacidades multilingües no documentadas aquí.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TheDrainFlorist/Qwen3.6-35B-A3B-VQ-3.8bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- ModelScope (modelo base): https://www.modelscope.ai/models/Qwen/Qwen3.6-35B-A3B
- Página de Qwen3.6 en LM Studio: https://lmstudio.ai/models/qwen3.6
- Página en MindStudio: https://www.mindstudio.ai/models/qwen3-6-35b-a3b-deepinfra
- PR de exo para replicación de codebooks: https://github.com/exo-explore/exo/pull/2268
- Rama de exo con la solución: https://github.com/noahzelezny/exo/tree/vq-codebook-replicate
