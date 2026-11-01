# tryambientai/whisper-medium.en-gguf

## Resumen

`tryambientai/whisper-medium.en-gguf` es una conversión a formato GGUF del modelo `openai/whisper-medium.en`, publicada por el usuario tryambientai para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). El modelo base es el checkpoint Whisper de tamano "medium" en su variante exclusivamente inglesa, un transformer encoder-decoder de 763.873.376 parametros entrenado por OpenAI para reconocimiento automatico del habla (ASR) mediante supervision debil a gran escala.

La relevancia de esta publicacion es practica: empaqueta los pesos originales en cuantizaciones GGUF (desde F32 hasta Q4_K_M) que reducen el modelo de 2,85 GB a 481 MB, manteniendo una tasa de error de palabra (WER) de entre 2,72 % y 2,91 % sobre LibriSpeech test-clean. Esto permite ejecutar un modelo ASR de gama media en CPU y en GPU de consumo, con soporte para Metal y Vulkan, algo inviable con los pesos originales en muchos entornos.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 1 de noviembre de 2026. La licencia es Apache-2.0, heredada del modelo base. La model card incluye metricas de validacion numerica y de rendimiento (RTF) medidas por el autor, lo que aporta trazabilidad sobre la calidad de la conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq), Whisper medium |
| Parametros totales | 763.873.376 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificacion por chunks para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ingles unicamente (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo secuencia-a-secuencia, la arquitectura original de Whisper descrita en el paper *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al., OpenAI). El encoder procesa espectrogramas Mel de ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. La variante `.en` se entreno exclusivamente con datos en ingles y solo para la tarea de reconocimiento del habla, sin la tarea de traduccion que si incluyen los checkpoints multilingues.

Segun la model card original, el entrenamiento se realizo sobre 680.000 horas de audio etiquetado mediante supervision debil a gran escala, lo que le confiere capacidad de generalizacion a dominios y datasets sin fine-tuning adicional. La model card de esta conversion no detalla la composicion exacta del dataset, el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO; esos datos deben consultarse en la documentacion upstream de OpenAI. La conversion se realizo desde el commit upstream `2e98eb6` (fijado el 2026-04-25) y se valido numericamente contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26.

La innovacion tecnica de esta publicacion no esta en el modelo sino en el empaquetado: cuantizaciones K-quant (Q4_K_M, Q5_K_M, Q6_K) y Q8_0 que preservan la calidad ASR con perdidas de WER inferiores a 0,2 puntos porcentuales respecto a F32 en la mayoria de casos. El autor documenta que las diferencias entre ejecuciones pueden alcanzar ~0,1 pp de WER por las reducciones paralelas no deterministas de Metal.

## Capacidades

- Transcripcion de voz a texto en ingles sobre audio de 16 kHz mono, con ventanas de 30 segundos y decodificacion por chunks para audio de mayor duracion.
- Generacion de marcas de tiempo a nivel de segmento (`timestamps: segment`), util para subtitulado y alineacion.
- Decodificacion greedy con `suppress_tokens` y fallback de temperatura, segun la configuracion por defecto de transcribe.cpp.
- Ejecucion en CPU y en GPU mediante backends Metal (Apple Silicon) y Vulkan.
- No soporta streaming (`streaming: false`), ni traduccion (`translate: false`), ni deteccion automatica de idioma (`lang_detect: false`).
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente; es un modelo puramente ASR.
- No dispone de vision, audio generativo ni modo "thinking".

## Casos de uso

- Subtitulado automatico de video en ingles: el modelo genera marcas de tiempo por segmento, lo que permite producir ficheros SRT o VTT directamente a partir de la salida del decoder sin post-procesado de alineacion adicional.
- Transcripcion de reuniones y notas de voz: con la cuantizacion Q5_K_M (556 MB) se puede desplegar en un portatil con CPU moderna y transcribir grabaciones por chunks, manteniendo un WER cercano al 2,74 % en condiciones limpias.
- Indexacion y busqueda de archivos de audio: convertir grandes volumenes de grabaciones en ingles a texto para alimentar motores de busqueda o sistemas RAG, usando Q4_K_M (481 MB) cuando el coste de almacenamiento y el throughput priman sobre la precision maxima.
- Prototipado rapido en local: la version Q8_0 (793 MB) permite validar pipelines ASR en un Mac con Metal (RTF 45,1) sin depender de APIs externas ni de GPU dedicadas.
- Preprocesado de datasets de voz: transcribir corpus en ingles para anotacion automatica o para generar pares audio-texto en tareas de investigacion, con la ventaja de que la licencia Apache-2.0 permite uso comercial.
- Despliegue en dispositivos con recursos limitados: en una APU como el Ryzen 4750U con Vulkan se obtiene un RTF de 4,6, suficiente para transcripcion por lotes no interactiva; en CPU pura el RTF cae a 1,1 en ese mismo equipo.
- Integracion en aplicaciones de escritorio o CLI: al ser un unico fichero GGUF y requerir solo el binario `transcribe-cli`, se puede empaquetar en herramientas locales de dictado o captura de notas sin dependencias de Python.

## Benchmarks y rendimiento

Las metricas de WER proceden de la model card del autor, medidas sobre la particion completa LibriSpeech test-clean (2620 enunciados) con la decodificacion por defecto de transcribe.cpp. El dato autoinformado por OpenAI para el mismo split es 3,02 %.

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,85 GB | 2,74 % |
| F16 | 1,44 GB | 2,73 % |
| Q8_0 | 793 MB | 2,72 % |
| Q6_K | 618 MB | 2,83 % |
| Q5_K_M | 556 MB | 2,74 % |
| Q4_K_M | 481 MB | 2,91 % |

Rendimiento en tiempo real (RTF, menor es mejor; el autor no especifica la unidad exacta mas alla del valor numerico):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 45,1 |
| Apple M4 Max | CPU | 3,2 |
| AMD Ryzen 4750U | Vulkan | 4,6 |
| AMD Ryzen 4750U | CPU | 1,1 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no es de lenguaje general.

## Requisitos de hardware

- VRAM estimada: entre 0,5 GB (Q4_K_M) y 2,9 GB (F32) para los pesos; el overhead de activaciones y buffers de audio es reducido, por lo que en la practica basta con ~1 GB adicional.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon M1 en adelante) o Vulkan (AMD, Intel, NVIDIA). El autor reporta RTF 45,1 en un M4 Max con Metal.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con al menos 2-4 GB de VRAM, e incluso en iGPU mediante Vulkan.
- Despliegue: exclusivamente mediante transcribe.cpp (binario `transcribe-cli`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato GGUF esta adaptado a este runtime concreto.
- Latencia y throughput: RTF 45,1 (Metal, M4 Max), 4,6 (Vulkan, Ryzen 4750U), 3,2 (CPU, M4 Max) y 1,1 (CPU, Ryzen 4750U). El audio de entrada debe convertirse previamente a WAV mono de 16 kHz con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| whisper-medium.en (esta conversion) | 763,9 M | ventanas de 30 s | en | Apache-2.0 | GGUF |
| openai/whisper-medium (multilingue) | 763,9 M | ventanas de 30 s | multilingue | Apache-2.0 | safetensors, GGUF |
| openai/whisper-small.en | 241,7 M | ventanas de 30 s | en | Apache-2.0 | safetensors, GGUF |
| openai/whisper-large-v3 | 1,55 B | ventanas de 30 s | multilingue | Apache-2.0 | safetensors, GGUF |

Frente a `whisper-medium` multilingue, esta variante es algo mas rapida y ligeramente mas precisa en ingles al no repartir capacidad entre idiomas, pero pierde traduccion y deteccion de idioma. Frente a `whisper-small.en` ofrece mayor precision a costa de triplicar el tamano. Frente a `whisper-large-v3` es mas ligero y desplegable en hardware modesto, con peor WER esperado en condiciones dificiles. No se dispone de datos comparativos de WER entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no transcribe ni traduce otros idiomas, y no realiza deteccion automatica de idioma.
- Sin streaming: la decodificacion es por lotes, lo que impide casos de uso de transcripcion en tiempo real con baja latencia.
- Riesgo de alucinacion en clips cortos o con ruido de fondo; el autor senala que las diferencias de WER entre ejecuciones (~0,1 pp) se deben en gran parte a resultados de alucinacion en el suelo de ruido.
- El WER reportado (2,72-2,91 %) corresponde a LibriSpeech test-clean, un corpus de lectura limpia; en audio espontaneo, con acentos marcados o ruido ambiental el error sera sustancialmente mayor.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar los terminos upstream de OpenAI para cualquier restriccion adicional.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de adopcion ni de validacion independiente por parte de la comunidad.
- Dependencia de un runtime especifico (transcribe.cpp), lo que limita la portabilidad frente a otras herramientas GGUF mas extendidas.
- El autor advierte que las cifras provienen de una unica ejecucion con backend Metal, por lo que la reproducibilidad exacta no esta garantizada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tryambientai/whisper-medium.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-medium.en
- Commit upstream fijado: https://huggingface.co/openai/whisper-medium.en/commit/2e98eb6
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Version validada de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Pagina de modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-medium.en.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
