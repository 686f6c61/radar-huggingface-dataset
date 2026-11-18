# WAS/Minimax-h3_Singularity_v2_pruned

## Resumen

MiniMax H3 Singularity ref2va v2 pruned es una version podada y cuantizada del finetune comunitario Singularity ref2va v2, construido sobre el modelo base MiniMax H3 de MiniMax. El autor, WAS, publica tres variantes de pesos (int8, w6a8 y w4a8) en el formato pruned que ComfyUI emplea de forma nativa para sus releases de MiniMax H3, lo que permite cargar los archivos directamente con el nodo Load Diffusion Model sin conversiones adicionales. El modelo esta orientado a generacion de video: text-to-video, image-to-video y reference-to-video, y su pipeline declarado en Hugging Face es image-to-video.

La relevancia de esta publicacion es practica: el release original en bf16 ocupa un espacio considerable y exige mas memoria de la que muchas GPU de consumo ofrecen, mientras que estas variantes reducen el peso del archivo a 21 GB (int8), 16 GB (w6a8) o 11,8 GB (w4a8). El podado elimina el embedder de timestep y la proyeccion adaLN de ancho completo en cada uno de los 50 bloques transformer, sustituyendolos por una tabla `adaln_t_table` de 1025 x 8 y pesos adaLN de 8 canales, lo que retira 13 mil millones de pesos del grafo.

El repo completo ocupa 85,7 GB e incluye los archivos bf16 e int8 de referencia ademas de las variantes podadas. La build r2 corrige la ruta de construccion: los archivos int8 y w6a8 parten ahora del release bf16 en lugar del int8, con mejoras medibles en error de pesos y PSNR frente a la build r1. La licencia es la MiniMax H3 Community License Agreement, no una licencia open source estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para video, 50 bloques transformer, con podado de embedder de timestep y proyeccion adaLN sustituidos por tabla `adaln_t_table` (1025 x 8) y pesos adaLN de 8 canales |
| Parametros totales | no disponible (el podado retira 13 mil millones de pesos del grafo original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de video; la referencia de render usa 124 frames a 24 fps) |
| Tipos de cuantizacion | int8 convrot, w6a8 (group 32), w4a8 (group 16); release bf16 e int8 de referencia en el repo |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement |
| Formato de pesos | safetensors (layout pruned compatible con ComfyUI) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion para generacion de video, con 50 bloques transformer. El podado aplicado por WAS no altera la atencion ni las capas lineales principales, sino la ruta de modulacion temporal: el embedder de timestep y la proyeccion adaLN de ancho completo de cada bloque se reemplazan por una tabla `adaln_t_table` de 1025 x 8 y pesos adaLN de 8 canales, siguiendo el layout de curvas del release `minimax_h3_ref2va_pruned_int8_convrot` de ComfyUI. En los archivos r2 la tabla se deriva del propio embedder de timestep del release bf16, y la modulacion resultante queda dentro del 0,03 % de la del bf16 en todos los timesteps probados.

La cuantizacion se aplica sobre las lineales de los bloques transformer. El archivo int8 fija la escala de cada fila para minimizar el error; el w6a8 cuantiza ademas `final_layer.video_out` y mantiene el token refiner en int8 convrot, igual que el release w6a8 podado de ComfyUI. El w4a8 se construye desde el release int8, no desde bf16, porque la construccion desde bf16 rendia peor en todas las semillas probadas (20,2 dB frente a 21,5 dB). No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO en el finetune Singularity.

## Capacidades

- Generacion de video a partir de texto (text-to-video).
- Generacion de video a partir de imagen (image-to-video), pipeline declarado del repo.
- Generacion de video a partir de referencias (reference-to-video), origen del sufijo ref2va.
- Compatibilidad nativa con ComfyUI mediante el nodo Load Diffusion Model, con `weight_dtype` en `default`.
- Compatibilidad con LoRAs que no incluyan claves de adaLN ni de embedder de timestep, incluida la `minimax_h3_ref2v_turbo_4step_v0.1` recomendada por la model card de origen.
- Integracion con el VAE de video `minimax_h3_video_vae_int8_convrot` y el text encoder Qwen3-VL 32B de MiniMax H3.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Prototipado de video generativo en estaciones con GPU de consumo: la variante w4a8 de 11,8 GB permite cargar el modelo en tarjetas de 16 GB o 24 GB y validar prompts e ideas antes de escalar a la variante int8 o al bf16.
- Iteracion rapida en ComfyUI: al usar el layout pruned nativo, los archivos se cargan directamente con Load Diffusion Model y se combinan con el LoRA turbo de 4 pasos, lo que reduce el ciclo de prueba a unos pocos pasos de muestreo.
- Image-to-video para contenido de marketing: partiendo de una imagen fija de producto o escenario, el modelo anima la escena a 1344 x 768 y 24 fps, un formato adecuado para piezas cortas de redes sociales.
- Reference-to-video para mantener consistencia de personaje: la variante ref2va permite condicionar la generacion con referencias visuales, util en series de clips con el mismo protagonista o estilo.
- Generacion de video en pipelines por lotes: con la variante int8 (21 GB) y un nodo de carga estandar, se pueden encadenar renders nocturnos de multiples semillas y seleccionar por PSNR o inspeccion visual.
- Evaluacion comparativa de cuantizaciones: el repo incluye renders de referencia y calculos de PSNR por semilla, lo que sirve para decidir que variante usar segun la tolerancia a perdida de fidelidad frente al bf16 (26,1 dB int8, 24,4 dB w6a8, 21,5 dB w4a8).
- Fine-tuning ligero sobre la base podada: al conservar la estructura de bloques y solo sustituir la ruta adaLN, los LoRAs existentes sin claves de adaLN se aplican sin cambios, lo que facilita adaptaciones de estilo.

## Benchmarks y rendimiento

Los unicos datos publicados son comparaciones de fidelidad frente al release bf16, medidas como PSNR medio de todos los frames sobre cuatro semillas, con render a 1344 x 768, 124 frames a 24 fps, sampler euler, scheduler simple, 6 pasos, LoRA DMAD 4-step a 0,7 y atencion PyTorch.

| Archivo | Semilla 42 | Semilla 43 | Semilla 44 | Semilla 45 | Media |
|---|---:|---:|---:|---:|---:|
| bf16 release | referencia | referencia | referencia | referencia | referencia |
| pruned int8 convrot r2 | 23,3 | 24,9 | 28,2 | 28,0 | 26,1 dB |
| pruned w6a8 r2 | 23,5 | 24,2 | 24,3 | 25,8 | 24,4 dB |
| pruned w4a8 | 21,9 | 21,1 | 21,7 | 21,4 | 21,5 dB |

Errores de cuantizacion medidos frente al bf16:

| Metrica | r2 | r1 |
|---|---:|---:|
| Error de pesos int8, capas muestreadas | 0,87 % a 1,10 % | 1,30 % a 1,48 % |
| Error de modulacion de timestep | 0,02 % | 0,3 % a 0,6 % |
| PSNR medio int8, cuatro semillas | 26,1 dB | 24,6 dB |
| PSNR medio w6a8, cuatro semillas | 24,4 dB | 23,9 dB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de video estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; como referencia, el peso del archivo es de 21,0 GB (int8), 16,0 GB (w6a8) y 11,8 GB (w4a8), a lo que hay que sumar el VAE de video y el text encoder Qwen3-VL 32B.
- La variante w4a8 (11,8 GB) es la unica con margen razonable para GPU de consumo de 16 GB o 24 GB, siempre que el text encoder y el VAE se gestionen aparte o con offload.
- La variante w6a8 (16,0 GB) encaja en GPU de 24 GB con margen ajustado; la int8 (21,0 GB) requiere 24 GB o mas y deja poco espacio para el resto del pipeline.
- GPU recomendadas: no hay lista oficial; por tamano de pesos, A100 40/80 GB y H100 son las opciones seguras para int8, mientras que RTX 4090 (24 GB) queda al limite para int8 y es adecuada para w6a8 y w4a8.
- Despliegue: ComfyUI es la via documentada, con el nodo Load Diffusion Model y `weight_dtype` en `default`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponibles. El render de referencia usa 6 pasos con LoRA turbo de 4 pasos, lo que sugiere que el coste por clip es bajo en pasos pero alto en resolucion (1344 x 768, 124 frames).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| WAS/Minimax-h3_Singularity_v2_pruned (int8) | no disponible (podado de 13 mil millones de pesos) | video 1344 x 768, 124 frames a 24 fps | MiniMax H3 Community License Agreement | Hugging Face, 150.047 descargas |
| WAS/Minimax-h3_Singularity_v2_pruned (w4a8) | no disponible | mismo formato, 11,8 GB | MiniMax H3 Community License Agreement | Hugging Face |
| WarmBloodAban/Minimax-h3_Singularity | no disponible | release bf16 e int8 de origen | MiniMax H3 Community License Agreement | Hugging Face |
| MiniMaxAI/MiniMax-H3 | no disponible | modelo base | MiniMax H3 Community License Agreement | Hugging Face |

No se dispone de datos de benchmarks estandar que permitan comparar rendimiento con alternativas de otros autores; la comparacion disponible es interna al linaje Singularity y MiniMax H3.

## Limitaciones y advertencias

- La licencia es la MiniMax H3 Community License Agreement, no una licencia open source; el uso comercial esta sujeto a sus terminos y a la seccion III.2 sobre obras modificadas, que obliga a declarar la modificacion en los metadatos.
- Los archivos son versiones modificadas: la ruta de timestep esta reemplazada y los pesos transformer cuantizados; no son equivalentes bit a bit al release bf16.
- La perdida de fidelidad es medible: el w4a8 baja a 21,5 dB de PSNR medio y el w6a8 a 24,4 dB, frente a los 26,1 dB del int8; una sola semilla puede ordenar dos archivos cercanos de forma distinta, por lo que la media de cuatro semillas es la referencia valida.
- El w4a8 se construyo desde el release int8 y no desde bf16 porque la ruta bf16 rendia peor; esto implica una doble cuantizacion acumulada.
- Los LoRAs que incluyan claves de adaLN o de embedder de timestep no son compatibles con el layout podado.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion; al ser un modelo de video, el riesgo principal es la inconsistencia temporal y la deriva visual entre frames, no la alucinacion textual.
- El tamaño del repo (85,7 GB) exige planificar el almacenamiento antes de descargar; conviene bajar solo el archivo de la variante elegida.
- El text encoder Qwen3-VL 32B y el VAE `minimax_h3_video_vae_int8_convrot` son dependencias externas y no estan incluidos en estos archivos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WAS/Minimax-h3_Singularity_v2_pruned
- Modelo base del finetune: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Modelo base original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Commit de la build r1: https://huggingface.co/WAS/Minimax-h3_Singularity_v2_pruned/tree/ad7eb66157ff5fbe3429ef4413921fb0c7c9323f
- Render de referencia bf16: https://huggingface.co/WAS/Minimax-h3_Singularity_v2_pruned/blob/main/comparison/reference_bf16.mp4
- Render pruned int8 r2: https://huggingface.co/WAS/Minimax-h3_Singularity_v2_pruned/blob/main/comparison/pruned_int8_convrot_r2.mp4
- Render pruned w6a8 r2: https://huggingface.co/WAS/Minimax-h3_Singularity_v2_pruned/blob/main/comparison/pruned_w6a8_r2.mp4
- Render pruned w4a8: https://huggingface.co/WAS/Minimax-h3_Singularity_v2_pruned/blob/main/comparison/pruned_w4a8.mp4
- Contact sheet comparativo: https://huggingface.co/WAS/Minimax-h3_Singularity_v2_pruned/blob/main/comparison/contact_sheet.png
