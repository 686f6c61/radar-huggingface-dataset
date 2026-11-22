# twmht/Qwen3-ASR-1.7B-ct2-bf16

## Resumen

Qwen3-ASR-1.7B-ct2-bf16 es una conversion al formato CTranslate2 del modelo de reconocimiento automatico del habla Qwen/Qwen3-ASR-1.7B-hf, publicada por el usuario twmht. El modelo original lo desarrolla el equipo Qwen de Alibaba y esta disenado para transcripcion de audio a texto en chino e ingles. Esta version concreta no anade capacidades nuevas: su proposito es ofrecer los pesos en un formato optimizado para inferencia con CTranslate2, con los pesos almacenados en bfloat16.

La relevancia de esta publicacion es operativa mas que cientifica. CTranslate2 es un motor de inferencia centrado en eficiencia en CPU y GPU, con soporte de cuantizacion en tiempo de carga y un diseno orientado a despliegues de produccion. Convertir un modelo ASR de 1.700 millones de parametros a este formato facilita su integracion en servicios de transcripcion con requisitos de latencia y memoria controlados.

No obstante, el propio autor advierte de que se trata de una build temprana: requiere un fork de CTranslate2 que anade una clase nativa para Qwen3-ASR, fork que esta en desarrollo y no se ha publicado. CTranslate2 upstream no puede cargar estos ficheros, y el formato interno puede cambiar antes de la primera release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio, proyector y decoder de texto (familia Qwen3-ASR); detalles internos no disponibles |
| Parametros totales | 1.700 millones (segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en bfloat16; el runtime puede cargarlos como float32, bfloat16, float16 o int8 (cuantizacion en tiempo de carga) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (`model.bin` con spec `Qwen3AsrSpec`, revision 1); ficheros auxiliares JSON y Jinja copiados del modelo original |

## Arquitectura y entrenamiento

El modelo original Qwen3-ASR-1.7B es un sistema de reconocimiento automatico del habla que, segun la estructura de ficheros descrita en la model card de esta conversion, se compone de un encoder de audio, un proyector que conecta las representaciones acusticas con el espacio del decoder, y un decoder de texto autorregresivo, ademas de tablas mel para el preprocesado de la senal. La model card de esta conversion no detalla la arquitectura interna del transformer, el numero de capas ni la dimension de las representaciones.

Tampoco se documentan en la informacion disponible los datos de entrenamiento: numero de tokens, composicion del corpus, horas de audio, ni si se aplicaron tecnicas de alineacion o ajuste fino supervisado. El proceso de conversion, en cambio, si esta descrito: se realiza con la herramienta `ct2-qwen3-asr-converter`, que lee directamente `model.safetensors` sin requerir `torch` ni `transformers`, y preserva exactamente los valores bfloat16 originales.

## Capacidades

- Reconocimiento automatico del habla (ASR) en chino e ingles, con salida de texto a partir de audio.
- Preprocesado de audio integrado mediante tablas mel incluidas en `model.bin`.
- Plantilla de chat (`chat_template.jinja`) y configuracion de generacion (`generation_config.json`) heredadas del modelo original, lo que sugiere un interfaz de decoder con prompts.
- Carga de pesos en float32, bfloat16, float16 o int8 en tiempo de ejecucion, lo que permite ajustar precision y consumo de memoria.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de reuniones y notas de voz en chino e ingles: el modelo convierte audio a texto y puede integrarse en un servicio CTranslate2 con pesos en int8 para reducir memoria en servidores sin GPU dedicada.
- Subtitulado automatizado de contenido audiovisual: la conversion a CTranslate2 permite desplegar el modelo detras de una API de transcripcion por segmentos, con la ventaja de un motor optimizado para inferencia por lotes.
- Atencion al cliente con analitica de llamadas: transcripcion de conversaciones telefonicas en zh/en para alimentar sistemas de analisis de sentimiento o busqueda sobre historico de llamadas.
- Pipeline de accesibilidad: generacion de transcripciones en tiempo casi real para aplicaciones de subtitulado en directo, aprovechando la cuantizacion en carga para ajustar latencia.
- Procesamiento por lotes de archivos de audio en entornos CPU: CTranslate2 esta optimizado para CPU, de modo que el modelo puede ejecutarse en infraestructura sin GPU para tareas de transcripcion diferida.
- Evaluacion y prototipado de ASR multilingue: util para investigadores que quieran comparar el modelo original con su version CTranslate2 en condiciones de cuantizacion distintas sin reescribir el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamano, 1.700 millones de parametros en bfloat16 ocupan aproximadamente 3,4 GB solo en pesos; en float32, unos 6,8 GB; en int8, unos 1,7 GB. A estas cifras hay que sumar el encoder de audio, el proyector y las activaciones, cuyo consumo no se detalla.
- GPU recomendadas: no disponible. Por tamano, el modelo deberia caber en GPUs de consumo con 8 GB o mas en bfloat16 o int8, pero no hay confirmacion del autor.
- Cabe en GPU de consumo: probable por tamano, aunque no confirmado en la informacion disponible.
- Opciones de despliegue: CTranslate2, con la salvedad de que requiere un fork no publicado que anade la clase `Qwen3AsrSpec`. Upstream CTranslate2 no puede cargar estos ficheros.
- Latencia y throughput: no disponibles.
- Nota critica: al no existir release publica del fork necesario, el modelo no es desplegable en produccion con las herramientas actuales.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| twmht/Qwen3-ASR-1.7B-ct2-bf16 | 1,7 B | zh, en | CTranslate2 (bfloat16) | Apache-2.0 | Requiere fork no publicado |
| Qwen/Qwen3-ASR-1.7B-hf (original) | 1,7 B | zh, en | safetensors (transformers) | Apache-2.0 | Disponible |
| Whisper large-v3 (referencia de categoria) | no disponible en la informacion | multilingue | safetensors, CTranslate2, GGUF | MIT | Disponible |

La comparativa con Whisper se incluye como referencia de categoria ASR, pero los datos concretos de parametros y contexto de ese modelo no forman parte de la informacion proporcionada en esta busqueda, por lo que no se comparan cifras de rendimiento.

## Limitaciones y advertencias

- Estado experimental: el autor califica la build como temprana; el formato `Qwen3AsrSpec` revision 1 puede cambiar antes de la primera release.
- No cargable con CTranslate2 upstream: requiere un fork en desarrollo y no publicado.
- Se recomienda fijar la revision del repositorio que se pruebe, dado que el layout de ficheros puede variar.
- Cobertura linguistica limitada a chino e ingles segun los metadatos; no se documentan otros idiomas.
- No se documentan sesgos, tasas de alucinacion ni comportamiento en audio con ruido, acentos o code-switching.
- No se dispone de informacion sobre el contexto maximo de audio procesable ni sobre la duracion maxima por segmento.
- Licencia Apache-2.0, permisiva para uso comercial, heredada del modelo original; conviene verificar los terminos del modelo base Qwen3-ASR-1.7B-hf.
- Sin descargas ni likes en el momento de la consulta, lo que reduce la evidencia empirica de la comunidad sobre su funcionamiento.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/twmht/Qwen3-ASR-1.7B-ct2-bf16
- Modelo base original: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- CTranslate2 (motor de inferencia): no se proporciona enlace en la informacion disponible
- Paper, blog o demo oficial de Qwen3-ASR: no disponible en la informacion proporcionada
