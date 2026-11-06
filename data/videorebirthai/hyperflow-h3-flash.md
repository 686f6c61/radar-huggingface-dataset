# VideoRebirthAI/hyperflow-h3-flash

## Resumen

HyperFlow H3 Flash es una versión comprimida y de pocos pasos de MiniMax-H3, el modelo de generación conjunta de vídeo y audio de MiniMax. Lo desarrolla Video Rebirth, que no es el autor original del modelo base sino un tercero que lo destila y cuantiza; el repositorio lo declara explícitamente como "no un producto oficial de MiniMax". El modelo resuelve el problema del coste de inferencia del H3 original: reduce el transformer de ~31B a 13,7B (`fl2va`) o 13,9B (`ref2va`) parámetros y permite generar clips con 4, 6 u 8 pasos sin classifier-free guidance, lo que lo hace viable en GPUs de consumo.

La arquitectura subyacente es un transformer de difusión para generación audio-vídeo, con un text encoder Qwen3-VL-32B, un VAE de vídeo y un VAE de audio. Genera clips de 5,2 a 15 segundos a 24 fps (1344×768 por defecto) con pista estéreo a 32 kHz. Su relevancia actual radica en que cabe en 24 GB de VRAM con cuantización `Q4_K_M` (9,1 GB), con un mínimo de 16 GB de RAM de sistema, y mantiene el soporte de tareas texto-a-vídeo-audio, imagen-a-vídeo-audio y referencia-a-vídeo-audio.

El modelo se distribuye en dos formatos: GGUF (para ComfyUI, Unsloth Studio y stable-diffusion.cpp) e INT8 convrot (para el CLI oficial y diffusers). La licencia es la MiniMax H3 Community License Agreement, que restringe territorios y usos, un punto crítico para cualquier despliegue comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión audio-vídeo (few-step, sin CFG) |
| Parámetros totales | 13.946.322.616 (13,9B); 13,7B en la variante `fl2va` |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: `Q3_K_M`, `Q4_K_S`, `Q4_K_M`, `Q5_K_M`, `Q6_K`, `Q8_0`; INT8 convrot (W8A8 + low-rank) |
| Idiomas soportados | en, zh |
| Licencia | minimax-h3-community-license-agreement (other) |
| Formato de pesos | safetensors (INT8 convrot) y GGUF |

## Arquitectura y entrenamiento

El modelo es una destilación de pocos pasos del transformer de MiniMax-H3. Video Rebirth comprime el transformer original de ~31B parámetros a menos de la mitad (13,7B en `fl2va`, 13,9B en `ref2va`) y lo entrena para funcionar con 4, 6 u 8 pasos de muestreo sin classifier-free guidance, con 6 pasos como valor por defecto. El repositorio almacena únicamente los transformers comprimidos; el text encoder (Qwen3-VL-32B), el VAE de vídeo, el VAE de audio, el tokenizer y el processor se cargan desde los repositorios upstream de MiniMax o Comfy-Org según el runtime.

La innovación técnica principal es la reducción del número de pasos de difusión y la compresión del transformer, que permiten inferencia en GPUs de consumo. No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO. La variante INT8 convrot usa cuantización W8A8 con componentes de bajo rango (~16 GB). Existe además un LoRA de 8 pasos para el transformer completo de MiniMax-H3 en el repositorio `VideoRebirthAI/hyperflow`, y el motor NVIDIA SOL-H3 da soporte de inferencia en tiempo real sobre 4 GPUs de la serie B.

## Capacidades

- Generación conjunta de vídeo y audio estéreo sincronizado a 32 kHz.
- Texto-a-vídeo-audio (`t2va`): genera clip a partir de un prompt de texto.
- Imagen-a-vídeo-audio (`fl2va`): acepta primer keyframe, o primer y último keyframe.
- Referencia-a-vídeo-audio (`ref2va`): acepta hasta 12 referencias; en INT8 admite imágenes, vídeos y audio, en GGUF solo imágenes.
- Muestreo de pocos pasos (4, 6 u 8) sin classifier-free guidance.
- Salida de 5,2 a 15 segundos a 24 fps, 1344×768 por defecto.
- Soporte multilingüe limitado a inglés y chino.
- Integración con ComfyUI (plantillas `hyperflow_t2v`, `hyperflow_i2v`, `hyperflow_flf2v`, `hyperflow_ref2v`), Unsloth Studio, stable-diffusion.cpp y diffusers.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo generativo de medios, no un LLM conversacional.

## Casos de uso

- Generación de clips publicitarios cortos: con `t2va` y 6 pasos se producen vídeos de 5,2 s con audio sincronizado en 36 s sobre una H200, adecuado para iterar creatividades rápidamente.
- Prototipado de storyboards animados: `fl2va` con primer y último keyframe permite interpolar entre dos fotogramas de referencia manteniendo coherencia temporal y audio.
- Creación de contenido para redes sociales en GPU de consumo: con `Q4_K_M` (9,1 GB) corre en RTX de 24 GB, lo que permite generar clips en un PC con 16 GB de RAM de sistema.
- Doblaje y sincronización audio-vídeo: la generación conjunta de pista estéreo a 32 kHz evita el paso separado de síntesis de audio y alineación.
- Vídeo de referencia a partir de material existente: `ref2va` en INT8 acepta hasta 12 referencias de imagen, vídeo y audio para guiar el estilo y el contenido del clip generado.
- Integración en pipelines de ComfyUI: las plantillas y los GGUF permiten encadenar el modelo con otros nodos de postproceso, escalado o composición sin escribir código.
- Aceleración en data center: con NVIDIA SOL-H3 sobre 4 GPUs B-series se alcanza inferencia en tiempo real para generación de clips de 5,2 s.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son tiempos de inferencia para un clip de 5,2 s con 6 pasos:

| Hardware | Tiempo de generación (5,2 s, 6 pasos) |
|---|---|
| 4× B200 | 8,7 s |
| 1× H200 | 36 s |
| 1× RTX 5090 | 92 s |

No se dispone de cifras de MMLU, HumanEval, GSM8K ni métricas de calidad de vídeo (FVD, CLIP score) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: `Q3_K_M` 7,2 GB; `Q4_K_S` 8,0 GB; `Q4_K_M` 9,1 GB; `Q5_K_M` 10,3 GB; `Q6_K` 11,6 GB; `Q8_0` 14,9 GB; INT8 convrot ~16 GB.
- RAM de sistema: 16 GB mínimo con GGUF; ~16 GiB sin offload con INT8; ≥ 69 GiB con offload y text encoder `fp8`; ≥ 91 GiB con `bf16`.
- GPUs recomendadas: H100, H200, B200, B300 (1 a 8 GPUs) para INT8; RTX de 24 GB y 32 GB medidas para ambos formatos. Las GPUs de 16 GB no están medidas.
- Cabe en GPU de consumo: sí, en RTX de 24 GB con `Q4_K_M` (9,1 GB) y 16 GB de RAM de sistema.
- Opciones de despliegue: CLI `hyperflow-h3-flash` (Python), diffusers, ComfyUI, Unsloth Studio, stable-diffusion.cpp.
- Latencia y throughput: 8,7 s en 4× B200, 36 s en 1× H200 y 92 s en 1× RTX 5090 para un clip de 5,2 s a 6 pasos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HyperFlow H3 Flash | 13,7B / 13,9B | no disponible | MiniMax H3 Community License | HF, GGUF, INT8 |
| MiniMax-H3 (base) | ~31B | no disponible | MiniMax H3 Community License | HF oficial |
| HyperFlow (LoRA 8 pasos sobre H3) | ~31B (base) | no disponible | MiniMax H3 Community License | HF, GitHub |

La comparación se limita a las variantes del mismo linaje porque la información disponible no incluye otros modelos de generación audio-vídeo comparables con datos verificables. HyperFlow H3 Flash reduce a menos de la mitad los parámetros del H3 base y permite pocos pasos sin CFG, mientras que el LoRA HyperFlow mantiene el transformer completo y requiere más VRAM.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License Agreement restringe el territorio: no está licenciado en la UE, Reino Unido, Corea del Sur ni EE. UU. sin autorización previa de MiniMax. Esto afecta directamente a despliegues comerciales en España.
- Incluye una Acceptable Use Policy que condiciona los usos permitidos.
- El repositorio no es un producto oficial de MiniMax; el soporte y las garantías dependen de Video Rebirth.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Riesgo de alucinación visual y de desalineación entre audio y vídeo inherente a los modelos generativos; no se publican métricas de calidad en la información disponible.
- En GGUF, `ref2va` solo acepta imágenes como referencia; vídeo y audio requieren INT8.
- Las GPUs de 16 GB no han sido medidas; el rendimiento en ese rango es desconocido.
- Sesgos conocidos: no documentados en la información proporcionada.
- El repo ocupa 155,4 GB, lo que exige planificación de almacenamiento aunque solo se descargue una cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA HyperFlow (8 pasos sobre H3): https://huggingface.co/VideoRebirthAI/hyperflow
- GitHub del LoRA HyperFlow: https://github.com/Video-Rebirth/hyperflow
- GitHub de HyperFlow H3 Flash (código, guías, workflows ComfyUI): https://github.com/Video-Rebirth/hyperflow-h3-flash
- Showcase de ejemplos generados: https://www.videorebirth.com/lp/hyperflow-flash
- Web de Video Rebirth: https://www.videorebirth.com/
- NVIDIA SOL-H3 (aceleración de inferencia): https://github.com/NVlabs/Sana/tree/sol-engine/models/minimax_h3/HyperFlow-Flash
- Text encoder Qwen3-VL-32B FP8: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct-FP8
- VAE y text encoders para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
- GGUF de MiniMax-H3 para Unsloth Studio: https://huggingface.co/unsloth/MiniMax-H3-GGUF
