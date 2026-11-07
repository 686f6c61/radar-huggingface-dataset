# ununununununununununununununununununun/ltx-video-2b-phi-lattice-v2

## Resumen

`ltx-video-2b-phi-lattice-v2` es un paquete de cuantización de 4 bits del transformador de difusión (DiT) del modelo de generación de vídeo LTX-Video de Lightricks, concretamente del checkpoint de 2B parámetros (`LTXVideoTransformer3DModel`). Lo publica el usuario `ununununununununununununununununununun` como derivado cuantizado del subdirectorio `transformer/` de `Lightricks/LTX-Video`, y no es un modelo nuevo: es un artefacto de compresión que reduce el peso en disco y en memoria del componente principal del pipeline image-to-video.

El problema que aborda es el coste de memoria del transformador original, cuyos shards en FP32 ocupan 7.339,07 MiB. El pack empaqueta las 287 capas `nn.Linear` en formato phi-lattice v2 de 4 bits y deja las normas y la `scale_shift_table` en BF16, logrando 976,67 MiB en disco y 976,35 MiB residentes en modo `low_vram_4bit`, es decir, 3,76 veces menos que la misma imagen de tensores en BF16 y 7,51 veces menos que en FP32. Esto hace viable ejecutar el transformador de 2B en GPUs de consumo con VRAM ajustada.

La relevancia es práctica: LTX-Video es un modelo DiT de generación de vídeo con capacidad de image-to-video, y este pack permite desplegar su variante de 2B en entornos donde el checkpoint original no cabe. La licencia es "other" y remite a los términos upstream de LTX-Video, por lo que el uso comercial queda sujeto a dichos términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) 3D, 28 bloques, hidden size 2048 |
| Parametros totales | 1.922.039.808 pesos lineales (transformador de 2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits phi-lattice v2 (287/287 capas `nn.Linear`); normas y `scale_shift_table` en BF16 |
| Idiomas soportados | no disponible (modelo de video, no de texto) |
| Licencia | other (LTX-Video Open Weights License y ltx-video-2b-v0.9.5.license.txt) |
| Formato de pesos | `.pt` empaquetado (`ltx_video_2b_transformer_phi_v2_packed_4bit.pt`), cargable con `torch.load(weights_only=True)`; pipeline `diffusers` |

## Arquitectura y entrenamiento

El modelo subyacente es el transformador de difusión de LTX-Video, un DiT que opera sobre latentes de vídeo y que en esta variante de 2B consta de 28 bloques con tamaño oculto de 2048. El pack no reentrena ni afina el modelo: toma los pesos del subdirectorio `transformer/` de `Lightricks/LTX-Video` y los cuantiza. Las 287 capas lineales se empaquetan con la técnica phi-lattice v2, que requiere que la dimensión de entrada sea múltiplo de 64 (`K % 64 == 0`), condición que se cumple en todas ellas, incluida `proj_in` (`K=128`) y el MLP de timesteps. Las capas de normalización y la `scale_shift_table` se mantienen en BF16 para preservar estabilidad numérica.

La innovación técnica del artefacto es el esquema de compresión y su cargador: `phi_loader.py` ofrece tres modos de carga (`low_vram_4bit`, `unrolled_bf16` y `triton_4bit`), y el modo `triton_4bit` usa `phi_lut_gemm.py` para ejecutar la multiplicación de matrices directamente sobre los pesos empaquetados en CUDA mediante una LUT. La calidad de la cuantización se documenta con un SQNR de 19,15 dB frente a los pesos FP32 originales y un 14,51% de ceros exactos (278.876.464 elementos). No se especifican datos de entrenamiento propios ni procesos de RLHF/DPO, ya que no hay entrenamiento en este artefacto.

## Capacidades

- Generación de vídeo a partir de imagen (pipeline image-to-video), heredada del transformador LTX-Video de 2B.
- Generación de vídeo condicionada por texto a través del pipeline completo de LTX-Video (el pack solo contiene el transformador; el resto de componentes se toman del modelo base).
- Cuantización selectiva con preservación de capas críticas en BF16 (normas y tabla de escala/desplazamiento).
- Carga en memoria reducida: modo `low_vram_4bit` para GPUs con VRAM limitada.
- Ejecución acelerada en CUDA con kernels Triton mediante `phi_lut_gemm.py` (modo `triton_4bit`).
- Materialización directa en BF16 en el dispositivo destino (`unrolled_bf16`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Prototipado de image-to-video en estaciones de trabajo con GPU de consumo: el transformador de 2B cuantizado a 4 bits ocupa menos de 1 GiB residente, lo que permite cargarlo junto al VAE y el text encoder en GPUs de 8-12 GB.
- Generación de clips cortos para previsualización de anuncios o storyboards: se parte de una imagen fija y se anima con el pipeline LTX-Video, usando el pack para reducir el coste de memoria por instancia.
- Despliegue en entornos con presupuesto de VRAM ajustado: el modo `low_vram_4bit` permite mantener el transformador en memoria mientras se procesan lotes pequeños, sin recurrir a offload a CPU.
- Investigación sobre cuantización de modelos de difusión: el pack incluye métricas de SQNR y porcentaje de ceros que sirven para estudiar el impacto de la cuantización de 4 bits en la calidad de vídeo generado.
- Integración en pipelines `diffusers` existentes: al ser un derivado del `LTXVideoTransformer3DModel`, se puede sustituir el transformador original por el empaquetado manteniendo el resto del pipeline.
- Evaluación comparativa de esquemas de compresión: los tres modos de carga permiten medir latencia y calidad entre ejecución 4-bit con Triton, BF16 materializado y carga de bajo consumo de VRAM.
- Generación de vídeo en notebooks o entornos interactivos: el menor peso en disco (976,67 MiB) acelera la descarga y el arranque frente a los 7.339,07 MiB en FP32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de vídeo (FVD, CLIP score, etc.) en la información disponible. Los únicos datos cuantitativos publicados son métricas de compresión y fidelidad de pesos:

| Metrica | Valor |
|---|---|
| SQNR frente a pesos FP32 originales | 19,15 dB |
| Ceros exactos | 278.876.464 (14,51%) |
| Peso en disco | 976,67 MiB |
| Peso residente (`low_vram_4bit`) | 976,35 MiB |
| Reduccion frente a BF16 | 3,76x |
| Reduccion frente a FP32 | 7,51x |
| Capas lineales empaquetadas | 287/287 |
| Tamano del fichero de pesos | 1.024.108.304 bytes |
| SHA-256 | b11dabd468202b56e4e9272a809152b0a50185c88eb56dfac84c174eb0a9658d |

## Requisitos de hardware

- VRAM estimada para el transformador: aproximadamente 1 GiB en modo `low_vram_4bit` (976,35 MiB residentes), más el VAE y el text encoder del pipeline LTX-Video completo.
- En modo `unrolled_bf16` el transformador requiere unos 3.669,54 MiB, similar al checkpoint BF16 original.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB de VRAM para el pipeline completo en 4 bits; para el modo `triton_4bit` se requiere CUDA y Triton instalado.
- Cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4070 y RTX 4090, siempre que el resto del pipeline quepa en la VRAM restante.
- Opciones de despliegue: carga mediante `phi_loader.py` (incluido en el repo) sobre `diffusers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ltx-video-2b-phi-lattice-v2` (este pack) | 1,92B lineales (transformador) | no disponible | Cuantizacion 4-bit de LTX-Video 2B | other (LTX-Video Open Weights) | Hugging Face, diffusers |
| `Lightricks/LTX-Video` (2B, original) | 1,92B lineales (transformador) | no disponible | DiT de generacion de video | other (LTX-Video Open Weights) | Hugging Face, GitHub |
| Wan 2.2 | no disponible en la informacion | no disponible | Generacion de video open source | no disponible en la informacion | open source |
| HunyuanVideo | no disponible en la informacion | no disponible | Generacion de video open source | no disponible en la informacion | open source |

La comparativa directa más relevante es con el checkpoint original de LTX-Video 2B: mismo transformador, misma licencia, pero el pack reduce el peso del transformador de 7.339,07 MiB (FP32) a 976,67 MiB. Frente a Wan 2.2 y HunyuanVideo no se dispone de datos de parámetros, contexto ni rendimiento en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo completo: solo contiene el transformador cuantizado; requiere el resto de componentes del pipeline LTX-Video (VAE, text encoder, scheduler) para generar vídeo.
- La cuantización introduce pérdida de fidelidad: SQNR de 19,15 dB frente a FP32, lo que puede degradar la calidad visual frente al modelo original.
- El 14,51% de ceros exactos implica que parte de los pesos se anulan, con posible impacto en detalles finos de los vídeos generados.
- Solo cubre el checkpoint de 2B; los checkpoints de 13B del repositorio upstream no están incluidos en este pack.
- Licencia "other": el uso comercial queda sujeto a la LTX-Video Open Weights License y a `ltx-video-2b-v0.9.5.license.txt`; es necesario revisar ambos textos antes de desplegar en producción.
- El modo `triton_4bit` depende de CUDA y Triton; no hay soporte documentado para CPU ni para otras APIs de aceleración.
- No se documentan sesgos, idiomas ni riesgos de alucinación específicos, ya que es un modelo de generación de vídeo y no de texto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni evidencia de uso en producción.
- El campo "idiomas" no está disponible; la generación de vídeo no se evalúa por idioma, pero el condicionamiento textual dependerá del text encoder del pipeline base.

## Enlaces

- Hugging Face: https://huggingface.co/ununununununununununununununununununun/ltx-video-2b-phi-lattice-v2
- Modelo base: https://huggingface.co/Lightricks/LTX-Video
- Repositorio oficial de LTX-Video: https://github.com/Lightricks/LTX-Video
- Comparativa de modelos open source de vídeo (2026): https://www.sevenlabs.site/blogs/best-open-source-video-generation-models-2026
