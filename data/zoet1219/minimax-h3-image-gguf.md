# ZOET1219/MiniMax-H3-Image-GGUF

## Resumen

MiniMax-H3-Image es un modelo de generación y edición de imágenes de tipo Diffusion Transformer (DiT) de un solo flujo, desarrollado por MiniMaxAI. El checkpoint original cuenta con 33.100 millones de parámetros (según la model card) y está diseñado para generación texto-a-imagen de altísima resolución y edición multi-referencia de hasta 16 MP (4096 × 4096) en tan solo 6 pasos de muestreo destilados. Emplea una arquitectura de difusión destilada denominada Piecewise Decoupled Diffusion (PDD) y un VAE de imagen de 24 canales con decodificador ViT 2D.

La ficha que nos ocupa, ZOET1219/MiniMax-H3-Image-GGUF, es una conversión a GGUF de los pesos podados estructuralmente (pruned) del checkpoint BF16 maestro publicado por Comfy-Org. El repositorio incluye cinco niveles de cuantización (Q2_K a Q5_K_M) pensados para ejecutarse en ComfyUI mediante el nodo Unet Loader (GGUF) de ComfyUI-GGUF, con soporte nativo de la cabecera de configuración PDD de 6 pasos.

La relevancia de esta conversión radica en que reduce un modelo de más de 20.000 millones de parámetros reales (según safetensors) a ficheros de entre 6,88 GB y 14,10 GB, permitiendo su uso en GPUs de consumo. Las capas sensibles (patchifier de entrada, cabeza de salida PDD y bases de modulación AdaLN) se conservan íntegras en FP32 sin cuantizar para evitar artefactos de rejilla y ruido de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de un solo flujo, destilado con Piecewise Decoupled Diffusion (PDD) |
| Parámetros totales | 20.113.670.232 (safetensors del repo GGUF); la model card del modelo base declara 33,1B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; el text encoder Qwen3-VL-32B lee estados ocultos de la capa 50) |
| Tipos de cuantización | Q2_K, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M (capas sensibles en FP32) |
| Idiomas soportados | inglés (en) |
| Licencia | minimax-h3-image-community-license-agreement (other) |
| Formato de pesos | GGUF (repo de 53,1 GB); el modelo base en safetensors BF16 podado |

## Arquitectura y entrenamiento

El modelo base es un Diffusion Transformer de un solo flujo con un VAE de imagen dedicado de 24 canales latentes y decodificador ViT 2D. La generación se realiza en 6 pasos de muestreo mediante cabezas PDD (Piecewise Decoupled Diffusion) fusionadas y calibradas específicamente para ese número de pasos, con CFG fijo a 1.0 (sin classifier-free guidance). El text encoder es Qwen3-VL-32B, del que se leen los estados ocultos de la capa 50.

Esta conversión parte del checkpoint BF16 podado estructuralmente publicado por Comfy-Org (`minimax_h3_image_pruned_bf16.safetensors`). En el proceso de cuantización se preservan en FP32 sin cuantizar tres grupos de capas sensibles: el patchifier de entrada de 24 canales (`video_patch_proj`), la cabeza de salida PDD de 6 pasos (`final_layer`) y la base de modulación AdaLN de bajo rango (`adaln_basis` / `adaln_t_table`). Los ficheros GGUF incluyen metadatos de configuración embebidos (`pdd_sigmas`, esquema de 6 pasos) que permiten su carga nativa en ComfyUI-GGUF. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación texto-a-imagen (text-to-image) de alta resolución, hasta 16 MP (4096 × 4096).
- Edición de imagen (image-editing) y transformación imagen-a-imagen (image-to-image).
- Edición multi-referencia con hasta 16 referencias de imagen.
- Inferencia destilada en exactamente 6 pasos de muestreo con sampler `euler` y scheduler `simple` o `sgm_uniform`.
- Integración nativa con ComfyUI mediante el nodo Unet Loader (GGUF) de ComfyUI-GGUF.
- Soporte de texto en inglés como único idioma declarado.
- No se declara soporte de tool calling, agentes ni modos de razonamiento multi-paso (es un modelo de difusión de imagen, no un LLM).

## Casos de uso

- Generación de ilustraciones de alta resolución para producción editorial: el modelo permite obtener imágenes de hasta 4096 × 4096 en 6 pasos, lo que reduce el coste computacional frente a modelos de difusión de 20-50 pasos y encaja en flujos de trabajo por lotes.
- Edición multi-referencia de producto: con soporte de hasta 16 imágenes de referencia, se puede mantener la identidad de un producto o personaje a través de variaciones de escena, útil en catálogos de e-commerce.
- Prototipado rápido en estaciones de trabajo con GPU de consumo: la variante Q4_K_M (11,60 GB) cabe en GPUs de 16 GB de VRAM, permitiendo iterar localmente sin depender de servicios en la nube.
- Integración en pipelines de ComfyUI para diseño gráfico: el workflow de ejemplo incluido (`image_minimax_h3_image_t2i_gguf.json`) permite arrancar un flujo texto-a-imagen con los tres componentes requeridos (DiT, VAE y text encoder) sin scripts personalizados.
- Restauración y repintado de imágenes de gran formato: la ventana de 16 MP y el VAE de 24 canales permiten trabajar sobre detalles finos en imágenes de alta resolución sin reescalado previo.
- Despliegue en portátiles y GPUs de gama de entrada: la variante Q2_K (6,88 GB) está pensada para GPUs de 8-10 GB de VRAM, habilitando generación de imágenes en hardware modesto.
- Investigación sobre cuantización de DiT: la preservación selectiva en FP32 de capas sensibles ofrece un caso de estudio reproducible sobre el impacto de la cuantización en la calidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (según la model card):
  - Q2_K: 6,88 GB de fichero, 8-10 GB de VRAM.
  - Q3_K_M: 8,91 GB de fichero, 12 GB de VRAM.
  - Q4_K_S: 11,60 GB de fichero, 12-16 GB de VRAM.
  - Q4_K_M: 11,60 GB de fichero, 16 GB de VRAM (recomendado).
  - Q5_K_M: 14,10 GB de fichero, 16-24 GB de VRAM.
- Además del DiT se requiere el VAE de imagen FP16 de 24 canales y el text encoder Qwen3-VL-32B (GGUF Q4_K_M de 14,6 GB o Q3_K_M de 12 GB, o alternativas NVFP4/AWQ/INT8 en safetensors), lo que incrementa sustancialmente el consumo total de VRAM.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; las indicaciones se expresan únicamente en rangos de VRAM.
- Cabe en GPU de consumo: sí, al menos la variante Q2_K en GPUs de 8-10 GB y Q4_K_M en GPUs de 16 GB (junto con los componentes auxiliares).
- Opciones de despliegue: ComfyUI v0.45.0 o superior con ComfyUI-GGUF (nodo Unet Loader (GGUF)); se incluye un script opcional de compatibilidad (`minimax_h3_image_gguf_fix.py`) para versiones antiguas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/resolución | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image (esta conversión GGUF) | 20,1B (safetensors); 33,1B declarados en model card | 16 MP (4096 × 4096) | 6 (PDD destilado) | minimax-h3-image-community-license-agreement | GGUF en Hugging Face |
| MiniMax-H3-Image (base BF16 podado, Comfy-Org) | 33,1B declarados | 16 MP (4096 × 4096) | 6 | minimax-h3-image-community-license-agreement | safetensors BF16 en Hugging Face |
| Otras alternativas de DiT texto-a-imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en otros idiomas no está documentado.
- La licencia es la minimax-h3-image-community-license-agreement, no una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- El modelo está calibrado para exactamente 6 pasos de muestreo con CFG 1.0; usar otros valores de pasos, CFG o prompts negativos puede degradar la calidad de forma significativa.
- No se debe emplear el VAE estándar de 4 canales de SD/Flux ni el VAE de vídeo de 16 canales de versiones anteriores de H3; se requiere el VAE de imagen de 24 canales.
- La cuantización, aunque preserva capas sensibles en FP32, puede introducir pérdida de calidad en las variantes de menor bit depth (Q2_K, Q3_K_M); la model card solo califica Q5_K_M como indistinguible de BF16.
- Riesgo de alucinación visual y sesgos: no se documentan en la información disponible; como modelo generativo de imagen, está sujeto a los sesgos de sus datos de entrenamiento, no especificados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- El tamaño del repo (53,1 GB) incluye todas las cuantizaciones; la descarga individual de cada fichero es mucho menor.
- No se dispone de información sobre latencia, throughput ni requisitos de GPU concretos más allá de los rangos de VRAM.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ZOET1219/MiniMax-H3-Image-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Checkpoint BF16 podado (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- VAE oficial FP16: https://huggingface.co/Comfy-Org/MiniMax-H3-Image/tree/main/vae
- Text encoders oficiales: https://huggingface.co/Comfy-Org/MiniMax-H3-Image/tree/main/text_encoders
- Text encoder GGUF Q4_K_M (Abiray): https://huggingface.co/Abiray/MiniMax-H3-GGUF/blob/main/text_encoders/qwen3vl_32b_minimax_h3-Q4_K_M.gguf
- Text encoder GGUF Q3_K_M (Abiray): https://huggingface.co/Abiray/Qwen3-VL-32B-Instruct-GGUF/blob/main/Qwen3vl_32b_h3-Q3_K_M.gguf
- Workflow de ejemplo ComfyUI: https://huggingface.co/Abiray/MiniMax-H3-Image-GGUF/blob/main/image_minimax_h3_image_t2i_gguf.json
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
