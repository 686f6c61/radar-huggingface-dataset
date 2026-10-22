# WAS/Minimax-h3_Singularity_v2_pruned

## Resumen

Minimax-h3_Singularity_v2_pruned es un conjunto de tres ficheros safetensors derivados de `Minimax-h3_Singularity_ref2va_v2_int8.safetensors`, el fine-tune de vídeo de WarmBloodAban sobre MiniMax H3 (modelo de MiniMax). El trabajo lo publica el usuario WAS y consiste en una poda del camino de modulación temporal del modelo más dos recuantizaciones adicionales, manteniendo el formato de los lanzamientos pruned oficiales de ComfyUI para que el modelo se cargue de forma nativa con el nodo Load Diffusion Model.

El modelo es un generador de vídeo por difusión (pipeline image-to-video, con soporte declarado también de text-to-video y reference-to-video) compuesto por 50 bloques transformer, un VAE de vídeo (`minimax_h3_video_vae_int8_convrot`) y el text encoder Qwen3-VL 32B en la variante MiniMax H3. La poda sustituye el timestep embedder y la proyección adaLN de ancho completo de cada uno de los 50 bloques —13.000 millones de pesos en total— por una tabla `adaln_t_table` de 1025 x 8 y pesos adaLN de anchura 8; según el autor, la modulación resultante se mantiene dentro del 0,025 % de la del modelo original en cada timestep probado.

Su relevancia es práctica: reduce el peso de los ficheros de 21,0 GB (int8 pruned) a 16,0 GB (w6a8) y 11,8 GB (w4a8), lo que acerca la inferencia a GPUs de consumo, a costa de una pérdida medible de fidelidad frente al render de referencia (PSNR de 29,1 dB, 26,2 dB y 21,4 dB respectivamente). Es un modelo de vídeo, no un LLM: no ofrece tool calling ni razonamiento multi-paso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (50 bloques transformer) con VAE de vídeo y text encoder Qwen3-VL 32B en la variante MiniMax H3 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se documenta arquitectura MoE) |
| Longitud de contexto | no disponible (la comparación del autor genera 124 fotogramas a 24 fps, unos 5,2 s, a 1344 x 768) |
| Tipos de cuantización | int8 convrot; w6a8 (grupo 32); w4a8 (grupo 16) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 48,7 GB (los tres ficheros de difusión: 21,0 GB, 16,0 GB y 11,8 GB) |
| Pipeline declarado | image-to-video (tags: text-to-video, image-to-video, reference-to-video) |
| Poda aplicada | timestep embedder y proyección adaLN de ancho completo en los 50 bloques: 13.000 millones de pesos sustituidos por `adaln_t_table` 1025 x 8 y pesos adaLN de anchura 8 |
| Modelo base | WarmBloodAban/Minimax-h3_Singularity y MiniMaxAI/MiniMax-H3 |
| Descargas / likes | 0 / 2 |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para vídeo. El autor no entrena desde cero: parte del fichero int8 de `Minimax-h3_Singularity_ref2va_v2` y aplica una poda estructural sobre el camino de modulación. En cada uno de los 50 bloques transformer se eliminan el timestep embedder y la proyección adaLN de ancho completo, que se reemplazan por una tabla `adaln_t_table` de 1025 x 8 y pesos adaLN de anchura 8, replicando el esquema de los lanzamientos pruned de ComfyUI (`minimax_h3_ref2va_pruned_int8_convrot`). El resto de tensores del fichero int8 es idéntico byte a byte al original, y el autor reporta que la modulación producida por las capas podadas se desvía menos del 0,025 % respecto al modelo fuente en todos los timesteps probados.

Sobre esa base podada se construyen las otras dos variantes: `w6a8` (grupo 32) y `w4a8` (grupo 16) cuantizan las capas lineales de los bloques transformer y `final_layer.video_out`, dejando el token refiner en int8 convrot, igual que hace el lanzamiento pruned w6a8 de ComfyUI. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO: el fine-tune subyacente es de WarmBloodAban y sus datos de entrenamiento no se detallan aquí. La innovación destacable es la poda del camino adaLN con preservación casi exacta de la modulación, que habilita cuantizaciones más agresivas sin reentrenar.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video), el pipeline declarado en el repositorio.
- Generación de texto a vídeo (text-to-video), según los tags del autor.
- Generación con referencia (reference-to-video), orientada a mantener la identidad o el aspecto de un sujeto de referencia; la variante se denomina `ref2va`.
- Composición de resolución 1344 x 768 y secuencias de 124 fotogramas a 24 fps en la configuración de comparación publicada.
- Carga nativa en ComfyUI mediante Load Diffusion Model con `weight_dtype` en `default`.
- Compatibilidad con LoRAs que no contengan claves adaLN ni de timestep embedder, incluida la recomendada por el autor del fine-tune, `minimax_h3_ref2v_turbo_4step_v0.1`.
- Tres niveles de compromiso tamaño/fidelidad: int8 pruned (21,0 GB), w6a8 (16,0 GB) y w4a8 (11,8 GB).
- No soporta tool calling, function calling ni razonamiento agéntico: es un modelo generativo de vídeo, no un modelo de lenguaje.
- Cobertura multilingüe: no disponible (el text encoder es Qwen3-VL 32B, pero el autor no documenta idiomas).

## Casos de uso

- Generación de vídeo a partir de una imagen fija en producción publicitaria: se parte de un key visual y se anima con image-to-video; la variante w6a8 (16,0 GB) permite ejecutarlo en GPUs de 24 GB sin renunciar a una fidelidad de 26,2 dB de PSNR frente al render de referencia.
- Series con personaje consistente mediante reference-to-video: el modo `ref2va` toma una referencia visual para mantener la identidad del sujeto entre planos, útil en capítulos cortos o contenido de marca recurrente.
- Iteración rápida en estudio con ComfyUI: al cargarse de forma nativa con Load Diffusion Model y admitir LoRAs turbo de 4 pasos, encaja en flujos de previsualización donde se encadenan varios renders por sesión.
- Pruebas de concepto y previsualizaciónaudiovisual en equipos con una sola GPU: el fichero w4a8 (11,8 GB) permite generar borradores a 1344 x 768 sin acceso a clúster, aceptando el deterioro de calidad (21,4 dB de PSNR) en la fase de exploración.
- Investigación sobre cuantización y poda de modelos de difusión: el repositorio publica el detalle exacto de la poda (13.000 millones de pesos, tabla 1025 x 8, desviación del 0,025 %) y renders comparativos, lo que sirve como caso de estudio reproducible de cuantización post-entrenamiento en vídeo.
- Ampliación de datasets de vídeo sintético: generación de clips cortos de 124 fotogramas a 24 fps para aumentar corpus de entrenamiento o evaluar modelos de vídeo, con la ventaja de poder elegir el nivel de cuantización según el presupuesto de cómputo.
- Integración en pipelines de automatización por lotes en ComfyUI: al ser un fichero safetensors estándar en el layout pruned de ComfyUI, se puede orquestar desde scripts que encolen prompts y referencias sin adaptadores adicionales.

## Benchmarks y rendimiento

El autor no publica MMLU, HumanEval, GSM8K ni métricas de ese tipo (no aplican a un modelo de vídeo). El único dato cuantitativo es la fidelidad frente al render de referencia, medida como PSNR medio de todos los fotogramas, con la misma configuración: 1344 x 768, 124 fotogramas a 24 fps, semilla 42, sampler euler, scheduler simple, 6 pasos, LoRA DMAD de 4 pasos a 0,7, atención PyTorch, `minimax_h3_video_vae_int8_convrot` y text encoder Qwen3-VL 32B MiniMax H3.

| Fichero | PSNR medio vs. fuente | Tamaño |
|---|---:|---:|
| source v2 int8 (referencia) | — | no disponible |
| pruned int8 convrot | 29,1 dB | 21,0 GB |
| pruned w6a8 | 26,2 dB | 16,0 GB |
| pruned w4a8 | 21,4 dB | 11,8 GB |
| source v2 int8 re-renderizado con otro estado de memoria | 24,7 dB | no disponible |

El propio autor señala que la variación entre dos ejecuciones del modelo fuente bajo estados de memoria distintos en ComfyUI (24,7 dB) es mayor que la que introduce la poda int8 (29,1 dB), y que dos ejecuciones con el mismo estado de memoria son idénticas fotograma a fotograma. No hay datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM para los pesos de difusión (estimación a partir del tamaño de fichero, no publicada por el autor): en torno a 21-24 GB para el int8 pruned, 16-20 GB para w6a8 y 12-16 GB para w4a8, sin contar activaciones ni el VAE.
- El text encoder es Qwen3-VL 32B, ejecutado aparte en la configuración del autor; requiere memoria adicional considerable y conviene servirlo en una precision reducida o descargarlo entre fases.
- GPU recomendadas para la variante int8 pruned: A100 40/80 GB, H100 o RTX 4090 24 GB (esta última al límite, con offload).
- GPU para w6a8: RTX 3090 / 4090 (24 GB) con margen; posible en 16 GB recurriendo a offload de bloques.
- GPU para w4a8: tarjetas de 16 GB e, incluso, 12 GB con offload agresivo; es la variante pensada para hardware de consumo.
- Despliegue: ComfyUI es la vía soportada de forma nativa (nodo Load Diffusion Model, `weight_dtype` en `default`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles. La configuración de referencia usa 6 pasos con una LoRA DMAD de 4 pasos a 0,7, lo que reduce el número de evaluaciones del modelo, pero el autor no publica tiempos por clip.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / salida | Fidelidad (PSNR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pruned int8 convrot (este repo) | no disponible | 124 fotogramas, 1344 x 768 | 29,1 dB | MiniMax H3 Community License | safetensors, 21,0 GB |
| Pruned w6a8 (este repo) | no disponible | 124 fotogramas, 1344 x 768 | 26,2 dB | MiniMax H3 Community License | safetensors, 16,0 GB |
| Pruned w4a8 (este repo) | no disponible | 124 fotogramas, 1344 x 768 | 21,4 dB | MiniMax H3 Community License | safetensors, 11,8 GB |
| WarmBloodAban/Minimax-h3_Singularity (fuente del fine-tune) | no disponible | no disponible | referencia | MiniMax H3 Community License | safetensors int8 |
| MiniMaxAI/MiniMax-H3 (modelo base) | no disponible | no disponible | referencia | MiniMax H3 Community License | repositorio oficial de MiniMax |

No se dispone de datos de benchmarks ni de especificaciones de modelos de vídeo de otros fabricantes en la información proporcionada, por lo que la comparación se limita a las variantes de la propia familia. Cualquier comparación con alternativas externas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- La variante w4a8 pierde fidelidad de forma apreciable: 21,4 dB de PSNR, por debajo incluso de la variación entre ejecuciones del modelo fuente bajo estados de memoria distintos (24,7 dB). No es adecuada para entregables finales.
- La poda elimina el timestep embedder y las proyecciones adaLN de los 50 bloques; los LoRAs que incluyan claves adaLN o de timestep embedder no se aplicarán correctamente. Solo son compatibles los que carecen de esas claves.
- El modelo es un derivado modificado del fichero int8 de Singularity v2, declarado como tal bajo la sección III.2 de la MiniMax H3 Community License Agreement; los metadatos de cada safetensors lo indican. Cualquier uso comercial debe revisarse contra el texto de la licencia y el NOTICE, que no se reproducen en la información disponible.
- No hay información sobre sesgos, riesgo de alucinación visual, idiomas soportados ni comportamiento en dominios distintos del de la demostración publicada.
- La validación comunitaria es mínima: 0 descargas y 2 likes en el momento de la ficha, con el repositorio creado y actualizado el mismo día (21 de octubre de 2026).
- El autor de la ficha (WAS) es el cuantizador, no el autor del fine-tune (WarmBloodAban) ni del modelo base (MiniMax); los méritos y las limitaciones del fine-tune original no se documentan aquí.
- El repositorio ocupa 48,7 GB, lo que exige espacio en disco y tiempo de descarga considerables; conviene descargar solo la variante necesaria.
- No hay métricas de latencia ni de throughput publicadas, así que no se puede estimar coste por clip sin medirlo en el hardware objetivo.
- El resultado de la búsqueda web realizada no contiene ninguna fuente relevante sobre este modelo (devuelve páginas sobre gramática inglesa y WhatsApp), por lo que no se ha podido contrastar información externa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/WAS/Minimax-h3_Singularity_v2_pruned
- Licencia: https://huggingface.co/WAS/Minimax-h3_Singularity_v2_pruned/blob/main/LICENSE
- Aviso legal: https://huggingface.co/WAS/Minimax-h3_Singularity_v2_pruned/blob/main/NOTICE
- Renders comparativos: https://huggingface.co/WAS/Minimax-h3_Singularity_v2_pruned/tree/main/comparison
- Fine-tune de origen (WarmBloodAban): https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Perfil del autor del fine-tune: https://huggingface.co/WarmBloodAban
