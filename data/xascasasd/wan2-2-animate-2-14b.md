# xascasasd/Wan2.2-Animate-2-14B

## Resumen

Wan-Animate-2 es un framework de animacion de personajes de extremo a extremo desarrollado por el equipo Wan (Wan-AI), presentado como una evolucion de su linea de modelos de animacion. A diferencia de aproximaciones anteriores, consume directamente el video conductor (driving video) dentro de un Diffusion Transformer rediseñado, eliminando los extractores de movimiento intermedios. Con ello busca dos objetivos simultaneos: alta fidelidad de movimiento y una fuerte preservacion de la identidad del personaje de referencia.

El modelo se publica en dos variantes de pesos, Wan-Animate-2 Base y Wan-Animate-2 Distillation, ademas de una variante eficiente denominada Wan-Animate-2-Lite orientada a animacion en streaming con latencias cercanas al tiempo real. La ficha del repositorio analizado corresponde a una copia subida por el usuario xascasasd bajo el nombre `xascasasd/Wan2.2-Animate-2-14B`, mientras que la publicacion oficial del equipo es `Wan-AI/Wan2.2-Animate-2-14B`.

Una de las innovaciones que declara la model card es el control de punto de vista guiado por texto, que desacopla la perspectiva de camara de la salida respecto al video conductor, permitiendo modificar el encuadre sin alterar el movimiento. El repositorio ocupa 82,5 GB, se distribuye bajo licencia Apache 2.0 y esta integrado en Diffusers, DiffSynth-Studio y ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de extremo a extremo para animacion de personajes; el detalle de capas y dimensiones no esta disponible |
| Parametros totales | 14B (segun la nomenclatura del repositorio; no se explicita en el texto de la model card) |
| Parametros activos | No aplica / no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | No aplica / no disponible (modelo generativo de video, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; los prompts de ejemplo y la plantilla de caption estan en chino |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible en la model card (el repositorio ocupa 82,5 GB y se mencionan integraciones con Diffusers, DiffSynth-Studio y ComfyUI) |

## Arquitectura y entrenamiento

Wan-Animate-2 se construye sobre un Diffusion Transformer rediseñado que recibe directamente el video conductor, sin pasar por un modulo intermedio de extraccion de movimiento (pose, keypoints o similares). Esta decision arquitectonica es la que el equipo presenta como principal, ya que evita la acumulacion de errores que introducen los extractores y favorece la preservacion de la identidad del sujeto de referencia. Sobre esa base se anade un mecanismo de control de punto de vista condicionado por texto, que permite decidir la perspectiva de camara de la salida de forma independiente al video de entrada.

El modelo se distribuye con dos juegos de pesos: Base y Distillation. La variante de destilacion esta pensada para reducir el numero de pasos de muestreo; en los ejemplos de inferencia se invoca con `--step 10` y `--sample_guide_scale 1.0`, frente a la configuracion estandar de la variante Base. Existe ademas una variante Lite, descrita como eficiente, cuyo objetivo es reducir la latencia hasta umbrales de tiempo real para animacion de personajes en streaming.

No se han publicado en la informacion disponible datos sobre volumen de tokens o de video de entrenamiento, composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. El unico detalle operativo relevante es que el pipeline esperado combina el modelo con un LLM auxiliar (se cita Qwen3.7-Plus) para generar el caption descriptivo del personaje de referencia y del fondo antes de la animacion.

## Capacidades

- Animacion de personajes a partir de un video conductor, con generacion de movimiento de alta fidelidad.
- Preservacion de identidad a partir de una imagen de referencia del personaje.
- Control de punto de vista de camara guiado por texto, desacoplado del video conductor.
- Generacion de video en resolucion 720P (configuracion oficial probada) y 480P (configuracion probada en 2x A800).
- Inferencia con destilacion a 10 pasos, lo que reduce el coste computacional por muestra.
- Variante Lite orientada a streaming con latencia cercana al tiempo real.
- Integracion con librerias del ecosistema: Diffusers (`WanAnimate2Pipeline`), DiffSynth-Studio y ComfyUI.
- No se describe soporte de tool calling, function calling ni razonamiento multi-paso; el modelo es generativo de video, no un LLM.
- Capacidades multilingues: no disponibles. Los prompts de ejemplo y la plantilla de generacion de captions estan redactados en chino, y se recomienda usar un LLM que produzca la descripcion en chino.

## Casos de uso

- Produccion audiovisual y animacion: a partir de una imagen de referencia y un video de actuacion, el modelo genera el personaje animado manteniendo la identidad, lo que permite sustituir o crear interpretaciones sin rodaje adicional.
- Avatares virtuales y creadores de contenido en directo: la variante Lite esta pensada para streaming, de modo que un avatar puede reaccionar en tiempo casi real al movimiento capturado por webcam.
- Doblaje y reenactment de video: se puede conducir la animacion de un personaje con un video de otra persona y conservar la identidad del sujeto de referencia, util en localizacion de contenido a otros idiomas o mercados.
- Postproduccion con control de camara: el control de punto de vista guiado por texto permite reencuadrar una escena (por ejemplo, pasar a un plano frontal o lateral) sin volver a grabar el movimiento.
- Prototipado rapido en estudios pequenos: la integracion con ComfyUI y DiffSynth-Studio permite montar flujos de prueba sin escribir codigo de inferencia desde cero.
- Publicidad y contenido de marca: al preservar la identidad del personaje, resulta adecuado para campanas en las que un mismo rostro o mascota corporativa debe aparecer en multiples piezas con coherencia visual.
- Investigacion en diffusion transformers aplicados a video: el diseno sin extractor de movimiento y el control de camara por texto son puntos de partida utiles para experimentos sobre condicionamiento y control temporal.
- Material formativo y presentadores sinteticos: generacion de videos explicativos con un presentador animado controlado por un video plantilla, reutilizable para distintas piezas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con metricas como FID, FVD, LPIPS, SSIM ni evaluaciones de calidad de animacion, y los resultados de busqueda web obtenidos no contienen informacion tecnica relevante sobre el modelo.

## Requisitos de hardware

- Configuracion oficial de referencia: 8x A800 para generacion a 720P, segun las notas de la model card.
- Configuracion probada para 480P: 2x A800.
- VRAM estimada por peso: no disponible de forma oficial. Como referencia orientativa, 14B parametros en bf16 ocupan aproximadamente 28 GB solo en pesos, a lo que hay que sumar latentes de video, VAE y el coste de atencion con FlashAttention; no se trata de un dato publicado por el autor.
- GPU recomendadas: A800 (configuracion validada), y por arquitectura equivalente, GPU de centro de datos con 80 GB tipo A100/H100 en numero multiple. No hay confirmacion oficial de funcionamiento en GPU de consumo.
- GPU de consumo: no disponible. Con el tamano de pesos y las configuraciones paralelas descritas, no se indica soporte en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: scripts de inferencia nativos del repositorio, Diffusers (`WanAnimate2Pipeline`), DiffSynth-Studio y ComfyUI. Requiere Python 3.11, PyTorch 2.7.0 con CUDA 12.6 y `flash-attn`.
- Latencia y throughput: no disponibles como cifras. La variante Lite se describe como capaz de alcanzar umbrales de tiempo real en streaming, pero sin numeros publicados. La variante Distillation reduce el muestreo a 10 pasos.
- Ajuste de configuracion: las notas indican que, si el hardware difiere, deben ajustarse los parametros de paralelismo de los ficheros YAML de configuracion.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada. La comparacion interna entre las variantes publicadas del propio modelo es la siguiente:

| Variante | Parametros | Resolucion probada | Pasos de muestreo | Latencia | Licencia |
|---|---|---|---|---|---|
| Wan-Animate-2 Base | 14B | 720P en 8x A800 | Configuracion estandar | No disponible | Apache 2.0 |
| Wan-Animate-2 Distillation | No disponible (derivada de la base) | No disponible | 10 pasos, `sample_guide_scale 1.0` | No disponible | Apache 2.0 |
| Wan-Animate-2-Lite | No disponible | No disponible | No disponible | Descripcion cualitativa de tiempo real | Apache 2.0 |

Los resultados de busqueda web no aportaron informacion sobre alternativas comparables, por lo que no se incluyen cifras de terceros. Como referencia de categoria, los modelos de animacion de personajes y reenactment facial suelen compararse por preservacion de identidad, fidelidad de movimiento y coste de inferencia, pero no hay datos publicados de este modelo que permitan establecer esa comparacion.

## Limitaciones y advertencias

- No hay datos publicados de sesgos. Al ser un modelo de animacion condicionado por imagen y video, puede reproducir sesgos presentes en los datos de entrenamiento en cuanto a tono de piel, complexcion corporal o rasgos faciales.
- Riesgo de artefactos y alucinacion visual: como modelo de difusion aplicado a video, puede generar inconsistencias temporales, deformaciones de manos o rostro y deriva de identidad en secuencias largas. No se han publicado metricas que cuantifiquen este riesgo.
- Idiomas: la informacion disponible no especifica idiomas soportados. Los ejemplos y la plantilla de descripcion estan en chino, por lo que el flujo recomendado depende de un LLM que genere captions en ese idioma.
- Dependencia de un LLM auxiliar: el pipeline de inferencia descrito requiere generar previamente un caption del personaje y del fondo con un modelo de lenguaje, lo que anade una dependencia externa y un coste adicional.
- Requisitos de hardware elevados: la configuracion oficial parte de 8x A800 para 720P y 2x A800 para 480P, lo que excluye el despliegue en estaciones de trabajo convencionales segun la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios. No se detallan en la model card restricciones adicionales de uso aceptable.
- Repositorio analizado: la ficha corresponde a `xascasasd/Wan2.2-Animate-2-14B`, una copia con 0 descargas y 0 likes. Para produccion conviene usar la publicacion oficial `Wan-AI/Wan2.2-Animate-2-14B`, ya que una copia de terceros puede no estar actualizada o contener modificaciones no documentadas.
- Integracion en Diffusers en estado preliminar: el soporte llega mediante el PR #14412 y los ejemplos indican instalar Diffusers desde el codigo fuente, lo que implica posibles cambios de API.
- Formato de pesos y cuantizaciones no documentados: no se indica disponibilidad de GGUF u otros formatos optimizados, lo que limita opciones de despliegue en hardware modesto.

## Enlaces

- Repositorio de HuggingFace analizado: https://huggingface.co/xascasasd/Wan2.2-Animate-2-14B
- Repositorio oficial en HuggingFace: https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B
- Modelo oficial en ModelScope: https://modelscope.cn/models/Wan-AI/Wan2.2-Animate-2-14B
- Repositorio de codigo: https://github.com/Wan-Video/Wan-Animate-2
- Paper (arXiv): https://arxiv.org/pdf/2608.06009
- Pagina del proyecto: https://humanaigc.github.io/wan-animate-2
- Demo en ModelScope: https://www.modelscope.cn/studios/Wan-AI/Wan2.2-Animate
- PR de integracion en Diffusers: https://github.com/huggingface/diffusers/pull/14412
- Diffusers: https://github.com/huggingface/diffusers
- FlashAttention: https://github.com/Dao-AILab/flash-attention
- Nota: los resultados de la busqueda web realizada no contienen informacion tecnica relevante sobre este modelo.
