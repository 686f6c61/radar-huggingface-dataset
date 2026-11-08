# supermind/OGG-Comfy

## Resumen

OGG-Comfy es un paquete de nodos personalizados para ComfyUI publicado por el usuario supermind que integra el modelo de sintesis de voz OGG TTS (0,8B parametros, difusion por bloques, 8 idiomas y 24 etiquetas de emocion y voz) junto con su codec de audio (Fish codec), clonacion de voz, decodificacion, un editor de audio sobre linea de tiempo y Qwen3-ASR para transcripcion. El objetivo es que todo el pipeline de generacion de voz funcione de forma autocontenida dentro de ComfyUI, sin depender de otros paquetes de nodos.

El repositorio en Hugging Face no contiene pesos: es un paquete de codigo (nodos y flujos de trabajo de ejemplo). Los pesos reales se descargan de otros repositorios (FashionFlora/ogg-tts para el modelo, Drama-3-ComfyUI para el codec y Qwen3-ASR-ComfyUI para el ASR). El tamano del repo es de 0,0 GB, con cero descargas y cero likes en el momento de la consulta, y la model card no declara licencia, idiomas ni pipeline.

La relevancia actual es practica: permite montar un flujo completo de texto a voz con clonacion y edicion dentro de ComfyUI reutilizando los pesos de OGG TTS. No obstante, el propio autor advierte de que el codigo solo se ha verificado en CPU con sustitutos de ComfyUI y nunca con los pesos reales ni en GPU, por lo que debe considerarse material en fase temprana de integracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nodos de ComfyUI que envuelven OGG TTS (modelo de difusion por bloques) y codec de audio Fish; incluye Qwen3-ASR para transcripcion |
| Parametros totales | 0,8B (modelo OGG TTS); Qwen3-ASR en variantes de 1,7B y 0,6B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 y bfloat16 (seleccionables en el nodo Load OGG TTS) |
| Idiomas soportados | 8 idiomas en OGG TTS; 30 idiomas en Qwen3-ASR (la lista concreta no esta disponible) |
| Licencia | no disponible |
| Formato de pesos | safetensors (modelo, codec y ASR); ficheros de voz en formato propio del paquete (unos pocos KB) |

## Arquitectura y entrenamiento

OGG TTS es un modelo de difusion por bloques de 0,8B parametros que genera codigos acusticos que posteriormente decodifica el codec Fish a audio a 44,1 kHz. El paquete OGG-Comfy no entrena nada: porta el modelo a nodos de ComfyUI, gestiona la carga del checkpoint, el codec, las voces de referencia y los codigos generados, e incorpora Qwen3-ASR para transcribir clips y obtener marcas temporales por palabra en el editor.

Segun la model card, el checkpoint disponible corresponde a 120.000 de 400.000 pasos de entrenamiento. Las etiquetas de emocion y voz se aprendieron a partir de anotaciones de fragmentos claramente audibles, que eran minoria en el corpus, y en una cuarta parte de las muestras se eliminaron; por eso el autor las describe como indicaciones orientativas mas que como control fiable. El modelo dispone de 3.157 hablantes anonimos entrenados (spk_0 a spk_3156) y 599 "calidades" (q0 a q598) asociadas a grabaciones de libros o juegos. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Sintesis de voz a partir de texto en 8 idiomas, con 24 etiquetas de emocion y voz insertables en linea.
- Clonacion de voz a partir de un clip de referencia y su transcripcion exacta; las voces resultantes se guardan como ficheros de pocos KB y se recargan rapido.
- Seleccion de identidad vocal sin clip mediante hablantes entrenados (spk_0 a spk_3156), hablante desconocido por idioma (ru_x y similares) o aleatorio por semilla.
- Generacion por lineas (`split_lines`): una toma por linea, cada una con las dos lineas anteriores y posteriores como contexto.
- Modo dialogo con hasta 6 hablantes nombrados, en dos variantes: linea a linea (cada linea desde la voz de su hablante) o de una sola pasada (toda la escena y todas las voces a la vez).
- Extraccion de una voz a partir de una toma generada (OGG Voice from Take) para reutilizarla con cualquier texto.
- Guardado y carga de codigos para decodificar o editar sin regenerar.
- Decodificacion a 44,1 kHz con union de tomas separadas por 0,3 s y recorte opcional de pausas largas.
- Editor sobre linea de tiempo: subtitulos sincronizados con la voz, cortes, insercion de silencio, nombrado de voces y ajuste de volumen.
- Transcripcion de voz a texto en 30 idiomas con Qwen3-ASR y marcas temporales por palabra mediante ForcedAligner.
- No dispone de entrada para descripciones de voz en lenguaje natural: la identidad vocal se controla con clip de referencia, hablante, calidad, etiquetas en linea, cfg y temperatura.

## Casos de uso

- Doblaje y localizacion de contenido: el modelo cubre 8 idiomas y permite fijar una voz clonada por personaje, de modo que un mismo clip de referencia mantiene la identidad vocal entre lineas y tomas de un guion traducido.
- Produccion de audiolibros y narracion: el modo `split_lines` genera una toma por linea con contexto de las lineas vecinas, lo que mantiene coherencia de entonacion en parrafos largos, y el editor permite recortar pausas y ajustar volumen por segmento.
- Escenas de dialogo para videojuegos o animacion: el nodo OGG TTS Dialogue admite hasta 6 hablantes con voces asignadas y puede generar la escena completa en una sola pasada, util para prototipar conversaciones antes de contratar voces definitivas.
- Clonacion de voz para prototipos de asistentes: con un clip y su transcripcion se crea una voz reutilizable (ficheros de pocos KB) que se carga en cada generacion, lo que simplifica pipelines con varias voces fijas.
- Postproduccion y montaje de audio en ComfyUI: el editor decodifica los codigos, sincroniza subtitulos con la voz mediante las marcas por palabra de Qwen3-ASR, corta, inserta silencio y ajusta volumen sin salir del grafo.
- Generacion de voces para pruebas de UX: el flujo `ogg_voice_design` con hablante aleatorio produce una voz distinta por ejecucion y guarda cada toma con su clip, lo que permite audicionar muchas identidades y conservar las validas.
- Transcripcion y alineado de material existente: Qwen3-ASR en variantes de 0,6B o 1,7B transcribe en 30 idiomas y aporta marcas temporales que alimentan el editor o sirven para preparar referencias de clonacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El autor no ha probado el paquete en GPU: la verificacion se hizo en CPU sustituyendo ComfyUI por dobles de prueba.
- VRAM estimada: no disponible. El unico dato de memoria es que `bfloat16` reduce el consumo a la mitad frente a `float32`, que es el modo en que lo ejecutan los autores.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos de ejecucion real.
- Despliegue: ComfyUI version 0.40 o superior; no requiere `pip install` adicional y usa la version de `transformers` que ya exige ComfyUI. Los pesos se colocan en `models/diffusion_models` (modelo OGG TTS), `models/vae` (codec Drama 3) y `models/asr` (Qwen3-ASR).
- Latencia y throughput: no disponibles. Los valores por defecto de generacion son `steps` 6, `cfg` 1.5 y `temperature` 0.8, tomados del script de referencia.
- Puede instalarse junto a ComfyUI-Drama3 porque los identificadores y tipos de nodo difieren.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de texto a voz que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El codigo no se ha probado con los pesos reales, ni en GPU, ni con una instancia activa de ComfyUI; tampoco se ha verificado la interfaz web del editor ni la calidad del audio.
- Problemas probables en el primer contacto segun el autor: version de `transformers` (las llamadas de KV-cache son del codigo de referencia), comportamiento de `ModelPatcher` de ComfyUI con un modulo plano, conjunto exacto de claves del checkpoint y disposicion de los ficheros de configuracion y tokenizer de OmniVoice.
- El flujo de ejemplo de clonacion no incluye clip: hay que elegir uno manualmente en Load Audio.
- El checkpoint esta entrenado solo hasta 120.000 de 400.000 pasos, y las etiquetas de emocion y voz se aprendieron de anotaciones parciales; el propio autor las califica de indicaciones poco fiables.
- No acepta descripciones de voz en lenguaje natural; la identidad vocal depende de clip, hablante, calidad y parametros de muestreo.
- Licencia no declarada: no hay base para asumir uso comercial permitido.
- Idiomas: se indican 8 para OGG TTS y 30 para Qwen3-ASR, pero no se detalla la lista, por lo que no puede confirmarse la cobertura de una lengua concreta.
- Riesgo de alucinacion y sesgos: no hay informacion disponible sobre sesgos del modelo de voz ni sobre fidelidad de la transcripcion.
- El repositorio tiene cero descargas y cero likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio del paquete: https://huggingface.co/supermind/OGG-Comfy
- Modelo OGG TTS (pesos): https://huggingface.co/FashionFlora/ogg-tts
- Codec Drama 3 para ComfyUI: https://huggingface.co/PedroMarinhoDev/Drama-3-ComfyUI
- Qwen3-ASR para ComfyUI: https://huggingface.co/PedroMarinhoDev/Qwen3-ASR-ComfyUI
- Perfil del autor: https://huggingface.co/supermind/activity/all
- Catalogo de modelos de ComfyUI: https://comfy.org/hub/models/
