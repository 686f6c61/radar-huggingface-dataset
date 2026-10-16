# Yiming1234/bagel-sam-mask-pre-fusion

## Resumen

`Yiming1234/bagel-sam-mask-pre-fusion` es un checkpoint derivado de `ByteDance-Seed/BAGEL-7B-MoT`, publicado por el usuario Yiming1234. No se trata de un modelo nuevo entrenado desde cero, sino de un ajuste fino (finetune) del modelo multimodal BAGEL de ByteDance-Seed, orientado a tareas de fusion con mascaras y componentes de segmentacion y reconstruccion 3D. El repositorio ocupa 58,8 GB y contiene 14.607.260.128 parametros en formato safetensors, coherente con el tamano del modelo base.

El checkpoint se identifica como candidato de la etapa de entrenamiento con mascaras ("mask pre fusion"), guardado en el paso 30000. El propio autor advierte de que la identificacion de la etapa proviene del nombre del directorio de origen y que la procedencia del entrenamiento requiere confirmacion. No se reclama ninguna precision y la validacion en GPU del adaptador portatil todavia no se ha completado.

Su relevancia es fundamentalmente de investigacion: explora la fusion de BAGEL con dependencias externas SAM3D y MoGe para tareas de segmentacion, VQA 3D y estimacion de pose de camara. No emplea la clase `AutoModel` estandar de Transformers, sino una arquitectura BAGEL personalizada que exige el codigo de inferencia especifico del repositorio `plzdoo/bagel-sam`. Con cero descargas y cero "likes", no cuenta con validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BAGEL personalizada (custom-code), derivada de BAGEL-7B-MoT; no es un `AutoModel` estandar de Transformers. La nomenclatura del modelo base indica arquitectura MoT (mixture of transformers experts) |
| Parametros totales | 14.607.260.128 (dato real de safetensors) |
| Parametros activos | no disponible en la informacion proporcionada (el nombre del modelo base, BAGEL-7B-MoT, sugiere 7.000 millones activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no disponible |
| Licencia | `other` (los materiales upstream de BAGEL conservan sus terminos; la licencia Apache 2.0 de origen se incluye como `BAGEL_LICENSE`) |
| Formato de pesos | safetensors |
| Modelo base | ByteDance-Seed/BAGEL-7B-MoT |
| Tipo de pipeline | image-text-to-text |
| Tamano del repositorio | 58,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos HF) | 2026-10-15 |

## Arquitectura y entrenamiento

El checkpoint emplea la arquitectura BAGEL personalizada, heredada de `ByteDance-Seed/BAGEL-7B-MoT`. No es compatible con la carga estandar de Transformers: la model card indica explicitamente que se debe usar el codigo de inferencia correspondiente del repositorio `plzdoo/bagel-sam`. Los recursos de tokenizer, configuracion y VAE de BAGEL se incluyen en el directorio `BAGEL-7B-MoT/` del propio repositorio, mientras que las dependencias SAM3D y MoGe deben obtenerse por separado para poder ejecutar la inferencia de fusion.

En cuanto al entrenamiento, el autor lo describe como un "mask-trained checkpoint candidate" guardado en el paso 30000 de una etapa de entrenamiento con mascaras. La identificacion de la etapa procede del nombre del directorio de origen, no de un manifiesto verificado, y la procedencia del entrenamiento queda pendiente de confirmacion. Se trata de una comparacion entre etapas de entrenamiento: el autor senala que el checkpoint posterior a la fusion incorpora ademas supervision adicional de VQA y de controlador, por lo que el par de checkpoints no aisla el efecto de la fusion por si solo. No se documentan el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Comprension de imagenes y texto (`image-text-to-text`) heredada de BAGEL-7B-MoT.
- Respuesta a preguntas visuales 3D: el conjunto de evaluacion asociado incluye 200 preguntas de Omni3D VQA.
- Trabajo con instancias de mascara: 100 instancias de mascara en el conjunto de evaluacion asociado.
- Estimacion de pose de camara: 100 fotogramas de pose de camara de Hypersim en el conjunto de evaluacion asociado.
- Fusion con componentes externos SAM3D y MoGe, que deben obtenerse por separado.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo de pensamiento, audio, vision adicional): no disponible.

## Casos de uso

- Investigacion en fusion multimodal con segmentacion: el checkpoint esta disenado para combinarse con SAM3D y MoGe, de modo que un equipo de investigacion puede reproducir la etapa "mask pre fusion" y compararla con la variante posterior a la fusion.
- Experimentos de segmentacion de instancias: las 100 instancias de mascara del conjunto de evaluacion permiten medir el comportamiento del modelo en la generacion o el uso de mascaras dentro de un pipeline de vision por computador.
- VQA 3D sobre escenas: con 200 preguntas de Omni3D VQA, resulta util para evaluar respuestas sobre relaciones espaciales y objetos en escenas tridimensionales.
- Estimacion de pose de camara en investigacion: los 100 fotogramas de Hypersim permiten estudiar el comportamiento del modelo en tareas de pose, teniendo en cuenta que el autor advierte que estos checkpoints no pretenden predecir poses absolutas de camara en el mundo real.
- Reproduccion de comparativas internas: el repositorio `plzdoo/bagel-sam` publica `RELEASED_COMPARISON.md` con la inferencia y la puntuacion en CPU, lo que permite replicar la comparacion entre etapas.
- Base para ajuste fino propio: un equipo puede partir de estos pesos para continuar el entrenamiento con su propio dataset de mascaras o de escenas 3D, siempre que asuma la carga de mantener el codigo de inferencia personalizado.
- Auditoria de pipelines multimodales: util para estudiar como se comporta un modelo BAGEL cuando se le anaden dependencias externas no integradas en el grafo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que "no accuracy is claimed by this upload" y que la ejecucion en GPU del adaptador portatil todavia no ha sido validada mediante benchmarks. Lo unico documentado es el diseno de evaluacion:

| Elemento | Valor |
|---|---|
| Conjunto de evaluacion | https://huggingface.co/datasets/Yiming1234/bagel-sam-eval-200 |
| Preguntas Omni3D VQA | 200 |
| Instancias de mascara | 100 |
| Fotogramas de pose de camara (Hypersim) | 100 |
| Solapamiento entre subconjuntos | Si, los subconjuntos se solapan |
| Precision declarada | Ninguna |
| Validacion en GPU | No realizada para el adaptador portatil |

## Requisitos de hardware

- VRAM estimada para los pesos en bf16/fp16: 14.607.260.128 parametros x 2 bytes = aproximadamente 29,2 GB, mas el espacio adicional para activaciones, cache KV y el VAE, por lo que conviene contar con 40 GB o mas.
- VRAM estimada en fp32: unos 58,4 GB, coherente con el tamano de 58,8 GB del repositorio.
- GPU recomendadas: A100 de 40 GB o 80 GB, H100, o GPUs profesionales con 48 GB o mas. Con 24 GB no es viable cargar los pesos sin cuantizar.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en bf16 con los pesos completos. Al no publicarse pesos cuantizados (ni GGUF, ni AWQ, ni GPTQ), no hay una ruta directa de despliegue en GPU de consumo.
- Opciones de despliegue: no es compatible con llama.cpp, Ollama, vLLM ni TGI al no ser un `AutoModel` estandar. El unico camino documentado es el codigo de inferencia de `plzdoo/bagel-sam`, con SAM3D y MoGe obtenidos aparte.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Yiming1234/bagel-sam-mask-pre-fusion | 14.607.260.128 (safetensors) | no disponible | other | safetensors | 0 descargas, 0 likes |
| ByteDance-Seed/BAGEL-7B-MoT (modelo base) | no disponible en la informacion proporcionada | no disponible | Apache 2.0 segun la referencia del autor | no disponible en la informacion proporcionada | Repositorio oficial del modelo base |
| Otros checkpoints comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un checkpoint intermedio de entrenamiento (paso 30000), no un modelo final ni validado para produccion.
- El autor no reclama ninguna metrica de precision; no hay resultados de benchmarks publicados.
- La identificacion de la etapa de entrenamiento proviene del nombre del directorio, no de un manifiesto verificado; la procedencia requiere confirmacion.
- La comparacion publicada mezcla etapas: el checkpoint posterior a la fusion incluye supervision adicional de VQA y controlador, por lo que no aisla el efecto de la fusion.
- No se incluye la auditoria original de solapamiento del manifiesto de entrenamiento.
- Los checkpoints no pretenden predecir poses absolutas de camara en el mundo real.
- Requiere dependencias externas (SAM3D y MoGe) obtenidas por separado, lo que anade complejidad de despliegue y posibles incompatibilidades.
- No funciona con las rutas de carga estandar de Transformers, ni con herramientas habituales de servido (vLLM, TGI, Ollama, llama.cpp).
- La licencia es `other`; antes de cualquier uso comercial debe revisarse el texto completo, teniendo en cuenta que los materiales upstream de BAGEL conservan sus propios terminos (Apache 2.0 incluido como `BAGEL_LICENSE`).
- Idiomas soportados: no disponible, por lo que no puede garantizarse un comportamiento multilingue concreto.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no evaluado en esta publicacion; el modelo hereda las caracteristicas del modelo base, sin que se aporten mediciones.
- Cero descargas y cero "likes": no existe validacion independiente por parte de la comunidad.
- El adaptador portatil no ha sido validado con benchmarks en GPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yiming1234/bagel-sam-mask-pre-fusion
- Modelo base: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
- Conjunto de evaluacion: https://huggingface.co/datasets/Yiming1234/bagel-sam-eval-200
- Repositorio de inferencia: https://github.com/plzdoo/bagel-sam
- Comparativa publicada: https://github.com/plzdoo/bagel-sam/blob/main/RELEASED_COMPARISON.md
- Codigo fuente de BAGEL: https://github.com/ByteDance-Seed/Bagel
