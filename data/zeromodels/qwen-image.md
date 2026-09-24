# zeromodels/qwen-image

## Resumen
zeromodels/qwen-image es una conversion a **Keras 3** del checkpoint text-to-image `Qwen/Qwen-Image`, publicada por el proyecto ZeroModels (IMvision12). No se trata de un modelo entrenado desde cero, sino de una redistribucion de los mismos pesos del checkpoint original de Alibaba/Qwen, reempaquetados en el formato de ZeroModels para que una unica implementacion funcione sin cambios sobre TensorFlow, PyTorch o JAX seleccionando la variable de entorno `KERAS_BACKEND`.

El modelo resuelve generacion de imagenes a partir de texto a 1024x1024 px mediante difusion con rectified flow. Internamente combina un denoiser MMDiT de doble flujo de 60 capas, un autoencoder VAE estilo Wan de 16 canales con factor espacial 8x y una torre de texto Qwen2.5-VL (28 capas, 3584 dimensiones). Los pesos se almacenan en bfloat16 y el checkpoint ocupa unos 53 GiB (~55,3 GB en el repositorio), lo que lo situa en la gama alta de difusion abierta.

Su relevancia actual es de caracter practico: permite ejecutar un modelo de imagen puntero sin depender de Diffusers y aprovechar aceleradores distintos (TPU con JAX, GPU con Torch, pipelines TF). La licencia Apache-2.0 heredada del checkpoint upstream facilita el uso comercial, aunque el repositorio no registra descargas ni validacion de la comunidad.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Difusion con rectified flow: MMDiT de doble flujo (60 capas) + VAE KL estilo Wan (16 canales, 8x espacial) + text encoder Qwen2.5-VL (28 capas, 3584-d) |
| Parametros totales | no disponible (el checkpoint pesa unos 53 GiB en bfloat16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el prompt se procesa con tokenizer Qwen2 BPE bajo plantilla ChatML de Diffusers) |
| Tipos de cuantizacion | bfloat16 (por defecto); float32 opcional via `load_dtype="float32"` |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | Keras 3: `model.weights.json`, `model_*.weights.h5`, `zm_config.json`, `tokenizer.json` |
| Resolucion objetivo | 1024x1024 px (latentes empaquetados 2x2 sobre una rejilla 128x128x16) |
| Scheduler | `FlowMatchEulerDiscreteScheduler` con desplazamiento dinamico segun la longitud de secuencia empaquetada |
| Pasos de inferencia por defecto | 50 (`guidance_scale=4.0`) |
| Tamano del repositorio | 55,3 GB |

## Arquitectura y entrenamiento
El denoiser es un transformer MMDiT de doble flujo (`QwenImageTransformer2DModel`) con 60 capas que opera sobre tokens empaquetados de forma `(B, H/2·W/2, 64)`. El autoencoder (`AutoencoderKLQwenImage`) es un VAE KL de estilo Wan con `z_dim` 16 y factor de submuestreo espacial 8x, que normaliza latentes con `latents_mean`/`latents_std`. El texto se codifica con la torre de texto de Qwen2.5-VL de 28 capas y 3584 dimensiones, tokenizada con BPE de Qwen2 bajo la plantilla ChatML de Diffusers. El muestreo usa rectified flow con `FlowMatchEulerDiscreteScheduler` y desplazamiento dinamico de la resolucion en funcion de la longitud de la secuencia empaquetada.

No se realizo entrenamiento adicional en esta publicacion: la model card indica explicitamente que la arquitectura y los valores de los parametros son identicos al checkpoint `Qwen/Qwen-Image` y que solo cambian los nombres de los pesos y el formato de fichero. Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas) corresponden al informe tecnico upstream (arXiv:2508.02324) y no se reproducen en la informacion proporcionada. Como innovacion practica, esta version permite compilar los grafos para resoluciones distintas de 1024 px (multiplos de 16 px) mediante `transformer_sample_size` y `vae_sample_size`.

## Capacidades
- Generacion de imagenes text-to-image a 1024x1024 px a partir de prompts en ingles y chino.
- Control de la generacion mediante `num_inference_steps`, `guidance_scale`, `seed` y prompts negativos.
- Reproducibilidad bit a bit con fijacion de semilla, util para pruebas automatizadas.
- Ejecucion sobre tres backends con el mismo codigo: `KERAS_BACKEND=torch`, `jax` o `tensorflow`.
- Carga de pesos en bfloat16 o float32 sin conversiones intermedias en el Hub.
- Carga del contenedor sin bucle de generacion (`QwenImageModel.from_weights`) para inspeccionar features o integrar en pipelines propios.
- No dispone de tool calling, function calling, modo agente ni razonamiento multi-paso.
- No procesa imagenes como entrada: este checkpoint es exclusivamente text-to-image (la edicion de imagen pertenece a otras variantes de la familia Qwen-Image).
- No se declaran capacidades de audio, video ni thinking mode.

## Casos de uso
- Ilustracion editorial automatizada: generar imagenes de portada a 1024x1024 a partir de titulares o resumentes, controlando la semilla para reproducir una misma linea visual en una serie de articulos.
- Creacion de assets para videojuegos o prototipos: producir conceptos de personajes, entornos y objetos con prompts en ingles o chino para iterar rapidamente en fases de preproduccion.
- Marketing y publicidad bilingue: generar variantes de carteles o banners en en/zh reutilizando el mismo pipeline, util para campanas en mercados chinos y anglosajones.
- Generacion de datasets sinteticos: crear lotes de imagenes etiquetadas a partir de plantillas de prompt para aumentar datos de entrenamiento de clasificadores o detectores.
- Investigacion en modelos de difusion: comparar rendimiento y estabilidad numerica del mismo checkpoint bajo JAX, Torch y TensorFlow sin reescribir codigo, midiendo pasos, semilla y `guidance_scale` de forma controlada.
- Despliegue en infraestructura no-CUDA: aprovechar el backend JAX para ejecutar la generacion sobre TPU o entornos acelerados distintos de las GPU NVIDIA.
- Pruebas de regresion de librerias: usar `seed` fijo y 50 pasos para verificar que una actualizacion de Keras o del backend no altera las imagenes generadas.
- Generacion por lotes en servidores de alta VRAM: producir catalogos de imagenes de producto en en/zh a partir de descripciones estructuradas, siempre que se disponga de GPU de 80 GB o multi-GPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. Los resultados de busqueda que citan cifras como DPG-Bench 88,32 frente a 83,84 de FLUX.1 corresponden a versiones posteriores de la familia (Qwen-Image-2.0 y Qwen-Image-2.1) con arquitectura y numero de parametros distintos, por lo que no son extrapolables a `zeromodels/qwen-image`. No se dispone tampoco de medidas de FID, CLIP score ni tiempos de inferencia para esta conversion.

## Requisitos de hardware
- Los pesos en bfloat16 suman unos 53 GiB, por lo que la inferencia en bf16 necesita mas de 60 GiB de VRAM contando activaciones y buffers.
- En float32 los pesos duplican su tamano (~106 GiB), lo que exige multi-GPU o memoria unificada grande.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB o H200. Tambien valido con varias GPU de 48 GB (A6000, L40S) repartiendo el modelo.
- No cabe en GPU de consumo: una RTX 4090 (24 GB) o RTX 5090 (32 GB) no pueden alojar los pesos en bf16 sin tecnicas de offload no documentadas en este repositorio.
- No se ofrece GGUF, AWQ ni otras cuantizaciones de 4/8 bits, por lo que no es ejecutable en llama.cpp, Ollama ni LM Studio.
- Opciones de despliegue: Keras 3 con backend Torch, JAX o TensorFlow; JAX permite apuntar a TPU. No esta soportado por vLLM ni TGI, que son servidores orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. La configuracion por defecto es de 50 pasos con `guidance_scale=4.0`, lo que implica 50 evaluaciones del denoiser por imagen.
- La carga en caliente via `hf:` no esta soportada para modelos de difusion; es necesario usar los pesos preconvertidos.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto/resolucion | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| zeromodels/qwen-image | no disponible (~53 GiB en bf16) | 1024x1024; sin dato de tokens de prompt | Apache-2.0 | Keras 3 (JAX/Torch/TF); 0 descargas, 0 likes |
| Qwen/Qwen-Image (upstream) | no disponible en la informacion | 1024x1024 | Apache-2.0 | Diffusers/PyTorch; es el origen de estos pesos |
| Qwen-Image-2.0 | 7B en el componente visual | 2K nativa; prompts de ~1K tokens segun el blog | no disponible | Repositorio propio de Qwen; arquitectura mas ligera |
| Qwen-Image-2.1 | 7B, 32 capas DiT de un solo flujo | no disponible | no disponible | GitHub QwenLM/Qwen-Image-2.1; generacion y edicion unificadas |
| FLUX.1 | 12B segun el resultado de busqueda | no disponible | no disponible | No disponible en la informacion proporcionada |

Los datos de las versiones 2.0 y 2.1 proceden de los resultados de busqueda y describen modelos distintos, no una evolucion directa de este checkpoint. No hay informacion suficiente para comparar rendimiento medido entre estas opciones.

## Limitaciones y advertencias
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir imagenes plausibles pero incorrectas respecto al prompt (objetos deformes, texto ilegible, atributos mezclados).
- Cobertura idiomatica limitada a en y zh; no se declara soporte de castellano, por lo que la calidad con prompts en espanol es incierta.
- Sesgos del dataset de entrenamiento del checkpoint upstream no documentados en esta publicacion; no hay auditoria de sesgos en el repositorio de conversion.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente de la fidelidad de la conversion frente al original.
- Formato de pesos propietario de ZeroModels (`model.weights.json`, `.weights.h5`), incompatible de forma directa con Diffusers, ComfyUI, Automatic1111, vLLM o llama.cpp.
- Requisito de VRAM muy alto: mas de 60 GiB en bf16, lo que excluye el despliegue en hardware de consumo.
- Solo genera a 1024x1024 por defecto; otras resoluciones obligan a reconstruir los grafos con multiplos de 16 px y pueden degradar la calidad si se alejan de la resolucion de entrenamiento.
- Este checkpoint no soporta edicion de imagen, inpainting ni entrada de imagen, pese a que otras variantes de la familia si lo hacen.
- Aunque la licencia es Apache-2.0 y permite uso comercial, los terminos aplicables son los del checkpoint upstream `Qwen/Qwen-Image`, que se heredan al usar estos pesos.
- No hay informacion sobre latencia, throughput ni coste energetico, datos imprescindibles antes de dimensionar un servicio en produccion.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/zeromodels/qwen-image
- Modelo base upstream: https://huggingface.co/Qwen/Qwen-Image
- Informe tecnico (arXiv): https://arxiv.org/abs/2508.02324
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de Qwen-Image en ZeroModels: https://imvision12.github.io/ZeroModels/qwen_image/
- Documentacion general de Qwen en ZeroModels: https://imvision12.github.io/ZeroModels/qwen/
- Repositorio Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Blog de Qwen-Image-2.0: https://qwenimages.com/blog/qwen-image-2-release
- Blog de Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
