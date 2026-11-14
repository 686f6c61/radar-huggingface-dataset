# vyrekai/minimax-h3-image-comfyui-workflows

## Resumen

MiniMax H3 Image es un modelo de difusion para generacion y edicion de imagenes a resolucion nativa de 16 MP (5472x3072 en 16:9, 3552x4736 en 3:4), desarrollado por MiniMax. Este repositorio concreto, publicado por el usuario vyrekai, no contiene pesos del modelo en si, sino tres workflows de ComfyUI (`minimax_h3_image_8gb_vram.json`, `minimax_h3_image_12gb_vram.json` y `minimax_h3_image_16gb_vram.json`) que permiten ejecutar el modelo completo en tarjetas graficas de 8, 12 y 16 GB de VRAM respectivamente. Los pesos oficiales se distribuyen en el repositorio `Comfy-Org/MiniMax-H3-Image`.

El interes practico del repositorio radica en que demuestra que un modelo de difusion de 21 GB en int8 puede generar imagenes de 16 MP en una GPU de 8 GB, gracias al streaming por partes que ComfyUI aplica al modelo durante la inferencia. El autor reporta que las tres variantes producen imagenes identicas pixel a pixel con la misma semilla, de modo que la restriccion de memoria afecta unicamente a la latencia, no a la calidad final.

El modelo esta destilado para 6 pasos de muestreo con CFG 1.0 y sin prompt negativo, lo que reduce drasticamente el coste computacional por imagen. El repositorio incluye tambien una guia de prompts (`MINIMAX_H3_IMAGE_PROMPT_GUIDE.md`) disenada para que un chatbot externo genere prompts detallados, y diez slots de imagen de referencia para edicion multi-imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (text-to-image / image-editing); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | int8 (modelo de difusion, variante `pruned_int8_convrot`); nvfp4 + AWQ (text encoder Qwen3-VL 32B); w4a8 GPTQ (upsampler Qwen3.5 9B); fp16 (VAE) |
| Idiomas soportados | no disponible (el prompt guide esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Resolucion de salida | 16 MP nativo (5472x3072 en 16:9, 3552x4736 en 3:4); draft a 4 MP |
| Pasos de muestreo | 6 (destilado), CFG 1.0, sin prompt negativo |
| Sampler | SamplerLCM (s_noise 1.1 -> 0.9) + BasicScheduler simple |
| Slots de referencia | 10 (para edicion e imagenes multi-referencia) |
| Relaciones de aspecto | 1:1, 3:4, 4:3, 2:3, 3:2, 9:16, 16:9, 21:9 |
| Tamano total de ficheros | ~38 GB (45 GB con upsampler opcional) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo de difusion MiniMax H3 Image en el material proporcionado: no se especifica si emplea un transformer de difusion (DiT), un UNet o una variante hibrida, ni el numero de parametros. Lo que si se conoce es el pipeline completo de inferencia tal como lo configura el workflow: un text encoder Qwen3-VL de 32B en nvfp4 con AWQ, un modelo de difusion podado y cuantizado a int8 con la variante `convrot` (21 GB), un VAE fp16 (1.2 GB) y, opcionalmente, un upsampler de prompts Qwen3.5 9B en w4a8 GPTQ (7.3 GB).

El modelo esta destilado para 6 pasos de muestreo, lo que implica un entrenamiento orientado a reducir el numero de evaluaciones del modelo de difusion por imagen. El sampler recomendado es SamplerLCM con decaimiento de `s_noise` de 1.1 a 0.9, combinado con BasicScheduler simple, CFG fijado a 1.0 y ausencia de prompt negativo. El autor indica explicitamente que aumentar el numero de pasos no mejora el resultado, coherente con un proceso de destilacion por destilacion de trayectoria (LCM). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de imagenes text-to-image a resolucion nativa de 16 MP, con soporte de draft a 4 MP para iteracion rapida de prompts.
- Edicion de imagen unica mediante instrucciones en lenguaje natural (por ejemplo, cambiar la iluminacion de una habitacion o anadir un objeto).
- Composicion multi-referencia: hasta 10 imagenes de referencia simultaneas, referenciadas en el prompt como `<Picture 1>`, `<Picture 2>`, etc.
- Soporte de ocho relaciones de aspecto preconfiguradas (1:1, 3:4, 4:3, 2:3, 3:2, 9:16, 16:9, 21:9).
- Upsampling opcional de prompts mediante Qwen3.5 9B, que reescribe una idea corta en una descripcion larga y detallada (solo para text-to-image).
- Guia de prompts incluida para delegar la redaccion de prompts a chatbots externos (ChatGPT, Claude, Gemini o modelos locales).
- Capacidades especificas cubiertas por la guia: piel realista, manos, direccion del cuerpo, texto dentro de la imagen y correccion de problemas comunes.
- No se documentan capacidades de video, audio ni tool calling; es un modelo puramente de imagen.

## Casos de uso

- Generacion de ilustraciones editoriales a resolucion de impresion: el modelo produce 5472x3072 de forma nativa, suficiente para dobles paginas y portadas sin reescalado posterior, lo que evita artefactos de upscaling.
- Edicion fotorrealista de interiores y arquitectura: usando un slot de referencia con la foto original y un prompt de edicion, se puede cambiar la hora del dia, la iluminacion o anadir mobiliario manteniendo la perspectiva de la estancia.
- Composicion de producto con modelo: colocar a una persona de una imagen de referencia en un escenario de otra imagen, util para catalogos de moda o campanas publicitarias sin sesion fotografica adicional.
- Prototipado rapido de conceptos visuales: con el modo draft a 4 MP y 6 pasos, se pueden evaluar decenas de prompts en minutos antes de comprometer el render final a 16 MP.
- Generacion de assets para juegos y entornos 3D: texturas, fondos y concept art a alta resolucion que luego se recortan o reescalan para distintos formatos de destino.
- Iteracion de prompts asistida por IA: integrando la guia de prompts en un chatbot, un equipo no tecnico puede generar prompts de calidad profesional sin conocer la sintaxis del modelo.
- Ejecucion en hardware modesto: estudios pequenos con una RTX 3060 de 8 GB pueden producir imagenes de 16 MP, con tiempos estimados de alrededor de 60-230 segundos por imagen segun el caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, etc.) en la informacion disponible. El autor proporciona unicamente tiempos de render medidos en una RTX 5070 Ti (16 GB) con 24 GB de RAM de sistema, simulando las restricciones de VRAM de tarjetas de 12 y 8 GB mediante un programa que ocupaba memoria:

| Trabajo | 16 GB | 12 GB | 8 GB |
|---|---|---|---|
| Text-to-image, 16 MP | 66 s | 63 s | 60 s |
| Tiempo por paso (6 pasos) | 4,4 s | 4,8 s | 5,7 s |
| 4 imagenes de referencia, 16 MP | no disponible | no disponible | 228 s (~4 min) |
| 4 imagenes de referencia, 8 MP | no disponible | no disponible | 156 s (~2,5 min) |

El autor advierte que las tarjetas reales de 8 y 12 GB (RTX 4060, 3060, 4070, etc.) tienen chips mas lentos que la tarjeta de prueba, por lo que los tiempos reales seran mayores. La comparacion entre columnas confirma que la limitacion de memoria no altera la salida: las tres variantes generan imagenes identicas pixel a pixel con la misma semilla.

## Requisitos de hardware

- VRAM: 8 GB minimo (variante `8gb`), 12 GB recomendado (variante `12gb`), 16 GB o mas para la variante completa con decodificacion VAE normal.
- Memoria de sistema: el autor uso 24 GB de RAM; no se especifica un minimo, pero el streaming del modelo de 21 GB desde disco implica que se necesita espacio en disco y RAM suficiente para cache.
- Espacio en disco: aproximadamente 38 GB para los cuatro ficheros obligatorios (modelo de difusion, text encoder, VAE) y 45 GB si se incluye el upsampler opcional de prompts.
- GPU recomendadas: RTX 5070 Ti (probada por el autor), RTX 4090, RTX 4080, A100, H100. En gama consumer inferior, RTX 4060 Ti 16 GB, RTX 4070 12 GB, RTX 3060 12 GB y RTX 4060 8 GB deberian funcionar con tiempos mayores.
- Caben en GPU consumer: si, desde 8 GB, con decodificacion VAE tileada a 512 px en la variante de 8 GB y a 768 px en la de 12 GB.
- Opciones de despliegue: ComfyUI exclusivamente, con nodos nativos (no se requieren custom nodes). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de difusion.
- Throughput estimado: 6 pasos por imagen, entre 4,4 y 5,7 segundos por paso segun VRAM disponible; entre 60 y 66 segundos por imagen de 16 MP en text-to-image.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el material proporcionado. Los datos disponibles no incluyen parametros, contexto ni benchmarks de MiniMax H3 Image frente a alternativas de la misma categoria (por ejemplo, otros modelos de difusion text-to-image de alta resolucion), por lo que no es posible construir una comparativa fiable sin inventar cifras.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax H3 Image (este repo) | no disponible | no disponible | Apache 2.0 | ComfyUI, pesos en Comfy-Org/MiniMax-H3-Image |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Este repositorio contiene unicamente workflows de ComfyUI y una guia de prompts; no incluye los pesos del modelo, que deben descargarse por separado desde `Comfy-Org/MiniMax-H3-Image`.
- Los tiempos de render publicados se midieron en una RTX 5070 Ti con VRAM simulada; en tarjetas reales de 8 y 12 GB los tiempos seran significativamente mayores debido a chips mas lentos.
- El modelo esta destilado para 6 pasos: aumentar los pasos no mejora la calidad y solo incrementa el tiempo de inferencia.
- CFG fijado a 1.0 y sin prompt negativo implica que no se puede usar prompt negativo para suprimir elementos no deseados; la guia de prompts cubre correcciones mediante reformulacion.
- La decodificacion VAE tileada en las variantes de 8 y 12 GB puede introducir costuras sutiles en imagenes de 16 MP; la variante de 16 GB usa decodificacion normal.
- El upsampler de prompts (Qwen3.5 9B) solo funciona en text-to-image, no en edicion ni en composicion multi-referencia.
- La guia de prompts esta redactada en ingles; no se documenta soporte multilingue del modelo ni del text encoder para otros idiomas.
- No se dispone de informacion sobre sesgos del modelo, tasas de alucinacion visual ni limitaciones especificas de contenido; se recomienda evaluacion propia antes de uso en produccion.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los componentes auxiliares (Qwen3-VL 32B, Qwen3.5 9B) por si tienen licencias distintas.

## Enlaces

- Repositorio del workflow: https://huggingface.co/vyrekai/minimax-h3-image-comfyui-workflows
- Carpeta de ejemplos: https://huggingface.co/vyrekai/minimax-h3-image-comfyui-workflows/tree/main/examples
- Guia de prompts: https://huggingface.co/vyrekai/minimax-h3-image-comfyui-workflows/blob/main/MINIMAX_H3_IMAGE_PROMPT_GUIDE.md
- Pesos oficiales (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Modelo de difusion (descarga directa): https://huggingface.co/Comfy-Org/MiniMax-H3-Image/resolve/main/diffusion_models/minimax_h3_image_pruned_int8_convrot.safetensors
- Text encoder Qwen3-VL 32B: https://huggingface.co/Comfy-Org/MiniMax-H3-Image/resolve/main/text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors
- Upsampler de prompts Qwen3.5 9B: https://huggingface.co/Comfy-Org/MiniMax-H3-Image/resolve/main/text_encoders/qwen3.5_9b_w4a8_gptq.safetensors
- VAE: https://huggingface.co/Comfy-Org/MiniMax-H3-Image/resolve/main/vae/minimax_h3_image_vae_fp16.safetensors
