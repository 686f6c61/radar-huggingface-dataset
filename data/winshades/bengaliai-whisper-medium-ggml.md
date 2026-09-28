# winshades/bengaliai-whisper-medium-ggml

## Resumen

`winshades/bengaliai-whisper-medium-ggml` es una conversion al formato ggml del modelo de reconocimiento automatico del habla (ASR) `bengaliAI/tugstugi_bengaliai-asr_whisper-medium`, un Whisper medium ajustado para bengali por el equipo de tugstugi para Bengali.AI. El repositorio no entrena nada: toma los pesos originales en la revision `da605cc1bd2f60a18d8e440e977ddfa921a88e63`, los convierte a 16 bits con `models/convert-h5-to-ggml.py` de whisper.cpp (commit `d09f61a`) y los comprime a 5 bits con `whisper-quantize` (release `b5130`). El resultado es un unico fichero de 539.257.671 bytes (514 MB) que whisper.cpp lee directamente.

La relevancia de esta ficha esta en el binomio tamano/precision: el modelo cuantizado a q5_0 ocupa 514 MB y, segun las mediciones del propio autor, comete un 20% de palabras erroneas sobre 25 clips de habla leida en bengali del split de test de FLEURS, frente al 61% de IndicWhisper medium en 16 bits (1,5 GB) y al 96% de Whisper large-v3-turbo cuantizado (547 MB). Es decir, un modelo de tamano medio que iguala su propia version de 16 bits con un tercio del peso.

El caso de uso declarado es la dictacion offline en bengali dentro de WinShades, una herramienta de lectura y escritura para Windows. Al estar en ggml, puede ejecutarse sin conexion y sin dependencias de Python, tanto en CPU como en GPU. La licencia es Apache 2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | Aproximadamente 769 millones (arquitectura Whisper medium estandar; no confirmado en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (caracteristica estandar de Whisper; no detallada en la informacion proporcionada) |
| Tipos de cuantizacion | F16 (16 bits, 1,5 GB) y q5_0 (5 bits, 514 MB); el repositorio solo distribuye el fichero q5_0 |
| Idiomas soportados | Bengali (`bn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (`ggml-bengaliai-whisper-medium-q5_0.bin`) |
| Tamano del fichero q5_0 | 539.257.671 bytes (514 MB) |
| SHA-256 | `2c64c7f1e2c8f2417ed1fe5b78c7238933c00a2cdc2ef33e7087a95475256605` |
| Runtime objetivo | whisper.cpp |
| Modelo base | `bengaliAI/tugstugi_bengaliai-asr_whisper-medium` (revision `da605cc1bd2f60a18d8e440e977ddfa921a88e63`) |
| Herramientas de conversion | `convert-h5-to-ggml.py` (commit `d09f61a`), `whisper-quantize` (release `b5130`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper medium de OpenAI: un transformer encoder-decoder con representacion log-Mel del audio de entrada, pensado para transcripcion multilingue y traduccion. El modelo original se entreno con supervision debil sobre un corpus multilingue a gran escala; los detalles concretos del ajuste fino posterior para bengali (volumen de horas, composicion del dataset, si hubo tecnicas de aumento de datos o de decodificacion) no estan disponibles en la informacion proporcionada.

Lo relevante de este repositorio es que **no hay reentrenamiento ni ajuste adicional**: los pesos se convierten y se comprimen, nada mas. El pipeline exacto es conversion a 16 bits desde el checkpoint de HuggingFace y posterior cuantizacion a q5_0. La model card declara explicitamente que se trata de una version modificada del modelo original y que todo el credito corresponde a Bengali.AI y a sus autores. No se documentan innovaciones tecnicas propias (ni decodificacion especulativa, ni atencion lineal, ni variantes de arquitectura): el valor anadido es el empaquetado en ggml y la compresion a 5 bits con perdida minima de calidad.

## Capacidades

- Reconocimiento automatico del habla en bengali (`bn`) con salida de texto.
- Transcripcion offline, sin conexion a internet, al ejecutarse sobre whisper.cpp.
- Ejecucion en CPU y en GPU con el mismo fichero de pesos.
- Modelo de tamano medio: segun el autor, comodamente mas rapido que el habla en una tarjeta grafica y "justo a la par" en un procesador de sobremesa rapido.
- Formato GGML compatible con el ecosistema whisper.cpp, lo que facilita su integracion en aplicaciones nativas de escritorio.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision ni audio mas alla de la transcripcion. Tampoco se declara soporte multilingue adicional: aunque Whisper medium es multilingue por construccion, esta version esta orientada y validada unicamente para bengali.

## Casos de uso

- Dictado offline en aplicaciones de escritorio: es el caso de uso declarado por el autor. WinShades lo distribuye como descarga para dictado en bengali, de modo que el usuario no depende de un servicio en la nube ni envia audio a terceros.
- Subtitulado de contenido en bengali: transcripcion de videos, podcasts o clases grabadas, generando pistas de subtitulos sin coste de API y con el modelo ejecutandose en local.
- Accesibilidad para hablantes de bengali: conversion de voz a texto en herramientas de asistencia, con requisitos de hardware muy bajos gracias a los 514 MB del fichero cuantizado.
- Archivado y busqueda de audio: transcripcion por lotes de grabaciones historicas o periodisticas para indexarlas y hacerlas buscables por texto, aprovechando que el modelo cabe en cualquier GPU de consumo o incluso en CPU.
- Aplicaciones de campo con conectividad limitada: el modelo se puede empaquetar dentro de un binario de escritorio o de un dispositivo sin acceso a red, algo imposible con APIs de ASR alojadas.
- Transcripcion en entornos con requisitos de privacidad: sectores sanitario, legal o administrativo donde el audio no puede salir del equipo; al ser un modelo GGML local, el dato nunca abandona la maquina.
- Integracion en pipelines de accion por voz: entrada de comandos hablados en bengali para herramientas de escritorio, siempre que se combine con una capa de interpretacion posterior, ya que el modelo solo produce transcripcion.

## Benchmarks y rendimiento

El autor publica una evaluacion propia sobre 25 clips de habla leida en bengali del split de test del dataset FLEURS, midiendo la proporcion de palabras erroneas, omitidas o anadidas (menor es mejor).

| Modelo | Tamano | Palabras erroneas |
|---|---:|---:|
| OpenAI Whisper base (q5_1) | 57 MB | 110% |
| OpenAI Whisper large-v3-turbo (q5_0) | 547 MB | 96% |
| AI4Bharat IndicWhisper medium (16 bits) | 1,5 GB | 61% |
| Este modelo, 16 bits | 1,5 GB | 19% |
| Este modelo, q5_0 | 514 MB | 20% |

Advertencias sobre estos datos, tal como los presenta el propio autor: 25 clips permiten ordenar modelos de forma fiable, pero no constituyen una cifra precisa. Ademas, la metrica es una tasa de error a nivel de palabra calculada por WinShades, no el WER estandar reportado en publicaciones academicas. La cuantizacion a q5_0 degrada el resultado en un solo punto porcentual respecto a los 16 bits, con un tercio del tamano de fichero.

## Requisitos de hardware

- VRAM para inferencia: el fichero q5_0 pesa 514 MB; hay que sumar buffers de contexto y de decodificacion de whisper.cpp. En la practica, menos de 1 GB en total para la version cuantizada y aproximadamente 1,5-2 GB para la de 16 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre sirve, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 y superiores. Segun el autor, en tarjeta grafica va comodamente mas rapido que tiempo real.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas e incluso en iGPU con memoria compartida suficiente, gracias al tamano del modelo cuantizado.
- CPU: el autor indica que en un procesador de sobremesa rapido el modelo "justo se mantiene" al ritmo del habla, es decir, un factor de tiempo real cercano a 1x. En portatiles o CPUs mas lentas la transcripcion sera mas lenta que el audio de entrada.
- Opciones de despliegue: whisper.cpp (formato nativo), WinShades como aplicacion de escritorio, y cualquier envoltorio que consuma ficheros GGML de whisper.cpp. No hay versiones publicadas para vLLM, TGI, Ollama o llama.cpp en la informacion proporcionada.
- Latencia y throughput: no disponibles como cifras concretas. La unica referencia cualitativa es la del autor (mas rapido que tiempo real en GPU, aproximadamente tiempo real en CPU de sobremesa rapida).

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Idiomas | Palabras erroneas (FLEURS, 25 clips) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (q5_0) | Whisper medium, 514 MB | Bengali | 20% | Apache 2.0 | GGML en HuggingFace |
| Este modelo (F16) | Whisper medium, 1,5 GB | Bengali | 19% | Apache 2.0 | GGML en HuggingFace |
| AI4Bharat IndicWhisper medium | 1,5 GB | Indias (incluye bengali) | 61% | No disponible en la informacion proporcionada | HuggingFace |
| OpenAI Whisper large-v3-turbo (q5_0) | 547 MB cuantizado | Multilingue (99 idiomas) | 96% | MIT (modelo original de OpenAI; no confirmado en la informacion proporcionada) | Multiples repositorios |
| OpenAI Whisper base (q5_1) | 57 MB cuantizado | Multilingue | 110% | MIT (modelo original de OpenAI; no confirmado en la informacion proporcionada) | Multiples repositorios |

El dato diferencial es que un modelo de tamano medio especializado en bengali supera ampliamente a alternativas multilingues mas grandes o cuantizadas al mismo tamano en esta tarea concreta, a costa de no servir para otros idiomas.

## Limitaciones y advertencias

- Especializacion mono-idioma: la model card declara unicamente bengali (`bn`). Aunque Whisper medium es multilingue por arquitectura, no hay ninguna garantia de calidad fuera de ese idioma y no se ha evaluado.
- Evaluacion muy limitada: las cifras de rendimiento provienen de 25 clips de FLEURS medidos por el propio distribuidor, no de una evaluacion independiente ni de un benchmark estandar. No deben tratarse como un WER reproducible.
- Sin datos de sesgos: no se documenta analisis de sesgos por acento, dialecto, genero, edad o condicion sociolectal dentro del bengali. Es un riesgo real en ASR, especialmente con un ajuste fino cuyo dataset no se detalla.
- Riesgo de alucinacion: como cualquier modelo de la familia Whisper, puede generar texto plausible en segmentos con ruido, silencio o audio musical. En produccion conviene aplicar umbrales de confianza y revision humana en contenido critico.
- Cuantizacion con perdida: q5_0 es una compresion a 5 bits. La degradacion medida es de un punto porcentual (19% a 20%), pero esa medicion es de 25 clips; otros dominios pueden sufrir mas.
- Trazabilidad del origen: el repositorio es una conversion de terceros (winshades), no una publicacion de Bengali.AI ni de OpenAI. Conviene verificar el SHA-256 del fichero antes de desplegarlo y asumir la cadena de custodia del modelo base.
- Licencia: Apache 2.0, heredada del modelo original, lo que permite uso comercial. Aun asi, la model card no incluye analisis juridico adicional ni se pronuncia sobre los terminos del modelo base mas alla de indicar que la licencia completa esta en `LICENSE`.
- Dependencia de whisper.cpp: el fichero solo es util con ese runtime; no hay pesos en safetensors ni compatibilidad declarada con frameworks de servido como vLLM o TGI.
- Sin soporte de tool calling ni agentes: es un modelo de transcripcion puro, no un LLM conversacional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/winshades/bengaliai-whisper-medium-ggml
- Modelo base: https://huggingface.co/bengaliAI/tugstugi_bengaliai-asr_whisper-medium
- Revision del modelo base usada en la conversion: `da605cc1bd2f60a18d8e440e977ddfa921a88e63`
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- WinShades: https://winshades.org
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs

Nota sobre la busqueda web: los resultados devueltos no contienen informacion relacionada con este modelo ni con reconocimiento del habla en bengali, por lo que no se ha podido incorporar material adicional (papers, blogs o demos) mas alla de la model card y los enlaces anteriores.
