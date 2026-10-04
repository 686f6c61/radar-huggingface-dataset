# yuldashev222/whisper-small-uz-v1-ct2

## Resumen

yuldashev222/whisper-small-uz-v1-ct2 es la conversion al formato CTranslate2 del modelo OvozifyLabs/whisper-small-uz-v1, un ajuste fino de Whisper small orientado al reconocimiento automatico del habla (ASR) en uzbeko. El autor de la conversion mantiene los pesos sin tocar en precision float32 y genera el fichero `tokenizer.json` a partir de los ficheros originales del tokenizador, de modo que el resultado sea cargable directamente con faster-whisper. No es un modelo nuevo: es un artefacto de despliegue derivado, pensado para reducir el coste de inferencia respecto a la implementacion original en PyTorch.

La relevancia practica esta en el ecosistema: CTranslate2 es el motor que utiliza faster-whisper, y su implementacion en C++ con soporte de cuantizacion en tiempo de carga permite ejecutar un modelo de ~244 millones de parametros en CPU con int8 o en GPU con float16, manteniendo la interfaz de transcripcion con marcas de tiempo a nivel de segmento y de palabra. Para un idioma con recursos limitados como el uzbeko, disponer de un checkpoint ya convertido y listo para produccion ahorra el paso de conversion y evita errores de compatibilidad de tokenizador.

El modelo cubre tres idiomas declarados (uz, en, ru) y se distribuye bajo licencia Apache 2.0, lo que habilita su uso comercial. El repositorio ocupa 1,0 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha, por lo que se trata de una publicacion reciente y sin validacion comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small), conversion a CTranslate2 |
| Parametros totales | 244 millones (arquitectura Whisper small del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventana de audio fija de 30 segundos por pasada; contexto del decodificador de 448 tokens (herencia de Whisper) |
| Tipos de cuantizacion | Pesos almacenados en float32; el tipo de computo se elige al cargar (`float32`, `float16`, `bfloat16`, `int8`, `int8_float16`) |
| Idiomas soportados | uz, en, ru (declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (directorio con `model.bin`, `config.json`, `vocabulary.json`, `tokenizer.json`) |

## Arquitectura y entrenamiento

El modelo base es Whisper small, un transformer encoder-decoder con atencion completa. El encoder procesa una representacion log-Mel de 80 canales sobre ventanas de 30 segundos (1500 fotogramas) y el decoder autoregresivo genera tokens de texto con marcas de tiempo especiales. Whisper small emplea 12 capas en encoder y 12 en decoder, con anchura de 768 y 12 cabezas de atencion. La conversion a CTranslate2 mediante `TransformersConverter` no altera estos pesos ni aplica cuantizacion: el autor indica explicitamente que se conservan en float32 y que la cuantizacion se decide en el momento de la carga.

Sobre el entrenamiento del ajuste fino no hay informacion en la model card mas alla de la atribucion a OvozifyLabs: no se detallan horas de audio, composicion del dataset, uso de aumentacion de datos ni si hubo etapas de ajuste con RLHF o DPO (en ASR estos procedimientos son poco habituales; el ajuste suele ser supervisado con pares audio-transcripcion y posiblemente con destilacion de pseudo-etiquetas). Todo ello queda como no disponible. La innovacion tecnica relevante de este repositorio no esta en el modelo sino en el artefacto: conversion reproducible, tokenizador regenerado y compatibilidad directa con el runtime de CTranslate2, que aplica optimizaciones de memoria y kernels especificos para CPU y GPU.

## Capacidades

- Transcripcion de voz a texto en uzbeko, con capacidad residual en ingles y ruso heredada del modelo Whisper original.
- Generacion de marcas de tiempo a nivel de segmento y, segun la configuracion de faster-whisper, a nivel de palabra.
- Deteccion automatica de idioma en la misma pasada (funcion `transcribe` de faster-whisper), util en audio mezclado uz/en/ru.
- Traduccion implicita de audio a texto en ingles mediante la tarea `translate` de Whisper (calidad no verificada para este ajuste).
- Procesamiento por lotes (`BatchedInferencePipeline` en faster-whisper) para aumentar el throughput en servidores.
- Ejecucion en CPU mediante cuantizacion int8 y en GPU mediante float16, sin cambios en el artefacto de pesos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acustico-secuencial, sin interfaz de instrucciones.
- No incorpora vision, audio de entrada multimodal distinto al audio, ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de archivos audiovisuales en uzbeko: digitalizacion de archivos de television, radio o entrevistas mediante faster-whisper con `compute_type="float16"` en GPU, aprovechando la ventana de 30 segundos y la salida con timestamps para generar subtitulos.
- Generacion automatica de subtitulos SRT/VTT: los segmentos temporizados que devuelve el modelo se convierten directamente a formato de subtitulo, con la opcion de alineacion a nivel de palabra que ofrece faster-whisper para subtitulos cortos.
- Atencion al cliente y analitica de contact center: transcripcion por lotes de grabaciones en uzbeko y ruso para alimentar sistemas de analisis de sentimiento o control de calidad; el coste por hora de audio es bajo gracias a la cuantizacion int8 en CPU.
- Interfaces de voz y asistentes: integracion como etapa ASR en un pipeline con LLM, donde el texto transcrito se pasa a un modelo de lenguaje; el modelo puede ejecutarse en la misma maquina que el resto del stack si hay al menos 1-2 GB de VRAM libres.
- Indexacion y busqueda semantica de audio: transcripcion masiva de podcasts, reuniones o cursos para construir indices de texto buscables, un escenario donde el rendimiento por lotes y la ventana fija de 30 segundos simplifican el troceado.
- Dictado y documentacion profesional: transcripcion de informes medicos, actas judiciales o notas de campo dictadas en uzbeko, siempre con revision humana posterior por el riesgo de alucinacion en segmentos con ruido o silencio.
- Etiquetado de datos para entrenamiento: generacion de pseudo-etiquetas sobre grandes volumenes de audio sin transcribir, para despues filtrar y reentrenar modelos ASR de mayor tamano.
- Despliegue en entornos sin GPU: al estar en formato CTranslate2, es viable ejecutarlo en servidores CPU o equipos de campo con `compute_type="int8"`, algo inviable con la implementacion original en PyTorch a velocidades utiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de WER ni CER sobre conjuntos de evaluacion en uzbeko, ni comparaciones con otros modelos ASR. Tampoco hay datos de latencia o throughput declarados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos derivados del tamano de la arquitectura, no publicados por el autor): aproximadamente 1,5-2,5 GB en float32, 1-1,5 GB en float16 y menos de 1 GB en int8.
- GPU recomendadas: cualquier GPU con 4 GB o mas de memoria (GTX 1650, RTX 3050, RTX 3060, RTX 4090). Las A100 y H100 son sobredimensionadas para un modelo de 244 millones de parametros salvo que se busque throughput agregado con lotes grandes.
- Cabe con holgura en GPU de consumo: si, en practicamente cualquier tarjeta de los ultimos ocho anos, y tambien en CPU mediante int8.
- Opciones de despliegue: faster-whisper (Python), WhisperX, servidores compatibles con la API de OpenAI basados en faster-whisper, contenedores Docker con CTranslate2, y bindings de CTranslate2 en C++ o Python.
- Latencia y throughput: no disponibles. El rendimiento dependera del tipo de computo, del hardware y del uso o no de procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| yuldashev222/whisper-small-uz-v1-ct2 | 244 M | 30 s | uz, en, ru | Apache 2.0 | CTranslate2 |
| OvozifyLabs/whisper-small-uz-v1 | 244 M | 30 s | no disponible | no disponible | safetensors / PyTorch |
| openai/whisper-small | 244 M | 30 s | 99 idiomas | Apache 2.0 | safetensors / PyTorch |
| openai/whisper-large-v3 | 1550 M | 30 s | 99 idiomas | Apache 2.0 | safetensors / PyTorch |

La comparacion cualitativa es limitada: el artefacto aqui descrito aporta ventaja en coste de despliegue (motor CTranslate2, cuantizacion en carga) frente a los checkpoints en PyTorch, pero no hay datos de WER que permitan afirmar que el ajuste en uzbeko supere al Whisper small original ni que se acerque a Whisper large-v3 en ese idioma. Los modelos comparables especificos para uzbeko distintos del modelo base no estan identificados en la informacion disponible.

## Limitaciones y advertencias

- Riesgo de alucinacion: Whisper tiende a generar texto plausible en segmentos de silencio, musica o ruido, y a repetir frases en bucles; en produccion conviene aplicar umbrales de probabilidad, deteccion de silencio previa y revision de segmentos con baja confianza.
- Sesgos: el ajuste fino se ha realizado sobre un corpus no documentado en la model card, por lo que se desconocen la distribucion de acentos, registros y genero de los hablantes; es esperable un rendimiento inferior en variedades dialectales poco representadas.
- Ventana fija de 30 segundos: los audios largos requieren troceado o el modo de ventana deslizante de faster-whisper; los cortes pueden degradar la precision en los limites entre fragmentos.
- Idiomas: aunque declara uz, en y ru, un ajuste fino sobre uzbeko puede haber degradado el rendimiento en ingles y ruso respecto al Whisper small original; no hay evaluacion que lo cuantifique.
- Calidad del ajuste no verificada: el repositorio no incluye metricas, ejemplos de salida ni evaluacion por terceros, y acumula cero descargas, por lo que no existe evidencia publica de su calidad.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion; conviene verificar la licencia del modelo base OvozifyLabs/whisper-small-uz-v1, no confirmada en la informacion disponible.
- Ausencia de funcionalidades de agente: no admite instrucciones, tool calling ni control fino de la salida mas alla de los parametros de decodificacion de Whisper.
- Sin diarizacion de hablantes: la asignacion de turnos requiere un modulo externo (por ejemplo, pyannote).
- Repositorio de 1,0 GB en float32: si se necesita una huella de disco menor, hay que recuantizar a int8 durante la carga o reconvertir el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuldashev222/whisper-small-uz-v1-ct2
- Modelo base: https://huggingface.co/OvozifyLabs/whisper-small-uz-v1
- Repositorio de CTranslate2: https://github.com/OpenNMT/CTranslate2
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
