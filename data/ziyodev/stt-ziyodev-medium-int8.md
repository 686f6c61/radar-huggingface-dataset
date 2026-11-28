# ziyodev/stt-ziyodev-medium-int8

## Resumen

stt-ziyodev-medium-int8 es un modelo de reconocimiento automatico del habla (ASR) para uzbeko, distribuido en formato CTranslate2 con cuantizacion int8. No es un modelo entrenado desde cero: se trata de una conversion del modelo islomov/rubaistt_v2_medium, que a su vez es un fine-tuning de OpenAI Whisper Medium sobre uzbeko. El autor de la conversion es ziyodev, que lo publica como parte del paquete stt-ziyodev para transcripcion offline.

La relevancia del modelo esta en su empaquetado: reduce el peso de 1,5 GB a 744 MB, elimina la dependencia de PyTorch y permite ejecutar la inferencia en CPU con 4 hilos a 2,8 veces la velocidad de tiempo real, manteniendo una tasa de error de palabras (WER) competitiva frente al modelo original. Esta pensado para aplicaciones de transcripcion en uzbeko que necesitan funcionar sin GPU y sin conexion.

La arquitectura subyacente es la de Whisper Medium (transformer encoder-decoder con 769 millones de parametros en su forma original), adaptada al uzbeko y posteriormente cuantizada. El modelo solo soporta uzbeko y se distribuye bajo licencia Apache 2.0. No se han publicado detalles sobre el proceso de fine-tuning ni sobre los datos de entrenamiento empleados por el autor del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Medium (transformer encoder-decoder), convertido a CTranslate2 |
| Parametros totales | no disponible (el modelo base Whisper Medium tiene 769 M; no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper Medium original: ventana de audio de 30 s; no confirmado en la informacion) |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | uzbeko (uz) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (modelo convertido con ct2-transformers-converter); incluye tokenizer.json para faster-whisper |

## Arquitectura y entrenamiento

El modelo deriva de OpenAI Whisper Medium, un transformer encoder-decoder disenado para transcripcion de audio, que fue fine-tuneado al uzbeko por islomov (rubaistt_v2_medium). La version aqui descrita no ha sido reentrenada: ziyodev convirtio los pesos a CTranslate2 y los cuantizo a int8 con `ct2-transformers-converter --quantization int8`, y genero un `tokenizer.json` a partir del tokenizer original para que faster-whisper pueda cargarlo.

No se dispone de informacion sobre el numero de tokens de audio, la composicion del dataset de fine-tuning, ni sobre si se aplicaron tecnicas de RLHF o DPO. La innovacion practica del modelo es el empaquetado: inferencia sin PyTorch, ejecutable en CPU, con un tamano de 744 MB (frente a 1,5 GB del original) y una velocidad de 2,8x tiempo real en un Apple M5 con 4 hilos. El paquete stt-ziyodev anade utilidades para transcribir y para cambiar el alfabeto de salida (latino, cirilico o "nuevo" con caracteres como o, g, s, c).

## Capacidades

- Transcripcion de voz a texto en uzbeko, incluyendo variantes de salida en alfabeto latino, cirilico y "nuevo alfabeto" (a traves del paquete stt-ziyodev).
- Funcionamiento totalmente offline: no requiere conexion a red tras la descarga del modelo.
- Inferencia en CPU sin PyTorch, con cuantizacion int8.
- Compatibilidad directa con faster-whisper (`WhisperModel` con `compute_type="int8"`).
- Manejo de audio con mezcla de ruso y uzbeko segun la evaluacion del autor (podcasts de habla de Taskent con mezcla de ruso).
- Decodificacion con beam search (el ejemplo de la model card usa `beam_size=5`).
- No se documentan capacidades de tool calling, agentes, vision, audio aparte de ASR, ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de podcasts en uzbeko: el modelo esta evaluado sobre 10 fragmentos de podcast con habla de Taskent y mezcla de ruso, con un WER del 16,2 %, lo que lo hace adecuado para generar transcripciones de contenido hablado de forma automatizada.
- Subtitulado offline en dispositivos sin GPU: al ejecutarse en CPU con int8 y sin PyTorch, puede integrarse en aplicaciones de escritorio o moviles que generen subtitulos sin conexion.
- Atencion al cliente en uzbeko: transcripcion de llamadas o mensajes de voz para su posterior procesamiento, con la ventaja de funcionar en infraestructura sin aceleradores.
- Archivo y busqueda de contenido audiovisual: conversion de grabaciones historicas o reuniones a texto indexable, aprovechando el bajo coste de inferencia en CPU.
- Integracion en pipelines de CI/CD o servicios ligeros: al ser compatible con faster-whisper y CTranslate2, puede desplegarse en contenedores pequenos sin dependencias de CUDA.
- Sistemas de accesibilidad: dictado por voz y generacion de transcripciones en tiempo real para usuarios uzbekoparlantes en entornos de bajos recursos.
- Prototipado rapido de ASR: el paquete stt-ziyodev permite probar transcripcion en uzbeko con una sola linea de codigo, util para validar ideas antes de invertir en infraestructura.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (WER sobre 10 fragmentos de podcast y sobre una grabacion de 54 s no usada en entrenamiento; velocidad medida en Apple M5):

| Modelo | WER podcast | WER audio nuevo | Velocidad (Apple M5) |
|---|---|---|---|
| rubaiSTT v2 original (transformers, MPS) | 15,1 % | 21,4 % | 1,9x tiempo real |
| stt-ziyodev-medium-int8 (CPU, 4 hilos) | 16,2 % | 17,9 % | 2,8x tiempo real |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; los unicos datos son los de WER y velocidad anteriores.

## Requisitos de hardware

- VRAM: no aplica en el modo documentado; el modelo esta pensado para CPU. El tamano en disco es de 744 MB.
- GPU recomendadas: no se especifican; al ser CTranslate2 int8 puede ejecutarse en CPU. No se documenta soporte GPU en la informacion proporcionada.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU de consumo; el caso de uso documentado es CPU.
- Despliegue: faster-whisper (libreria CTranslate2) y el paquete stt-ziyodev. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo ASR de este tipo).
- Latencia y throughput: 2,8x tiempo real en Apple M5 con 4 hilos y compute_type int8, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| stt-ziyodev-medium-int8 | no disponible (base Whisper Medium) | no disponible (ventana de 30 s en Whisper) | uzbeko | Apache 2.0 | CTranslate2 int8 |
| islomov/rubaistt_v2_medium (modelo base) | no disponible (base Whisper Medium) | no disponible | uzbeko | Apache 2.0 | transformers (1,5 GB) |
| openai/whisper-medium | 769 M (segun conocimiento general; no confirmado en la informacion) | ventana de audio de 30 s | multilingue | Apache 2.0 | safetensors / transformers |

La comparativa con otros modelos ASR especificos para uzbeko no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta uzbeko; no es un modelo multilingue general.
- El WER es del 16,2 % en podcasts y del 17,9 % en audio nuevo segun el autor; sigue habiendo errores de transcripcion, especialmente en habla con mezcla de ruso o acentos distintos.
- No se documentan sesgos especificos, pero al derivar de Whisper Medium y de un fine-tuning del que no se conocen los datos, pueden persistir sesgos del corpus original.
- Riesgo de alucinacion en pasajes de audio ambiguos o con ruido, comun en modelos Whisper.
- No se dispone de informacion sobre el proceso de entrenamiento del modelo base, lo que limita la evaluacion de su robustez.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de Whisper Medium.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de los resultados reportados por el autor.
- No se confirma soporte GPU ni despliegue en servidores de alto rendimiento; el enfoque documentado es CPU offline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ziyodev/stt-ziyodev-medium-int8
- Modelo base: https://huggingface.co/islomov/rubaistt_v2_medium
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-medium
- Repositorio del paquete stt-ziyodev: https://github.com/Ziyodullodev/stt-ziyodev
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
