# tintitu/sherpa-zipformer-ctc-zh-int8

## Resumen

Zipformer CTC 中文 INT8 es un modelo de reconocimiento automatico del habla (ASR) offline para chino mandarin, distribuido en formato ONNX cuantizado a INT8. No se trata de un modelo de lenguaje ni de un modelo multimodal: es un sistema acustico de transcripcion que recibe audio mono a 16 kHz y devuelve texto en chino. El repositorio `tintitu/sherpa-zipformer-ctc-zh-int8` es una reempaquetado del artefacto oficial publicado por el proyecto `k2-fsa/sherpa-onnx` (version `2025-07-03`), no un entrenamiento nuevo del autor del repositorio.

El modelo emplea la arquitectura Zipformer en su variante CTC (Connectionist Temporal Classification), desarrollada en el ecosistema k2/icefall, y se distribuye como dos ficheros: `model.int8.onnx` (pesos cuantizados) y `tokens.txt` (vocabulario). El repositorio ocupa 0,3 GB y el artefacto original tiene un tamano de 301.377.906 bytes, con SHA256 `f3ad1814fea34c407eab0cc3df6f6b625419ac9a60d8aebd8efe772a8e85ef67`.

Su relevancia practica esta en el despliegue: al ser un ONNX INT8 de ~300 MB, puede ejecutarse en CPU sin GPU, lo que lo hace apto para transcripcion embebida, aplicaciones de escritorio y moviles, y procesamiento por lotes de audio en infraestructura modesta. La contrapartida es que la licencia de los pesos no esta declarada y el propio autor advierte de que no debe asumirse Apache-2.0 sin verificar la cadena de atribucion upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer CTC (offline), encoder tipo transformer con downsampling multirresolucion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de audio a 16 kHz, ventana offline (el modelo procesa el segmento de audio completo que se le entregue) |
| Tipos de cuantizacion | INT8 (fichero `model.int8.onnx`) |
| Idiomas soportados | chino (中文) |
| Licencia | no disponible; la model card indica explicitamente que no debe declararse Apache-2.0 ni otra licencia sin verificar la cadena upstream |
| Formato de pesos | ONNX (`model.int8.onnx`) + vocabulario en texto plano (`tokens.txt`) |
| Tamano del repositorio | 0,3 GB |
| Tamano del artefacto upstream | 301.377.906 bytes |
| SHA256 upstream | `f3ad1814fea34c407eab0cc3df6f6b625419ac9a60d8aebd8efe772a8e85ef67` |
| Version upstream | `2025-07-03` |
| Frecuencia de muestreo | 16 kHz |
| Autor del repositorio | tintitu |
| Repositorio original | k2-fsa/sherpa-onnx |

## Arquitectura y entrenamiento

Zipformer es una arquitectura de encoder para reconocimiento de voz introducida en el ecosistema k2/icefall. Su rasgo distintivo es un esquema de downsampling multirresolucion: las capas del encoder no operan todas a la misma frecuencia temporal, sino que alternan distintas tasas de submuestreo, lo que reduce el coste computacional frente a un transformer de encoder convencional manteniendo el contexto temporal. La variante distribuida aqui es CTC, es decir, el modelo produce directamente una secuencia de posteriores sobre el vocabulario y se decodifica con busqueda greedy (o beam search) sin necesidad de un decodificador transducer o de un modelo de lenguaje externo obligatorio.

Sobre el entrenamiento no hay informacion en los materiales proporcionados: no se especifica el numero de horas de audio, la composicion del corpus, si se aplicaron tecnicas de aumento de datos, ni si hubo etapas de refinamiento. El autor del repositorio declara de forma explicita que "no es un nuevo resultado de entrenamiento", sino una reorganizacion de ficheros ya publicados por el proyecto upstream. En consecuencia, cualquier afirmacion sobre datos de entrenamiento, horas de audio o metodologia quedaria fuera del alcance de la informacion disponible.

La unica innovacion tecnica verificable en el artefacto es la cuantizacion INT8 de los pesos para inferencia en ONNX Runtime, orientada a reducir el tamano y acelerar la ejecucion en CPU.

## Capacidades

- Reconocimiento de voz offline para chino mandarin: transcribe audio a texto sin conexion a servicios externos.
- Entrada de audio mono a 16 kHz; requiere remuestreo previo si la fuente no esta a esa frecuencia.
- Decodificacion CTC greedy sobre el vocabulario incluido en `tokens.txt`.
- Ejecucion en CPU gracias a la cuantizacion INT8, sin necesidad de GPU.
- Integracion con el ecosistema sherpa-onnx y con ONNX Runtime.
- Capacidad de procesar segmentos de audio completos (modo offline, no streaming incremental).
- No dispone de tool calling ni function calling.
- No dispone de modo agente, razonamiento multi-paso ni planificacion.
- No dispone de capacidades de vision, audio generativo ni multimodalidad.
- No hay soporte multilingue declarado: el modelo es especificamente para chino.

## Casos de uso

- Transcripcion por lotes de archivos de audio en chino: al ser un modelo offline ONNX de ~300 MB, se puede ejecutar sobre CPU en un servidor modesto para convertir grandes volumenes de grabaciones archivadas en texto indexable, sin coste por API.
- Subtitulado automatizado de video: se extrae la pista de audio, se remuestrea a 16 kHz y se genera el texto en chino para posterior sincronizacion con marcas de tiempo (si el pipeline de decodificacion las provee).
- Dictado y entrada de voz en aplicaciones de escritorio: integrable mediante los bindings de sherpa-onnx, permite dictar texto en chino en un editor o campo de formulario sin enviar audio a la nube, lo que resulta relevante por privacidad.
- Asistentes de voz embebidos para dispositivos IoT o quioscos: el modelo INT8 cabe en dispositivos con recursos limitados (Raspberry Pi, placas ARM, moviles Android/iOS) y funciona sin conectividad.
- Analitica de conversaciones en centros de contacto: transcripcion de llamadas grabadas en chino para busqueda de palabras clave, clasificacion posterior y control de calidad, ejecutable on-premise.
- Accesibilidad para personas con discapacidad auditiva: conversion en tiempo casi real de conversaciones presenciales o contenido audiovisual en chino a texto en pantalla, con la ventaja de que no requiere red.
- Digitalizacion de archivos sonoros institucionales: bibliotecas, archivos historicos y organismos publicos con material en chino pueden transcribir colecciones completas sin dependencia de proveedores externos ni cuotas de uso.
- Preprocesado para pipelines de NLP: la transcripcion puede alimentar despues etapas de resumen, traduccion o indexacion semantica, actuando como primer eslabon de un sistema mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de caracteres (CER), tasas de error de palabras (WER), ni comparaciones con otros sistemas. Tampoco se proporcionan datos de latencia, factor de tiempo real (RTF) ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para ejecucion en CPU. En GPU, el consumo seria marginal (menos de 1 GB), pero no aporta ventaja clara frente a CPU.
- Memoria RAM estimada: coherente con el tamano del fichero de pesos (~300 MB) mas el overhead del runtime de ONNX Runtime, en el orden de cientos de MB.
- GPU recomendadas: no aplica. El modelo no requiere GPU; cualquier GPU compatible con ONNX Runtime CUDA serviria pero resultaria sobredimensionada.
- Compatibilidad con GPU de consumo: si, irrelevante en la practica; el hardware objetivo son CPUs de escritorio, portatiles y SoCs ARM.
- Dispositivos embebidos: el tamano INT8 permite despliegue en Raspberry Pi, moviles Android/iOS y dispositivos con memoria limitada, siempre que se use el runtime adecuado.
- Opciones de despliegue: sherpa-onnx (bindings en C++, C, Python, C#, Java, Kotlin, Swift, Go, JavaScript y WebAssembly, entre otros), ONNX Runtime directamente, y servidores de inferencia basados en sherpa-onnx. vLLM, llama.cpp, Ollama y TGI no son aplicables: estan orientados a modelos de lenguaje, no a reconocimiento de voz ONNX.
- Latencia y throughput: no disponible. Dependera del hardware, del numero de hilos de ONNX Runtime y de la duracion de los segmentos de audio.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamano / cuantizacion | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| tintitu/sherpa-zipformer-ctc-zh-int8 | Zipformer CTC offline | Chino | ~300 MB, INT8 | ONNX + tokens.txt | no disponible | no disponible |
| sherpa-onnx Zipformer CTC zh (fp32, upstream) | Zipformer CTC offline | Chino | mayor que la version INT8 | ONNX | segun upstream, no verificada | no disponible |
| Whisper (variantes small/medium) | Encoder-decoder transformer | Multilingue (incluye chino) | 244 MB - 1,5 GB segun variante | safetensors, GGUF, ONNX segun conversion | MIT (OpenAI) | no disponible en esta ficha |
| Paraformer (FunASR) | ASR no autorregresivo | Chino | centenares de MB segun variante | PyTorch, ONNX | Apache-2.0 en el proyecto FunASR | no disponible en esta ficha |
| WeNet / U2++ | Conformer transducer/CTC | Chino, multilingue | centenares de MB | PyTorch, ONNX | Apache-2.0 en el proyecto WeNet | no disponible en esta ficha |

Las comparaciones de rendimiento no pueden establecerse con los datos disponibles. La diferencia estructural mas relevante es que este modelo es monolingue (chino), offline y de tipo CTC puro, mientras que alternativas como Whisper son multilingues y autorregresivas, y Paraformer/WeNet ofrecen ecosistemas de entrenamiento mas amplios. La ventaja de este artefacto es su tamano reducido y su formato ONNX INT8 listo para CPU.

## Limitaciones y advertencias

- Licencia no declarada: la model card advierte de que la licencia del codigo fuente upstream no se hereda automaticamente por los pesos y el vocabulario, y de que no debe asumirse Apache-2.0 sin verificacion. Esto es un riesgo directo para uso comercial o redistribucion.
- Uso comercial incierto: sin una licencia clara sobre pesos y `tokens.txt`, el despliegue en producto requiere revision legal previa.
- Monolingue: solo chino. No procesa otros idiomas ni mezcla de idiomas de forma fiable.
- Modo offline: no es un modelo de streaming incremental; para reconocimiento en vivo hay que segmentar el audio y asumir latencias por segmento.
- Dependencia de la frecuencia de muestreo: la entrada debe estar a 16 kHz. Un remuestreo incorrecto degrada la transcripcion.
- Cuantizacion INT8: la reduccion de precision puede implicar una perdida de exactitud frente al modelo en fp32, especialmente en audio ruidoso o con acentos poco representados.
- Errores de sustitucion y omision: como todo sistema ASR, confunde palabrashomofonas y terminos especializados; no hay datos publicados de CER que permitan acotar el margen de error.
- Ausencia de puntuacion y normalizacion: la salida CTC suele carecer de puntuacion, mayusculas (no aplicable en chino) y normalizacion de numeros o fechas, por lo que puede requerir post-procesado.
- Sin marcas de tiempo garantizadas: la model card no documenta salida de timestamps por token; la alineacion temporal habria que derivarla externamente.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos por acento, edad, genero o variedad dialectal del chino.
- Riesgo de alucinacion: en sentido estricto no aplica a un modelo CTC, pero si existe el riesgo de producir texto plausible incorrecto en audio con ruido o silencio.
- Fecha de creacion futura en los metadatos de HuggingFace (2026-09-11), lo que apunta a metadatos poco fiables; conviene fijar el commit o la version al desplegar.
- Sin garantia de mantenimiento: 0 descargas y 0 likes en el momento de la consulta; el repositorio es un espejo sin senales de actividad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tintitu/sherpa-zipformer-ctc-zh-int8
- Proyecto upstream sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Documentacion de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/index.html
- Descarga del artefacto upstream: https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-zipformer-ctc-zh-int8-2025-07-03.tar.bz2
