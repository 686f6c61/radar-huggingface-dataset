# tryambientai/granite-4.0-1b-speech-gguf

## Resumen

Granite-4.0-1b-speech es un modelo de voz a texto (ASR) y traducción de voz (AST) desarrollado por IBM Research dentro de la familia Granite 4.0. Se trata de un audio-LLM que combina un codificador convolucional Conformer con atención Shaw de bloque local, un proyector Q-Former de tipo BLIP-2 y el modelo de lenguaje granite-4.0-1b-base como decodificador autorregresivo. El resultado es un sistema compacto de aproximadamente 2.310 millones de parámetros que consume audio WAV mono a 16 kHz y genera transcripciones o traducciones en texto.

La ficha que nos ocupa no es el modelo original, sino la conversión a formato GGUF realizada por el usuario `tryambientai` para su uso con `transcribe.cpp`, una implementación en C++ pensada para inferencia local sin dependencias de Python. Esta cuantización permite ejecutar el modelo en hardware modesto, incluyendo CPU y GPUs de consumo, manteniendo una tasa de error de palabra (WER) muy cercana a la del modelo en BF16.

Su relevancia actual radica en que ofrece reconocimiento de voz multilingüe (inglés, francés, alemán, español, portugués y japonés) y traducción bidireccional entre inglés y cada uno de esos cinco idiomas, todo con licencia Apache-2.0 y un tamaño que cabe en menos de 2 GB en cuantización Q4_K_M. Esto lo convierte en una opción atractiva para despliegues en el borde, aplicaciones de escritorio y pipelines offline donde no se quiere depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: Conformer encoder con block-local Shaw attention + proyector BLIP-2 Q-Former + decoder LLM granite-4.0-1b-base |
| Parametros totales | 2.313.228.092 (~2,31 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, pt, ja (ASR); traduccion en↔fr, en↔de, en↔es, en↔pt, en↔ja |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo sigue un diseño de audio-LLM en tres etapas. Primero, un codificador Conformer con atención Shaw de bloque local procesa la señal de audio. Después, un proyector Q-Former al estilo BLIP-2 alinea las representaciones acústicas con el espacio del modelo de lenguaje. Finalmente, el LLM granite-4.0-1b-base actúa como decodificador autorregresivo y es el encargado de generar el texto de salida. Esta separación permite reutilizar un LLM de texto ya entrenado y adaptarlo a la modalidad de voz mediante alineamiento de modalidades.

Según la model card original de IBM, el entrenamiento se realizó sobre corpus públicos diversos para ASR y AST, complementados con datasets sintéticos orientados a ASR en japonés, ASR con sesgo por palabras clave y traducción de voz. El modelo base granite-4.0-1b-base fue alineado a voz sobre estos datos abiertos. Entre las innovaciones destacadas por IBM figuran una mayor precisión en ASR inglés, inferencia más rápida gracias a un mejor entrenamiento del codificador y decodificación especulativa, y la capacidad de sesgo por listas de palabras clave para mejorar el reconocimiento de nombres y acrónimos. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición porcentual del dataset.

## Capacidades

- Transcripción de voz a texto (ASR) en inglés, francés, alemán, español, portugués y japonés.
- Traducción automática de voz (AST) bidireccional entre inglés y cada uno de los otros cinco idiomas, siempre pasando por inglés (no hay traducción directa fr↔de, por ejemplo).
- Sesgo por listas de palabras clave (keyword list biasing) para mejorar el reconocimiento de nombres propios y acrónimos.
- Entrada de audio WAV mono a 16 kHz; no se especifica soporte para otros formatos de audio de forma nativa.
- No soporta streaming según los metadatos de `transcribe.cpp` (`streaming: false`).
- No realiza detección automática de idioma (`lang_detect: false`); el idioma debe seleccionarse explícitamente.
- No genera marcas de tiempo (`timestamps: none`).
- Soporta traducción (`translate: true`).
- Capacidad conversacional limitada: es un modelo ASR/AST, no un asistente de propósito general.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo puede procesar archivos WAV de 16 kHz mono y generar transcripciones en seis idiomas sin conexión a internet, gracias a su tamaño reducido y a la licencia Apache-2.0.
- Subtitulado y traducción de contenido audiovisual: permite transcribir audio en inglés y traducirlo a español, francés, alemán, portugués o japonés, o a la inversa, lo que resulta útil para canales de vídeo y podcasts que necesitan versiones multilingües.
- Asistentes de voz en aplicaciones de escritorio: al ejecutarse con `transcribe.cpp` en CPU o GPU de consumo, puede integrarse en herramientas de dictado o asistentes personales que requieren privacidad y baja latencia.
- Reconocimiento de nombres y términos técnicos: la función de sesgo por listas de palabras clave permite mejorar la precisión en dominios como medicina, legal o atención al cliente, donde los acrónimos y nombres propios son frecuentes.
- Traducción de llamadas o reuniones internacionales: la capacidad de traducción en↔fr, en↔de, en↔es, en↔pt y en↔ja facilita la comunicación en entornos empresariales multilingües, siempre que el audio se prepare como WAV mono a 16 kHz.
- Procesamiento por lotes en servidores modestos: con cuantizaciones Q4_K_M (1,60 GB) o Q5_K_M (1,83 GB), se puede desplegar en instancias sin GPU dedicada o con GPUs de gama baja para transcribir grandes volúmenes de audio de forma económica.
- Investigación en ASR multilingüe: al ser un modelo abierto con licencia permisiva, sirve como base para experimentos de adaptación a dominios o comparación de técnicas de cuantización en `transcribe.cpp`.

## Benchmarks y rendimiento

Los datos disponibles corresponden a la tasa de error de palabra (WER) en LibriSpeech test-clean (2620 enunciados, decodificación greedy, normalizador `EnglishTextNormalizer` de Whisper) y a la velocidad de inferencia en `transcribe.cpp` medida como factor de tiempo real (RTF). No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento, ya que el modelo es específicamente de voz.

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,63 GB | 1,42 % |
| F16 | 4,63 GB | 1,42 % |
| Q8_0 | 2,56 GB | 1,44 % |
| Q6_K | 2,02 GB | 1,41 % |
| Q5_K_M | 1,83 GB | 1,42 % |
| Q4_K_M | 1,60 GB | 1,48 % |

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 36,5 |
| Apple M4 Max | CPU | 6,0 |
| Apple M4 | Metal | 11,0 |
| Apple M4 | CPU | 5,0 |
| Ryzen 4750U | Vulkan | 2,95 |
| Ryzen 4750U | CPU | 1,6 |

El RTF indica la relación entre el tiempo de procesamiento y la duración del audio; valores superiores a 1 implican procesamiento más rápido que tiempo real. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,6 GB en Q4_K_M, 1,83 GB en Q5_K_M, 2,02 GB en Q6_K, 2,56 GB en Q8_0 y 4,63 GB en BF16/F16. Hay que añadir el espacio para el audio de entrada y los buffers de trabajo.
- GPU recomendadas: no se especifican modelos concretos, pero los datos de RTF en Apple M4/M4 Max con Metal y en Ryzen 4750U con Vulkan indican que funciona en GPUs integradas y de gama media. Para máximo rendimiento se puede usar una GPU con soporte Metal o Vulkan.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M a Q8_0 en GPUs con 4 GB o más de VRAM; en BF16 requiere al menos 6 GB.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`), compilado desde fuente con CMake. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible; el formato GGUF es específico de `transcribe.cpp` en este caso.
- Latencia y throughput: los RTF medidos van de 1,6 (CPU Ryzen 4750U) a 36,5 (Metal en M4 Max), lo que implica entre 1,6 y 36,5 veces la velocidad en tiempo real según hardware y backend. No se proporcionan cifras de latencia absoluta ni de throughput en peticiones por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. A continuación se comparan características técnicas con alternativas de la misma familia o categoría, usando solo datos disponibles en las fichas de HuggingFace o en la model card.

| Modelo | Parametros | Idiomas ASR | Traduccion | Licencia | Formato |
|---|---:|---|---|---|---|
| granite-4.0-1b-speech (este GGUF) | ~2,31 B | en, fr, de, es, pt, ja | en↔fr, en↔de, en↔es, en↔pt, en↔ja | Apache-2.0 | GGUF |
| granite-speech-3.3-2b | ~2 B (no confirmado) | no disponible | no disponible | Apache-2.0 (heredada, no confirmada) | safetensors |
| granite-speech-3.3-8b | ~8 B (no confirmado) | no disponible | no disponible | Apache-2.0 (heredada, no confirmada) | safetensors |

La model card original indica que granite-4.0-1b-speech tiene la mitad de parámetros que granite-speech-3.3-2b, mayor precisión en ASR inglés y inferencia más rápida gracias a decodificación especulativa. No se han publicado en la información disponible comparaciones de WER con Whisper u otros sistemas ASR.

## Limitaciones y advertencias

- El modelo solo acepta audio WAV mono a 16 kHz; es necesario convertir otros formatos con herramientas externas como ffmpeg.
- No soporta streaming, por lo que no es adecuado para aplicaciones de transcripción en tiempo real continua sin un mecanismo de segmentación externo.
- No realiza detección automática de idioma: el idioma debe especificarse manualmente, lo que puede provocar errores si se desconoce.
- No genera marcas de tiempo, lo que limita su uso en subtitulado sincronizado o alineación fina.
- La traducción siempre pasa por inglés; no hay traducción directa entre pares como francés↔alemán.
- Riesgo de alucinación inherente a los modelos de lenguaje: en audio con ruido, silencios largos o habla solapada puede generar texto inventado o repetir fragmentos.
- Sesgos conocidos: no se documentan en la información disponible, pero al entrenarse con corpus públicos puede heredar sesgos de género, acento o dominio.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card original de IBM para términos completos y posibles restricciones adicionales.
- El repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 1 de noviembre de 2026; se trata de una conversión reciente y poco validada por la comunidad.
- La validación se realizó contra la referencia de Transformers en un commit concreto; cambios futuros en `transcribe.cpp` podrían afectar la compatibilidad.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/tryambientai/granite-4.0-1b-speech-gguf)
- [Modelo base ibm-granite/granite-4.0-1b-speech](https://huggingface.co/ibm-granite/granite-4.0-1b-speech)
- [Modelo base granite-4.0-1b-base](https://huggingface.co/ibm-granite/granite-4.0-1b-base)
- [granite-speech-3.3-2b](https://huggingface.co/ibm-granite/granite-speech-3.3-2b)
- [granite-speech-3.3-8b](https://huggingface.co/ibm-granite/granite-speech-3.3-8b)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Documentacion del modelo en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-4.0-1b-speech.md)
- [Commit de validacion en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/tree/275332d)
- [Commit upstream del modelo base](https://huggingface.co/ibm-granite/granite-4.0-1b-speech/commit/bd87ab8)
- [Paper arXiv:2505.08699](https://arxiv.org/abs/2505.08699)
- [Paper arXiv:2603.11243](https://arxiv.org/abs/2603.11243)
