# tsolful/FastH3-Omni-Comfy-INT4mixed-INT6GPTQ

## Resumen

FastH3-Omni-Comfy-INT4mixed-INT6GPTQ es una conversión cuantizada del estudiante FastH3 OmniRef de 8 pasos, un modelo de difusión que genera vídeo con audio sincronizado a partir de un prompt de texto y, opcionalmente, referencias de imagen, vídeo y audio. Lo publica el usuario tsolful a partir del checkpoint `fasth3_omniref_8step_pruned_bf16.safetensors` de FastVideo/FastH3-OmniRef-Comfy, que a su vez deriva de MiniMaxAI/MiniMax-H3 mediante destilación (la familia FastH3 reduce las 49 evaluaciones del denoiser del H3 base a un número muy inferior de pasos).

El paquete incluye dos ficheros de 13,70 GiB (≈14,7 GB) con el mismo esquema: v1 calibrado con atención densa y v2 calibrado con Video Sparse Attention (VSA), la ruta dispersa para la que se entrenó el modelo. La compresión combina W4A8 en los bloques 0-33, W6A8 en los bloques 34-49, INT8 ConvRot en el token refiner y precisión original (bf16/fp32) en cabeceras de salida, AdaLN, proyecciones y normas. Frente a los 44,2 GB del bf16 y los 22,2 GB del INT8 ConvRot de Comfy-Org, estos ficheros ocupan un 67 % y un 34 % menos respectivamente.

Su relevancia es práctica: permite ejecutar de forma nativa en ComfyUI un generador conjunto de vídeo y audio con referencias multimodales en GPUs de gama alta de consumo, a costa de una pérdida de calidad que el propio autor califica de no verificada en generaciones reales. El text encoder (Qwen3-VL-32B en INT8) y los VAE de vídeo y audio no se incluyen y deben tomarse del repositorio de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con 50 bloques, token refiner de 2 bloques, 32 cabeceras de salida y modulación AdaLN; estudiante destilado de MiniMax-H3 con atención dispersa VSA opcional |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; calibración a 1344×768 y 73 fotogramas (la ventana de tokens depende de resolución y número de fotogramas) |
| Tipos de cuantización | W4A8 (bloques 0-33), W6A8 (bloques 34-49), INT8 ConvRot (token refiner); capas sensibles en bf16/fp32 |
| Idiomas soportados | no disponibles (la calibración usa diálogos en dos idiomas sin especificar) |
| Licencia | minimax-h3-community-license-agreement (etiquetada como `other`) |
| Formato de pesos | safetensors de fichero único para ComfyUI (`diffusion-single-file`), con metadatos `_quantization_metadata` embebidos |
| Pasos de inferencia | 8 forwards, guidance 1, shift de vídeo 12 y shift de audio 3 |
| Tamaño por fichero | 13,70 GiB (≈14,7 GB) por variante; repositorio completo de 73,7 GB |
| Dependencias | ComfyUI ≥ v0.38.0, comfy-kitchen ≥ 0.2.37 (soporte W6A8), soporte MiniMax H3 |
| Referencias soportadas | imagen, vídeo y audio mediante el nodo `MiniMaxH3ReferenceToVideo` (etiquetas `<Picture 1>`, `<Video 1>`, `<Audio 1>`) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación conjunta de vídeo y audio. La pila principal tiene 50 bloques; los 34 primeros (170 capas entre atención qkv/out/gate y MLP fc1/fc2) se cuantizan a 4 bits con grupos de 16, y los 16 últimos (80 capas) a 6 bits con grupos de 16. El token refiner de 2 bloques (8 capas) se mantiene en INT8 ConvRot siguiendo la receta de Comfy-Org, y las 32 cabeceras de salida, la curva y modulación AdaLN, las proyecciones de patch y de condición y las normas quedan en bf16/fp32. Las cabeceras usan el esquema nativo de primera cabecera más offset, por lo que se dejan deliberadamente sin cuantizar.

El estudiante OmniRef de 8 pasos se destila de MiniMax-H3 y acepta referencias de imagen, vídeo y audio además del prompt. La variante v2 se calibra con Video Sparse Attention activada, con los parámetros con los que se entrenó la ruta dispersa: método `vsa`, `keep_percent` 10, rango 0,00-1,00, `min_tokens` 12288, `extra_tokens` 256 y `sink_condition` `exact_kv_and_rows`. La conversión aplica rotación Hadamard ConvRot con grupos de 256 y activaciones dinámicas de 8 bits en tiempo de ejecución; los pesos se optimizan con GPTQ (act-order activado, dampening 0,03, muestra de 4096 tokens por llamada) y una comprobación con conjunto de validación revierte a redondeo simple cualquier capa donde GPTQ empeore el resultado. La calibración de v1 usa 3 prompts de texto-a-vídeo-con-audio con atención densa; la de v2 usa 6 prompts (diálogo en dos idiomas, texto en pantalla, música en directo, naturaleza y clima, movimiento rápido) a 1344×768 y 73 fotogramas, con 8 pasos y shift 12 en ambos casos.

## Capacidades

- Generación de vídeo con audio sincronizado a partir de un prompt de texto.
- Generación condicionada por referencias multimodales: imagen, vídeo y audio, combinables en un mismo prompt mediante etiquetas.
- Diálogo hablado y texto en pantalla dentro de la escena, según los prompts de calibración.
- Generación de música en directo, escenas de naturaleza y clima y movimiento rápido, también presentes en la calibración.
- Inferencia en 8 forwards, lo que reduce el coste frente a los esquemas de decenas de pasos.
- Atención dispersa VSA en la variante v2, con soporte nativo mediante el nodo Model Sparse Attention de ComfyUI.
- Integración nativa en ComfyUI mediante el nodo Load Diffusion Model, sin loader personalizado.
- No soporta tool calling, function calling ni razonamiento multi-paso basado en texto: no es un modelo de lenguaje.

## Casos de uso

- Publicidad y redes sociales: generar clips cortos con audio sincronizado a partir de un brief textual, usando la ventana de 73 fotogramas y 1344×768 de la calibración como punto de partida para adaptar la resolución al formato final.
- Vídeo de producto con referencia visual: pasar una fotografía del producto como `<Picture 1>` y un prompt de escena para obtener un plano en movimiento coherente con la referencia, útil en catálogos y demos de e-commerce.
- Doblaje y prototipado de diálogo: emplear referencias de audio y vídeo para probar sincronización labial y voz en dos idiomas antes de producir una locución definitiva, aprovechando que la calibración incluye diálogos multilingües.
- Previsualización de storyboards: convertir guiones en animáticas con audio para validar ritmo y puesta en escena antes de rodar, con un coste de 8 forwards por clip.
- Creación de contenido para campañas A/B: generar variantes de un mismo anuncio cambiando el prompt o la referencia de imagen y comparar rendimiento, ya que el modelo admite múltiples referencias sin reentrenamiento.
- Investigación en cuantización de modelos de difusión: usar v1 (atención densa) y v2 (VSA) como banco de pruebas controlado para medir el impacto de W4A8/W6A8 en la calidad final de vídeo y audio.
- Despliegue local en estaciones de trabajo con ComfyUI: ejecutar el modelo en una GPU de 24 GB con offloading secuencial del text encoder, sin depender de servicios en la nube.
- Prototipos de vídeo para formación y e-learning: generar escenas explicativas con locución y texto en pantalla a partir de un guion, sustituyendo grabaciones de bajo presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K y similares no aplican a un modelo de difusión de vídeo). El autor sí reporta métricas internas de error de cuantización:

| Métrica | v1 (atención densa) | v2 (VSA) |
|---|---|---|
| Error medio por capa con redondeo simple | 4,35 % | 3,60 % |
| Error medio por capa con GPTQ | 1,74 % | 1,46 % |
| Reducción relativa del error | ≈60 % | ≈59 % |
| Capas cuantizadas con GPTQ | 198 | 248 (incluye las 50 capas de puerta VSA) |
| Capas con redondeo simple retenidas por la validación | 2 (token refiner) | 2 (token refiner) |
| Capas con redondeo simple no alcanzadas por la calibración | 58 (bloques 0-1 y todas las `to_gate_compress`) | 8 (atención y MLP de los bloques 0-1) |

El autor incluye además una tabla de error extremo a extremo frente a bf16 por paso de muestreo (rel-RMSE y similitud coseno), pero los valores no están disponibles en la información proporcionada. No hay métricas de calidad perceptual, FVD, sincronización audio-vídeo ni tiempos de inferencia medidos.

## Requisitos de hardware

- Pesos del transformer: 13,70 GiB por variante (frente a 44,2 GB en bf16 y 22,2 GB en INT8 ConvRot).
- Componentes adicionales no incluidos: text encoder Qwen3-VL-32B en INT8 ConvRot (aproximadamente 32 GB en esa precisión), VAE de audio en fp32 y VAE de vídeo en fp16 o INT8 ConvRot. El consumo total supera ampliamente el de los pesos del denoiser.
- VRAM estimada para inferencia: no disponible de forma oficial. Con offloading secuencial de ComfyUI, los 14,7 GB del denoiser más activaciones sugieren un mínimo práctico en torno a 24 GB; sin offloading y con el text encoder de 32B residente, se requiere un entorno de 80 GB o descarga secuencial a CPU.
- GPU de consumo: RTX 4090 (24 GB) es la opción más realista con offloading; en 16 GB el modelo entra solo con descarga agresiva a memoria del sistema y no hay validación pública de que funcione.
- GPU de centro de datos: A100 80 GB y H100 80 GB para ejecución sin offloading y generación por lotes.
- Opciones de despliegue: ComfyUI nativo (Load Diffusion Model + Model Sparse Attention para v2), con comfy-kitchen ≥ 0.2.37 y ComfyUI ≥ v0.38.0. vLLM-Omni documenta soporte para la familia FastH3/MiniMax-H3. llama.cpp, Ollama y TGI no son aplicables a este formato de difusión de un solo fichero.
- Latencia y throughput: no disponibles. Cualitativamente, el estudiante ejecuta 8 forwards frente a las 49 evaluaciones del denoiser del H3 base, pero no se han publicado tiempos por clip ni comparativas medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Pasos | Formato y tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tsolful/FastH3-Omni-Comfy-INT4mixed-INT6GPTQ (esta ficha) | no disponible | 1344×768, 73 fotogramas en calibración | 8 | safetensors único, 13,70 GiB | minimax-h3-community-license-agreement | HuggingFace, 0 descargas |
| FastH3-OmniRef-Comfy (bf16 de origen) | no disponible | misma familia OmniRef | 8 | safetensors, 44,2 GB | minimax-h3-community-license-agreement | HuggingFace (FastVideo) |
| INT8 ConvRot de Comfy-Org | no disponible | misma familia OmniRef | 8 | safetensors INT8, 22,2 GB | minimax-h3-community-license-agreement | HuggingFace (Comfy-Org) |
| FastVideo-FastH3-8-Step-V2 | no disponible | texto a vídeo con audio | 8 | checkpoint FastVideo, requiere backend VSA-H3 | no disponible en la información | HuggingFace (FastVideo) |
| FastH3 4-step (familia FastH3) | no disponible | texto a vídeo con audio | 4 | adaptador sobre el checkpoint base | no disponible en la información | HuggingFace / vLLM-Omni |

La comparación relevante es de tamaño y precisión: esta conversión reduce un 67 % el peso frente al bf16 y un 34 % frente al INT8, a cambio de un error de capa de entre el 1,46 % y el 1,74 %. No hay datos de calidad perceptual que permitan afirmar equivalencia con el bf16.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor: la calidad en GPU no se ha comprobado contra los ficheros bf16 o INT8 en generaciones reales.
- Error de cuantización acumulado no medido extremo a extremo en la información disponible; la tabla de rel-RMSE por paso está truncada.
- La variante v2 depende de un nodo VSA y de unos parámetros de muestreo concretos; usarla con otra configuración invalida la calibración.
- El text encoder y los VAE no están incluidos: sin ellos el fichero no es autónomo y hay que descargar componentes adicionales de gran tamaño.
- Requiere versiones muy concretas de ComfyUI y comfy-kitchen; versiones anteriores no cargan el formato W6A8.
- Licencia `other` sujeta al acuerdo comunitario de MiniMax H3: es obligatorio revisar las condiciones de uso comercial antes de desplegarlo en producción.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la ficha, sin informes independientes de calidad.
- Sesgos y composición del dataset de entrenamiento no disponibles; se heredan los del modelo base MiniMax-H3.
- Idiomas soportados no documentados; la calibración cubre diálogos en dos idiomas sin especificar cuáles.
- Riesgo de artefactos típicos de difusión de vídeo: parpadeo temporal, desincronización de audio, deformaciones en movimiento rápido y errores de texto en pantalla.
- Resolución y número de fotogramas máximos no documentados; la calibración se hizo a 1344×768 y 73 fotogramas, y no hay garantía fuera de ese régimen.
- El repositorio completo ocupa 73,7 GB, aunque solo se necesite uno de los dos ficheros de 13,70 GiB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tsolful/FastH3-Omni-Comfy-INT4mixed-INT6GPTQ
- Checkpoint de origen (FastH3-OmniRef-Comfy): https://huggingface.co/FastVideo/FastH3-OmniRef-Comfy
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- FastVideo-FastH3-8-Step-V2: https://huggingface.co/FastVideo/FastVideo-FastH3-8-Step-V2
- Otra cuantización del mismo autor (Minimax_H3_INT4Mixed): https://huggingface.co/tsolful/Minimax_H3_INT4Mixed
- Documentación de FastH3 en vLLM-Omni: https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/minimax_h3/fasth3/
- Paper de GPTQ: https://arxiv.org/abs/2210.17323
- Notas de la versión ComfyUI v0.38.0: https://www.reddit.com/r/comfyui/comments/1wtxujx/comfyui_v0380/
- Sitio de FastH3-Omni: https://fasth3-omni.com/en
- Sitio de FastH3: https://fasth3.org/
