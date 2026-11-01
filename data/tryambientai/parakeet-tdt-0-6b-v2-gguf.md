# tryambientai/parakeet-tdt-0.6b-v2-gguf

## Resumen

`tryambientai/parakeet-tdt-0.6b-v2-gguf` es una conversión al formato GGUF del modelo de reconocimiento automático de voz (ASR) `nvidia/parakeet-tdt-0.6b-v2`, publicada por el usuario tryambientai. El modelo original lo desarrolla NVIDIA dentro de su familia Parakeet y está pensado para transcripción de inglés con puntuación, mayúsculas y marcas temporales a nivel de token. La conversión permite ejecutar el modelo con `transcribe.cpp`, una implementación en C++ del runtime de inferencia, sin necesidad de NeMo ni de PyTorch.

Arquitectónicamente es un FastConformer de tipo XL (encoder Conformer con atención completa) acoplado a un decodificador TDT (Token-and-Duration Transducer, variante de RNNT). Cuenta con 617.869.958 parámetros totales y procesa audio de 16 kHz mono en WAV, generando transcripciones en una sola pasada de hasta 24 minutos de audio según la model card original.

Su relevancia actual reside en que ofrece una alternativa ejecutable en CPU y GPU de consumo para transcripción offline en inglés, con una degradación de calidad mínima al cuantizar: el WER en LibriSpeech test-clean pasa de 1,68 % en F32 a 1,72 % en Q4_K_M, con un tamaño de fichero de solo 483 MB. No es un modelo streaming ni multilingüe; para multilingüe existe la variante v3 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer XL (encoder) + TDT/RNNT (decoder transducer) |
| Parametros totales | 617.869.958 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de hasta 24 minutos por pasada según la model card original) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (runtime: transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer de NVIDIA, una variante del Conformer que reduce el coste computacional mediante subsampling de las secuencias de entrada, combinado con un decodificador TDT (Token-and-Duration Transducer). La atención es completa, lo que permite procesar segmentos largos de audio en una sola pasada (hasta 24 minutos según la model card de NVIDIA). El decodificador TDT predice simultáneamente tokens y duraciones, lo que mejora la eficiencia frente a un RNNT clásico.

La model card de la conversión no detalla la composición del dataset de entrenamiento, el número de horas de audio ni si hubo etapas de ajuste fino con RLHF o DPO (no aplicable habitualmente en ASR). Sí se indica que la conversión GGUF se realizó a partir del commit `1b149a3` del modelo base, fijado el 2026-04-15, y se validó contra la referencia NeMo en el commit `bf0d0b7` de transcribe.cpp el 2026-04-18. La validación numérica reportada muestra que F32 y Q8_0 igualan el WER de referencia de NVIDIA (1,69 %) dentro del redondeo.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio WAV de 16 kHz mono.
- Generación de puntuación y mayúsculas de forma automática.
- Marcas temporales a nivel de token (`timestamps: token` en la metadata de transcribe.cpp).
- Buen rendimiento en números hablados y transcripción de letras de canciones, según la model card original.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de capacidades de visión ni audio generativo; solo consume audio y produce texto.

## Casos de uso

- Transcripción offline de reuniones: el modelo procesa audio de hasta 24 minutos en una sola pasada y devuelve puntuación y mayúsculas, lo que permite generar actas sin post-procesado intensivo. Ejecutable en un portátil con la cuantización Q4_K_M (483 MB).
- Subtitulado con marcas temporales: al emitir timestamps a nivel de token, se puede alinear el texto con el audio para generar ficheros de subtítulos; requiere agrupar tokens en segmentos en el post-procesado.
- Dictado por voz en aplicaciones de escritorio: con el binario `transcribe-cli` de transcribe.cpp y un WAV de 16 kHz, se puede integrar en herramientas locales de dictado sin depender de servicios en la nube.
- Indexación y búsqueda de archivos de audio: transcribir por lotes un archivo de podcasts o grabaciones en inglés y alimentar un índice de búsqueda textual; el coste por hora es bajo gracias al RTFx reportado por NVIDIA (3380 en HF-Open-ASR con batch 128).
- Preprocesado para pipelines de NLP: convertir audio a texto antes de aplicar resumen, clasificación o extracción de entidades con modelos de lenguaje, aprovechando la puntuación y capitalización que ya genera el modelo.
- Transcripción en dispositivos con GPU integrada: los datos de rendimiento en Ryzen 4750U (RTF 8 en CPU, 15 en Vulkan) y en M4 Max (RTF 29 en CPU, 175 en Metal) indican que es viable en hardware de consumo sin GPU dedicada.
- Archivado y cumplimiento: transcripción local de grabaciones sensibles en inglés sin enviar audio a terceros, dado que el modelo se ejecuta íntegramente en la máquina del usuario.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2620 utterances), decodificación greedy del transducer sin LM externa, según la model card de la conversión:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,47 GB | 1,68 % |
| F16 | 1,24 GB | 1,68 % |
| Q8_0 | 730 MB | 1,69 % |
| Q6_K | 608 MB | 1,70 % |
| Q5_K_M | 547 MB | 1,70 % |
| Q4_K_M | 483 MB | 1,72 % |

Referencia de NVIDIA sobre la misma partición: 1,69 %. El port F32 y el Q8_0 coinciden con la referencia dentro del redondeo.

Rendimiento (RTF, mayor es mejor) reportado en la metadata de transcribe.cpp:

| Hardware | Backend | RTF |
|---|---|---:|
| Ryzen 4750U | CPU | 8 |
| Ryzen 4750U | Vulkan | 15 |
| M4 Max | CPU | 29 |
| M4 Max | Metal | 175 |

RTFx de 3380 en HF-Open-ASR con batch 128 según la model card de NVIDIA (el valor puede variar con la duración del audio y el batch).

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para Q8_0 (730 MB de pesos) y alrededor de 500 MB para Q4_K_M; F32 requiere unos 2,5 GB.
- GPU recomendadas: cualquier GPU con soporte Vulkan o Metal es suficiente; no se requiere A100 ni H100 para inferencia interactiva.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1-2 GB de memoria libre; también funciona en CPU.
- Opciones de despliegue: `transcribe.cpp` (compilación con CMake, binario `transcribe-cli`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 8 (CPU Ryzen 4750U) a 175 (Metal en M4 Max); en la práctica, un audio de 60 segundos se transcribe en unos 7,5 segundos en CPU de portátil y en menos de 0,4 segundos en M4 Max con Metal.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / audio | Licencia | Runtime |
|---|---:|---|---|---|---|
| parakeet-tdt-0.6b-v2 (GGUF, este) | 617,9 M | en | hasta 24 min por pasada (model card original) | CC-BY-4.0 | transcribe.cpp |
| nvidia/parakeet-tdt-0.6b-v3 | no disponible en la informacion | 25 idiomas europeos | no disponible | no disponible en la informacion | NeMo |
| Whisper large-v3 | no disponible en la informacion | multilingue | no disponible en la informacion | no disponible en la informacion | multiples |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la comparación se limita a parámetros, idiomas y licencia.

## Limitaciones y advertencias

- Solo inglés: no transcribe otros idiomas ni detecta el idioma de entrada.
- No es streaming: requiere el audio completo (o segmentos) como entrada; no apto para transcripción en tiempo real continua.
- No traduce: la salida es siempre texto en el idioma de entrada (inglés).
- Riesgo de alucinación en audio con ruido, música o habla solapada; la model card no reporta métricas en dominios ruidosos.
- Sesgos: no se documentan en la información disponible; al ser un modelo entrenado mayoritariamente con inglés, puede tener peor rendimiento en acentos no nativos o variedades dialectales.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor original (NVIDIA) y mantener el aviso de licencia.
- La conversión GGUF está validada contra un commit concreto de transcribe.cpp (`bf0d0b7`); cambios en el runtime pueden alterar la compatibilidad.
- El repositorio de la conversión tiene 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.
- El modelo base está fijado a un commit de 2026-04-15; actualizaciones posteriores de NVIDIA no están reflejadas.
- No soporta tool calling ni agentes; no debe usarse como sustituto de un LLM.

## Enlaces

- HuggingFace (conversión GGUF): https://huggingface.co/tryambientai/parakeet-tdt-0.6b-v2-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Variante multilingüe v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt-0.6b-v2.md
- Commit del modelo base usado: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2/commit/1b149a3
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v2
- Documentación NeMo sobre FastConformer: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode.en
