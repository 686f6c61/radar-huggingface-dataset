# VisualInference/FLUX-3-Image-Klein-MLX-6bit

## Resumen

FLUX-3-Image-Klein-MLX-6bit es una conversion comunitaria del modelo de generacion y edicion de imagen FLUX 3 Image Klein de Black Forest Labs, adaptada para ejecutarse de forma nativa en Apple Silicon mediante la libreria MLX. El autor de la conversion es VisualInference, un tercero independiente que no tiene vinculacion ni respaldo de Black Forest Labs. El repositorio empaqueta el transformer cuantizado a 6 bits (capas lineales de los 43 bloques, tamano de grupo 64, afin) y se distribuye con un runner especifico, `flux3-mlx`.

El modelo resuelve tres tareas principales: generacion texto-a-imagen, edicion e imagen-a-imagen con hasta 10 imagenes de referencia, y composicion por cajas delimitadoras (bounding-box layout). Su relevancia practica esta en que permite ejecutar un modelo de difusion de gama alta en equipos de consumo Apple, concretamente en Macs de 16 GB con el modo de bajo consumo activado por defecto por debajo de 24 GB. El repo ocupa 9,0 GB y la descarga asociada al transformer de 6 bits es de 8,4 GB.

La arquitectura subyacente es un DiT (Diffusion Transformer) destilado basado en flow map. El autor valida la conversion contra la implementacion de referencia de Black Forest Labs y reporta una similitud coseno de 0,9999 en la velocidad del transformer y 1,000000 en el VAE. No se publican parametros totales del modelo ni resultados de benchmarks de texto, ya que se trata de un modelo generativo de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) destilado, flow map; 43 bloques transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; condicionado por el codificador de texto) |
| Tipos de cuantizacion | 6 bits (group size 64, affine) en capas lineales; repos hermanos en 8 bits; upsampler en 4 y 8 bits |
| Idiomas soportados | ingles (en) |
| Licencia | flux-kommunity-license (license: other, ver LICENSE.md) |
| Formato de pesos | safetensors (formato MLX, libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo base es FLUX 3 Image Klein, un Diffusion Transformer (DiT) destilado con formulacion de flow map. El transformer del modelo contiene 43 bloques; en esta conversion, las capas lineales de dichos bloques se cuantizan a 6 bits con tamano de grupo 64 y esquema affine. Los modulos de modulacion y temporales se mantienen en mayor precision, segun la estructura descrita en la model card (el detalle del contenido del repo queda truncado en la informacion disponible). El codificador de texto, el VAE y el transformer se validan por separado contra el codigo de referencia de Black Forest Labs (commit `45e57c9`).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, ya que esta ficha describe la conversion cuantizada y no el entrenamiento original. La innovacion tecnica destacable de esta version es la cuantizacion a 6 bits: el autor realizo un estudio sobre cinco casos (fotografia, tipografia, moda, bodegon y edicion) y concluyo que 6 bits preserva la textura de alta frecuencia (factor 1,00 respecto a BF16), mientras que 5 bits desenfoca (0,95) y 4 bits introduce grano y cambios de diseno (1,05 a 1,18). Por ese motivo no existe una version de 4 bits.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) a resoluciones configurables, con ejemplo documentado a 1024² y 1216x832.
- Edicion de imagen mediante instrucciones en lenguaje natural, con hasta 10 imagenes de referencia de entrada.
- Composicion por cajas delimitadoras (bounding-box layout), permitiendo indicar la posicion de elementos en la escena.
- Combinacion de multiples referencias para trasladar atributos entre imagenes (por ejemplo, aplicar una prenda de una imagen a una persona de otra).
- Prompt upsampler opcional (repos `pup-MLX-4bit` y `pup-MLX-8bit`) que expande peticiones cortas en descripciones completas de escena: medio, encuadre, sujetos, materiales, fondo e iluminacion.
- Reproducibilidad de semillas: la misma semilla produce el mismo ruido inicial que la implementacion de referencia de Black Forest Labs.
- Ejecucion nativa en Apple Silicon mediante MLX, sin necesidad de GPU dedicada.
- No se documentan capacidades de tool calling, agentes, audio ni vision de entrada mas alla de las imagenes de referencia para edicion.

## Casos de uso

- Generacion de imagenes editoriales o de producto en estudios pequenos: el modelo permite crear escenas fotorrealistas con control de iluminacion y materiales desde un Mac, sin depender de servicios en la nube.
- Edicion fotografica asistida: eliminar o sustituir elementos de una imagen (por ejemplo, quitar un coche y su sombra) mediante instrucciones de texto, usando una imagen de referencia.
- Composicion de escenas con multiples referencias: integrar productos, personas o elementos de varias imagenes en una sola escena coherente, util para catalogos y maquetas de diseno.
- Maquetacion por cajas delimitadoras: generar bodegones o composiciones donde la posicion de cada elemento esta prefijada, aplicable a diseno grafico y presentaciones.
- Prototipado de carteles y tipografia: la validacion del autor incluye casos de tipografia exacta y posters risograph a dos tintas, lo que lo hace adecuado para pruebas de diseno grafico.
- Pruebas de concepto de estilo fotografico: la galeria documenta emulaciones de pelicula (Portra 400, Vision3 250D, Leica M6, formato 4x5), util para previsualizar un look antes de un rodaje real.
- Flujos locales con requisitos de privacidad: al ejecutarse integramente en el equipo, permite procesar imagenes sensibles sin enviarlas a servicios externos.
- Investigacion en cuantizacion de modelos de difusion: el repositorio sirve como referencia reproducible para estudiar el efecto de la precision en la textura y el diseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no aplican metricas tipo MMLU, HumanEval o GSM8K a un modelo de generacion de imagen). Si se documentan metricas de validacion y de rendimiento de inferencia.

Validacion frente al codigo de referencia de Black Forest Labs (commit `45e57c9`):

| Comprobacion | Resultado |
|---|---|
| Codificador de texto: tokens, plantilla, estados ocultos (8 capas) | ids identicos; coseno medio >= 0,9999 |
| VAE encode/decode | coseno 1,000000 |
| Velocidad del transformer, t2i y edicion | coseno 0,9999 |
| Port BF16 frente a `man_dog.png` de BFL (B200), 1024², semilla 7 | 35,9 dB, indistinguible visualmente |
| Este repo frente a `man_dog.png` de BFL | 30,1 dB |
| Textura de este repo frente a BF16 (energia de alta frecuencia, 1,00 = identico) | 1,00 |

Estudio de cuantizacion (cinco casos: foto, tipografia, moda, bodegon, edicion):

| Transformer | Textura frente a BF16 | Veredicto |
|---|---|---|
| 8 bits | 0,99 | publicado |
| 6 bits | 1,00 | publicado |
| 5 bits | 0,95 | desenfoca |
| 4 bits (g32, g64, mixto 4/6, mixto 4/8) | 1,05-1,18 | grano y cambios de diseno |

Rendimiento de inferencia (M4 Pro, 48 GB, 1024², 16 pasos): aproximadamente 114 s por imagen, con un pico de memoria de 13,0 GB (9,6 GB con `--low-memory`). Cada imagen de referencia anade sus propios tokens: medido en 8 bits, las ediciones tardan unos 200-270 s con una referencia, unos 290 s con dos y unos 540 s con tres (cada una de aproximadamente 1 MP). El upsampler anade entre 10 y 20 s. A 1 MP el modelo esta limitado por computo, por lo que la cuantizacion ahorra memoria mas que tiempo.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (MLX). No se documenta soporte para CUDA ni ROCm en este repositorio.
- Memoria unificada minima recomendada: 16 GB, con el modo `--low-memory` activado por defecto en equipos por debajo de 24 GB.
- Pico de memoria a 1024²: 13,0 GB en modo normal y 9,6 GB con `--low-memory`; el pico de memoria con 8 bits es de 14,3 GB y 11,0 GB respectivamente.
- Tamano del transformer: 4,83 GB en 6 bits (frente a 6,15 GB en 8 bits); descarga total del repo 8,4 GB (9,6 GB en 8 bits).
- GPU recomendadas: no aplica en el sentido tradicional; el hardware de referencia documentado es un Apple M4 Pro con 48 GB de memoria unificada. Los repos hermanos indican que la version de 8 bits esta pensada para Macs de 24 GB o mas y la de 6 bits para Macs de 16 GB.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de 16 GB o superior en modo de bajo consumo; no se documenta su ejecucion en GPU NVIDIA consumer.
- Opciones de despliegue: runner `flux3-mlx` (instalable con `pip install "flux3-mlx[pup] @ git+https://github.com/felix-ab/flux3-mlx"`) y API Python mediante `flux3_mlx.Flux3Klein`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 114 s por imagen de 1024² a 16 pasos en M4 Pro; las ediciones con referencias escalan de 200-270 s (una referencia) a 540 s (tres referencias).
- Numero de pasos: el autor recomienda mantener los 16 pasos; a 4 pasos la salida queda visiblemente subdesdenoised y con grano, incluso en el codigo propio de Black Forest Labs.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada. La unica comparacion documentada es interna, entre variantes del mismo modelo.

| Variante | Transformer | Descarga | Pico 1024² | Pico `--low-memory` | Publico objetivo |
|---|---|---|---|---|---|
| FLUX-3-Image-Klein-MLX-8bit | 8 bits, 6,15 GB | 9,6 GB | 14,3 GB | 11,0 GB | Macs de 24 GB o mas; la mas cercana a BF16 |
| FLUX-3-Image-Klein-MLX-6bit (este repo) | 6 bits, 4,83 GB | 8,4 GB | 13,0 GB | 9,6 GB | Macs de 16 GB (modo de bajo consumo por defecto por debajo de 24 GB) |
| FLUX-3-Image-Klein (base, BF16) | BF16 | no disponible | no disponible | no disponible | Referencia de maxima fidelidad |
| FLUX-3-Image-Klein-pup-MLX-4bit / 8bit | upsampler de prompts | no disponible | no disponible | no disponible | Componente auxiliar para expandir prompts cortos |

Frente al modelo base en BF16, esta conversion obtiene 30,1 dB en la comparacion con `man_dog.png` (frente a 35,9 dB del port BF16), con una textura de alta frecuencia identica (factor 1,00). No se ofrecen comparaciones con modelos de otros autores (por ejemplo, otras familias de difusion) en la documentacion disponible.

## Limitaciones y advertencias

- Licencia no estandar: se distribuye bajo flux-kommunity-license, con el campo `license: other`. Es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial, ya que puede imponer restricciones adicionales a las habituales en licencias abiertas.
- Conversion no oficial: el autor indica explicitamente que es una conversion comunitaria independiente, no afiliada ni respaldada por Black Forest Labs.
- Idioma limitado al ingles: las peticiones y el upsampler estan documentados solo para ingles; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo de alucinacion visual: como modelo generativo, puede producir detalles inexactos o incoherentes, especialmente en tipografia, manos o estructuras complejas, aunque no se cuantifica este riesgo en la documentacion.
- Artefactos por cuantizacion: la version de 6 bits iguala la textura de BF16 en las pruebas del autor (factor 1,00), pero sigue siendo una aproximacion; las variantes de 5 y 4 bits degradan la calidad y por eso no se publican.
- Dependencia de plataforma: requiere Apple Silicon y la libreria MLX; no es desplegable en infraestructura con GPU NVIDIA sin reconversion.
- Limitacion de computo: a 1 MP el modelo esta limitado por computo, de modo que la cuantizacion reduce memoria pero no el tiempo de inferencia; las ediciones con varias referencias escalan de forma notable (hasta unos 540 s con tres referencias).
- Recomendacion de pasos: no conviene reducir por debajo de 16 pasos, ya que la salida queda subdesdenoised y con grano.
- Adopcion muy baja en el momento de la ficha: 0 descargas y 1 me gusta, lo que implica poca validacion por parte de la comunidad.
- Fecha de publicacion futura respecto al momento de redaccion de la ficha (16 de octubre de 2026), dato a tener en cuenta al verificar la vigencia del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/VisualInference/FLUX-3-Image-Klein-MLX-6bit
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Repo hermano en 8 bits: https://huggingface.co/VisualInference/FLUX-3-Image-Klein-MLX-8bit
- Upsampler de prompts en 4 bits: https://huggingface.co/VisualInference/FLUX-3-Image-Klein-pup-MLX-4bit
- Upsampler de prompts en 8 bits: https://huggingface.co/VisualInference/FLUX-3-Image-Klein-pup-MLX-8bit
- Runner flux3-mlx: https://github.com/felix-ab/flux3-mlx
- Libreria MLX: https://github.com/ml-explore/mlx
