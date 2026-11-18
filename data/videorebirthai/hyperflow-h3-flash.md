# VideoRebirthAI/hyperflow-h3-flash

## Resumen

HyperFlow H3 Flash es una versión comprimida y de pocos pasos (*few-step*) del modelo MiniMax-H3, desarrollada por Video Rebirth. Genera de forma conjunta vídeo y audio estéreo sincronizado a partir de texto, una imagen de referencia o un primer/último fotograma. El modelo mantiene la arquitectura transformer del MiniMax-H3 original (~31B parámetros) pero la reduce a 13,7B (`fl2va`) o 13,9B (`ref2va`), menos de la mitad, lo que permite ejecutarlo en GPUs de consumo.

La propuesta de valor es doble: por un lado, la compresión del transformer y el entrenamiento *few-step* (4, 6 u 8 pasos sin classifier-free guidance) reducen drásticamente el coste de inferencia; por otro, la disponibilidad de pesos en INT8 y GGUF (desde `Q3_K_M` de 7,2 GB hasta `Q8_0` de 15,2 GB) lo hace viable en tarjetas de 24 y 32 GB con 16 GB de RAM de sistema. Un clip de 5,2 s a 6 pasos se genera en 8,7 s sobre 4× B200, 36 s sobre una H200 y 92 s sobre una RTX 5090.

Es relevante ahora porque combina generación audio-vídeo sincronizada, licencia comunitaria de MiniMax y un ecosistema de despliegue amplio (ComfyUI, `stable-diffusion.cpp`, Unsloth Studio, `diffusers`), además de soporte de aceleración en tiempo real mediante NVIDIA SOL-H3 sobre GPUs Blackwell.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (derivado de MiniMax-H3), variantes `fl2va` y `ref2va` |
| Parámetros totales | 13.946.322.616 (13,9B); 13,7B en `fl2va`, 13,9B en `ref2va` |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, INT8 (W8A8 + low-rank), GGUF de `Q3_K_M` a `Q8_0` (6 niveles) |
| Idiomas soportados | en, zh |
| Licencia | minimax-h3-community-license-agreement (restricciones territoriales: UE, Reino Unido, Corea del Sur y EE. UU. sin autorización previa de MiniMax) |
| Formato de pesos | safetensors (BF16 e INT8), GGUF |
| Salida | Vídeo de 5,2 a 15 s a 24 fps (1344×768 por defecto) + audio estéreo a 32 kHz |
| Pasos de muestreo | 4, 6 u 8 sin CFG (por defecto 6) |
| Tamaño del repo | 243,1 GB |

## Arquitectura y entrenamiento

HyperFlow H3 Flash es una destilación/comprresión del transformer de MiniMax-H3, un modelo de difusión para generación conjunta de vídeo y audio. El repositorio contiene únicamente los transformers comprimidos (`transformer` para `fl2va`, `transformer_ref` para `ref2va`); el text encoder, el VAE de vídeo, el VAE de audio, el tokenizer y el processor se cargan desde los repositorios upstream (`MiniMaxAI/MiniMax-H3` o `Qwen/Qwen3-VL-32B-Instruct-FP8` para el encoder en FP8).

La innovación principal es el entrenamiento *few-step* que permite muestrear en 4, 6 u 8 pasos sin classifier-free guidance, frente a los pipelines de difusión convencionales que requieren decenas de pasos y doble forward por CFG. El modelo soporta tres tareas: `t2va` (texto a vídeo+audio), `fl2va` (primer fotograma o primer+último fotograma a vídeo+audio) y `ref2va` (hasta 12 referencias). No se dispone de información sobre el número de tokens de entrenamiento ni la composición exacta del dataset en la información proporcionada.

## Capacidades

- Generación de vídeo con audio estéreo sincronizado a partir de texto (`t2va`).
- Generación condicionada por primer fotograma o por primer y último fotograma (`fl2va`).
- Generación con hasta 12 referencias de imagen, vídeo y audio (`ref2va`; en GGUF y ComfyUI INT8 solo imágenes).
- Muestreo *few-step* en 4, 6 u 8 pasos sin CFG.
- Soporte multilingüe de prompts en inglés y chino.
- Integración con ComfyUI (plantillas `hyperflow_t2v`, `hyperflow_i2v`, `hyperflow_flf2v`, `hyperflow_ref2v` y variantes `*_int8`).
- Compatibilidad con `stable-diffusion.cpp`, Unsloth Studio, `diffusers` y CLI propio.
- Aceleración en tiempo real sobre 4× GPUs Blackwell mediante NVIDIA SOL-H3.
- No se documenta soporte de tool calling ni de agentes; es un modelo generativo de medios, no un LLM conversacional.

## Casos de uso

- **Generación de clips publicitarios cortos:** con `t2va` se producen vídeos de 5,2 a 15 s a 1344×768 con banda sonora estéreo en una sola pasada, útil para prototipado rápido de creatividades.
- **Animar storyboards e ilustraciones:** `fl2va` permite partir de un keyframe existente y animarlo manteniendo coherencia con el primer fotograma, ideal para previsualización de animación.
- **Interpolación de fotogramas clave:** la variante primer+último fotograma genera la transición intermedia, aplicable a montaje y efectos.
- **Personalización con referencias de personaje:** `ref2va` con hasta 12 referencias (imágenes, vídeo y audio en Python) permite mantener identidad visual y de voz en distintas tomas.
- **Doblaje y sincronización audio-vídeo:** el audio estéreo a 32 kHz generado junto al vídeo sirve para prototipos de contenido narrado sin pipeline separado de TTS.
- **Despliegue en estaciones de trabajo con GPU de consumo:** los GGUF `Q4_K_M` (9,1 GB) y `Q8_0` (14,9 GB) permiten ejecutar el modelo en RTX de 24 y 32 GB con 16 GB de RAM, útil para estudios pequeños y creadores individuales.
- **Investigación en generación audio-vídeo:** el paquete Python INT8 convrot sobre H100/H200/B200/B300 facilita experimentación a escala en centros de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FVD, CLIP score, etc.) en la información disponible. Sí se documentan métricas de velocidad:

| Escenario | Clip 5,2 s, 6 pasos |
|---|---|
| 4× B200 | 8,7 s |
| 1× H200 | 36 s |
| 1× RTX 5090 | 92 s |
| 4× Blackwell (SOL-H3) | tiempo real |

## Requisitos de hardware

- **VRAM estimada:** `Q4_K_M` ocupa 9,1 GB; `Q8_0`, 14,9 GB; INT8 convrot, ~16 GB; BF16, 27,4 GB (`fl2va`) / 27,9 GB (`ref2va`).
- **GPU de consumo:** medido en RTX de 24 GB y 32 GB con 16 GB de RAM de sistema; las de 16 GB no se han medido.
- **GPU de centro de datos:** H100, H200, B200 y B300 (1 a 8 GPUs) para INT8 convrot.
- **RAM de sistema:** 16 GB+ en ComfyUI; paquete Python ~16 GiB sin offload, ≥69 GiB (text encoder FP8) o ≥91 GiB (BF16) con offload.
- **Despliegue:** ComfyUI, `stable-diffusion.cpp`, Unsloth Studio, `diffusers`, CLI `hyperflow-h3-flash`.
- **Latencia/throughput:** ver tabla de benchmarks (8,7 s en 4× B200; 92 s en RTX 5090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperFlow H3 Flash | 13,7–13,9B | no disponible | vídeo + audio estéreo | MiniMax H3 Community (restringida por territorio) | HF, ComfyUI, GGUF, INT8 |
| MiniMax-H3 (base) | ~31B | no disponible | vídeo + audio | MiniMax H3 Community | HF |
| HyperFlow (LoRA 8 pasos sobre MiniMax-H3) | ~31B (base) | no disponible | vídeo + audio | MiniMax H3 Community | HF |

No se dispone de datos de benchmarks comparativos de calidad entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Restricciones de licencia:** la MiniMax H3 Community License Agreement no autoriza el uso en la UE, Reino Unido, Corea del Sur ni EE. UU. sin autorización previa de MiniMax. Incluye una política de uso aceptable. No es un producto oficial de MiniMax.
- **Idiomas:** solo inglés y chino; el rendimiento en otros idiomas no está documentado.
- **`ref2va` limitado en GGUF y ComfyUI INT8:** solo acepta imágenes como referencia; vídeo y audio requieren el paquete Python INT8.
- **Duración acotada:** clips de 5,2 a 15 s; no está pensado para vídeo largo.
- **Requisitos de RAM:** el paquete Python con offload exige ≥69 GiB (FP8) o ≥91 GiB (BF16) de RAM de sistema.
- **GPUs de 16 GB:** no medidas, por lo que su viabilidad es incierta.
- **Riesgo de alucinación visual y artefactos:** no se documentan sesgos ni tasas de error; como modelo generativo, puede producir contenido incoherente o no fiel al prompt.
- **BF16 no es formato de generación:** solo sirve para re-cuantizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA HyperFlow (8 pasos sobre MiniMax-H3): https://huggingface.co/VideoRebirthAI/hyperflow
- GitHub HyperFlow H3 Flash: https://github.com/Video-Rebirth/hyperflow-h3-flash
- GitHub HyperFlow: https://github.com/Video-Rebirth/hyperflow
- NVIDIA SOL-H3: https://github.com/NVlabs/Sana/tree/sol-engine/models/minimax_h3/HyperFlow-Flash
- Showcase: https://www.videorebirth.com/lp/hyperflow-flash
- Web de Video Rebirth: https://www.videorebirth.com/
- Text encoder alternativo FP8: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct-FP8
