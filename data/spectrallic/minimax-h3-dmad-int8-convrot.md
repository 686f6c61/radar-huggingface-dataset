# Spectrallic/MiniMax-H3-DMAD-int8-convrot

## Resumen

MiniMax-H3-DMAD-int8-convrot es un conjunto de cuatro ficheros de pesos para el transformer de difusion MiniMax-H3, publicado por el usuario Spectrallic. No se trata de un modelo entrenado desde cero, sino de una derivacion cuantizada y destilada de los transformers podados FL2VA y Ref2VA distribuidos por Comfy-Org, a los que se ha fusionado un LoRA DMAD de rango completo y se ha aplicado cuantizacion INT8 con rotacion convolucional (ConvRot). El resultado son pesos listos para usar en ComfyUI que generan video con audio sincronizado en 4 u 8 pasos de muestreo, sin necesidad de cargar un LoRA aparte.

La relevancia practica esta en la reduccion del coste de inferencia: el muestreo pasa de decenas de pasos a 4 u 8 con CFG fijo a 1.0, y los lineales de atencion y MLP se almacenan en INT8 con escala por fila, lo que rebaja el peso en disco y la huella de VRAM frente a los pesos BF16 originales. El repositorio ocupa 83,9 GB e incluye tanto la variante texto-a-video (FL2VA) como la de referencia-a-video (Ref2VA), cada una en version de 4 y 8 pasos.

Conviene subrayar que la destilacion DMAD se entreno sobre el transformer texto-a-audio-video, no sobre la particion Ref2VA; los propios autores del LoRA indican que carga en Ref2VA pero no publican resultados para esa variante. Es, por tanto, un artefacto de despliegue orientado a produccion con ComfyUI, no una publicacion de investigacion con evaluacion exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (MiniMax-H3), variantes FL2VA y Ref2VA podadas; lineales de bloques en INT8 con ConvRot |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generacion de 124 fotogramas a 24 fps en los ejemplos) |
| Tipos de cuantizacion | INT8 tensorwise con ConvRot (grupo 256) en `blocks.N.attn.{qkv_proj,out_proj}` y `blocks.N.mlp.{fc1,fc2}`; resto de tensores en el dtype original de Comfy-Org |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (`license: other`) |
| Formato de pesos | safetensors (fichero unico, `diffusion-single-file`), con descriptores `.comfy_quant` y `weight_scale` F32 por fila |

## Arquitectura y entrenamiento

La base es el transformer de difusion MiniMax-H3 en su version podada, distribuida por Comfy-Org en BF16. Sobre esa base se fusiona un LoRA DMAD de rango completo procedente de ZhengmingYu/DMAD: `full_critic` para los ficheros de 4 pasos y `8step_full_critic` para los de 8 pasos. DMAD es una tecnica de destilacion few-step que colapsa el muestreo a un punto de operacion fijo (4 u 8 pasos, CFG 1.0, shift temporal de video 12 y de audio 2). La fusion se hizo sobre las conversiones exactas de los autores para ComfyUI, sin reentrenamiento adicional por parte de Spectrallic.

La cuantizacion aplica INT8 tensorwise con ConvRot y grupo de 256 a todos los lineales de cada bloque, con una escala F32 por fila almacenada en `weight_scale` y un tensor `.comfy_quant` por capa que describe el formato (`{"format": "int8_tensorwise", "convrot": true, "convrot_groupsize": 256}`). Los nombres, orden, dtypes, formas, offsets de datos y descriptores coinciden con los ficheros de Comfy-Org, de modo que los pesos son intercambiables en el mismo grafo. El resto de tensores conserva el dtype original. Los ejemplos de la model card se renderizaron con SageAttention y atencion dispersa a densidad 0,15 (primer paso denso).

## Capacidades

- Generacion de video a partir de texto (FL2VA) con audio sincronizado, en resoluciones como 1344x768 y 124 fotogramas a 24 fps.
- Generacion de video condicionada por referencias (Ref2VA): imagenes, video y audio referenciados en el prompt como `<Picture i>`, `<Video k>` y `<Audio j>`.
- Generacion de audio conjunta con el video (pipeline texto-a-audio-video en la base).
- Muestreo few-step: 4 u 8 pasos segun el fichero, con CFG 1.0, lo que elimina la necesidad de classifier-free guidance.
- Integracion directa en ComfyUI mediante el sampler DMAD, sin cargador de LoRA.
- Compatibilidad con atencion dispersa y SageAttention para acelerar el muestreo.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo generativo de difusion, no un LLM.

## Casos de uso

- Previsualizacion rapida de storyboards: con 4 pasos y CFG 1.0 se obtienen clips de 124 fotogramas en una sola pasada, lo que permite iterar sobre un guion visual antes de comprometer un render mas costoso.
- Generacion de clips con audio para redes sociales: el pipeline produce video y audio conjuntamente, de modo que un unico grafo cubre imagen en movimiento y banda sonora sin postproduccion separada.
- Continuidad de personajes y escenarios: la variante Ref2VA acepta una imagen de referencia (`<Picture 1>`) para mantener el diseno de un elemento concreto, como se muestra en el ejemplo del barco y la ciudad flotante.
- Prototipado de efectos visuales en produccion audiovisual: la cuantizacion INT8 reduce la huella de VRAM y permite desplegar el modelo en estaciones de trabajo con GPU de gama alta consumer en lugar de exigir nodos de datacenter.
- Iteracion de prompts cinematograficos: los ejemplos documentan prompts largos y descriptivos con control de camara, iluminacion y atmosfera, utiles para equipos que ajustan lenguaje natural en lugar de parametros tecnicos.
- Integracion en pipelines de ComfyUI existentes: al conservar el layout exacto de los ficheros de Comfy-Org, los pesos se sustituyen sin reescribir el grafo, lo que simplifica la migracion de un flujo BF16 a uno INT8 few-step.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio pesa 83,9 GB e incluye cuatro ficheros; cada variante individual en INT8 es sustancialmente menor que su equivalente BF16, pero no se documenta la cifra por fichero.
- GPU recomendadas: no disponible. Los ejemplos se renderizaron a 1344x768 con 124 fotogramas, lo que sugiere GPU de gama alta, pero no se especifica el modelo empleado.
- Cabe en GPU consumer: no confirmado. La cuantizacion INT8 y el muestreo a 4 pasos estan disenados precisamente para reducir requisitos, pero la model card no aporta cifras de VRAM ni nombres de GPU.
- Opciones de despliegue: ComfyUI con el sampler DMAD y los workflows del repositorio ZhengmingYu/DMAD; compatible con SageAttention y atencion dispersa (densidad 0,15, primer paso denso).
- Latencia y throughput: no disponibles. Solo se documenta el numero de pasos (4 u 8) y la configuracion de muestreo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-DMAD-int8-convrot (este) | no disponible | 124 fotogramas a 24 fps en ejemplos | 4 u 8, CFG 1.0 | minimax-h3-community-license-agreement | Hugging Face, fichero unico safetensors |
| Comfy-Org/MiniMax-H3 (base) | no disponible | misma base | decenas de pasos, requiere LoRA DMAD aparte | minimax-h3-community-license-agreement | Hugging Face |
| ZhengmingYu/DMAD (LoRA) | no disponible | no aplica (adaptador) | 4 u 8 | no disponible en la informacion | Hugging Face |

La comparativa se limita a las variantes del mismo linaje porque la informacion proporcionada no incluye otros modelos de video con audio de la misma categoria con datos verificables.

## Limitaciones y advertencias

- La destilacion DMAD no se entreno sobre la particion Ref2VA; los autores del LoRA confirman que carga pero no publican resultados, por lo que la calidad de Ref2VA es incierta.
- Los pesos difieren del release original de MiniMax-H3; no deben tratarse como equivalentes a los BF16 de Comfy-Org en terminos de fidelidad numerica.
- La cuantizacion INT8 con ConvRot introduce error respecto a BF16; no se documenta la degradacion cualitativa medida.
- Licencia `minimax-h3-community-license-agreement` con `license: other`: es imprescindible revisar el texto antes de cualquier uso comercial, ya que las condiciones no se detallan en la informacion disponible.
- No hay datos de sesgos, idiomas soportados ni evaluacion de alucinacion visual; la model card no cubre estos aspectos.
- El punto de operacion esta fijado (4 u 8 pasos, CFG 1.0, shifts 12/2); desviarse de el no esta validado por el autor.
- El repositorio incluye cuatro ficheros grandes (83,9 GB en total); conviene descargar solo la variante necesaria.
- El modelo tiene un unico like y procede de un autor no oficial respecto a MiniMax; la trazabilidad del linaje depende de las revisiones citadas (`912b6e38` para Ref2VA, `b08c2bf3` para el LoRA).

## Enlaces

- Hugging Face: https://huggingface.co/Spectrallic/MiniMax-H3-DMAD-int8-convrot
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- LoRA DMAD: https://huggingface.co/ZhengmingYu/DMAD
- Paper citado en tags: arxiv:2610.02188
- Blog sobre atencion dispersa y SageAttention: https://noxengine.dev/blog/sparse/
- Ejemplos en video: `samples/floating_city_1344x768_seed42.mp4`, `samples/stormy_boat_1344x768_seed42.mp4`, `samples/floating_city_8step_1344x768_seed42.mp4`, `samples/stormy_boat_8step_1344x768_seed42.mp4` (dentro del repositorio)
