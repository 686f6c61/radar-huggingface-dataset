# TheDrainFlorist/GLM-5.3-Flash-VQ-3.6bpw

## Resumen

GLM-5.3-Flash-VQ-3.6bpw es una cuantización por vector quantization (VQ) del modelo GLM-5.3-Flash de Zhipu AI, creada por TheDrainFlorist para ejecutarse en Apple Silicon mediante MLX. El modelo base es un MoE nativamente multimodal de 320B parámetros totales y 18B activos, que según Cloudflare se acerca a Claude Opus 4.8 en tareas de código y agentes. Esta versión reduce el checkpoint bf16 de 598.5 GiB a 134.0 GiB de pesos, manteniendo una calidad comparable a una cuantización affine q4 pero con 32 GiB menos de memoria, gracias a una técnica de VQ sin datos de calibración desarrollada con VQLab.

La cuantización aplica códigos empaquetados de 13 bits a los expertos MoE (d=4, K=8192), mientras que atención, embeddings y cabeza de salida se mantienen en 8-bit affine; normas, routers y la torre de visión completa quedan en bf16. La capa de predicción multi-token (MTP) nunca se cuantiza. El modelo está diseñado para entornos con restricciones de memoria, como Macs de gama alta o clústeres exo de dos nodos, y su pipeline es image-text-to-text, por lo que acepta entradas de imagen y texto.

La relevancia de este modelo radica en que demuestra que la cuantización VQ puede superar a la affine en calidad por byte en la gama de menos de 6 bits, un resultado documentado en el paper «Data-Free Vector Quantization Beats Affine Quantization at Matched Bytes Below 6 Bits».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con visión nativa, basada en GLM-5.3-Flash |
| Parametros totales | 45.444.923.198 (elementos en safetensors; el modelo base tiene 320B parámetros) |
| Parametros activos | 18B (modelo base, según Cloudflare) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | VQ 3.6 bits por peso (d=4, K=8192); atención, embeddings y cabeza de salida en 8-bit affine; normas, routers y torre de visión en bf16; capa MTP sin cuantizar |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, con runtime embebido en model.py) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE nativamente multimodal de 320B parámetros totales y 18B activos, desarrollado por Zhipu AI. Según Cloudflare, es el primer modelo nativamente multimodal de la serie GLM-5 y supera a GLM-5.2 en benchmarks y cargas de trabajo reales con una décima parte del coste, acercándose a Claude Opus 4.8 en coding y benchmarks agénticos. No se proporcionan detalles sobre el corpus de entrenamiento, RLHF o DPO en la información disponible.

La versión VQ se obtiene a partir del checkpoint bf16 (598.5 GiB) sin corpus de calibración, mediante la herramienta VQLab. Los expertos MoE se cuantizan uniformemente con códigos empaquetados de 13 bits (d=4, K=8192), mientras que atención, embeddings y cabeza de salida se mantienen en 8-bit affine; normas, routers y la torre de visión completa (347 tensores) quedan en bf16. La capa MTP (layers.45) nunca se cuantiza. La innovación técnica es el uso de vector quantization (VQ) en lugar de cuantización affine: VQ almacena grupos de pesos como índices en codebooks ajustados a los propios pesos, lo que permite una mejor calidad por byte por debajo de 6 bits. El método y los resultados se documentan en el paper «Data-Free Vector Quantization Beats Affine Quantization at Matched Bytes Below 6 Bits».

## Capacidades

- Generación de texto y conversación multimodal (image-text-to-text): acepta imágenes y texto como entrada.
- Razonamiento y generación de código: según Cloudflare, el modelo base se acerca a Claude Opus 4.8 en benchmarks de coding.
- Capacidades agénticas: soporta benchmarks agénticos, lo que indica aptitud para tareas de planificación y ejecución multi-paso.
- Multilingüe: inglés y chino.
- Decodificación especulativa: incluye un sidecar MTP (multi-token prediction) opcional que puede acelerar el servicio en pipelines.
- Cuantización VQ: permite ejecutar el modelo en memoria reducida sin necesidad de datos de calibración.

## Casos de uso

- Asistencia multimodal en Macs de gama alta: el modelo puede procesar imágenes y texto directamente en un Mac de 192 GB, gracias a su cuantización VQ de 3.6 bits por peso. Es adecuado para aplicaciones de escritorio que necesitan entender capturas de pantalla, diagramas o documentos escaneados sin depender de servicios en la nube.
- Generación de código asistida por visión: al ser un modelo multimodal con buen rendimiento en coding, puede recibir una captura de pantalla de una interfaz o un diagrama de arquitectura y generar el código correspondiente, integrándose en entornos de desarrollo locales.
- Despliegue en clústeres exo: la cuantización a 134 GiB permite repartir los pesos en un clúster de dos nodos (por ejemplo, M3 Ultra de 96 GB y M4 de 128 GB) mediante la rama vq-serving de exo, lo que habilita un servicio distribuido de inferencia multimodal en Apple Silicon.
- Investigación en cuantización: el modelo sirve como referencia para comparar VQ frente a cuantización affine. Los resultados de KL y perplejidad del README permiten evaluar la calidad de la cuantización sin necesidad de ejecutar el modelo base completo.
- Traducción y conversación chino-inglés: con soporte nativo para en y zh, puede utilizarse en aplicaciones bilingües que requieran comprensión de imágenes y texto, como herramientas de traducción de documentos o chatbots corporativos.
- Análisis de documentos visuales: gracias a su pipeline image-text-to-text y a la torre de visión en bf16, puede extraer información de facturas, informes o presentaciones que contengan gráficos e imágenes, manteniendo la fidelidad de la percepción visual.
- Servicio de inferencia con decodificación especulativa: el sidecar MTP opcional, aunque no validado en este rung, está diseñado para acelerar el servicio en pipelines donde se oculta la latencia entre etapas. Puede usarse en sistemas de producción una vez validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El README presenta métricas de fidelidad a la distribución del profesor bf16 (KL) y perplejidad en tres corpus. El referee usa 2048 tokens; prosa = WikiText, código = corpus mlx público, literario = Gutenberg. KL se calcula contra los logits top-64 en caché del profesor bf16 (masa capturada 0.9906).

| Build | Tamaño | KL a bf16 (mnats/tok) | Acuerdo top-1 | Perplejidad prosa | Perplejidad código | Perplejidad literaria |
|---|---|---|---|---|---|---|
| VQ 2.7bpw (mixed best-8) | 101.9 GiB | 293.84 | 85.7% | 2.4014 | 1.6671 | 1.4811 |
| VQ 3.1bpw (d4/K2048) | 116.3 GiB | 199.53 | 88.6% | 2.1954 | 1.6187 | 1.3402 |
| affine q3 (ours) | 129 GiB | 377.08 | 83.1% | 2.6824 | 1.7842 | 1.4731 |
| **este modelo (d4/K8192)** | **134.0 GiB** | **94.54** | **92.1%** | **2.0379** | **1.5475** | **1.2154** |
| affine q4 (ours) | 166 GiB | 98.34 | 91.9% | 2.0263 | 1.5718 | 1.2025 |
| affine q6 (ours) | 239 GiB | 13.47 | 97.1% | 1.9285 | 1.4929 | 1.1660 |
| bf16 teacher | 598.5 GiB | 0 | 100% | 1.9024 | 1.4888 | 1.1580 |

## Requisitos de hardware

- Memoria unificada estimada: 134.0 GiB de pesos (19 shards). Una vez que el routing ha tocado todos los expertos, la memoria residente es cercana al tamaño de descarga. El repo total con sidecar MTP es ~140.1 GiB; el sidecar añade ~6.3 GiB si se activa.
- GPU recomendadas: Apple Silicon (M3 Ultra, M4, etc.). No se mencionan GPUs NVIDIA; el modelo está construido para MLX.
- En consumer GPU: no cabe. 134 GiB excede la VRAM de cualquier GPU de consumo (RTX 4090 tiene 24 GB). Requiere un Mac de 192 GB o un clúster exo de 2 nodos.
- Opciones de despliegue: mlx-vlm 0.6.17 (pip install mlx-vlm), vqlab serve, exo (rama vq-serving). El runtime VQ viaja dentro del checkpoint como model.py y se resuelve con mlx-lm y mlx_vlm.
- Latencia y throughput: no disponible para este rung. El README indica que no se citan números de throughput single-box; se verificó la generación en un clúster exo de 2 nodos, pero no se midió latencia.

## Comparativa con modelos similares

| Modelo | Tamaño (pesos) | Parámetros activos | KL a bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash (bf16, base) | 598.5 GiB | 18B | 0 | MIT | HuggingFace |
| GLM-5.3-Flash-VQ-3.6bpw (este) | 134.0 GiB | 18B | 94.54 | MIT | HuggingFace |
| affine q4 (mismo base, conversión del autor) | 166 GiB | 18B | 98.34 | MIT | HuggingFace |
| affine q6 (mismo base, conversión del autor) | 239 GiB | 18B | 13.47 | MIT | HuggingFace |

## Limitaciones y advertencias

- Sesgos: no documentados en la información disponible.
- Riesgo de alucinación: no documentado; riesgo inherente a los modelos generativos de lenguaje.
- Limitaciones de idioma: solo inglés y chino según los metadatos. No se especifica soporte para otros idiomas.
- Contexto: la longitud de contexto no está disponible en la información proporcionada.
- Restricciones de licencia: MIT, permite uso comercial sin restricciones especiales.
- Requisitos de memoria: 134 GiB de pesos; no cabe en una máquina de 128 GB. Requiere un Mac de 192 GB o un clúster exo de 2 nodos. El prefill debe mantenerse acotado; el runtime limita la caché de buffer-reuse de MLX a 4 GiB.
- Sidecar MTP sin probar en este rung: el archivo mtp-head-q6.safetensors se incluye, pero no ha sido validado en esta configuración. No se recomienda activarlo sin pruebas previas.
- Perplejidad no comparable entre familias: los valores de perplejidad del README están contaminados por memorización del corpus público; deben interpretarse con cautela. La métrica KL es más fiable.
- Plataforma: el modelo está diseñado para Apple Silicon/MLX. No se proporcionan instrucciones para ejecutarlo en GPUs NVIDIA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheDrainFlorist/GLM-5.3-Flash-VQ-3.6bpw
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Documentación de Cloudflare Workers AI sobre GLM-5.3-Flash: https://developers.cloudflare.com/workers-ai/models/glm-5.3-flash/
- Paper: Data-Free Vector Quantization Beats Affine Quantization at Matched Bytes Below 6 Bits: https://doi.org/10.5281/zenodo.22136000
- VQLab (herramienta de cuantización): https://github.com/noahzelezny/VQLab
- Rama exo para serving VQ: https://github.com/noahzelezny/exo/tree/vq-serving
- Rung anterior VQ 2.7bpw: https://huggingface.co/TheDrainFlorist/GLM-5.3-Flash-VQ-2.7bpw
