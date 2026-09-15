# Supbatomic/sam-audio-large

## Resumen

SAM-Audio es un modelo de segmentacion y separacion de fuentes de audio desarrollado por Meta (referenciado en la model card como "Segment Anything Model for Audio"). Su objetivo es aislar cualquier sonido dentro de una mezcla de audio compleja a partir de tres modalidades de indicacion distintas: una descripcion en lenguaje natural, una mascara visual obtenida de un video, o un anclaje temporal que marca el intervalo en el que el sonido esta (o no esta) presente. A diferencia de un separador clasico limitado a un numero fijo de tallos, el modelo se plantea como un separador guiado por prompt, de ahi la analogia con SAM.

El modelo se distribuye oficialmente bajo el identificador `facebook/sam-audio-large` y requiere solicitar acceso y autenticarse con Hugging Face, con aceptacion explicita de la politica de privacidad de Meta. La ficha que se analiza aqui, `Supbatomic/sam-audio-large`, es una publicacion de terceros (autor `Supbatomic`) que replica el modelo con un repositorio de 14,9 GB, cero descargas y cero "likes" en el momento de la consulta. Conviene por tanto tratar la fuente canonica como el repositorio de Meta.

La relevancia del modelo esta en unificar en una sola arquitectura tareas que tradicionalmente requerían pipelines separados: separacion por clase sonora descrita en texto, separacion guiada por el objeto visible en un video y separacion guiada por marcas temporales. La informacion proporcionada no incluye el numero de parametros, la arquitectura interna ni el volumen de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica / no disponible (modelo de audio con anclajes temporales; no se especifica ventana de contexto) |
| Tipos de cuantizacion | no disponible (no se mencionan pesos cuantizados ni formatos GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles, para los prompts de texto) |
| Licencia | sam-license (identificador `other`, con acceso restringido y aceptacion de la politica de privacidad de Meta) |
| Formato de pesos | no disponible de forma explicita; el uso documentado via `from_pretrained` apunta a pesos compatibles con Hugging Face/PyTorch (no confirmado) |

Datos adicionales del repositorio consultado: tamano de 14,9 GB, creado y actualizado el 2026-09-15, 0 descargas, 0 likes, region `us`, pipeline no declarado.

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo, el numero de parametros, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detalla el encoder de audio ni el mecanismo por el que se fusionan las tres modalidades de prompt (texto, visual y temporal). Todo lo anterior debe considerarse "no disponible".

Lo que si se documenta es la interfaz funcional: el modelo recibe audio (o video, en el caso del prompting visual) junto con una descripcion y, opcionalmente, anclajes temporales, y devuelve dos senales: `result.target` con el sonido aislado y `result.residual` con el resto de la mezcla, ambas como listas de tensores de onda unidimensional. El prompting visual depende de SAM3 (`facebookresearch/sam3`) para generar las mascaras de video que se pasan al procesador mediante `processor.mask_videos`. Los anclajes temporales se expresan como listas `[tipo, inicio, fin]`, donde `+` indica presencia del sonido en ese intervalo y `-` indica ausencia.

Un dato practico relevante para el despliegue: el ejemplo oficial usa `SAMAudio.from_pretrained` y `SAMAudioProcessor.from_pretrained` con ejecucion en modo `eval()` e `inference_mode()`, lo que sugiere un consumo de inferencia en PyTorch estandar sin requisitos de servidores especializados documentados en la model card.

## Capacidades

- Separacion de audio guiada por texto: aisla sonidos descritos en lenguaje natural, con ejemplos oficiales como "A man speaking", "A person coughing", "A dog barking", "Piano playing a melody" o "Car engine revving".
- Separacion guiada por prompt visual: aisla el sonido asociado a un objeto concreto de un video usando mascaras generadas con SAM3 (por ejemplo, "The person on the left").
- Separacion guiada por intervalo temporal: acepta anclajes positivos y negativos para indicar cuando suena y cuando no suena el objetivo.
- Salida dual: devuelve tanto la senal objetivo aislada como el residuo con el resto de la mezcla.
- Entrada de audio y de video: el procesador acepta rutas de audio y de video (con decodificacion via `torchcodec.decoders.VideoDecoder`).
- Combinacion de prompt de texto con anclajes temporales, segun el ejemplo de la propia model card.
- Soporte de `tool calling` / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica / no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidad de vision: indirecta, solo como apoyo para derivar mascaras con SAM3; el modelo no es un modelo de vision general.

## Casos de uso

- Limpieza de dialogo en produccion audiovisual: dado un video con musica de fondo y ruido de ambiente, un prompt de texto del tipo "A man speaking" permite extraer la voz para regrabar o para sustituir la banda sonora, usando `result.residual` como pista de ambiencia.
- Postproduccion de doblaje: los anclajes temporales permiten indicar los tramos exactos en los que aparece un sonido concreto (por ejemplo, un pitido de coche entre los segundos 6,3 y 7,0) y aislarlo sin afectar al resto de la escena.
- Etiquetado y curacion de datasets de audio: separar automaticamente eventos sonoros descritos en texto facilita generar corpus limpios para entrenar clasificadores de eventos acusticos o sistemas de deteccion de palabras clave.
- Analisis forense y de vigilancia con video: el prompting visual con SAM3 permite aislar el sonido atribuible a una persona u objeto concreto identificado en el fotograma, lo que resulta util en revision de grabaciones donde varias fuentes hablan a la vez.
- Restauracion de archivos historicos o grabaciones de campo: aislar una fuente sonora (un instrumento, un animal, una senal de trafico) de una grabacion contaminada para su analisis posterior o para su reutilizacion en un archivo sonoro.
- Preprocesado para reconocimiento de voz en entornos ruidosos: extraer la voz objetivo antes de pasarla a un sistema ASR puede mejorar la transcripcion cuando hay musica, trafico u otras voces superpuestas.
- Prototipado de herramientas de audio interactivas: la API de tres modos de prompting permite construir interfaces en las que el usuario marca un intervalo en la onda, escribe una descripcion o selecciona un objeto en el video para obtener una pista aislada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia aproximada a partir del tamano del repositorio (14,9 GB de pesos), la inferencia en precision de 16 bits requeriria del orden de 15-20 GB de VRAM, y en precision de 32 bits del orden de 30-35 GB. Estas cifras son estimaciones derivadas del tamano de los ficheros, no datos confirmados por el autor.
- GPU recomendadas: no disponibles. Por la estimacion anterior, encajarian GPU de 24 GB o mas (RTX 4090, L40S, A100 40 GB, H100) para carga en 16 bits.
- Compatibilidad con GPU de consumo: probable en tarjetas de 24 GB (RTX 3090, RTX 4090) si la carga se hace en 16 bits; en tarjetas de 8-16 GB serian necesarias tecnicas de cuantizacion no documentadas en la informacion disponible.
- Opciones de despliegue: la model card solo documenta uso directo con PyTorch mediante la libreria `sam_audio` (`SAMAudio`, `SAMAudioProcessor`). No se mencionan vLLM, TGI, llama.cpp, Ollama ni formatos GGUF; al tratarse de un modelo de audio, esos backends de texto no son directamente aplicables.
- Dependencias adicionales: `torch`, `torchaudio`, `torchcodec` para decodificacion de video, y `sam3` (instalado desde `git+https://github.com/facebookresearch/sam3.git`) para el modo de prompting visual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables en la informacion proporcionada. La model card no incluye tablas de comparacion, y la busqueda web asociada no devolvio resultados relacionados con modelos de audio (los resultados obtenidos corresponden a un catalogo de recambios de automocion y no son relevantes). Categorias de modelos con los que cabria compararlo, sin datos disponibles para establecer la comparacion:

| Modelo | Parametros | Contexto / modalidad | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM-Audio large (este modelo) | no disponible | audio con prompts de texto, visuales y temporales | no disponible | sam-license (acceso restringido) | Hugging Face con solicitud de acceso |
| Modelos de separacion guiada por texto de la familia AudioSep / CLAP | no disponible | audio + texto | no disponible | no disponible | no disponible en la informacion consultada |
| Separadores de tallos musicales tipo Demucs | no disponible | audio, numero fijo de tallos | no disponible | no disponible | no disponible en la informacion consultada |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser un modelo condicionado por descripciones en texto e imagenes, hereda los sesgos del encoder de texto y del detector visual (SAM3) que lo alimentan.
- Riesgo de alucinacion / artefactos: no documentado en la informacion disponible. En separacion de fuentes es habitual la aparicion de artefactos en la senal objetivo y de fugas de la fuente extraida dentro del residuo; conviene validarlo con datos propios.
- Limitaciones de idioma: los prompts de texto solo estan soportados en ingles (`language: en`).
- Restricciones de licencia: licencia `sam-license` con acceso controlado. Requiere solicitar acceso al repositorio, autenticarse con Hugging Face y aceptar la politica de privacidad de Meta, facilitando nombre, apellidos, fecha de nacimiento, pais, afiliacion y puesto de trabajo. Es imprescindible revisar los terminos antes de cualquier uso comercial.
- Repositorio de terceros: la ficha analizada (`Supbatomic/sam-audio-large`) no es el repositorio oficial. No hay garantia de que los pesos sean identicos a los de `facebook/sam-audio-large`, ni de que se actualicen; el repositorio tiene 0 descargas y 0 likes y no esta verificado.
- Dependencia externa para el modo visual: el prompting visual exige instalar SAM3 y disponer de mascaras de video, lo que anade complejidad y consumo de recursos al pipeline.
- Trazabilidad: no se documentan parametros, datos de entrenamiento ni evaluaciones, lo que dificulta reproducir resultados o auditar el modelo.
- Formato de la model card: la cita bibliografica incluida en el README esta truncada, por lo que no se puede referenciar correctamente el articulo original a partir de la informacion disponible.

## Enlaces

- Repositorio de Hugging Face analizado: https://huggingface.co/Supbatomic/sam-audio-large
- Repositorio oficial de los checkpoints (mencionado en la model card): https://huggingface.co/facebook/sam-audio-large
- Repositorio de SAM3, necesario para el prompting visual: https://github.com/facebookresearch/sam3
- Politica de privacidad de Meta referenciada en el formulario de acceso: https://www.facebook.com/privacy/policy/
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada.
