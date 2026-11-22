# warlockzero/Qwen3-ASR-1.7B-int8

## Resumen

Qwen3-ASR-1.7B-int8 es una compilación cuantizada a 8 bits del modelo de reconocimiento automático del habla Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba. La cuantización la firma el usuario independiente warlockzero y se ha generado con la librería bitsandbytes aplicando `load_in_8bit=True`, lo que da lugar a un esquema W8A16 (pesos en INT8, activaciones en FP16). El objetivo es conservar la calidad de transcripción del modelo base reduciendo a la mitad el espacio en disco y el consumo de VRAM.

El modelo resuelve la transcripción de audio a texto en 18 idiomas (entre ellos castellano, inglés, chino, árabe, francés, alemán, japonés, coreano, ruso, hindi, bengalí, italiano, portugués, turco, vietnamita, indonesio, tailandés y persa). Frente al modelo base en FP16, el build INT8 pasa de unos 4,08 GB en disco a 2,10 GB, y de un pico de VRAM de aproximadamente 4,80 GB a 2,55 GB durante la inferencia, lo que representa una reducción del 46,8 %.

Es relevante ahora porque permite desplegar un ASR de 2.038.851.200 parámetros en GPUs de consumo con holgura, manteniendo según el autor una coincidencia literal del 100 % en la prueba de verificación realizada, sin pérdida de WER apreciable. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal para ASR (Qwen3-ASR), pesos cuantizados INT8 |
| Parametros totales | 2.038.851.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 W8A16 (pesos INT8, activaciones FP16) mediante bitsandbytes; el autor menciona tambien una variante 4-bit NF4 W4A8/W4A16 como referencia comparativa |
| Idiomas soportados | en, zh, ar, es, fr, de, ja, ko, ru, hi, bn, it, pt, tr, vi, id, th, fa (18 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,4 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-1.7B-hf emplea una arquitectura transformer multimodal orientada a la transcripción de voz, con un codificador de audio acoplado a un decodificador de lenguaje. Esta versión no reentrena ni modifica la arquitectura: aplica cuantización post-entrenamiento de los pesos lineales a INT8 mediante bitsandbytes, manteniendo las activaciones en FP16 (W8A16). El pipeline declarado es `automatic-speech-recognition` y la librería de referencia es transformers, con la clase `AutoModelForMultimodalLM`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base, ya que la model card de esta compilación no los detalla. La innovación técnica destacable de este repo es la propia cuantización: el autor reporta una reducción de VRAM del 46,8 % con una coincidencia literal del 100 % en la prueba de verificación, es decir, sin degradación observable en la transcripción de muestra.

## Capacidades

- Transcripción de audio a texto (ASR) en 18 idiomas, incluido castellano.
- Procesamiento de audio a 16 kHz, mono o estéreo (el ejemplo de la model card promedia canales si es estéreo).
- Decodificación fonética de alta precisión según el autor, heredada del modelo base de 1,7B.
- Generación determinista con `do_sample=False` y `max_new_tokens` configurable (256 en el ejemplo).
- Salida estructurada mediante `return_format="transcription_only"` en el procesador.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado automático de vídeo en castellano: el modelo transcribe audio de 16 kHz y devuelve texto plano listo para alinear con marcas de tiempo externas, con un consumo de VRAM de 2,55 GB que permite ejecutarlo junto al pipeline de renderizado en la misma GPU.
- Transcripción de reuniones y actas: al soportar 18 idiomas y audio mono o estéreo, puede procesar grabaciones de conferencias multilingües y generar actas en el idioma original sin cambiar de modelo.
- Atención al cliente con voz: integrado en un pipeline de telefonía, transcribe las llamadas entrantes antes de pasarlas a un LLM de respuesta; su reducido footprint permite desplegarlo en la misma instancia que el resto del stack.
- Generación de documentación a partir de notas de voz: en entornos de desarrollo, convierte dictados técnicos en texto para wikis o issues, con latencia de aproximadamente 0,95 s para un clip de 10,4 s en una RTX 3090.
- Accesibilidad: transcripción en tiempo casi real de clases o charlas para personas con discapacidad auditiva, aprovechando que cabe en GPUs de consumo como la RTX 3090.
- Archivado y búsqueda de audio: transcripción por lotes de archivos históricos en varios idiomas para indexar y hacer buscable el contenido, con un coste de memoria que permite procesar varios flujos en paralelo en una sola GPU.
- Investigación lingüística: análisis de corpus orales multilingües (árabe, hindi, bengalí, persa, etc.) con un único modelo Apache 2.0, sin restricciones de licencia para publicar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER sobre LibriSpeech, Common Voice u otros) en la información disponible. El autor únicamente aporta una verificación puntual:

| Prueba | Dato |
|---|---|
| Audio de prueba | `beckett.wav`, inglés, 10,4 s |
| GPU | NVIDIA GeForce RTX 3090 |
| VRAM pico registrada | 2,55 GB |
| Latencia | ~0,95 s |
| Coincidencia con el modelo base | 100 % literal (cero pérdida reportada) |
| Reducción de VRAM frente a FP16 | 46,8 % |

## Requisitos de hardware

- VRAM en reposo: ~2,25 GB; pico durante inferencia: ~2,55 GB (cifras del autor).
- Disco: ~2,10 GB de pesos (repo de 2,4 GB).
- GPUs recomendadas: RTX 3090 verificada por el autor; cualquier GPU con al menos 3 GB de VRAM libre debería bastar, incluidas RTX 3060, RTX 4060 y superiores.
- Cabe holgadamente en GPUs de consumo; también es viable en GPUs de datacenter (A100, H100) para despliegues de alto throughput.
- Opciones de despliegue: transformers con bitsandbytes (vía documentada), endpoints de Hugging Face (tag `endpoints_compatible`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia: ~0,95 s para un clip de 10,4 s en RTX 3090. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| warlockzero/Qwen3-ASR-1.7B-int8 | 2.038.851.200 | no disponible | INT8 W8A16 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-ASR-1.7B-hf (base FP16) | 2.038.851.200 | no disponible | FP16 | Apache 2.0 | Hugging Face |
| Variante 4-bit NF4 del mismo modelo | 2.038.851.200 | no disponible | 4-bit NF4 W4A8/W4A16 | Apache 2.0 | Referenciada por el autor, sin repo indicado |
| Whisper large-v3 | no disponible en la informacion proporcionada | no disponible | FP16, INT8 | MIT (segun conocimiento general, no verificado aqui) | Hugging Face / OpenAI |

La comparativa con Whisper u otros ASR no puede completarse con datos de esta ficha porque no se han proporcionado sus especificaciones en la información disponible.

## Limitaciones y advertencias

- La cuantización INT8 puede introducir degradaciones no detectadas en la única prueba de verificación publicada (un clip de 10,4 s en inglés); no hay evaluación sistemática de WER por idioma.
- El modelo está especializado exclusivamente en ASR: no genera texto libre, no razona, no hace tool calling ni procesa imágenes.
- Riesgo de alucinación inherente a los modelos de transcripción, especialmente con audio ruidoso, acentos no representados o solapamiento de hablantes.
- No se documenta la longitud máxima de audio soportada ni el contexto del decodificador; audios largos requerirán segmentación externa.
- El rendimiento en idiomas de bajos recursos del conjunto (bengalí, tailandés, persa) no está verificado con benchmarks públicos.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3-ASR-1.7B-hf por si añaden restricciones adicionales.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: es una compilación reciente y sin validación comunitaria amplia.
- No se documenta soporte para llama.cpp, Ollama ni vLLM, lo que limita las opciones de despliegue en producción fuera de transformers.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/warlockzero/Qwen3-ASR-1.7B-int8
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Librería bitsandbytes: no disponible en la información proporcionada
- Paper o blog técnico de Qwen3-ASR: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
