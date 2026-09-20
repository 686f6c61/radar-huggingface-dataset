# SYNAPSEai1/SynapseMusicV12-SFT

## Resumen

SynapseMusicV12-SFT es un modelo de generación de música a partir de texto (text-to-audio) publicado por el usuario SYNAPSEai1 en Hugging Face. Por los metadatos y la model card asociada (etiqueta `acestep`, `arxiv:2602.00744`), se trata de una redistribución o ajuste derivado de ACE-Step 1.5, el modelo fundacional de generación musical open source co-desarrollado por ACE Studio y StepFun. El repositorio pesa 4,8 GB y contiene 2.393.872.518 parámetros en formato safetensors, lo que es coherente con pesos en bf16/fp16 y con una de las variantes de la familia (el sufijo SFT sugiere la variante sometida a fine-tuning supervisado, comparable a `acestep-v15-sft`).

El problema que resuelve es la generación de audio musical de calidad comercial en hardware de consumo: según la model card, produce una canción completa en menos de 2 segundos en una A100 y en menos de 10 segundos en una RTX 3090, y puede ejecutarse localmente con menos de 4 GB de VRAM. Frente a otros modelos entrenados con datos de procedencia ambigua, ACE-Step 1.5 declara un dataset legalmente compatible (música con licencia, royalty-free/dominio público y datos sintéticos generados por conversión MIDI-a-audio), lo que permite uso comercial bajo licencia MIT.

La relevancia actual viene de su arquitectura híbrida: un modelo de lenguaje que actúa como planificador integral (convierte una consulta breve en un plan de canción, con metadatos, letra y descripciones mediante Chain-of-Thought) y un Diffusion Transformer (DiT) que sintetiza el audio. El alineamiento se realiza mediante reinforcement learning intrínseco, sin modelos de recompensa externos ni preferencias humanas. El repositorio concreto analizado tiene 0 descargas y 1 like en el momento de la consulta, por lo que carece de validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: LM planificador (base Qwen3 en la familia ACE-Step) + Diffusion Transformer (DiT) |
| Parametros totales | 2.393.872.518 (≈2,39 mil millones) |
| Parametros activos | No aplica: la informacion disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible (en audio, la model card menciona composiciones de hasta 10 minutos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 50+ idiomas segun la model card; los metadatos de Hugging Face no los enumeran |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`, requiere `custom_code`) |

## Arquitectura y entrenamiento

El sistema combina dos componentes. Por un lado, un modelo de lenguaje que funciona como planificador ("omni-capable planner"): transforma la consulta del usuario en un plano de cancion completo, escalando desde bucles cortos hasta composiciones de 10 minutos, y sintetiza metadatos, letra y descripciones mediante Chain-of-Thought para guiar al generador. Por otro, un Diffusion Transformer (DiT) que produce el audio final. La familia documenta tres LM (todos con preentrenamiento, SFT y RL, y con capacidad de reescritura de consulta y comprension de audio): `acestep-5Hz-lm-0.6B` (desde Qwen3-0.6B), `acestep-5Hz-lm-1.7B` (desde Qwen3-1.7B) y `acestep-5Hz-lm-4B` (desde Qwen3-4B); la comprension de audio y la capacidad de composicion van de "media" en los dos menores a "fuerte" en el de 4B, y la copia de melodia de "debil" a "fuerte".

| Modelo LM | Base | Preentrenamiento | SFT | RL | CoT de metadatos | Reescritura de consulta | Comprension de audio | Composicion | Copia de melodia |
|---|---|---|---|---|---|---|---|---|---|
| acestep-5Hz-lm-0.6B | Qwen3-0.6B | Si | Si | Si | Si | Si | Media | Media | Debil |
| acestep-5Hz-lm-1.7B | Qwen3-1.7B | Si | Si | Si | Si | Si | Media | Media | Media |
| acestep-5Hz-lm-4B | Qwen3-4B | Si | Si | Si | Si | Si | Fuerte | Fuerte | Fuerte |

En cuanto a los datos, la model card declara un corpus legalmente compatible compuesto por pistas musicales con licencia profesional, musica royalty-free y de dominio publico, y datos sinteticos de alta calidad generados por conversion MIDI-a-audio. La innovacion tecnica destacada es el alineamiento por reinforcement learning intrinseco, que segun el autor elimina los sesgos de los modelos de recompensa externos o de las preferencias humanas. El repositorio analizado no aporta informacion adicional sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset, y su model card es una copia de la del proyecto ACE-Step 1.5, no una ficha especifica del ajuste publicado por SYNAPSEai1.

## Capacidades

- Generacion de musica a partir de texto (text2music) con control estilistico preciso y adherencia estricta a la instruccion en mas de 50 idiomas.
- Generacion de composiciones de distinta duracion: desde bucles cortos hasta piezas de 10 minutos.
- Sintesis de metadatos, letra y descripciones de la cancion mediante Chain-of-Thought dentro del propio LM planificador.
- Edicion de audio musical: generacion de versiones cover, repintado (repainting) y conversion de voz a musica de fondo (vocal-to-BGM).
- Reescritura de consulta (query rewrite) para transformar peticiones breves del usuario en instrucciones detalladas.
- Comprension de audio por parte del LM de la familia, con nivel medio en los modelos de 0,6B y 1,7B y fuerte en el de 4B.
- Copia de melodia de referencia, con capacidad debil, media o fuerte segun el tamano del LM.
- Entrada de audio de referencia para condicionar la generacion.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.
- Las variantes DiT de tipo SFT (a la que corresponde el sufijo del repositorio) no incluyen extraccion (extract), lego ni completado (complete) segun la tabla de la model card; estas funciones solo aparecen en la variante base.

## Casos de uso

- Produccion musical asistida: un compositor introduce una descripcion textual (genero, instrumentacion, tempo, estado de animo) y obtiene un borrador completo en segundos; el modelo es adecuado porque genera la pieza entera, incluida la estructura, sin necesidad de encadenar varios modelos.
- Creacion de bandas sonoras para video y publicidad: la licencia MIT y el dataset declarado como legalmente compatible permiten usar las pistas generadas en producciones comerciales, con control de estilo para ajustarse al briefing del cliente.
- Generacion de versiones cover y remezclas: la capacidad de cover y repintado permite reutilizar una composicion existente y regenerar secciones concretas sin rehacer la pieza completa.
- Conversion de voz a musica de fondo: util para creadores que graban una melodia cantada o tarareada y necesitan un arreglo instrumental encima; la funcion vocal-to-BGM esta documentada en la model card.
- Prototipado rapido de ideas musicales en local: con menos de 4 GB de VRAM, un productor puede iterar decenas de variaciones en una GPU de gama media antes de comprometerse con un arreglo final.
- Localizacion musical multilingue: al declarar soporte de mas de 50 idiomas, permite generar canciones con letras en distintos idiomas manteniendo el control de estilo, util para mercados regionales.
- Herramientas creativas integradas en aplicaciones: al cargarse con la libreria `transformers` y pesos safetensors, puede envolverse en un servicio de inferencia para que una app de edicion musical ofrezca generacion de pistas bajo demanda.
- Generacion de bucles y samples para bibliotecas de audio: la capacidad de producir bucles cortos encaja en la creacion de packs de samples libres de regalias.
- Audio de referencia para condicionar el estilo: artistas pueden aportar una pista guia y generar material nuevo con una identidad sonora similar, con la salvedad de que la copia de melodia es la capacidad mas limitada del sistema.

## Benchmarks y rendimiento

La model card incluye una imagen de evaluacion, pero no expone valores numericos legibles en la informacion proporcionada. Los unicos datos de rendimiento disponibles son de velocidad de generacion, no de calidad objetiva.

| Metrica | Valor |
|---|---|
| Tiempo de generacion de una cancion completa en A100 | Menos de 2 segundos |
| Tiempo de generacion de una cancion completa en RTX 3090 | Menos de 10 segundos |
| Pasos de muestreo (variante SFT) | 50 |
| Pasos de muestreo (variante turbo) | 8 |
| VRAM minima declarada para ejecucion local | Menos de 4 GB |

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K ni equivalentes de audio como FAD o CLAP) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la model card declara ejecucion local con menos de 4 GB de VRAM; la variante turbo, con solo 8 pasos de muestreo, es la mas ligera.
- GPU recomendadas: A100 para el escenario de maxima velocidad (menos de 2 segundos por cancion) y RTX 3090 para el escenario de consumo (menos de 10 segundos por cancion).
- Compatibilidad con GPU de consumo: si, segun el fabricante cabe en tarjetas de gama media-alta con el presupuesto de VRAM indicado; no se detallan modelos concretos mas alla de la RTX 3090.
- Opciones de despliegue: la libreria declarada es `transformers` con `custom_code`, por lo que la ruta recomendada es Hugging Face Transformers con `trust_remote_code`. No hay informacion sobre soporte en vLLM, llama.cpp, Ollama, TGI ni ComfyUI.
- Latencia y throughput: menos de 2 segundos por cancion en A100 y menos de 10 segundos en RTX 3090; no se especifica el throughput agregado en lote.
- Almacenamiento: el repositorio ocupa 4,8 GB.

## Comparativa con modelos similares

El repositorio se corresponde con la familia ACE-Step 1.5, cuyas variantes estan documentadas en la misma model card. La comparacion se limita a esas variantes porque no se dispone de datos verificables de otros modelos de generacion musical en la informacion proporcionada.

| Modelo | Preentrenamiento | SFT | RL | CFG | Pasos | Calidad | Diversidad | Fine-tuning | Audio de referencia | Text2Music | Cover | Repaint | Extraccion | Lego | Completado | Licencia |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SynapseMusicV12-SFT (este repositorio) | Si (heredado de ACE-Step 1.5) | Si | No disponible | Si | 50 | No disponible | No disponible | No disponible | Si | Si | Si | Si | No disponible | No disponible | No disponible | MIT |
| acestep-v15-base | Si | No | No | Si | 50 | Media | Alta | Facil | Si | Si | Si | Si | Si | Si | Si | MIT |
| acestep-v15-sft | Si | Si | No | Si | 50 | Alta | Media | Facil | Si | Si | Si | Si | No | No | No | MIT |
| acestep-v15-turbo | Si | Si | No | No | 8 | Muy alta | Media | Media | Si | Si | Si | Si | No | No | No | MIT |
| acestep-v15-turbo-rl | Si | Si | Si | No | 8 | Muy alta | Media | Media | Si | Si | Si | Si | No | No | No | Pendiente de publicacion |

La variante base prioriza diversidad y funciones de edicion ampliadas (extraccion, lego, completado) a costa de una calidad media; la SFT prioriza calidad sobre diversidad y pierde las funciones de edicion avanzadas; la turbo reduce a 8 pasos de muestreo y maximiza la calidad, a costa de renunciar a CFG y a una parte de la flexibilidad de ajuste. No se dispone de datos comparativos con alternativas externas como MusicGen o Stable Audio Open en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio sin validacion: 0 descargas y 1 like en el momento de la consulta; el autor (SYNAPSEai1) no coincide con el equipo del proyecto original (ACE Studio y StepFun), por lo que se trata de una redistribucion o ajuste de terceros.
- La model card del repositorio es una copia de la del proyecto ACE-Step 1.5 y no documenta que cambios concretos introduce el ajuste SFT publicado, ni su dataset de ajuste.
- Riesgo de alucinacion en los componentes generativos de texto (letras y metadatos): el LM planificador puede producir letras con contenido factualmente incorrecto o sin sentido.
- Idiomas: se declaran mas de 50 idiomas, pero no se aporta evaluacion por idioma ni lista de idiomas soportados; el rendimiento en idiomas minoritarios es desconocido.
- Sesgos: no se documentan analisis de sesgo en genero, cultura o estilo musical en la informacion disponible.
- Longitud de contexto: no se especifica la ventana de contexto del LM planificador; solo se indica que las composiciones pueden alcanzar los 10 minutos.
- Licencia: MIT, lo que permite uso comercial, pero la responsabilidad sobre la procedencia de los pesos redistribuidos recae en el publicador del repositorio; conviene verificar la cadena de custodia antes de usarlo en produccion.
- Requiere `custom_code` y, por tanto, ejecucion con `trust_remote_code=True`, lo que implica ejecutar codigo no auditado del repositorio.
- Los metadatos de Hugging Face etiquetan el modelo como `feature-extraction` a la vez que el pipeline es `text-to-audio`, una inconsistencia que puede complicar la integracion automatica en algunas herramientas.
- No se documentan mecanismos de filtrado de contenido en la salida ni limites de uso aceptable.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/SYNAPSEai1/SynapseMusicV12-SFT
- Proyecto ACE-Step 1.5: https://ace-step.github.io/ace-step-v1.5.github.io/
- Coleccion en Hugging Face: https://huggingface.co/collections/ACE-Step/ace-step-15
- ModelScope: https://modelscope.cn/models/ACE-Step/ACE-Step-v1-5
- Demo en Spaces: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Discord: https://discord.gg/PeWDxrkdj7
- Informe tecnico (arXiv 2602.00744): https://arxiv.org/abs/2602.00744
- Repositorio en GitHub: https://github.com/ace-step/ACE-Step-1.5
- Variante base: https://huggingface.co/ACE-Step/acestep-v15-base
- Variante SFT: https://huggingface.co/ACE-Step/acestep-v15-sft
- Variante turbo: https://huggingface.co/ACE-Step/Ace-Step1.5
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utilizables son los de la model card y los metadatos de Hugging Face.
