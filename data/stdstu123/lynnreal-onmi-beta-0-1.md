# stdstu123/LynnReal-Onmi-beta-0.1

## Resumen

LynnReal-Omni beta 0.1 es un modelo generativo multimodal de vídeo desarrollado por el usuario stdstu123 y publicado bajo la familia LynnReal-Omni. Se distribuye en formato Diffusers y aborda una tarea poco habitual: unificar en un solo modelo la generación de vídeo a partir de texto, imagen, referencias visuales, control de pose corporal y de manos, edición de vídeo, reparación fotograma a fotograma y generación de vídeo largo en streaming. Su propuesta diferencial es la eficiencia en el muestreo: genera clips con solo cuatro pasadas del denoiser (variante Standard) o tres (variante Flash), frente a los 20-50 pasos típicos de los modelos de difusión de vídeo convencionales.

El modelo cuenta con 33.122.992.896 parámetros (unos 33,1 mil millones) según los pesos en safetensors, y el repositorio ocupa 403,5 GB, lo que refleja la presencia de múltiples checkpoints (Standard, Standard Lite, Flash, Flash Lite) además de VAEs, codificadores de texto y el paquete de nodos para ComfyUI. La arquitectura se basa en un transformer de difusión (DiT) con audio estéreo nativo, aunque la información disponible no detalla la composición interna de bloques ni el esquema de atención.

Su relevancia actual radica en la combinación de tres factores: la reducción drástica del coste de inferencia (un clip de cinco segundos a 1344×768 en aproximadamente 8,4 s sobre una H100 con la variante Flash), la publicación de checkpoints Lite con cuantización INT8 que reducen el peso en disco y la VRAM necesaria, y la integración lista para usar en ComfyUI con flujos de trabajo incluidos. La licencia es comunitaria (minimax-h3-community), no plenamente abierta, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para video con audio estereo nativo; pipeline `MiniMaxH3ModularPipeline` en diffusers |
| Parametros totales | 33.122.992.896 (33,1 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no de lenguaje; genera clips de 5 s) |
| Tipos de cuantizacion | BF16, INT8 (checkpoints Lite); VAE ligero (Light VAE) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community (licencia comunitaria, `license: other`) |
| Formato de pesos | safetensors (Diffusers) y formato ComfyUI en `comfyui/models/` |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un modelo de difusion basado en transformer (DiT) con generacion conjunta de video y audio estereo nativo, empaquetado como `MiniMaxH3ModularPipeline` en la libreria diffusers. El modelo opera con un numero muy reducido de pasos de denoising: cuatro pasadas en la variante Standard y tres en la variante Flash, lo que sugiere un entrenamiento especifico orientado a schedules de muestreo cortos (destilacion o entrenamiento directo con pocos pasos), aunque la model card no describe el metodo exacto.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La documentacion menciona la existencia de un articulo (arXiv:2609.15863) que presumiblemente contiene estos detalles, pero su contenido no forma parte de la informacion proporcionada. Si se documenta con precision la equivalencia bit a bit de los checkpoints Lite respecto a los originales (max |Δ| = 0 con semilla 970000 en t2v, i2v, r2v, pose2v y v2v), lo que indica que la compresion Lite no altera la salida del muestreo.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con audio estereo nativo.
- Generacion de video a partir de una imagen inicial (image-to-video).
- Generacion de video a partir de imagenes de referencia (reference-to-video, omni-reference).
- Control de pose corporal y de manos mediante clips de pose (pose-to-video).
- Edicion de video (video-to-video).
- Reparacion fotograma a fotograma (frame-by-frame repair).
- Generacion de video largo en streaming.
- Salida con audio estereo integrado en el propio clip.
- Integracion nativa con ComfyUI mediante paquete de nodos propio y flujos de trabajo incluidos.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso, por tratarse de un modelo generativo de video y no de un modelo de lenguaje.

## Casos de uso

- Produccion de clips publicitarios cortos: generacion de videos de cinco segundos a 1344×768 con audio estereo en una sola pasada de cuatro o tres steps, adecuada para iterar rapidamente sobre variantes creativas sin reentrenar nada.
- Previsualizacion de storyboards animados: a partir de una imagen clave (i2v) se obtiene un clip animado que permite validar encuadre, movimiento y ritmo antes de pasar a produccion final.
- Animacion de personajes con control de pose: el flujo pose2v permite trasladar un clip de movimiento corporal y de manos a un personaje generado, util en videojuegos, animacion y contenido para redes.
- Creacion de contenido con consistencia de referencias: el flujo r2v mantiene la identidad visual de personajes u objetos aportados como imagenes de referencia a lo largo del clip, apropiado para series o campanas con mascota o producto recurrente.
- Edicion y retoque de metraje existente: las capacidades de v2v y reparacion fotograma a fotograma permiten corregir artefactos, sustituir elementos o reestilizar planos sin regenerar el clip completo.
- Emision y generacion en directo: el modo de video largo en streaming posibilita la generacion continua de fragmentos, util para pantallas en eventos, instalaciones interactivas o entornos de emision automatizada.
- Prototipado rapido en equipos con VRAM limitada: con los checkpoints Lite (Flash Lite INT8 de 16,7 GiB o Standard Lite INT8 de 20,4 GiB) y el Light VAE, el modelo cabe en GPUs de gama alta de consumo, lo que facilita la experimentacion local frente a depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de inferencia medidas sobre una H100 de 80 GB a 1344×768:

| Variante | Pasos | Duracion del clip | Tiempo de generacion (H100 80 GB, warm) |
|---|---|---|---|
| Standard 4-step | 4 | 5 s | aproximadamente 50 s |
| Flash 3-step | 3 | 5 s | aproximadamente 8,4 s |

No se proporcionan cifras de FVD, CLIP score, metricas de calidad de audio ni comparaciones cuantitativas con otros modelos de generacion de video.

## Requisitos de hardware

- VRAM estimada: no se publica una cifra de VRAM total en ejecucion. La model card advierte explicitamente que los tamanos de los checkpoints DiT no equivalen a la VRAM de inferencia, ya que el codificador de texto, los VAEs y los tensores intermedios tambien consumen memoria.
- Checkpoints DiT disponibles y su peso en disco: Standard BF16 61,7 GiB; Standard Lite BF16 37,6 GiB; Standard Lite INT8 20,4 GiB; Flash 37,0 GiB; Flash Lite INT8 16,7 GiB.
- GPU recomendadas: H100 80 GB es la referencia con la que se midieron los tiempos (aproximadamente 50 s en Standard y 8,4 s en Flash para un clip de 5 s a 1344×768). Para configuraciones Lite se recomienda una GPU con suficiente VRAM para alojar el checkpoint INT8 mas el codificador de texto y los VAEs; no se especifican modelos concretos de consumo valido.
- GPU de consumo: no se confirma que quepa en tarjetas consumer; la documentacion solo menciona que los Lite estan pensados para VRAM limitada y cita una RTX 5090 en el contexto de una correccion de errores del nodo de ComfyUI con torch 2.8 y compilaciones cu13x, sin afirmar que el modelo completo quepa en ella.
- Opciones de despliegue: diffusers (pesos en formato Diffusers) y ComfyUI mediante el paquete de nodos `ComfyUI-LynnReal` y los flujos de trabajo incluidos (`t2v`, `i2v`, `r2v`, `pose2v`, `v2v`, en versiones de 4 y 3 pasos y variantes `*_lite.json`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, logicos por otra parte al no ser un modelo de lenguaje.
- Latencia y throughput: un clip de 5 s a 1344×768 tarda aproximadamente 50 s en Standard y aproximadamente 8,4 s en Flash sobre una H100 80 GB en caliente. No se publican cifras para otras GPUs ni para resoluciones distintas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos de generacion de video en la informacion proporcionada. La model card no cita alternativas. Como referencia de categoria, el modelo se situa en el segmento de generadores de video texto-a-video e imagen-a-video con audio, pero no es posible establecer una comparativa cuantitativa de parametros, contexto, rendimiento, licencia y disponibilidad frente a otros modelos sin inventar datos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LynnReal-Omni beta 0.1 | 33,1 mil millones | no disponible (clips de 5 s) | sin benchmarks publicados; 8,4 s/clip en Flash sobre H100 | minimax-h3-community | Hugging Face, diffusers, ComfyUI |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado beta (version 0.1): el propio nombre del modelo indica que es una version preliminar, con cambios frecuentes documentados en el CHANGELOG y correcciones recientes de errores en el nodo de ComfyUI.
- Licencia comunitaria `minimax-h3-community`: no es una licencia de codigo abierto estandar. Es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que puede imponer restricciones de uso, atribucion o redistribucion.
- Pasos de muestreo fijados: la model card advierte que Standard Lite debe usarse con 4 pasos y Flash Lite con 3 pasos; otros valores no estan validados. No se debe asumir que aumentar los pasos mejora la calidad.
- Consumo de memoria no trivial: los tamanos de checkpoint no equivalen a la VRAM total necesaria; el codificador de texto, los VAEs y los tensores intermedios anaden consumo, por lo que desplegar en GPUs de gama media o consumer puede no ser viable.
- Idiomas soportados no documentados: no se especifica que idiomas acepta el codificador de texto, lo que limita la planificacion de despliegues multilingues.
- Riesgo de artefactos y alucinacion visual: como todo modelo generativo de video, puede producir incoherencias temporales, deformaciones anatomicas o desalineacion entre el audio y la imagen; no se documentan tasas de fallo ni evaluaciones de sesgo.
- Sesgos: no se publica informacion sobre sesgos demograficos, culturales o de representacion en los datos de entrenamiento.
- Dependencia de ComfyUI para el flujo principal: la integracion documentada esta orientada a ComfyUI y diffusers; no se detallan otras rutas de despliegue ni garantias de estabilidad fuera de esas herramientas.
- Repositorio de gran tamano (403,5 GB): requiere espacio de almacenamiento considerable y una gestion cuidadosa de descargas selectivas de checkpoints.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stdstu123/LynnReal-Onmi-beta-0.1
- Repositorio de codigo: https://github.com/LynnReal-AI/LynnReal-Omni
- Articulo (arXiv): https://arxiv.org/abs/2609.15863
- Demo en YouTube: https://www.youtube.com/watch?v=P5Bl2mriEmk
- Demo en Bilibili: https://www.bilibili.com/video/BV12vYB6BEjc/
- Changelog: https://huggingface.co/stdstu123/LynnReal-Onmi-beta-0.1/blob/main/CHANGELOG.md
- Licencia: https://huggingface.co/stdstu123/LynnReal-Onmi-beta-0.1/blob/main/LICENSE
- Checkpoints ComfyUI: https://huggingface.co/stdstu123/LynnReal-Onmi-beta-0.1/tree/main/comfyui/models/diffusion_models
- Nodos ComfyUI: https://huggingface.co/stdstu123/LynnReal-Onmi-beta-0.1/tree/main/comfyui/custom_nodes/ComfyUI-LynnReal
- Flujo t2v (4 pasos): https://huggingface.co/stdstu123/LynnReal-Onmi-beta-0.1/blob/main/comfyui/workflows/t2v_lynnreal_4step.json
- Flujo i2v (4 pasos): https://huggingface.co/stdstu123/LynnReal-Onmi-beta-0.1/blob/main/comfyui/workflows/i2v_lynnreal_4step.json
- Flujo r2v (4 pasos): https://huggingface.co/stdstu123/LynnReal-Onmi-beta-0.1/blob/main/comfyui/workflows/r2v_lynnreal_4step.json
- Flujo pose2v (4 pasos): https://huggingface.co/stdstu123/LynnReal-Onmi-beta-0.1/blob/main/comfyui/workflows/pose2v_lynnreal_4step.json
