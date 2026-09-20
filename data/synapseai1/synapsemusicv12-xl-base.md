# SYNAPSEai1/SynapseMusicV12-XL-Base

## Resumen

SynapseMusicV12-XL-Base es un repositorio de Hugging Face publicado por el usuario SYNAPSEai1 que contiene el modelo ACE-Step 1.5 XL Base, un generador de musica texto-a-audio de ~4,99 mil millones de parametros desarrollado por ACE Studio y StepFun. Se trata de la variante XL del decodificador DiT (Diffusion Transformer) de ACE-Step 1.5, disenada para obtener mayor calidad de audio que las variantes de 2B. El repositorio se distribuye bajo licencia MIT y con el pipeline `text-to-audio` de transformers, e incluye codigo personalizado (`custom_code`), por lo que requiere el paquete oficial de ACE-Step para su ejecucion.

El modelo actua como modelo base de la familia XL y da soporte a todas las tareas del sistema: text-to-music, cover, repaint, extract, lego y complete. El repositorio ocupa 20,0 GB y los pesos declarados suman 4.987.310.726 parametros, coherentes con los ~4B anunciados en la model card y con un almacenamiento en bf16 de ~18,8 GB. La inferencia por defecto emplea 50 pasos con CFG (classifier-free guidance), lo que lo situa en el extremo de calidad y diversidad alta de la familia, a costa de mayor coste computacional que las variantes turbo de 8 pasos.

Su relevancia actual radica en dos factores: por un lado, es un modelo de generacion musical abierto con pesos publicos y licencia permisiva; por otro, el autor declara que ha sido entrenado con datos legalmente conformes (musica con licencia, royalty-free o de dominio publico, y datos sinteticos MIDI-a-audio), lo que permite el uso comercial de la musica generada. El repositorio, sin embargo, no incluye documentacion sobre idiomas soportados, y el propio autor no reporta resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con decodificador de 32 capas y codificador de 8 capas |
| Parametros totales | 4.987.310.726 (~5B, declarados como ~4B en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 como formato nativo; INT8 mencionado para ejecucion con CPU offload en GPUs de 12 GB; no se documentan GGUF, FP8 ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Hidden size del decodificador DiT | 2560 |
| Capas del decodificador DiT | 32 |
| Cabezas de atencion del decodificador DiT | 32 |
| Hidden size del codificador | 2048 |
| Capas del codificador | 8 |
| Pasos de inferencia | 50 con CFG |
| Tamano de pesos en bf16 | ~18,8 GB |
| Tamano del repositorio | 20,0 GB |
| Pipeline | text-to-audio |

## Arquitectura y entrenamiento

El modelo es un decodificador DiT (Diffusion Transformer) de gran tamano dentro de la familia ACE-Step 1.5. La model card detalla una configuracion interna de `hidden_size` 2560, 32 capas y 32 cabezas de atencion en el decodificador, acompanado de un codificador de 2048 de dimension oculta y 8 capas. El pipeline declarado en Hugging Face combina `text-to-audio` con `feature-extraction` y requiere `custom_code`, es decir, no funciona con una clase estandar de transformers sin el codigo del proyecto. El sistema completo se organiza en dos componentes: el DiT generador de audio y un modelo de lenguaje auxiliar a 5 Hz (disponible en variantes de 0,6B, 1,7B y 4B) que se encarga de la comprension de audio y de la composicion. Los tres modelos LM son compatibles con la variante XL.

En cuanto al entrenamiento, el autor indica que se han utilizado conjuntos de datos conformes legalmente: musica con licencia, material royalty-free o de dominio publico y datos sinteticos generados por conversion MIDI-a-audio. La model card no especifica el numero de tokens, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones de decodificacion (por ejemplo, decodificacion especulativa) mas alla del uso de CFG y del numero de pasos de muestreo. La familia incluye variantes con distintos equilibrios: la version base con CFG y 50 pasos (alta diversidad y calidad alta), la version SFT con CFG y 50 pasos (calidad muy alta, diversidad media) y la version turbo sin CFG y 8 pasos (calidad muy alta, diversidad media). La variante base, objeto de esta ficha, es la unica que soporta todas las tareas, incluidas extract, lego y complete.

## Capacidades

- Generacion de musica a partir de texto: sintesis de audio musical completo desde una descripcion textual (pipeline `text-to-audio`).
- Tarea cover: reinterpretacion de una pieza existente bajo un nuevo estilo o instrumentacion.
- Tarea repaint: regeneracion o reparacion de secciones concretas de una pista ya generada.
- Tarea extract: extraccion de componentes o tallos a partir de una mezcla.
- Tarea lego: composicion modular por capas o bloques instrumentales.
- Tarea complete: completado de fragmentos musicales parciales.
- Extraccion de caracteristicas (`feature-extraction`) sobre audio, segun los tags del repositorio.
- Integracion con modelos de lenguaje auxiliares a 5 Hz (0,6B, 1,7B y 4B) para comprension de audio y composicion.
- Uso comercial de la musica generada, segun lo declarado por el autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo conversacional).
- Capacidades multilingues: no disponible (no se documentan idiomas soportados).
- Modo thinking, vision o audio de entrada conversacional: no disponible.

## Casos de uso

- Produccion musical de fondo para video: el modelo genera pistas instrumentales completas desde un prompt de texto en 50 pasos con CFG, lo que resulta adecuado cuando se prioriza la variedad de resultados sobre la velocidad, por ejemplo al crear varias propuestas de banda sonora para un mismo montaje.
- Creacion de bibliotecas de musica royalty-free para productos digitales: al estar entrenado, segun el autor, con datos conformes y licencia MIT, la musica generada puede incorporarse a videojuegos, aplicaciones o campanas sin depender de un catalogo con derechos de terceros.
- Prototipado rapido de ideas musicales en estudios: la tarea complete permite partir de un fragmento tarareado o de un esbozo MIDI y obtener un arreglo completo, util para validar una idea antes de entrar en produccion con musicos.
- Edicion quirurgica de pistas existentes: la tarea repaint permite regenerar unicamente una seccion (un estribillo, un solo) sin rehacer la pieza entera, lo que reduce iteraciones en postproduccion.
- Remezclas y versiones alternativas: la tarea cover permite generar una nueva version de una pieza con otro estilo o instrumentacion, aplicable a contenido editorial o a demos para clientes.
- Separacion y reutilizacion de tallos: la tarea extract facilita obtener componentes de una mezcla para remezclas, sampleado o library music.
- Generacion de jingles y piezas cortas para publicidad: la combinacion de prompt de texto y tarea complete permite producir piezas de duracion corta con estructura controlada, integrables en pipelines automatizados de marketing.
- Demostraciones interactivas en Gradio: el repositorio oficial del proyecto incluye un arranque mediante `python acestep --config-path acestep-v15-xl-base`, lo que permite montar una demo interna para evaluacion por parte de equipos de producto o diseno sonoro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente clasifica las variantes por calidad y diversidad de forma cualitativa (base: calidad alta, diversidad alta; SFT: calidad muy alta, diversidad media; turbo: calidad muy alta, diversidad media), sin acompanar numeros ni metricas objetivas.

## Requisitos de hardware

- VRAM con CPU offload e INT8: desde 12 GB.
- VRAM con CPU offload (sin INT8): desde 16 GB.
- VRAM sin offload: desde 20 GB.
- VRAM para calidad completa (XL + LM de 4B): desde 24 GB.
- Pesos en bf16: ~18,8 GB, por lo que la carga completa sin offload excede la memoria de GPUs de consumo de 16 GB.
- GPUs de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) sin offload; en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) solo con cuantizacion INT8 y offload a CPU.
- GPUs profesionales: A100, H100 y similares pueden alojar el modelo sin offload y con margen para el modelo de lenguaje auxiliar.
- Opciones de despliegue: el proyecto oficial ACE-Step 1.5 (instalacion con `pip install -e .` sobre el repositorio GitHub) y su interfaz Gradio (`python acestep --config-path acestep-v15-xl-base`), ademas de la Space Demo oficial. La integracion mediante `transformers` requiere `custom_code`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a este pipeline de difusion de audio.
- Latencia y throughput: no disponibles. La unica referencia de coste es el numero de pasos de inferencia (50 con CFG).

## Comparativa con modelos similares

| Modelo | Parametros | CFG | Pasos | Tareas | Calidad / diversidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| SynapseMusicV12-XL-Base (ACE-Step 1.5 XL Base) | ~5B (declarado ~4B) | Si | 50 | Todas (extract, lego, complete) | Alta / alta | MIT | Repositorio HF de SYNAPSEai1; original en ACE-Step |
| ACE-Step 1.5 XL SFT | ~4B | Si | 50 | Estandar | Muy alta / media | No indicada en la informacion disponible | Hugging Face y ModelScope |
| ACE-Step 1.5 XL Turbo | ~4B | No | 8 | Estandar | Muy alta / media | No indicada en la informacion disponible | Hugging Face y ModelScope |
| ACE-Step 1.5 2B Turbo (por defecto) | ~2B | No | 8 | No especificadas | No disponible | No indicada en la informacion disponible | Hugging Face y ModelScope |

Comparativa de modelos de lenguaje auxiliares compatibles con la variante XL:

| Modelo LM | Parametros | Comprension de audio | Composicion | Disponibilidad |
|---|---|---|---|---|
| acestep-5Hz-lm-0.6B | 0,6B | Media | Media | Hugging Face y ModelScope |
| acestep-5Hz-lm-1.7B | 1,7B | Media | Media | Incluido en el paquete principal |
| acestep-5Hz-lm-4B | 4B | Fuerte | Fuerte | Hugging Face y ModelScope |

No se dispone de comparativas con modelos de generacion musical de otros proveedores en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que la calidad objetiva del modelo no puede verificarse con datos independientes; las afirmaciones de calidad son cualitativas y provienen del propio autor.
- El repositorio no documenta los idiomas soportados ni el tratamiento del texto del prompt, lo que introduce incertidumbre sobre su comportamiento con prompts en castellano.
- No se detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset; la afirmacion sobre datos "legalmente conformes" es una declaracion del autor y no se acompana de auditoria ni de desglose de fuentes.
- Riesgo de alucinacion en el sentido de generar audio que no corresponde fielmente al prompt: no hay metricas publicadas de adherencia al texto.
- El modelo requiere `custom_code`, de modo que no es ejecutable con una carga estandar de `transformers`; hay que instalar y mantener el paquete ACE-Step 1.5.
- Con 50 pasos y CFG, el coste de inferencia es notablemente mayor que el de la variante turbo de 8 pasos; la eleccion de la base implica un compromiso explicito por diversidad frente a velocidad.
- La variante base es la unica con soporte de las tareas extract, lego y complete; las variantes SFT y turbo no cubren esas tareas, lo que limita la sustitucion directa entre versiones.
- En GPUs de 12 GB solo es viable con cuantizacion INT8 y offload a CPU, lo que previsiblemente incrementa la latencia (no se aportan cifras).
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado el 20 de septiembre de 2026; no cuenta con validacion de la comunidad.
- El repositorio analizado es una publicacion de un tercero (SYNAPSEai1) del modelo ACE-Step 1.5 XL Base de ACE Studio y StepFun; conviene verificar la trazabilidad de los pesos frente al repositorio oficial antes de usarlos en produccion.
- La licencia del repositorio es MIT, pero la model card no aclara la licencia de los modelos auxiliares (SFT, turbo, LM), por lo que el uso comercial debe confirmarse caso por caso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SYNAPSEai1/SynapseMusicV12-XL-Base
- Pagina del proyecto: https://ace-step.github.io/ace-step-v1.5.github.io/
- Coleccion en Hugging Face: https://huggingface.co/collections/ACE-Step/ace-step-15
- Coleccion en ModelScope: https://modelscope.cn/collections/ACE-Step/Ace-Step-15-xl
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Servidor de Discord: https://discord.gg/PeWDxrkdj7
- Informe tecnico (arXiv): https://arxiv.org/abs/2602.00744
- Repositorio de codigo: https://github.com/ace-step/ACE-Step-1.5
- Modelo XL SFT: https://huggingface.co/ACE-Step/acestep-v15-xl-sft
- Modelo XL Turbo: https://huggingface.co/ACE-Step/acestep-v15-xl-turbo
- Modelo 2B Turbo: https://huggingface.co/ACE-Step/Ace-Step1.5
- Modelo 2B SFT: https://huggingface.co/ACE-Step/acestep-v15-sft
- Modelo 2B Base: https://huggingface.co/ACE-Step/acestep-v15-base
- Modelo LM 0,6B: https://huggingface.co/ACE-Step/acestep-5Hz-lm-0.6B
- Modelo LM 4B: https://huggingface.co/ACE-Step/acestep-5Hz-lm-4B

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card del repositorio.
