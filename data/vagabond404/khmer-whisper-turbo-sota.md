# Vagabond404/khmer-whisper-turbo-sota

## Resumen

khmer-whisper-turbo-sota es un modelo de reconocimiento automatico del habla (ASR) especializado en jemer (khmer, `km`), desarrollado por el usuario Vagabond404 y publicado en Hugging Face bajo licencia Apache 2.0. Se construye sobre el backbone `openai/whisper-large-v3-turbo` y sustituye el tokenizador original por un tokenizador BPE propio denominado K-Token (KCC y RAC), disenado especificamente para la escritura jemer. El modelo tiene 808.878.080 parametros y un repositorio de 5,7 GB en formato safetensors.

El problema que aborda es la fragmentacion excesiva de tokens que sufren los modelos multilingues genericos al procesar jemer, un sistema de escritura sin espacios entre palabras y con clusters consonantigos complejos. Segun la model card, el tokenizador injertado reduce el numero de tokens un 79,2 % y elimina los glifos rotos (0 % broken glyphs), lo que se traduce en una decodificacion mas eficiente y fiel a la ortografia jemer.

La relevancia actual del modelo radica en su enfoque de eficiencia para edge AI: al partir de la variante turbo de Whisper, mas ligera que `whisper-large-v3`, y aplicar una tokenizacion compacta, aspira a ofrecer ASR de calidad en jemer con requisitos de computo reducidos. El autor reporta un CER de validacion del 1,18 % y un WER del 27,20 % tras entrenar el 100 % de los shards (653 de 653, equivalentes a 728 horas de audio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), backbone `openai/whisper-large-v3-turbo` |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper turbo, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | jemer (`km`), ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de la familia Whisper, inicializado desde `openai/whisper-large-v3-turbo`. La innovacion principal no reside en la arquitectura del backbone sino en el tokenizador: se ha reemplazado el tokenizador original por un BPE propio llamado K-Token, con componentes KCC y RAC, ajustado a la morfologia del jemer. Segun el autor, este cambio reduce el numero de tokens un 79,2 % y elimina por completo los glifos rotos, un problema habitual cuando tokenizadores multilingues segmentan clusters consonantigos jemer.

El entrenamiento se realizo sobre el dataset `rinabuoy/khmer-speech-dataset`, con 728 horas de audio procesadas en 653 shards, de los cuales se completaron los 653 (100 %). No se especifican en la informacion disponible el numero total de tokens de texto, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado adicional. Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico del habla en jemer, con soporte secundario de ingles.
- Transcripcion de audio a texto con tokenizacion optimizada para la escritura jemer (reduccion del 79,2 % de tokens y 0 % de glifos rotos segun el autor).
- Manejo de audio de larga duracion dentro de los limites propios de Whisper (segmentacion interna).
- Capacidad multilingue limitada a `km` y `en`.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo thinking, vision ni audio mas alla de la transcripcion ASR.
- Orientado a despliegue en edge AI segun las etiquetas del repositorio.

## Casos de uso

- Transcripcion de reuniones y entrevistas en jemer: el modelo convierte audio conversacional en texto con una tokenizacion que preserva la ortografia jemer, adecuado para actas y documentacion interna en organizaciones camboyanas.
- Subtitulado automatico de contenido audiovisual: integrable en pipelines de postproduccion para generar subtitulos en jemer a partir de videos, con la ventaja de un vocabulario de tokens compacto que reduce el coste de decodificacion.
- Atencion al cliente por voz en jemer: permite transcribir llamadas o mensajes de voz para su posterior clasificacion o enrutamiento, aprovechando el soporte de `km` y `en` en un mismo modelo.
- Digitalizacion de archivos orales: transcripcion de grabaciones historicas o etnograficas en jemer para su indexacion y busqueda textual, con la fidelidad ortografica que aporta el tokenizador K-Token.
- Asistentes de voz en dispositivos de borde: las etiquetas `edge-ai` y el backbone turbo sugieren un uso previsto en hardware con recursos limitados, como altavoces inteligentes o moviles con inferencia local.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en tiempo casi real de clases, charlas o servicios publicos en jemer.
- Investigacion linguistica y ASR de bajos recursos: punto de partida para experimentos con tokenizadores especificos de escrituras no latinas, comparando el impacto del K-Token frente al tokenizador original de Whisper.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| CER de validacion (mejor) | 1,18 % |
| WER de validacion (mejor) | 27,20 % |
| Shards entrenados | 653 / 653 (100 %) |
| Horas de audio | 728 h |
| Reduccion de tokens (tokenizador K-Token) | 79,2 % |
| Glifos rotos | 0 % |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en benchmarks estandar como MMLU, HumanEval o GSM8K, ni resultados de CER/WER frente a alternativas en el mismo conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,6 GB solo para pesos (808,9 M de parametros), mas overhead de activaciones y buffers de audio; en la practica, entre 2 y 3 GB.
- VRAM estimada en cuantizacion int8: en torno a 0,8-1 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; para lotes grandes o baja latencia, A100 o H100.
- Cabe en GPU consumer: si, incluidas GPUs de gama media y posiblemente en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), vLLM no aplica de forma estandar a Whisper, llama.cpp no soporta Whisper de forma nativa, faster-whisper y WhisperX son alternativas habituales para ASR; TGI no esta orientado a ASR.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| khmer-whisper-turbo-sota | 808,9 M | no disponible | km, en | Apache 2.0 | Tokenizador K-Token especifico para jemer; CER 1,18 %, WER 27,20 % (validacion propia) |
| openai/whisper-large-v3-turbo | 809 M | ventana de audio de 30 s por segmento | multilingue (99 idiomas) | Apache 2.0 | Backbone del modelo; tokenizador generico, sin optimizacion para jemer |
| openai/whisper-large-v3 | 1,55 B | ventana de audio de 30 s por segmento | multilingue (99 idiomas) | Apache 2.0 | Mayor tamano y coste; referencia de calidad multilingue |
| whisper-small | 244 M | ventana de audio de 30 s por segmento | multilingue | Apache 2.0 | Alternativa ligera para edge, menor precision en idiomas de bajos recursos |

No se dispone de datos de rendimiento comparativo directo entre estos modelos en jemer dentro de la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo se ha validado con metricas propias del autor; no hay evaluacion independiente publicada.
- El WER de validacion del 27,20 % es elevado en terminos absolutos, aunque el CER del 1,18 % sugiere que los errores se concentran en sustituciones a nivel de palabra; conviene validar en dominios reales antes de produccion.
- Sesgos conocidos: no documentados; al entrenarse sobre un unico dataset (`rinabuoy/khmer-speech-dataset`), puede presentar sesgo de dominio, acento y registro.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto no presente en el audio, especialmente en silencios o ruido.
- Limitaciones de idioma: fuera de jemer e ingles el rendimiento no esta garantizado y no se documenta.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar la licencia del dataset de entrenamiento antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por la comunidad.
- No se documentan requisitos de contexto de audio, cuantizaciones soportadas ni latencias, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vagabond404/khmer-whisper-turbo-sota
- Backbone: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de entrenamiento: https://huggingface.co/datasets/rinabuoy/khmer-speech-dataset
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
