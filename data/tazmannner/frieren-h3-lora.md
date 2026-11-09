# tazmannner/Frieren-H3-LoRA

## Resumen

Frieren-H3-LoRA es un adaptador LoRA de rango 16 desarrollado por el usuario tazmannner para el modelo de generación de vídeo MiniMax H3. El LoRA aprende el estilo visual, el reparto de personajes y las voces del anime *Sousou no Frieren* a partir de 672 clips de diálogo de tres segundos y 721 imágenes fijas, entrenados conjuntamente en imagen, vídeo y audio desde el primer paso. Su propósito es permitir la generación de vídeo texto-a-vídeo e imagen-a-vídeo con la estética y los personajes de la serie dentro del ecosistema ComfyUI.

El adaptador se distribuye como tres checkpoints en formato safetensors (pasos 3150, 3900 y 4200), con un tamaño de repositorio de 0,9 GB. Se entrenó sobre la base H3 FL2VA y también funciona sobre el modelo Ref2VA usando hojas de personaje como referencias de imagen. La model card incluye además una guía completa de construcción del dataset: detección de planos, corte de clips, captioning con Gemini, balanceo y entrenamiento.

La relevancia de esta ficha radica en que documenta un caso práctico de fine-tuning multimodal (vídeo más audio) sobre un modelo de generación de vídeo, con detalles operativos concretos sobre el pipeline de datos y el coste de entrenamiento (~14 horas en una RTX 5090). No obstante, se trata de un LoRA de nicho, sin descargas ni likes en el momento de la consulta, y con licencia no especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base MiniMax H3; rango 16, alpha 16, objetivos `attention;mlp;audio` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; se carga en ComfyUI a fuerza 1.0) |
| Idiomas soportados | no disponible (el modelo base H3 no especifica idiomas en la informacion proporcionada) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`FRIEREN_H3_V1-step00004200.safetensors`, `-step00003900.safetensors`, `-step00003150.safetensors`) |

## Arquitectura y entrenamiento

El LoRA se aplica sobre MiniMax H3, un modelo de generación de vídeo con capacidad de audio, y se entrena con un rango de 16 y alpha de 16, afectando a los módulos de atención, MLP y audio. El entrenamiento es multimodal conjunto desde el paso 0: imagen, vídeo y audio se procesan de forma simultánea, lo que permite al adaptador aprender tanto la estética visual como las voces de los personajes. Se ejecutaron 4.200 pasos (aproximadamente 5,5 épocas) durante unas 14 horas en una única RTX 5090, guardando checkpoints cada 150 pasos y validando cada 300.

El dataset se construyó con 672 clips de exactamente 73 fotogramas (3,04 s a 23,976 fps, 1920×1080) con audio, más 721 imágenes fijas a 1920×1080 (299 extraídas de clips y 422 capturas seleccionadas a mano). Los clips se cortaron con detección de escenas sobre un proxy a 270p, verificación con tres detectores de PySceneDetect y codificación x264 CRF 14 con audio AAC 256 kbps. Las imágenes fijas se entrenan a 1376×768, resolución superior a la de los clips, para preservar el detalle de línea y ojos. El captioning se realizó con Gemini (tres líneas por clip) y se corrigió manualmente con tamaños de plano, movimientos de cámara medidos y etiquetas de personaje verificadas. Se reservaron 30 clips y 30 imágenes para validación.

## Capacidades

- Generación de vídeo texto-a-vídeo con estética anime 2D y el estilo visual de *Sousou no Frieren*.
- Generación de vídeo imagen-a-vídeo usando hojas de personaje como referencia (compatible con el modelo Ref2VA).
- Generación de audio y voz asociada a los personajes (el LoRA incluye objetivos de audio).
- Reproducción de personajes concretos del reparto (Frieren, Fern, Stark, Himmel, Aura, Serie, Methode, entre otros).
- Control de iluminación y composición mediante indicaciones textuales (el checkpoint 3150 sigue mejor las pautas de iluminación).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo generativo de vídeo).
- Capacidades multilingües: no disponible.

## Casos de uso

- Producción de fan films y cortos de anime: el LoRA permite generar planos de 3 segundos con los personajes de la serie manteniendo coherencia visual y de voz, adecuado para prototipado rápido de escenas.
- Creación de contenido para redes sociales: generación de clips cortos con estética consistente de la serie, usando el checkpoint 4200 para maximizar el parecido facial.
- Previsualización de animación: los checkpoints permiten iterar sobre composición e iluminación antes de producir animación final, con el 3150 como opción para pruebas de luz.
- Doblaje y pruebas de voz: al incluir objetivos de audio, permite experimentar con voces de personajes en clips de diálogo de tres segundos.
- Diseño de personajes y hojas de referencia: combinado con Ref2VA y hojas de personaje, sirve para generar variaciones consistentes de un mismo personaje en distintos planos.
- Docencia e investigación en fine-tuning multimodal: la model card documenta el pipeline completo (detección de planos, captioning, balanceo, entrenamiento), útil como caso de estudio reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta únicamente pérdida de validación cualitativa (el checkpoint 4200 presenta la menor pérdida de validación y el 3900 la mejor puntuación de detalle fino), sin cifras numéricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base MiniMax H3 y de la resolución de generación (clips a 1920×1080, imágenes a 1376×768).
- GPU recomendadas: el entrenamiento se realizó en una RTX 5090; para inferencia se requiere una GPU capaz de ejecutar MiniMax H3 en ComfyUI (no se especifican modelos concretos).
- Cabe en GPU de consumo: el entrenamiento cupo en una RTX 5090, lo que sugiere que la inferencia es viable en GPU de gama alta de consumo, aunque no se detalla.
- Opciones de despliegue: ComfyUI (librería declarada), cargando los safetensors en `ComfyUI/models/loras/` a fuerza 1.0.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros LoRA o adaptadores comparables para MiniMax H3 ni métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada: no se aclaran las condiciones de uso comercial ni la redistribución; el autor declara no poseer los derechos de la obra original, lo que añade riesgo legal en uso comercial.
- Riesgo de alucinación visual: al ser un LoRA de estilo, puede generar personajes fuera de modelo o inconsistencias faciales, especialmente en checkpoints distintos del 4200.
- Dependencia del modelo base: requiere MiniMax H3 (FL2VA o Ref2VA) y ComfyUI; no es un modelo autónomo.
- Sesgos: no documentados en la información proporcionada; al entrenarse sobre un reparto mayoritariamente femenino y con balanceo manual hacia Stark y otras mujeres, el dataset puede estar sesgado hacia ciertos personajes.
- Limitaciones de contexto e idioma: no disponibles; el captioning se hizo en el formato de tres líneas de H3 y las indicaciones deben comenzar con el trigger `2d anime style, Frieren style,`.
- Advertencia de producción: repositorio sin descargas ni validación comunitaria (0 descargas, 0 likes en la fecha de consulta); usar con cautela en entornos productivos.
- Los clips de entrenamiento son de 3 segundos, por lo que la coherencia en secuencias más largas no está garantizada.

## Enlaces

- Hugging Face: https://huggingface.co/tazmannner/Frieren-H3-LoRA
- Vídeo supercut (checkpoint 3150): https://huggingface.co/tazmannner/Frieren-H3-LoRA/resolve/main/media/supercut.mp4
- Rejilla de clips generados: https://huggingface.co/tazmannner/Frieren-H3-LoRA/resolve/main/media/clips_grid.mp4
- Rejilla de imágenes generadas: https://huggingface.co/tazmannner/Frieren-H3-LoRA/resolve/main/media/stills_grid.jpg
- Tira de revisión de ventana de clip: https://huggingface.co/tazmannner/Frieren-H3-LoRA/resolve/main/media/window_strip.jpg
- Selección de imagen fija: https://huggingface.co/tazmannner/Frieren-H3-LoRA/resolve/main/media/still_pick.jpg
