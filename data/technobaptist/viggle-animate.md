# TechnoBaptist/Viggle-Animate

## Resumen

Viggle-Animate es un modelo de video-to-video desarrollado por Viggle y publicado en HuggingFace por TechnoBaptist. Reemplaza el personaje de un video con lo que se pinte en uno de sus propios frames, manteniendo el movimiento, la cámara y el timing intactos. Es un finetune completo de 33,1 B parámetros del transformador ref2va de MiniMax-H3, destilado con DMD a solo tres forward passes. A diferencia de otros sistemas de reemplazo de personajes, no utiliza pose estimators, segmentadores, face trackers ni text encoder: la apariencia entra solo por el frame repintado y la geometría por el video de conducción. El flujo típico es repintar un frame con un modelo de imagen y dejar que Viggle-Animate propague el cambio al clip. Es relevante por su eficiencia: renderiza 124 frames en 26 segundos en una B200, 6,1 veces más rápido que Wan2.2-Animate-14B, y generaliza a cualquier tipo de personaje porque no asume anatomía humana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (finetune del bloque ref2va de MiniMax-H3) |
| Parámetros totales | 33.122.992.896 (33,1 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license |
| Formato de pesos | safetensors (pipeline diffusers) |

## Arquitectura y entrenamiento

Viggle-Animate es un finetune completo de 33,1 B parámetros del transformador ref2va de MiniMax-H3. La destilación se realiza con DMD y es conjunta: el finetune supervisa la parte de alto ruido del schedule, donde se decide el reemplazo del personaje, mientras que el MiniMax-H3 original supervisa la parte de bajo ruido, donde se deciden el detalle y la textura. Esto evita heredar las regresiones visuales del finetune a cambio de su capacidad de reemplazo. El modelo no carga nunca el text encoder; el conditioning es un embedding fijo incluido en los pesos. Los dos únicos inputs son un video de conducción y uno de sus frames con el personaje repintado. No se han publicado datos sobre el conjunto de entrenamiento, número de tokens ni procesos de RLHF o DPO.

## Capacidades

- Reemplazo de personaje en video a partir de un único frame repintado, sin alterar movimiento, cámara ni timing.
- Funciona en escenarios de movimiento rápido: cabezas que giran, patadas completas, saltos; el tracking es frame a frame.
- Generaliza a cualquier personaje que se pueda pintar (humanos, animales, criaturas, objetos) porque no utiliza representaciones de pose humana.
- Tres forward passes por clip gracias a la destilación DMD.
- No requiere pose estimator, segmentador, face tracker ni text encoder; la entrada de texto se sustituye por un embedding fijo.
- El frame repintado ya aporta la pose, la cámara, el encuadre y la iluminación del clip, por lo que no hay que alinearlos.
- Soporte de tool calling / function calling: no disponible (no aplica a modelos de video).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no disponible (el modelo no utiliza texto).
- Capacidades especiales: edición de video, video-to-video, character replacement.

## Casos de uso

- Efectos visuales en postproducción: el artista repinta un personaje en un frame de la toma y el modelo propaga el cambio a todo el clip, sustituyendo al actor original sin necesidad de rotoscopia ni tracking manual.
- Animación de personajes personalizados: se pinta un personaje (por ejemplo, un dragón o un robot) en un frame de un video de referencia de una acción real, y el modelo lo anima siguiendo el movimiento del video.
- Prototipado rápido de animación: a partir de un video de conducción y un frame pintado, se genera un clip animado en 26 segundos, lo que permite iterar sobre diseños de personajes sin pasar por rigging ni animación 3D.
- Contenido para redes sociales: transformar clips de baile o deportes en versiones con personajes estilizados, manteniendo la coreografía original.
- Sustitución de actores en tomas ya filmadas: cuando se necesita reemplazar a un actor por otro o por un personaje CGI, el modelo conserva la actuación original y solo cambia la apariencia.
- Generación de cinemáticas para videojuegos: se utilizan videos de captura de movimiento como conducción y un frame pintado con el personaje del juego para generar animaciones listas para integrar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la información disponible. Los datos de eficiencia reportados por el autor son:

| Métrica | Valor |
|---|---|
| Tiempo por render | 26 s |
| Frames | 124 a 24 fps |
| Resolución | 480×832 |
| Hardware | NVIDIA B200 |
| Comparación de velocidad | 6,1× más rápido que Wan2.2-Animate-14B |

## Requisitos de hardware

- VRAM estimada para inferencia: ~68 GB en bf16, según el tamaño del repo (68,9 GB). No se han publicado datos de cuantización.
- GPU recomendadas: la evaluación del autor se realizó en una NVIDIA B200; no se han publicado otras recomendaciones.
- No cabe en GPUs de consumo (8-24 GB de VRAM); requiere hardware profesional.
- Opciones de despliegue: compatible con la librería Diffusers de HuggingFace. No se han publicado integraciones con vLLM, TGI, Ollama ni llama.cpp.
- Latencia: 26 s por render de 124 frames a 24 fps en B200. Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viggle-Animate | 33,1 B | no disponible | 124 frames en 26 s (B200), 6,1× más rápido que Wan2.2-Animate-14B | minimax-h3-community-license | HuggingFace |
| Wan2.2-Animate-14B | 14 B | no disponible | no disponible | no disponible | no disponible |

Solo se dispone del dato de velocidad relativa frente a Wan2.2-Animate-14B; no se han publicado comparativas de calidad perceptual ni otros benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado estudios.
- Riesgo de alucinación: no evaluado; la calidad del resultado depende directamente de la calidad del frame repintado.
- Limitaciones de contexto o idioma: el modelo no utiliza texto, pero requiere que el frame repintado sea coherente con la pose y la iluminación del video de conducción.
- Restricciones de licencia: la licencia minimax-h3-community-license puede imponer condiciones de uso; se recomienda revisar el texto completo antes de uso comercial.
- Caveat para producción: el modelo solo ha sido evaluado en una B200; el rendimiento en otros hardware no está documentado. No se han publicado resultados de benchmarks de calidad.

## Enlaces

- HuggingFace: https://huggingface.co/TechnoBaptist/Viggle-Animate
- Demo: https://huggingface.co/spaces/Viggle/viggle-animate
- Sitio web: https://viggle.ai/h3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Plataforma Viggle: https://viggle.ai/
