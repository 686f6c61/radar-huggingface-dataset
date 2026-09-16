# spybyscript/nemotron-3.5-asr-streaming-0.6b-coreai

## Resumen

Nemotron 3.5 ASR Streaming 0.6B — Core AI es una conversión comunitaria, publicada por el usuario spybyscript, del modelo de reconocimiento automático del habla en streaming de NVIDIA (nvidia/nemotron-3.5-asr-streaming-0.6b) al formato `.aimodel` de Apple Core AI para macOS, iOS y iPadOS 27. No se trata de un modelo entrenado ni ajustado: es un export directo desde el checkpoint original en PyTorch/safetensors, sin entrenamiento adicional, y no es una publicación oficial ni de NVIDIA ni de Apple.

El paquete `mixed/` ocupa aproximadamente 1,343 GB e incluye 31 assets componentes de un pipeline RNN-T con estado y chunks de 560 ms, además de tokenizador, configuración de origen, contratos de tensores, hashes y validación. Se distribuye junto a un runner de streaming en Swift que acepta PCM mono incremental a 16 kHz, mantiene el estado de encoder y decoder, aplica el prompt de idioma y decodifica tokens a texto.

Su relevancia es práctica: permite ejecutar un ASR en streaming de ~0,6B parámetros íntegramente sobre el framework Core AI del sistema, sin dependencias de Python, NeMo, ONNX ni LiteRT en tiempo de ejecución. La validación publicada cubre solo inglés `en-US` (prompt 0) sobre 20 grabaciones de LibriSpeech test-clean, con paridad exacta de tokens frente a la referencia FP32 original y un WER del 3,07%.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RNN-T en streaming: encoder FastConformer con 24 bloques, módulos de subsampling inicial y estable, proyección condicionada por idioma y predictor + joint RNN-T |
| Parámetros totales | Aproximadamente 600 millones (denominación 0.6B del modelo base; el autor no publica desglose por componente) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de un LLM; pipeline con estado que procesa chunks de audio de 560 ms manteniendo estado de encoder y decoder |
| Tipos de cuantización | Precisión mixta: FP32 en frontend de onda y frontend inicial, predictor y joint RNN-T; FP16 en subsampling inicial/estable, 24 bloques del encoder y proyección condicionada por idioma. No se incluye variante W8 |
| Idiomas soportados | en (solo validado con `en-US`, prompt 0); el modelo fuente es multilingüe y conserva la interfaz de prompt de idioma, pero no se probó |
| Licencia | OpenMDW 1.1 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | Apple Core AI `.aimodel` (paquete `mixed/` con 31 assets); el checkpoint de origen es PyTorch/safetensors |
| Autor de la conversión | spybyscript (conversión comunitaria, no oficial) |
| Modelo base | nvidia/nemotron-3.5-asr-streaming-0.6b |
| Entrada de audio | PCM mono incremental a 16 kHz |
| Tamaño del repositorio | 1,3 GB |
| Fecha de publicación | 16 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transductor recurrente neuronal (RNN-T) con encoder FastConformer de 24 bloques, precedido por un frontend de onda y módulos de subsampling inicial y estable, y seguido por una proyección condicionada por idioma que alimenta el predictor y el joint del RNN-T. El pipeline es stateful y opera con chunks de 560 ms, de modo que el runner Swift transporta el estado del encoder y del decoder entre fragmentos y decodifica los tokens de forma autorregresiva. La conversión distribuye 31 assets con sus contratos de tensores, hashes y tokenizador.

No ha habido entrenamiento ni fine-tuning por parte del autor de la conversión: el export se realizó directamente desde el checkpoint original. La innovación técnica relevante está en la estrategia de precisión: una primera red completamente en FP16 alteraba los tokens de origen en una grabación pública, por lo que se restauró FP32 en el predictor y el joint (y se mantuvo FP32 en el frontend de onda y el frontend inicial), lo que devolvió paridad exacta de tokens con la referencia en todo el conjunto público. La evidencia del candidato descartado (`evidence/rejected-all-fp16.json`) se conserva, pero sus assets no se distribuyen. El ajuste automático de especialización de Core AI se usó por defecto y no se perfiló el reparto real entre CPU, GPU y Neural Engine.

## Capacidades

- Reconocimiento automático del habla en streaming con estado, sobre PCM mono a 16 kHz y chunks de 560 ms.
- Decodificación incremental a texto con transporte de estado de encoder y decoder entre fragmentos, incluyendo reseteo de cachés y finalización con stream vacío.
- Interfaz de prompt de idioma heredada del modelo fuente multilingüe (en la conversión solo se ha validado `en-US`, prompt 0).
- Empaquetado multiplataforma: los 31 assets finales compilan para iOS 27 (arquitectura h19p) y el adaptador Swift pasa la comprobación de tipos contra el SDK de iPhoneOS 27.
- Ejecución sin dependencias de Python, NeMo, ONNX ni LiteRT en tiempo de ejecución; el ejecutable Swift usa el framework Core AI del sistema.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento: no aplica a este modelo.

## Casos de uso

- Transcripción en directo en aplicaciones macOS nativas: el runner Swift acepta PCM mono incremental a 16 kHz y mantiene estado, por lo que se puede integrar en un cliente de dictado o de subtitulado sin salir del ecosistema Core AI.
- Subtitulado en tiempo real de reuniones o videollamadas: con RTF en caliente de 0,0727 (13,75× tiempo real en el host medido), el modelo consume unos 4,36 segundos de cómputo por minuto de audio, lo que deja margen para procesar audio continuo.
- Automatización de notas de voz en iOS/iPadOS: el paquete compila para iOS 27 y el adaptador typechequea contra el SDK de iPhoneOS 27, lo que permite plantear una app que transcriba grabaciones locales sin enviar audio a la nube.
- Asistentes de voz embebidos con activación por micrófono: el pipeline está pensado para captura incremental y reseteo de caches, condiciones habituales en interacciones cortas de voz.
- Preamplificación de pipelines de voz a texto (STT → resumen, búsqueda o indexación): al devolver texto incremental, la salida se puede encadenar a otros componentes del sistema.
- Evaluación de paridad de formatos en investigación: los informes de validación, velocidad y streaming del repositorio permiten reproducir la comparación entre la referencia FP32 y esta conversión con las mismas condiciones de chunk e idioma.
- Prototipado de ASR multilingüe sobre Apple Silicon: la interfaz de prompt de idioma se conserva, de modo que sirve como punto de partida para probar otros idiomas, siempre que se asuma que no existe validación publicada al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para métricas tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR. Las mediciones disponibles son específicas de reconocimiento y de velocidad:

| Medición | Resultado |
|---|---:|
| Coincidencias exactas de tokens con la referencia FP32 original | 20/20 grabaciones |
| WER frente a referencia humana (original y convertido) | 3,07% (15/488 palabras) |
| Factor de tiempo real en caliente (warm RTF) | 0,0727 |
| Throughput | 13,75× tiempo real |
| Cómputo por minuto de audio | 4,36 segundos |
| Mediana por grabación (p50) | 38,5 ms por chunk de audio de 560 ms |

Condiciones: 20 grabaciones seleccionadas de LibriSpeech test-clean, 10 hablantes, 171,555 segundos y 488 palabras de referencia. El autor advierte que es una prueba pequeña de conversión y no el benchmark completo de LibriSpeech. La ejecución original en FP32 se contrastó de forma independiente contra el `generate()` del modelo fuente con el mismo idioma y perfil de chunk. El benchmark de velocidad se ejecutó en un Apple M5 Max con 128 GiB, macOS 27.0 (26A428), Xcode 27.0 (27A266a) y Swift 6.4; el RTF en caliente excluye la primera grabación y la carga, e incluye frontend, encoder, decodificación autorregresiva, copias a host y comparación con arrays de referencia (no incluye lectura de archivos, captura de micrófono ni interfaz). La prueba de streaming cubrió 80 enunciados (20 grabaciones × 4 ciclos, 686,22 segundos de audio repetido) variando el tamaño de callback y reseteando cachés; el autor subraya que son comprobaciones de estabilidad, no un nuevo conjunto de precisión ni una conversación larga ininterrumpida.

## Requisitos de hardware

- Requisitos obligatorios: Apple Silicon, macOS 27, Xcode 27 y el Metal Toolchain de Apple (`xcodebuild -downloadComponent MetalToolchain`). El ejecutable Swift usa el framework Core AI del sistema.
- No hay dependencias de runtime de Python, NeMo, ONNX ni LiteRT.
- VRAM estimada: no disponible. Al ejecutarse sobre memoria unificada en Apple Silicon, el dato relevante es el tamaño del paquete (aproximadamente 1,343 GB de assets en `mixed/`) más el estado del pipeline; el autor no publica una cifra de consumo de memoria.
- GPU recomendadas: no aplica en el sentido de GPU dedicada; el destino es hardware Apple Silicon. El host de medida fue un Apple M5 Max con 128 GiB.
- GPU de consumo: no procede, el modelo no se distribuye para CUDA ni para GPUs de consumo tipo RTX.
- Colocación de cómputo: se usó la especialización por defecto de Core AI y no se perfiló el reparto real entre CPU, GPU y Neural Engine.
- Opciones de despliegue: compilación local del runner Swift con `xcrun swiftc -parse-as-library -O CoreAI35SpeechRunner.swift Swift35Transcribe.swift`, previa descarga de los assets con `hf download ... --include 'mixed/*' '*.swift' '*.md' 'LICENSE' 'publication.json' 'SHA256SUMS'`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 38,5 ms de mediana por chunk de 560 ms, RTF 0,0727, 13,75× tiempo real y 4,36 s de cómputo por minuto de audio en el host indicado. El autor advierte que el tiempo de cómputo no equivale a latencia de subtitulado en vivo y que no son estimaciones de rendimiento en teléfono o tableta.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| spybyscript/nemotron-3.5-asr-streaming-0.6b-coreai (esta conversión) | Apple Core AI `.aimodel` | ~0,6B | Interfaz multilingüe; validado solo en `en-US` | OpenMDW 1.1 | Conversión comunitaria, 31 assets, runner Swift incluido |
| nvidia/nemotron-3.5-asr-streaming-0.6b (modelo fuente) | PyTorch/safetensors | ~0,6B | Multilingüe (benchmarks upstream) | OpenMDW 1.1 | Referencia oficial; revisión `1c8deaecc64b91f034d73e08dd8b64625eb3395d` |
| spybyscript/nemotron-3.5-asr-streaming-0.6b-litert | LiteRT | ~0,6B (mismo origen) | Multilingüe en origen; validación no detallada aquí | OpenMDW 1.1 (según origen) | Conversión comunitaria alternativa |
| spybyscript/nemotron-speech-streaming-en-0.6b-aimodel | Apple Core AI `.aimodel` | 0,6B indicado en el nombre (no confirmado) | Específico de inglés | No disponible | Checkpoint distinto: vocabulario y contrato de proyección diferentes, componentes no intercambiables |

Los benchmarks multilingües del modelo fuente son resultados upstream y no mediciones de esta conversión, según advierte el propio autor. No se dispone de cifras comparativas de WER frente a otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Conversión comunitaria: no es una publicación oficial de NVIDIA ni de Apple, y no se ofrece ningún tipo de garantía.
- Idiomas: solo se ha validado inglés `en-US` (prompt 0). El resto de idiomas y la detección automática de idioma requieren pruebas de paridad y reconocimiento propias. Los metadatos de idioma reflejan la cobertura probada, no la capacidad completa del modelo fuente.
- Precisión: la primera candidata completamente en FP16 alteraba tokens en una grabación pública; si se modifica la estrategia de precisión hay que revalidar. No se incluye variante W8.
- Alcance de la evaluación: 20 grabaciones de LibriSpeech test-clean, 10 hablantes y 488 palabras de referencia. No es el benchmark completo de LibriSpeech y el WER de 3,07% no debe extrapolarse a audio real, ruidoso o con acentos no cubiertos.
- Streaming: las 80 repeticiones comprueban estabilidad, pero no constituyen un conjunto de precisión nuevo ni una conversación larga ininterrumpida.
- Plataformas: los assets se compilaron para iOS 27 (arquitectura h19p) y el adaptador Swift typechequea contra el SDK de iPhoneOS 27, pero no se ha ejecutado en un iPhone o iPad físico ni se han medido batería, temperatura o micrófono.
- Rendimiento: las cifras de velocidad corresponden a un Apple M5 Max con 128 GiB y actividad de escritorio normal; no son estimaciones para teléfono o tableta. El tiempo de cómputo no equivale a latencia de subtitulado en vivo.
- Compatibilidad de componentes: el checkpoint específico de inglés tiene otro vocabulario y otro contrato de proyección; sus componentes no se pueden sustituir en este paquete.
- Licencia: OpenMDW 1.1. Conviene revisar el texto completo de la licencia y el `NOTICE.md` del repositorio antes de un uso comercial o de redistribución.
- Riesgo de error de reconocimiento: como todo sistema ASR, puede producir transcripciones incorrectas en audio con ruido, solapamiento de hablantes o vocabulario especializado; no se documentan sesgos específicos en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spybyscript/nemotron-3.5-asr-streaming-0.6b-coreai
- Modelo base (NVIDIA): https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Revisión concreta del modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/tree/1c8deaecc64b91f034d73e08dd8b64625eb3395d
- Conversión alternativa a LiteRT (mismo autor): https://huggingface.co/spybyscript/nemotron-3.5-asr-streaming-0.6b-litert
- Conversión Core AI específica de inglés (mismo autor): https://huggingface.co/spybyscript/nemotron-speech-streaming-en-0.6b-aimodel
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Artefactos internos del repositorio citados en la model card: `mixed/validation.json`, `evidence/rejected-all-fp16.json`, `evidence/speed-20260916.json`, `evidence/speed-summary.json`, `evidence/streaming.json`, `evidence/ios-compilation.json`, `evidence/swift-ios-typecheck.json`, `conversion/README.md`, `SOURCE_MODEL_CARD.md`, `LICENSE`, `NOTICE.md`
- Búsqueda web: no se han encontrado enlaces relevantes al modelo en los resultados disponibles (los resultados devueltos correspondían a listados de hoteles y no guardan relación con el modelo).
