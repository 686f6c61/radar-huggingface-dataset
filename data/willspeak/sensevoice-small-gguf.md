# willspeak/sensevoice-small-gguf

## Resumen

Este repositorio, `willspeak/sensevoice-small-gguf`, no es un modelo original: es un espejo (mirror) selectivo de ficheros GGUF del modelo de reconocimiento de voz SenseVoiceSmall, cuyo autor original es FunAudioLLM. El mirror se limita a redistribuir los pesos ya cuantizados procedentes de otra fuente GGUF (`voconly-org/sensevoice-small-gguf`) sin modificar archivos ni reclamar autoría sobre el entrenamiento o la cuantizacion.

El modelo base, FunAudioLLM/SenseVoiceSmall, es un sistema de reconocimiento automatico del habla (ASR) de unos 234 millones de parametros orientado a transcripcion multilingue de alta velocidad. La relevancia de esta ficha radica en que ofrece los pesos en formato GGUF, lo que permite ejecutar el modelo en entornos de inferencia ligeros, incluso en CPU, sin depender de frameworks pesados de deep learning.

Conviene subrayar que este mirror no aporta documentacion tecnica propia, ni benchmarks, ni idiomas declarados en su model card; toda la informacion de arquitectura y capacidades procede del modelo base y debe confirmarse en el repositorio original. La licencia aplicada es `funasr-model-license`, distinta de la etiqueta que pudiera figurar en la fuente GGUF, segun aclara el propio autor del mirror.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en este repositorio; corresponde al modelo base FunAudioLLM/SenseVoiceSmall (sistema ASR no autorregresivo basado en encoder) |
| Parametros totales | 234.000.287 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de reconocimiento de voz; procesa audio, no texto) |
| Tipos de cuantizacion | GGUF: Q5_K_M, Q8_0, F16 |
| Idiomas soportados | No disponible en la model card del mirror (consultar el modelo base) |
| Licencia | funasr-model-license (etiqueta `license: other`; texto en LICENSE.txt) |
| Formato de pesos | GGUF (este repositorio); el modelo base original en safetensors/PyTorch |
| Tamano del repositorio | 0,9 GB |
| Modelo base | FunAudioLLM/SenseVoiceSmall |
| Revision de origen GGUF | 6394f6d5b1ca5d7b03e6bb7ac6f64d18f082c19e |

## Arquitectura y entrenamiento

Este repositorio no incluye informacion sobre arquitectura ni sobre el proceso de entrenamiento. Se trata, segun su propia model card, de un "selective, unchanged file mirror", es decir, una copia de ficheros sin alteraciones cuyo unico proposito es la redistribucion de los pesos GGUF. El autor declara explicitamente que no reclama autoria sobre el entrenamiento ni sobre la cuantizacion, ni el respaldo de los autores originales.

La arquitectura, por tanto, es la del modelo base FunAudioLLM/SenseVoiceSmall. Cualquier afirmacion sobre su estructura interna (tipo de encoder, mecanismo de atencion, datos de entrenamiento, uso de RLHF/DPO u otras tecnicas) debe tomarse de la documentacion original del modelo base, que el mirror conserva como fichero aparte pero que no se ha verificado de forma independiente en este repositorio. No se dispone aqui de datos sobre numero de tokens de audio, composicion del dataset ni innovaciones tecnicas concretas.

## Capacidades

No se documentan capacidades en la model card de este mirror. Las capacidades corresponden, en su caso, al modelo base FunAudioLLM/SenseVoiceSmall y dependen del runtime de inferencia que se utilice con los ficheros GGUF:

- Reconocimiento automatico del habla (transcripcion de audio a texto), segun el modelo base.
- Posible deteccion de idioma y soporte multilingue, segun el modelo base (no confirmado en este repositorio).
- Posibles tareas adicionales de analisis de audio atribuidas al modelo base (por ejemplo, reconocimiento de emociones o eventos sonoros), no verificadas aqui.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje generativo de proposito general).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

Dado que este repositorio es un mirror de pesos ASR, los casos de uso son los propios de un motor de transcripcion de voz desplegable en local:

- Transcripcion de audio en local o en el borde: al disponer de ficheros GGUF de tamano reducido (172-470 MB), el modelo puede ejecutarse en equipos sin GPU dedicada para convertir voz en texto sin enviar datos a servicios externos.
- Subtitulado automatico de video: integrable en pipelines de postproduccion para generar subtitulos a partir de pistas de audio, aprovechando el formato ligero para procesar lotes en CPU.
- Actas y notas de reunion: transcripcion de grabaciones de reuniones como paso previo a resumen o indexacion, en escenarios donde la privacidad exige procesamiento on-premise.
- Asistentes de voz embebidos: uso como componente ASR en dispositivos con recursos limitados (por ejemplo, Raspberry Pi o mini-PC) para dictado o control por voz.
- Analitica de centros de llamadas: transcripcion masiva de grabaciones para su posterior busqueda, clasificacion o cumplimiento normativo, gracias a la posibilidad de desplegar muchas instancias ligeras.
- Accesibilidad: generacion de transcripciones en tiempo real para personas con discapacidad auditiva en aplicaciones de escritorio o moviles que integren este GGUF.
- Prototipado e investigacion en ASR: punto de partida reproducible para experimentar con cuantizaciones GGUF y comparar latencia y calidad frente a otros motores.

En todos los casos, la viabilidad real depende de que el runtime elegido (llama.cpp, sherpa-onnx, FunASR u otro) soporte la arquitectura SenseVoice en formato GGUF, extremo no confirmado en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del mirror no incluye metricas de precision (WER/CER), latencia ni comparaciones numericas, y este documento no recoge cifras del modelo base para no atribuir a este repositorio datos no verificados. Para evaluaciones, consultese el repositorio original de FunAudioLLM/SenseVoiceSmall.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los ficheros ocupan aproximadamente 172 MB (Q5_K_M), 253 MB (Q8_0) y 470 MB (F16).
- GPU recomendadas: practicamente cualquier GPU sirve; no requiere aceleradores de datacenter (A100, H100) salvo despliegues masivos. Una RTX 4090 o incluso una GPU integrada es mas que suficiente.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso se puede ejecutar en CPU.
- Opciones de despliegue: llama.cpp y variantes compatibles con GGUF son las opciones mas probables; tambien sherpa-onnx o el ecosistema FunASR, segun el soporte real de la arquitectura SenseVoice en formato GGUF (no confirmado en la informacion disponible).
- Latencia y throughput estimados: no disponibles. Como referencia de orden de magnitud, el modelo tiene 234 millones de parametros y ocupa menos de 0,5 GB, por lo que se espera una inferencia rapida en CPU moderna, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| SenseVoiceSmall (este mirror GGUF) | 234 M | ASR multilingue (modelo base FunAudioLLM) | funasr-model-license | GGUF en este repo; original en safetensors |
| Whisper-small (OpenAI) | 244 M | ASR multilingue | MIT | Multiples formatos, ampliamente soportado |
| Whisper-large-v3 (OpenAI) | 1.550 M | ASR multilingue | MIT | Multiples formatos |
| Paraformer (FunASR) | ~220 M | ASR (principalmente chino) | Apache-2.0 (consultar) | Ecosistema FunASR |

Nota: los datos de parametros de los modelos comparados proceden de conocimiento general de esos modelos; el rendimiento comparado (WER/CER, latencia) no esta disponible en la informacion proporcionada para este repositorio y no se incluye para no inventar cifras.

## Limitaciones y advertencias

- Este repositorio es un mirror no oficial: no aporta garantias de calidad, integridad mas alla de los hashes SHA-256 listados, ni soporte tecnico.
- No se documentan idiomas soportados ni cobertura linguistica en la model card del mirror.
- No se dispone de datos de sesgo ni de tasas de error (WER/CER); el riesgo de transcripcion incorrecta no esta cuantificado aqui.
- Alucinacion: en modelos ASR puede manifestarse como texto inventado en segmentos de silencio o ruido; no hay evaluacion disponible en esta ficha.
- Licencia: se aplica `funasr-model-license` (etiqueta `license: other`). El propio mirror advierte que la fuente GGUF contiene una etiqueta de licencia distinta y que este repositorio no pretende anular los derechos del autor original. Antes de cualquier uso comercial o redistribucion, debe revisarse LICENSE.txt y NOTICE.txt y, en su caso, la licencia del modelo base.
- Dependencia de runtime: la ejecucion en formato GGUF exige que la herramienta de inferencia soporte la arquitectura SenseVoice; no confirmado en la informacion disponible.
- Repositorio sin descargas ni "likes" en el momento de la consulta, lo que reduce las senales de validacion por parte de la comunidad.

## Enlaces

- Mirror en HuggingFace: https://huggingface.co/willspeak/sensevoice-small-gguf
- Modelo base original: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Fuente GGUF original: https://huggingface.co/voconly-org/sensevoice-small-gguf
- Licencia (LICENSE.txt): https://huggingface.co/willspeak/sensevoice-small-gguf/blob/main/LICENSE.txt
- Revision de origen: 6394f6d5b1ca5d7b03e6bb7ac6f64d18f082c19e
