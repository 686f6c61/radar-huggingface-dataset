# Stankyspence1/MiniMax-H3-Realism-People-LoRA

## Resumen

MiniMax-H3-Realism-People-LoRA es un adaptador LoRA para el modelo de generacion de video MiniMax H3 (MiniMaxAI/MiniMax-H3), creado por Lovis Odin en fal. Su proposito es mejorar la representacion realista de personas en video generativo: rostros que aguantan primeros planos, textura de piel natural, microexpresiones coherentes, iluminacion de estilo cinematografico y movimiento de camara con sensacion de camara en mano.

El adaptador es el sucesor de MiniMax-H3-Realism-LoRA, reentrenado sobre un dataset mayor centrado en personas (176 clips de accion real curados a mano). Se publica como pesos safetensors de uso universal: funciona en ComfyUI, en cualquier stack de inferencia compatible con LoRA sobre H3, o en endpoints alojados como los de fal.ai. Es relevante porque aborda uno de los puntos debiles tipicos de los modelos de texto-a-video: la degradacion de la piel, las manos y los rostros en planos cercanos.

El repositorio pesa aproximadamente 0,2 GB y el adaptador se entreno con rank 32 durante 1500 pasos en el bucket de resolucion alta, configuracion que resulto ganadora en revision humana comparativa frente a otras dieciseis configuraciones probadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3; modifica las proyecciones de atencion compartidas (`diffusion_model.blocks.N.attn.qkv_proj`, QKV fusionado) |
| Parametros totales | no disponible (tamano del repo: ~0,2 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (hereda la del modelo base MiniMax H3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (heredada del modelo base) |
| Formato de pesos | safetensors |

Datos adicionales del entrenamiento:

| Parametro | Valor |
|---|---|
| Rank del LoRA | 32 |
| Pasos de entrenamiento | 1500 |
| Resolucion de entrenamiento | bucket de resolucion alta (valor exacto no disponible) |
| Dataset | 176 clips de accion real curados a mano, normalizados a 24 fps |
| Tareas soportadas | text-to-video, image-to-video, reference-to-video |
| Trigger word | `r34l1sm` |

## Arquitectura y entrenamiento

El adaptador es un LoRA estandar aplicado mediante la operacion habitual `W_eff = W + lora_B @ lora_A`. Segun la model card, solo toca las proyecciones de atencion compartidas del modelo base, lo que explica que funcione de forma transversal en las tres tareas de H3: texto a video, imagen a video y referencia a video. Las claves de los pesos siguen el layout estandar de H3 con QKV fusionado, por lo que ComfyUI lo carga sin conversion.

El entrenamiento uso el fal H3 trainer sobre un dataset de 176 clips de accion real centrados en personas: retratos, rostros, trabajadores, atletas y personajes cotidianos, construido sobre los mejores planos del primer dataset Realism. Se detecto y retemporizo metraje a camara lenta a velocidad natural, se normalizo todo a 24,000 fps estrictos y se generaron subtitulos estructurados por escena. Se entrenaron y compararon dieciseis configuraciones (pasos, rank, learning rate y resolucion) mediante revision humana lado a lado con pares de prompts de misma semilla. La version publicada (rank 32, 1500 pasos, resolucion alta) no fue ni la de mayor rank ni la de mayor duracion: la resolucion de entrenamiento resulto ser el factor decisivo, ya que la textura de piel, los poros, el pelo fino y el grano viven en altas frecuencias espaciales que los latents apenas conservan en buckets de resolucion inferiores.

## Capacidades

- Realce del realismo en planos con personas: retratos, rostros en primer plano, manos trabajando, multitudes y personajes cotidianos.
- Preservacion de la textura de piel (evita el alisado tipico), coherencia en ojos y microexpresiones.
- Iluminacion con aspecto de rodaje cinematografico y movimiento sutil de camara en mano.
- Compatible con las tres modalidades del modelo base: texto a video, imagen a video y referencia a video.
- Conserva el audio sincronizado nativo de MiniMax H3.
- Intensidad ajustable mediante el parametro scale (1,0 recomendado; 0,6-0,8 para un efecto mas ligero).
- Activacion mediante trigger word `r34l1sm` al inicio del prompt.
- Integracion directa en ComfyUI (nodo Load LoRA) o en cualquier stack que soporte LoRA sobre H3.

## Casos de uso

- Produccion de cortos cinematograficos con personajes: el adaptador mejora rostros y piel en primeros planos, util para previsualizaciones o planos finales de bajo presupuesto con estetica documental.
- Spots publicitarios y videos de marca: escenas con personas reales (atletas, trabajadores, personajes cotidianos) con iluminacion de set y movimiento de camara creible, generadas desde texto o desde una imagen de referencia.
- Storyboards animados para cine y television: conversion de guiones en secuencias video con expresiones faciales coherentes en dialogos y discusiones entre varios personajes.
- Contenido para redes sociales y video vertical: generacion rapida de clips con personas realistas usando los endpoints alojados de fal (text-to-video, image-to-video o reference-to-video) sin infraestructura propia.
- Animacion a partir de fotografia (image-to-video): dar movimiento a un retrato o fotograma manteniendo la textura de piel y la coherencia de la mirada.
- Escenas de viaje, ritual y documental: el dataset de entrenamiento incluye escenas de viaje y rituales, por lo que el adaptador esta orientado a ese tipo de contenido etnografico o de viaje.
- Prototipado de efectos de camara en mano: el movimiento sutil handheld que introduce el adaptador sirve para dar verosimilitud a planos que de otro modo se percibirian como sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card ofrece en su lugar una comparacion cualitativa: 19 pares de videos (mismo prompt, misma semilla, con y sin adaptador) disponibles en el repositorio, asi como un video de comparacion de 197 segundos a 1920x1080.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador en si; depende del modelo base MiniMax H3, cuyos requisitos no se detallan en la informacion proporcionada. El adaptador anade solo ~0,2 GB de pesos adicionales.
- GPU recomendadas: no disponible; el consumo vendra determinado por la inferencia de MiniMax H3.
- Cabe en consumer GPU: no disponible; la model card no especifica requisitos de hardware del modelo base.
- Opciones de despliegue:
  - ComfyUI local: copiar el `.safetensors` a `models/loras/` e insertar un nodo Load LoRA entre el cargador de modelo y el sampler.
  - Cualquier stack de inferencia propio que aplique LoRA sobre H3 (`W_eff = W + lora_B @ lora_A`).
  - Endpoints alojados en fal.ai para text-to-video, image-to-video y reference-to-video con soporte de LoRA.
- Latencia y throughput: no disponibles. Como referencia de configuracion, el ejemplo de la model card usa duracion de 5 segundos a resolucion 768P.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Rank / tamano | Tareas | Licencia |
|---|---|---|---|---|---|
| MiniMax-H3-Realism-People-LoRA | LoRA de realismo (personas) | MiniMax H3 | rank 32, ~0,2 GB | t2v, i2v, r2v | MiniMax H3 Community License |
| MiniMax-H3-Realism-LoRA (predecesor) | LoRA de realismo general | MiniMax H3 | no disponible | no disponible | MiniMax H3 Community License |
| MiniMax H3 (modelo base) | Modelo de video completo | — | no disponible | t2v, i2v, r2v, audio sincronizado | MiniMax H3 Community License |

La diferencia principal frente a su predecesor es el enfoque: el dataset pasa de realismo general a un corpus de 176 clips centrado en personas, con mejor manejo de piel, rostros y manos. No hay alternativas de otros autores comparables documentadas en la informacion disponible.

## Limitaciones y advertencias

- Es un adaptador, no un modelo completo: requiere el modelo base MiniMax H3 y no aporta capacidades por si solo.
- Necesita el trigger word `r34l1sm` al inicio del prompt para activarse; sin el, el efecto no se aplica como se espera.
- La intensidad recomendada es scale 1,0; valores muy altos podrian degradar el resultado (no documentado, pero es un comportamiento tipico de LoRAs).
- La licencia es la MiniMax H3 Community License del modelo base: cualquier restriccion de uso comercial se rige por esa licencia; conviene revisar sus terminos antes de uso en produccion.
- No hay benchmarks cuantitativos publicados; la evaluacion se basa en revision humana comparativa, por lo que la mejora puede variar segun el tipo de escena.
- El efecto esta optimizado para escenas con personas; en paisajes u objetos el beneficio es incierto y no esta documentado.
- Descargas muy bajas en el momento de la ficha (20 descargas, 1 like), de modo que hay poca validacion comunitaria independiente.
- Existe una copia oficial del adaptador bajo la organizacion fal en Hugging Face; la version de Stankyspence1 parece un espejo, por lo que se recomienda verificar la procedencia de los pesos antes de usarlos.

## Enlaces

- Ficha del adaptador (espejo): https://huggingface.co/Stankyspence1/MiniMax-H3-Realism-People-LoRA
- Copia oficial en la organizacion fal: https://huggingface.co/fal/MiniMax-H3-Realism-People-LoRA
- Pesos directos: https://huggingface.co/fal/MiniMax-H3-Realism-People-LoRA/resolve/main/h3-realism-people-t2v-i2v-r2v.safetensors
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Predecesor: https://huggingface.co/fal/MiniMax-H3-Realism-LoRA
- Endpoint text-to-video con LoRA: https://fal.ai/models/minimax/h3/text-to-video/lora
- Endpoint image-to-video con LoRA: https://fal.ai/models/minimax/h3/image-to-video/lora
- Endpoint reference-to-video con LoRA: https://fal.ai/models/minimax/h3/reference-to-video/lora
- Autor: https://github.com/lovisdotio (Lovis Odin, fal — https://fal.ai)
