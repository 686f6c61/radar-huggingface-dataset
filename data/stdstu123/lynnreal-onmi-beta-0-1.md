# stdstu123/LynnReal-Onmi-beta-0.1

## Resumen

LynnReal-Omni es un modelo de generación de vídeo con audio nativo distribuido como pipeline de diffusers por el equipo LynnReal-AI, publicado en Hugging Face bajo el identificador `stdstu123/LynnReal-Onmi-beta-0.1` (versión beta 0.1). No es un modelo de lenguaje: cubre texto a vídeo, imagen a vídeo, control de pose corporal y de manos, generación a partir de imágenes de referencia, edición de vídeo, reparación fotograma a fotograma y vídeo largo en streaming.

Técnicamente se apoya en un DiT (Diffusion Transformer) que genera cada clip con cuatro pasadas del denoiser en la variante estándar y solo tres en la variante Flash, más decodificadores de vídeo y de audio estéreo. Los pesos en safetensors suman 33.122.992.896 parámetros (unos 33,1 mil millones) y el repositorio ocupa 323,2 GB, ya que incluye varios checkpoints, también en formato ComfyUI.

Su relevancia es práctica: con la variante Flash en W8A8 y el VAE ligero, un clip de 5 segundos a 1344×768 con audio estéreo se genera en unos 8,4 s en una única H100 de 80 GB, y todo el flujo es ejecutable desde ComfyUI con los workflows y el nodo personalizado incluidos en el propio repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con decodificadores de vídeo y audio; pipeline declarado en los tags como `diffusers:MiniMaxH3ModularPipeline` |
| Parametros totales | 33.122.992.896 (~33,1 mil millones), dato real de los safetensors |
| Parametros activos | No aplica: la informacion disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible. No es un modelo de texto; los clips medidos son de 5 s y 10 s a 1344×768, y la ruta Flash de ComfyUI no admite clips de mas de 11 s |
| Tipos de cuantizacion | INT8 (variante Flash W8A8 del DiT, `lynnreal_omni_flash_int8.safetensors`), fp16 para el VAE ligero; el repo menciona un conmutador INT8 opcional en ComfyUI |
| Idiomas soportados | No disponible |
| Licencia | `minimax-h3-community` (etiquetada como `license:other`, con enlace a `LICENSE` en el repositorio) |
| Formato de pesos | safetensors, tanto para diffusers como para ComfyUI (carpetas `comfyui/models/diffusion_models/` y `comfyui/models/vae/`) |
| Tamano del repositorio | 323,2 GB |
| Resolucion de trabajo | 1344×768 en los benchmarks publicados |
| Audio | Estereo nativo, generado por el propio modelo |

## Arquitectura y entrenamiento

La model card describe un unico modelo que resuelve siete tareas distintas (texto a vídeo, primer fotograma a vídeo, referencias a vídeo, control de pose a vídeo, continuación de vídeo, edición y reparación fotograma a fotograma, y vídeo largo en streaming). El nucleo es un DiT que funciona con muy pocas pasadas del denoiser: cuatro en la variante estándar y tres en la variante Flash, que ademas se ejecuta en precision W8A8 (INT8) y va acompañada de un VAE ligero en fp16. El audio estéreo se genera en el mismo clip y se decodifica junto al vídeo, con ambos decodificadores incluidos en la medición de latencia.

No hay informacion disponible sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni sobre innovaciones de atencion o decodificacion especulativa mas alla de la reduccion de pasos del denoiser y de la cuantizacion INT8. La model card solo documenta el comportamiento en inferencia y la integracion con ComfyUI (paquete de nodos `ComfyUI-LynnReal`, ocho archivos de modelo y workflows listos para ejecutar).

## Capacidades

- Generacion de vídeo a partir de texto con pista de audio estéreo nativa.
- Imagen a vídeo: animacion de un primer fotograma de partida (`ti2v`/`i2v`).
- Generacion a partir de imagenes de referencia (omni-reference), util para mantener identidad o estilo entre planos.
- Control de pose corporal y de manos a partir de un clip de control de pose.
- Continuacion y extension de vídeo (`v2v`) sobre metraje existente.
- Edicion de vídeo y reparacion fotograma a fotograma.
- Generacion de vídeo largo en streaming (funcionalidad anunciada, con la salvedad de los 11 s en la ruta Flash de ComfyUI).
- Salida a 1344×768 con audio estéreo muxado en el mismo clip.
- Ejecucion directa en ComfyUI, con workflows separados para cada tarea y para cada variante (estándar de 4 pasos y Flash de 3 pasos).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni vision de comprehension: es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Previsualizacion animada en produccion audiovisual: convertir un guion o un storyboard en clips de 5 a 10 s a 1344×768 con audio, y validar plano, ritmo y atmosfera antes de rodar o de encargar el render final.
- Publicidad de producto a partir de referencias: la tarea `r2v` permite partir de dos imagenes de referencia (por ejemplo, un producto y un entorno) para generar el plano animado, lo que reduce el numero de iteraciones de direccion de arte.
- Animacion de personajes con control de pose: la tarea `pose2v` acepta un clip de control de movimiento y un fotograma inicial, por lo que sirve para previsualizar coreografias, deportes o animacion de manos con estructura corporal fija.
- Iteracion rapida de artistas en ComfyUI: con la variante Flash un clip de 5 s tarda unos 8,4 s en generarse en una H100, de modo que el bucle prompt-resultado-ajuste es viable dentro de una sesion de trabajo.
- Extension de metraje existente: el flujo de continuacion de vídeo permite alargar un plano ya grabado sin volver a generarlo completo, util en postproduccion y en montaje.
- Restauracion y reparacion de fotogramas: la reparacion fotograma a fotograma resulta adecuada para corregir defectos puntuales en material ya rodado o generado.
- Prototipado de locuciones y bandas sonoras provisionales: al generar audio estéreo junto al vídeo, el clip ya sale con sonido y no requiere un paso separado de doblaje para la revision interna.

## Benchmarks y rendimiento

La model card no publica metricas de calidad (FVD, VBench, similitud con el prompt ni similares). Los unicos datos numericos disponibles son latencias medidas de la variante Flash de tres pasos sobre una H100 de 80 GB a 1344×768, en caliente y con tres ejecuciones por celda (desviacion de ±0,02 s entre repeticiones):

| Tarea | 5 s · generar | 5 s · clic a vídeo | 10 s · generar | 10 s · clic a vídeo |
|---|---|---|---|---|
| Texto a vídeo | 8,4 s | 12,2 s | 22,0 s | 29,1 s |
| Primer fotograma a vídeo | 8,9 s | 13,0 s | 23,1 s | 30,1 s |
| Referencias a vídeo | 9,5 s | 13,2 s | 24,2 s | 31,1 s |

En la variante estándar de cuatro pasos, la propia model card indica una ejecucion en caliente de aproximadamente 50 s en una H100 para un vídeo de cinco segundos a 1344×768. El criterio "generar" abarca desde el primer forward del denoiser hasta los fotogramas decodificados; "clic a vídeo" incluye ademas la codificacion del prompt y el muxado, es decir, lo que el usuario espera realmente. No se han publicado en la informacion disponible comparaciones de calidad frente a otros modelos.

## Requisitos de hardware

- VRAM estimada: el checkpoint INT8 del DiT ronda los 33 GB solo en pesos, a los que hay que sumar VAE, decodificador de audio y activaciones; en la practica las mediciones publicadas se han hecho en una GPU de 80 GB (H100). No hay cifras oficiales de VRAM para otros perfiles; el repositorio remite al `comfyui/README.md` para el comportamiento detallado de VRAM y el conmutador INT8 opcional.
- GPUs recomendadas: H100 de 80 GB es la referencia medida. Por tamano de pesos, el modelo queda fuera del rango de las GPU de consumo habituales (RTX 4090 de 24 GB, RTX 5090 de 32 GB) en su configuracion documentada.
- Cabe en GPU de consumo: no hay datos que lo confirmen; el tamano del checkpoint INT8 (unos 33 GB) lo hace inviable en tarjetas de 24 GB sin cuantizaciones adicionales no documentadas.
- Opciones de despliegue: diffusers y ComfyUI son las dos vias soportadas oficialmente, con paquete de nodos propio (`ComfyUI-LynnReal`) y workflows incluidos. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de difusion de vídeo.
- Latencia y throughput: en la ruta Flash de tres pasos, 8,4 s para un clip de 5 s de texto a vídeo y 22,0 s para uno de 10 s, en una unica H100 y en caliente.
- Almacenamiento: el repositorio completo ocupa 323,2 GB, aunque solo se descarguen los archivos de la tarea concreta.

## Comparativa con modelos similares

Los datos de los modelos alternativos son cifras de referencia publica y orientativas; no se han verificado dentro de la informacion proporcionada para esta ficha.

| Modelo | Parametros (aprox.) | Audio nativo | Licencia | Disponibilidad |
|---|---|---|---|---|
| LynnReal-Omni beta 0.1 | 33,1 mil millones (safetensors) | Si, estereo | `minimax-h3-community` | Hugging Face, 238 descargas y 13 likes |
| HunyuanVideo | ~13 mil millones | No | Licencia comunitaria de Tencent | Pesos abiertos en Hugging Face |
| Wan 2.1 | ~14 mil millones | No | Apache 2.0 | Pesos abiertos en Hugging Face |
| LTX-Video | ~2 mil millones | No | Pesos abiertos de Lightricks | Pesos abiertos en Hugging Face |

La diferencia funcional principal de LynnReal-Omni frente a esas alternativas es la generacion conjunta de audio estéreo y el conjunto de tareas de control (pose, referencias, edicion y reparacion) dentro de un unico modelo. No hay datos de calidad comparada que permitan ordenarlos por rendimiento.

## Limitaciones y advertencias

- Version beta 0.1: la propia nomenclatura y la advertencia de la model card indican que la ruta acelerada para clips largos aun se esta corrigiendo.
- En la ruta Flash de ComfyUI, los vídeos de mas de 11 segundos no son utilizables por ahora.
- Licencia `minimax-h3-community` con etiqueta `license:other`: es imprescindible revisar el archivo `LICENSE` del repositorio antes de cualquier uso comercial, ya que las condiciones no estan resumidas en la informacion disponible.
- No se documentan sesgos, composicion del dataset de entrenamiento ni proceso de alineacion, por lo que no es posible evaluar sesgos de representacion ni riesgos de contenido.
- Riesgo de alucinacion en sentido generativo: no hay metricas publicadas de fidelidad al prompt ni de consistencia temporal, de modo que un clip puede desviarse de la instruccion o perder coherencia entre fotogramas.
- Idiomas soportados por el codificador de texto: no disponible.
- Requisitos de recursos elevados: 33,1 mil millones de parametros y un repositorio de 323,2 GB descartan el despliegue en hardware de consumo sin pasos de optimizacion adicionales no documentados.
- Las cifras de latencia proceden de una unica configuracion (H100 80 GB, 1344×768, ejecuciones en caliente) y no son extrapolables directamente a otras GPU.
- No se han publicado resultados de benchmarks de calidad, por lo que la evaluacion comparativa con otros generadores de vídeo queda pendiente de pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stdstu123/LynnReal-Onmi-beta-0.1
- Repositorio de codigo: https://github.com/LynnReal-AI/LynnReal-Omni
- Paper: https://github.com/LynnReal-AI/LynnReal-Omni/blob/main/docs/LynnReal-Omni-Paper.pdf
- Demo en YouTube: https://www.youtube.com/watch?v=P5Bl2mriEmk
- Demo en Bilibili: https://www.bilibili.com/video/BV12vYB6BEjc/
- Workflows y modelos para ComfyUI: https://huggingface.co/stdstu123/LynnReal-Onmi-beta-0.1/tree/main/comfyui/models
- Nodo personalizado de ComfyUI: https://huggingface.co/stdstu123/LynnReal-Onmi-beta-0.1/tree/main/comfyui/custom_nodes/ComfyUI-LynnReal
- Documentacion de ComfyUI del repositorio: https://huggingface.co/stdstu123/LynnReal-Onmi-beta-0.1/blob/main/comfyui/README.md
- Pesos Flash INT8: https://huggingface.co/stdstu123/LynnReal-Onmi-beta-0.1/blob/main/comfyui/models/diffusion_models/lynnreal_omni_flash_int8.safetensors
- VAE ligero fp16: https://huggingface.co/stdstu123/LynnReal-Onmi-beta-0.1/blob/main/comfyui/models/vae/lynnreal_omni_light_vae_fp16.safetensors

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los publicados en la propia model card.
