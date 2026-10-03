# transcriber-app/parakeet-tdt-0.6b-v3-mlx-4bit

## Resumen
Parakeet TDT 0.6B v3 MLX 4-bit es una versión cuantizada a 4 bits del modelo de reconocimiento automático de voz NVIDIA Parakeet TDT 0.6B v3, redistribuida por transcriber-app. Está pensada para inferencia local en Apple silicon mediante MLX y convierte los pesos fp32 del modelo original al formato MLX, con cuantización affine de 4 bits y grupo de 64 en capas Linear y Embedding. El modelo base es un sistema ASR multilingüe de 25 lenguas europeas, con arquitectura FastConformer y decodificador TDT (Token-and-Duration Transducer), y 627.052.166 parámetros totales. El repositorio ocupa 0,5 GB y el archivo de pesos cuantizado pesa 472 MB, frente a 2,5 GB del fp32. Es relevante porque permite transcripción de voz multilingüe en dispositivo, sin GPU dedicada, manteniendo un WER cercano al fp32 según la model card.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer), según tags y nombre del modelo base |
| Parametros totales | 627.052.166 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; no se especifica ventana de audio máxima) |
| Tipos de cuantizacion | 4-bit affine, group size 64, en 221 módulos Linear/Embedding; convoluciones, LSTM y normalización en bfloat16. La familia incluye builds de 8-bit, 6-bit y 5-bit (no publicada) |
| Idiomas soportados | en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk (25 idiomas) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (MLX); config.json, vocab.txt, tokenizer.model, tokenizer.vocab |

## Arquitectura y entrenamiento
Este repositorio no entrena un modelo nuevo: parte de los pesos fp32 de mlx-community/parakeet-tdt-0.6b-v3, que a su vez es una conversión MLX del modelo NVIDIA parakeet-tdt-0.6b-v3. Se cuantizan 221 módulos Linear y Embedding con mlx.nn.quantize a 4 bits, group size 64 (affine); el resto de tensores, como convoluciones, LSTM y normalización, se almacenan en bfloat16. Los nombres de tensores se mantienen respecto al checkpoint original y config.json incorpora un bloque quantization con group_size 64 y bits 4.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información disponible. La innovación principal de esta ficha es la cuantización 4-bit para MLX, que reduce el peso de 2,5 GB a 472 MB y permite decodificación greedy rápida en Apple silicon. El decodificador TDT modela tokens y duraciones, típico de la familia Parakeet; no se detallan más hiperparámetros ni el proceso exacto de entrenamiento del modelo original.

## Capacidades
- Reconocimiento automático de voz (ASR) multilingüe en 25 lenguas europeas.
- Transcripción de audio a texto con decodificación greedy.
- Inferencia local en Apple silicon mediante MLX.
- Modelo cuantizado a 4 bits, orientado a eficiencia de memoria y velocidad.
- Uso con tokenizer y vocabulario incluidos en el repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni generación de texto libre.
- No se especifican funciones de puntuación, mayúsculas, marcas de tiempo o diarización.

## Casos de uso
- Dictado local en Mac: integración en aplicaciones de escritura mediante MLX y parakeet-mlx. El peso de 472 MB y la velocidad indicada de 90× en un M4 permiten transcripción casi instantánea sin enviar audio a la nube.
- Transcripción de reuniones y notas de voz: procesar audio en el dispositivo para equipos multilingües europeos, evitando subir conversaciones confidenciales a servicios externos.
- Subtitulado de vídeos: generar transcripciones base en 25 idiomas para posterior revisión humana. El tamaño reducido facilita ejecutarlo en portátiles Apple sin GPU dedicada.
- Análisis de llamadas de atención al cliente: convertir grabaciones a texto para búsqueda, clasificación y analítica. Es adecuado para despliegue en Macs de desarrollo o servidores Apple, aunque el WER de 4-bit exige revisión en dominios críticos.
- Accesibilidad: dictado para personas con movilidad reducida o dificultades de escritura, con funcionamiento sin conexión y latencia baja en hardware Apple consumer.
- Investigación en ASR multilingüe: evaluar el impacto de la cuantización 4-bit frente a fp32 usando FLEURS y GOLOS, comparando WER y velocidad en distintos idiomas.
- Aplicaciones de voz offline en portátiles Apple: asistentes locales que solo necesitan transcripción, no generación de lenguaje, y que pueden integrarse en pipelines de automatización.
- Preprocesado para pipelines de NLP: transcribir audio antes de análisis de sentimiento, resumen o extracción de entidades, usando un modelo ASR especializado y ligero.

## Benchmarks y rendimiento
Medido en 1.000 clips en ruso (500 FLEURS, 500 GOLOS), decodificación greedy, en un Mac M4, según la model card:

| Build | Descarga | WER FLEURS | WER GOLOS | Velocidad |
|---|---:|---:|---:|---:|
| fp32 (mlx-community/parakeet-tdt-0.6b-v3) | 2,5 GB | 5,57 % | 3,42 % | 64× |
| 8-bit (transcriber-app/parakeet-tdt-0.6b-v3-mlx-8bit) | 744 MB | 5,67 % | 3,46 % | 90× |
| 6-bit (transcriber-app/parakeet-tdt-0.6b-v3-mlx-6bit) | 608 MB | 5,61 % | 3,38 % | 88× |
| 5-bit (no publicado) | 540 MB | 5,93 % | 3,50 % | 87× |
| 4-bit (este repositorio) | 472 MB | 5,95 % | 3,67 % | 90× |

No se han publicado otros benchmarks en la información disponible. La model card indica que 4-bit cuesta aproximadamente un tercio de punto de WER frente a fp32 y que 6-bit es el build más pequeño que mantiene la precisión de fp32.

## Requisitos de hardware
- VRAM o memoria unificada estimada: el archivo model.safetensors pesa 472 MB; hay que sumar el overhead de activaciones y del runtime MLX. No se especifica una cifra oficial de memoria mínima.
- GPU recomendadas: no aplica para MLX; el modelo está pensado para Apple silicon. No se indica soporte CUDA en este repositorio.
- Cabe en consumer GPU: no aplica directamente, ya que el formato es MLX para Apple silicon. En Macs consumer con chip M1, M2, M3 o M4, el tamaño de 472 MB es manejable.
- Opciones de despliegue: MLX y parakeet-mlx. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: la model card indica una velocidad de 90× para 4-bit y 64× para fp32 en un Mac M4. No se detalla si la métrica es real-time factor u otro multiplicador.

## Comparativa con modelos similares
No se proporcionan datos de otros modelos ASR comparables, como Whisper, en la información disponible. La comparativa posible es entre los distintos builds de cuantización del mismo modelo:

| Build | Parametros | Contexto | WER FLEURS (ru) | WER GOLOS (ru) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| fp32 mlx-community | 627 M | no disponible | 5,57 % | 3,42 % | CC-BY-4.0 | público |
| 8-bit transcriber-app | 627 M | no disponible | 5,67 % | 3,46 % | CC-BY-4.0 | público |
| 6-bit transcriber-app | 627 M | no disponible | 5,61 % | 3,38 % | CC-BY-4.0 | público |
| 5-bit transcriber-app | 627 M | no disponible | 5,93 % | 3,50 % | CC-BY-4.0 | no publicado |
| 4-bit transcriber-app | 627 M | no disponible | 5,95 % | 3,67 % | CC-BY-4.0 | público |

## Limitaciones y advertencias
- Modelo especializado en ASR; no genera texto libre, no razona y no soporta tool calling ni agentes.
- La cuantización 4-bit degrada el WER frente a fp32: +0,38 puntos en FLEURS y +0,25 puntos en GOLOS en la evaluación en ruso.
- La evaluación de precisión solo cubre ruso (1.000 clips) según la model card; no hay datos publicados para los otros 24 idiomas.
- No se documentan sesgos específicos, pero al ser un modelo ASR puede heredar sesgos del dataset de entrenamiento de NVIDIA, no disponible en esta información.
- Riesgo de errores de transcripción en audio ruidoso, acentos marcados, solapamiento de voces, vocabulario técnico o dominios alejados del entrenamiento.
- No se especifica soporte de puntuación, mayúsculas, marcas de tiempo, diarización ni segmentación de hablantes.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar a NVIDIA, mlx-community y transcriber-app.
- El formato MLX limita el despliegue a Apple silicon; no hay pesos GGUF, ONNX o CUDA en este repositorio.
- No se especifica la longitud máxima de audio; en audios largos puede ser necesario segmentar antes de transcribir.
- En ASR existe riesgo de alucinación en silencios o ruido, produciendo texto plausible pero incorrecto; no se documenta un mecanismo de mitigación.

## Enlaces
- HuggingFace: https://huggingface.co/transcriber-app/parakeet-tdt-0.6b-v3-mlx-4bit
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversión MLX de mlx-community: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v3
- Repositorio parakeet-mlx: https://github.com/senstella/parakeet-mlx
- Build 8-bit: https://huggingface.co/transcriber-app/parakeet-tdt-0.6b-v3-mlx-8bit
- Build 6-bit: https://huggingface.co/transcriber-app/parakeet-tdt-0.6b-v3-mlx-6bit
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
