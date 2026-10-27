# yuanhaiguang/MiniMax-H3-Ref2VA-RunPod-4files

## Resumen

MiniMax-H3 es un modelo generativo de difusion omni-modal orientado a la sintesis de video con audio. Este repositorio, `yuanhaiguang/MiniMax-H3-Ref2VA-RunPod-4files`, no es el modelo original: es un reempaquetado no oficial de los pesos en formato single-file para ComfyUI, preparado por el usuario `yuanhaiguang` para desplegar la variante Ref2VA (reference-to-video + audio) en RunPod. El modelo base es `MiniMaxAI/MiniMax-H3`, publicado por MiniMax, y la distribucion se acoge a la `minimax-h3-community-license-agreement`.

La relevancia de este repositorio es practica: agrupa en un solo paquete los pesos de difusion en varias cuantizaciones (bf16, int8_convrot, fp8_scaled, w6a8 podado), el codificador de texto Qwen3-VL-32B en tres formatos, los VAE de video y audio, LoRAs turbo de 4 y 8 pasos, un ControlNet Union y diez embeddings de estilo. Con 525,2 GB de tamano total, el repo esta pensado para entornos con GPU de datacenter, no para equipos de consumo sin offloading agresivo.

No se dispone de informacion sobre el numero de parametros, la arquitectura interna detallada ni resultados de benchmarks en la documentacion proporcionada. El interes inmediato para desarrolladores es la disponibilidad de flujos de trabajo oficiales de ComfyUI para texto-a-video, imagen-a-video, referencia-a-video y continuacion de video, ademas del soporte de audio generado de forma nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion omni-modal de video y audio; detalles internos no publicados en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana de contexto no aplica como en un LLM) |
| Tipos de cuantizacion | Difusion: bf16, int8_convrot, fp8_scaled, w6a8 (variantes pruned). Text encoder: bf16, int8_convrot, nvfp4_awq. VAE de video: int8_convrot. VAE de audio: fp32 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (single-file para ComfyUI) |
| Tamano del repositorio | 525,2 GB |
| Variantes del modelo | ref2va y fl2va, cada una en bf16, int8_convrot, pruned_bf16, pruned_int8_convrot, pruned_w6a8 y pruned_fp8_scaled |
| Codificador de texto | Qwen3-VL-32B adaptado (bf16, int8_convrot, nvfp4_awq) |
| VAE | Video (`minimax_h3_video_vae_int8_convrot`) y audio (`minimax_h3_audio_vae_fp32`) |
| LoRAs incluidos | Turbo 4 pasos (fl2v, 768p), turbo 8 pasos (fl2v), turbo 4 pasos (ref2v, v0.1) |
| Extras | ControlNet Union podado (bf16 e int8_convrot) y 10 embeddings de estilo/efecto |
| Libreria declarada | diffusion-single-file (ComfyUI) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo de difusion (tipo de backbone, numero de bloques, mecanismo de atencion ni estrategia de compresion temporal). Lo que si se deduce de los archivos publicados es una topologia de tres componentes: un difusion transformer o equivalente que opera en el espacio latente, un codificador de texto basado en Qwen3-VL-32B (modelo vision-lenguaje, lo que habilita la entrada de imagenes de referencia y texto), y dos VAE separados, uno para video y otro para audio. La generacion conjunta de video y audio en un mismo pipeline es la caracteristica diferencial del modelo frente a generadores de video puramente visuales.

El repositorio no incluye informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones de decodificacion. Los unicos elementos de optimizacion descritos son de naturaleza practica: las LoRAs turbo reducen la inferencia a 4 u 8 pasos, el ControlNet Union podado anade control estructural, y las cuantizaciones `int8_convrot`, `fp8_scaled`, `w6a8` y `nvfp4_awq` reducen el peso en VRAM. Cabe destacar que, segun la model card, el text encoder en `nvfp4` no requiere GPU Blackwell, y que se recomienda `int8_convrot` cuando se dispone de PyTorch con CUDA 13.0.

## Capacidades

- Generacion de video a partir de texto (text-to-video), con audio sintetizado de forma conjunta.
- Generacion de video a partir de una imagen (image-to-video), con flujos de trabajo oficiales de ComfyUI.
- Referencia a video (reference-to-video): la variante Ref2VA de este repositorio, orientada a mantener la identidad o el estilo de una referencia visual.
- Generacion first-last frame to video+audio (FL2VA) en las variantes `fl2va` incluidas.
- Continuacion de video: existe un flujo de trabajo `i2v_continuation` para extender secuencias existentes.
- Generacion de audio asociada al video mediante un VAE de audio dedicado en fp32.
- Control estructural mediante ControlNet Union podado (pose, profundidad u otras senales, segun el modelo base).
- Estilizado y efectos mediante diez embeddings invocables desde el prompt (`embedding:minimaxh3_...`), como `art_is_explosion`, `bullet_time`, `four_seasons`, `storm_magic` o `truman_show`.
- Aceleracion por LoRA turbo: inferencia en 4 u 8 pasos en lugar del muestreo completo.
- Comprension de instrucciones e imagenes por parte del text encoder Qwen3-VL-32B, lo que permite prompts largos y con contenido visual.

## Casos de uso

- Publicidad de producto con personaje consistente: usando Ref2VA, se toma una imagen de referencia del producto o del modelo y se generan varias tomas manteniendo la identidad visual entre clips, con audio sincronizado para evitar una segunda fase de produccion sonora.
- Prototipado rapido de storyboards animados: a partir de un guion y una o dos imagenes clave, se generan previz de 4 a 8 pasos con las LoRAs turbo para iterar sobre el montaje antes de producir en alta calidad.
- Localizacion y doblaje de contenido: la generacion conjunta de audio y video permite producir variantes de un anuncio o clip formativo con locucion integrada, apoyandose en el VAE de audio del propio modelo.
- Contenido para redes sociales a escala: pipelines automatizados en ComfyUI que consumen una cola de imagenes de referencia y producen clips verticales con efectos preconfigurados mediante los embeddings incluidos (`bullet_time`, `blooming_flowers`, etc.).
- Extension de metraje existente: el flujo de continuacion de imagen a video permite alargar un plano ya generado o grabado, util en postproduccion para cubrir huecos de montaje sin reshoots.
- E-learning y tutoriales tecnicos: generacion de demostraciones animadas a partir de una imagen de referencia del producto o del entorno, con narracion sintetizada, para cursos que no justifican una grabacion presencial.
- Previsualizacion de VFX en cine y animacion: aplicar el ControlNet Union podado para imponer una estructura de movimiento (por ejemplo, una silueta o un blocking) y validar la composicion antes de pasar a render final.
- Investigacion en generacion multimodal: banco de pruebas para estudiar coherencia audio-video, sesgos en la generacion de personas y evaluacion de cuantizaciones sobre calidad perceptual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 525,2 GB, pero el conjunto minimo para Ref2VA son cuatro archivos (difusion, text encoder, VAE de video y VAE de audio). En bf16, solo el text encoder Qwen3-VL-32B ronda los 64 GB, por lo que la pila completa en bf16 supera con holgura los 80 GB y requiere offloading a RAM o disco, o bien multi-GPU.
- Configuracion recomendada: GPU de datacenter tipo A100 80 GB, H100 80 GB o multiples GPU. Para el text encoder, la variante `nvfp4_awq` (aproximadamente 16-20 GB) o `int8_convrot` (aproximadamente 32 GB) reducen de forma sustancial el pico de memoria.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en bf16 sin offloading. Con diffusion en `pruned_int8_convrot` o `pruned_w6a8`, text encoder `nvfp4_awq` y VAE en VRAM bajo demanda, es plausible en 24 GB con ComfyUI gestionando la carga por fases, aunque el rendimiento y el throughput no estan documentados.
- Aceleracion por pasos: las LoRAs turbo permiten 4 u 8 pasos de muestreo, lo que reduce el coste por clip de forma proporcional frente al muestreo completo (sin cifras publicadas de latencia).
- Requisito de software: `int8_convrot` necesita PyTorch con CUDA 13.0; `fp8_scaled` es la alternativa cuando no se dispone de esa combinacion. El text encoder `nvfp4` no exige GPU Blackwell segun la model card.
- Opciones de despliegue: ComfyUI es el entorno de referencia (estructura de carpetas `diffusion_models`, `text_encoders`, `loras`, `vae`, `model_patches`, `embeddings`). No se documentan soportes para vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje. Existen plantillas de RunPod de terceros en GitHub y un kit de instalacion publicado en note.com.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Modalidades | Audio nativo | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3 (este repo, Ref2VA) | Texto, imagen y referencia a video; audio | Si (VAE de audio dedicado) | minimax-h3-community-license-agreement | Pesos abiertos en HuggingFace; reempaquetado ComfyUI |
| Wan 2.x (Alibaba) | Texto e imagen a video | No documentado en la informacion disponible | licencia abierta de Alibaba (verificar version) | Pesos abiertos en HuggingFace |
| HunyuanVideo (Tencent) | Texto e imagen a video | No documentado en la informacion disponible | licencia comunitaria de Tencent | Pesos abiertos en HuggingFace |
| LTX-Video (Lightricks) | Texto e imagen a video | No documentado en la informacion disponible | licencia propia de Lightricks | Pesos abiertos en HuggingFace |

No se dispone de datos verificados de parametros, longitud de contexto, resolucion maxima ni resultados de benchmarks para ninguno de los modelos de la tabla en la informacion proporcionada; la comparacion se limita por tanto a modalidades, licencia y disponibilidad. El rasgo diferencial de MiniMax-H3 frente a las alternativas listadas es la generacion conjunta de audio, que en los demas casos no esta documentada en las fuentes consultadas.

## Limitaciones y advertencias

- Repositorio no oficial: se trata de un reempaquetado de terceros con 0 descargas y 0 likes, creado y actualizado el 27 de octubre de 2026. No hay garantia de integridad de los pesos ni de equivalencia numerica con el modelo original.
- Licencia restrictiva: la `minimax-h3-community-license-agreement` no es una licencia de codigo abierto al uso. Es imprescindible leer el texto completo antes de cualquier uso comercial; no se detallan aqui sus umbrales de facturacion, obligaciones de atribucion ni restricciones de redistribucion.
- Riesgo de alucinacion visual: como todo modelo generativo de difusion, puede producir anatomia incorrecta, texto ilegible en el fotograma, incoherencias temporales entre fotogramas y desincronizacion entre el audio y la accion mostrada.
- Sesgos: no hay informacion publicada sobre la composicion del dataset ni sobre evaluaciones de sesgo. Es esperable un sesgo hacia las distribuciones visuales dominantes en los datos de entrenamiento, con posible infrarepresentacion de ciertas culturas, fenotipos y entornos.
- Idiomas: la cobertura linguistica del audio generado y de los prompts no esta documentada.
- Dependencia de version: los flujos de trabajo dependen de plantillas de ComfyUI y de versiones concretas de PyTorch y CUDA; `int8_convrot` exige CUDA 13.0 y puede fallar en entornos mas antiguos.
- Coste de infraestructura: la pila en bf16 precisa GPU de 80 GB o estrategias de offloading; el coste por clip en cloud no es despreciable y depende del proveedor.
- Riesgo de uso indebido: la capacidad de generar video realista con audio a partir de una imagen de referencia facilita la creacion de deepfakes y contenido no consentido. Es necesario aplicar filtros, marcas de agua y politicas de uso aceptable en cualquier despliegue en produccion.
- Sin benchmarks: no existen datos publicados que permitan comparar objetivamente la calidad de esta variante cuantizada frente al modelo original ni frente a la competencia.

## Enlaces

- Repositorio del reempaquetado: https://huggingface.co/yuanhaiguang/MiniMax-H3-Ref2VA-RunPod-4files
- Perfil del autor: https://huggingface.co/yuanhaiguang
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- LoRAs turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- ControlNet Union: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union
- Versiones experimentales: https://huggingface.co/Kijai/MiniMax-H3-experimental
- Origen del text encoder cuantizado: https://huggingface.co/cybermotaz/Qwen3-VL-32B-Instruct-NVFP4
- Flujo texto a video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_t2v.json
- Flujo imagen a video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v.json
- Flujo referencia a video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_r2v.json
- Flujo de continuacion de video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v_continuation.json
- Plantilla de RunPod en GitHub: https://github.com/unfounddev/runpod-minimax-h3
- Guia de despliegue en RunPod (blog oficial): https://www.runpod.io/blog/minimax-h3-the-open-weight-omni-modal-video-model-and-what-it-takes-to-run-it
- Kit de instalacion para RunPod (note.com): https://note.com/unico920/n/n2caae9747fb2
