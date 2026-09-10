# wolf1280/LTX-2.3

## Resumen

LTX-2.3 es un modelo fundacional de generación conjunta de audio y vídeo desarrollado por Lightricks, construido sobre una arquitectura DiT (Diffusion Transformer) y publicado con pesos abiertos. A diferencia de los pipelines que encadenan un modelo de vídeo y otro de audio por separado, LTX-2.3 genera ambas modalidades de forma sincronizada dentro de un único modelo, lo que permite obtener pistas de audio alineadas con la imagen sin post-procesado de alineación. La ficha corresponde a una reproducción alojada en el repositorio `wolf1280/LTX-2.3` (0 descargas, 0 likes), cuyo contenido reproduce la model card oficial de Lightricks.

La versión 2.3 es una actualización de LTX-2 centrada en calidad audiovisual y adherencia al prompt. El modelo se distribuye en una variante completa de 22.000 millones de parámetros entrenable en bf16 (`ltx-2.3-22b-dev`), variantes destiladas de 8 pasos con CFG=1 (`ltx-2.3-22b-distilled` y `-1.1`), adaptadores LoRA de destilación y una familia de upscalers espaciales y temporales para pipelines multietapa.

Es relevante porque cubre un espectro amplio de tareas multimodales condicionadas (texto, imagen, vídeo y audio como entradas) con licencia comunitaria y ejecución local, en un momento en el que la generación de vídeo con audio sincronizado está dominada por APIs cerradas. El repositorio ocupa 156 GB y la librería declarada es Diffusers, aunque el soporte en esa librería está anunciado como "próximamente" en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para generacion conjunta de audio y video |
| Parametros totales | 22 000 millones (nomenclatura `ltx-2.3-22b-*` de los checkpoints) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible; las restricciones publicadas son de resolucion y fotogramas (ancho y alto divisibles por 32, numero de fotogramas divisible por 8 + 1) |
| Tipos de cuantizacion | no disponible como formatos de cuantizacion; se publican pesos bf16 (dev), variantes destiladas de 8 pasos con CFG=1 y LoRAs de destilacion |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt (la seccion Model Details de la model card indica unicamente "English", lo que contradice los metadatos de idiomas) |
| Licencia | ltx-2-community-license-agreement (enlazada a `github.com/Lightricks/LTX-2/blob/main/LICENSE-2`) |
| Formato de pesos | no especificado de forma explicita; repositorio de 156 GB distribuido para la libreria diffusers |

## Arquitectura y entrenamiento

LTX-2.3 es un modelo de difusion basado en transformer (DiT) disenado como modelo fundacional audiovisual conjunto. La innovacion central es que un mismo modelo genera video y audio sincronizados, en lugar de componer dos sistemas independientes. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon etapas de RLHF o DPO; esa informacion no esta disponible en el material proporcionado. Si se documenta que la version completa (dev) es entrenable en bf16 y que el repositorio `Lightricks/LTX-2` es un monorepo con los paquetes `ltx-core` (definicion del modelo), `ltx-pipelines` (pipelines de inferencia) y `ltx-trainer` (entrenamiento).

El sistema se apoya en una familia de checkpoints complementarios que definen el pipeline de generacion: el modelo completo, variantes destiladas de 8 pasos con CFG=1 (incluida una v1.1 con estetica distinta y mejor audio), LoRAs de destilacion aplicables al modelo completo, un upscaler espacial x2 y otro x1.5 sobre los latentes de LTX-2.3, y un upscaler temporal x2 para aumentar los FPS. Los pipelines multietapa (multiscale) combinan estos upscalers para alcanzar mayor resolucion y tasa de fotogramas. La model card indica que entrenar LoRAs de movimiento, estilo o semejanza (sonido y apariencia) puede llevar menos de una hora en muchos escenarios.

## Capacidades

- Generacion de video a partir de texto (text-to-video) y a partir de imagen (image-to-video), que es el pipeline declarado en los metadatos.
- Generacion de video condicionada conjuntamente por imagen y texto (image-text-to-video).
- Transformacion de video existente (video-to-video).
- Generacion y condicionamiento de audio: text-to-audio, video-to-audio y audio-to-audio.
- Condicionamiento cruzado audio-video: audio-to-video y video-to-audio.
- Generacion conjunta audiovisual en una sola pasada: text-to-audio-video, image-to-audio-video e image-text-to-audio-video.
- Superresolucion espacial de latentes mediante upscalers x2 y x1.5, e interpolacion temporal mediante upscaler x2 para aumentar FPS.
- Personalizacion mediante LoRA e IC-LoRA (movimiento, estilo, semejanza de sonido y apariencia) sobre el modelo base entrenable.
- Soporte de multiples idiomas en la metadata (en, de, es, fr, ja, ko, zh, it, pt), aunque la seccion oficial de detalles solo menciona ingles.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; no es un modelo de lenguaje agentico.

## Casos de uso

- Prototipado de video publicitario con audio: a partir de una imagen de producto y un prompt de texto, el modelo genera un clip con banda sonora sincronizada, evitando montar por separado un generador de video y otro de audio.
- Doblaje y re-sonorizacion de clips: usando el modo video-to-audio, se puede generar una pista de audio coherente con un video existente, util en localizacion de contenido o sustitucion de musica por derechos.
- Animacion de fotografia fija (image-to-video): convertir retratos o ilustraciones en clips cortos en movimiento para redes sociales o presentaciones, partiendo de un unico fotograma.
- Iteracion creativa sobre material rodado (video-to-video): reestilizar o transformar metraje existente manteniendo la estructura temporal, con la opcion de acompasar el audio generado.
- Escalado de resolucion y FPS en postproduccion: aplicar los upscalers espaciales x2/x1.5 y el temporal x2 sobre latentes generados por el propio modelo para entregar material de mayor calidad sin reentrenar.
- Investigacion en generacion audiovisual conjunta: la variante dev es totalmente entrenable en bf16 y el monorepo incluye `ltx-trainer`, lo que permite reproducir LoRAs y estudiar tecnicas de destilacion sobre un modelo de 22B con pesos abiertos.
- Creacion de personajes y estilos consistentes: entrenar LoRAs de semejanza (apariencia y voz) en menos de una hora para series de clips con identidad visual y sonora estable.
- Generacion de audio a partir de video (video-to-audio) en accesibilidad: producir descripciones sonoras o ambientes para contenido que carece de pista de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de calidad de video (FVD, CLIPScore, sincronizacion audio-video), y los resultados de la busqueda web no aportan datos verificables sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22.000 millones de parametros, los pesos en bf16 ocupan aproximadamente 44 GB, a los que hay que sumar activaciones, latentes y decodificadores de video y audio. Se trata de una estimacion derivada del tamano del modelo, no de cifras publicadas en la ficha.
- GPU recomendadas: para la variante completa en bf16, GPUs de 80 GB (H100, A100 80 GB) o configuraciones multi-GPU. Las variantes destiladas de 8 pasos con CFG=1 reducen el coste por generacion al requerir muchos menos pasos de muestreo.
- Cabe en GPU de consumo: no hay datos oficiales; con 22B en bf16 no cabe en una RTX 4090 de 24 GB sin cuantizacion u offloading, opciones que la model card no documenta.
- Opciones de despliegue: el codigo de referencia es el monorepo `Lightricks/LTX-2` (paquete `ltx-pipelines`), con Python >= 3.12, CUDA > 12.7 y PyTorch ~= 2.7. Tambien hay soporte mediante nodos de LTXVideo en ComfyUI (instalables desde el ComfyUI Manager) y una API en la nube. El soporte en Diffusers figura como "proximamente".
- Latencia y throughput estimados: no disponibles. La unica referencia indirecta es que las variantes destiladas usan 8 pasos con CFG=1.

## Comparativa con modelos similares

No se han proporcionado datos comparativos verificables en la informacion disponible (la busqueda web devolvio resultados no relacionados con el modelo). Como referencia cualitativa de categoria, los modelos de generacion de video con pesos abiertos mas cercanos serian las familias HunyuanVideo, Wan 2.x y Mochi 1, pero no se dispone de cifras de parametros, contexto, rendimiento o licencia contrastadas en este material para construir una tabla fiable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.3 | 22B | no disponible | no disponible | ltx-2-community-license-agreement | pesos abiertos en HuggingFace, demo en la nube y ComfyUI |
| Alternativas de generacion de video con pesos abiertos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no esta disenado ni es capaz de proporcionar informacion factual.
- Como modelo estadistico, puede amplificar sesgos sociales existentes.
- Puede no generar videos que coincidan perfectamente con el prompt; el seguimiento de instrucciones depende en gran medida del estilo de redaccion del prompt.
- Puede producir contenido inapropiado u ofensivo.
- Cuando se genera audio sin voz, la calidad del audio puede ser inferior.
- Restricciones tecnicas de forma de entrada: ancho y alto deben ser divisibles por 32, y el numero de fotogramas debe ser divisible por 8 + 1; en caso contrario hay que rellenar con -1 y recortar despues.
- La licencia es comunitaria (`ltx-2-community-license-agreement`), no una licencia de codigo abierto estandar; conviene revisar los terminos en `github.com/Lightricks/LTX-2/blob/main/LICENSE` antes de un uso comercial.
- El soporte en Diffusers esta anunciado como "proximamente", por lo que la integracion via esa libreria puede no estar disponible.
- La model card oficial declara "English" como unico idioma en Model Details, mientras que los metadatos enumeran nueve idiomas; existe una inconsistencia no resuelta sobre el alcance multilingue real.
- El repositorio consultado corresponde a una reproduccion de terceros (`wolf1280/LTX-2.3`) con 0 descargas y 0 likes; para uso en produccion conviene verificar el repositorio oficial de Lightricks.

## Enlaces

- Repositorio consultado en HuggingFace: https://huggingface.co/wolf1280/LTX-2.3
- Modelo oficial LTX-2: https://huggingface.co/Lightricks/LTX-2
- Paper (arXiv 2601.03233) - LTX-2: Efficient Joint Audio-Visual Foundation Model: https://huggingface.co/papers/2601.03233
- Repositorio de codigo LTX-2: https://github.com/Lightricks/LTX-2
- Licencia LTX-2: https://github.com/Lightricks/LTX-2/blob/main/LICENSE
- Licencia comunitaria (referenciada en la ficha): https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2
- Paquete de pipelines de inferencia: https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-pipelines/README.md
- Paquete de entrenamiento: https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-trainer/README.md
- Demo interactiva (image-to-video): https://app.ltx.studio/ltx-2-playground/i2v
- Playground de API: https://console.ltx.video/playground/
- Video de presentacion en YouTube: https://youtu.be/o-7us-BR_gQ
- Guia de prompting: https://ltx.video/blog/how-to-prompt-for-ltx-2
- Documentacion de integracion con ComfyUI: https://docs.ltx.video/open-source-model/integration-tools/comfy-ui
- Documentacion de Diffusers: https://huggingface.co/docs/diffusers/main/en/index
