# TalkBar/voice-models

## Resumen

TalkBar/voice-models no es un modelo único, sino un repositorio de distribución de pesos para la aplicación de escritorio TalkBar. Agrupa un conjunto heterogéneo de modelos de reconocimiento automático del habla (ASR), detección de actividad vocal (VAD), diarización de hablantes y embeddings de documentos, empaquetados en formatos ONNX y GGML/GGUF para su ejecución local. Cada fichero es una reempaquetado byte a byte de un modelo upstream con licencia permisiva, sin modificaciones de pesos más allá de la cuantización, la conversión de formato y el archivado.

El repositorio suma 566.703.104 parámetros declarados en safetensors y ocupa 6,2 GB. Los modelos incluidos cubren desde ASR ligero (Canary 180M Flash, GigaAM v3 int8) hasta ASR de mayor tamaño (Whisper large-v3, Parakeet TDT 0.6B v3), además de componentes auxiliares como Silero VAD y un modelo de diarización Sortformer para hasta cuatro hablantes. La licencia es mixta por fichero (mixed-per-file), con predominio de MIT y CC-BY-4.0.

Su relevancia actual radica en que ofrece un punto de descarga fijado a un commit con verificación SHA-256, lo que facilita la reproducibilidad en pipelines de aplicaciones de escritorio que necesitan inferencia de voz local sin depender de servicios en la nube. No obstante, al tratarse de un host de distribución y no de un modelo entrenado por TalkBar, las capacidades reales deben evaluarse fichero a fichero consultando los modelos upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo: TDT/Conformer (Parakeet, Canary), transformer encoder-decoder (Whisper), Conformer (GigaAM), ResNet34 (WeSpeaker), Sortformer (diarización), VAD (Silero), BGE-M3 (embeddings) |
| Parámetros totales | 566.703.104 (declarados en safetensors); varía por fichero |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo ASR; no especificado en la model card) |
| Tipos de cuantización | int8 (ONNX), q4_1, q5_0, Q4_K_M (GGML/GGUF), fp32/fp16 en bundles ONNX |
| Idiomas soportados | no disponible (depende del modelo upstream; Whisper es multilingüe, GigaAM está orientado a ruso, Canary a inglés/otros según versión) |
| Licencia | mixed-per-file (MIT, CC-BY-4.0, Apache-2.0, NVIDIA Open Model License) |
| Formato de pesos | ONNX, GGML, GGUF, safetensors, tar.gz bundles |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo propio: redistribuye pesos de terceros. La arquitectura subyacente es, por tanto, la de cada modelo upstream. Parakeet TDT 0.6B v3 y Canary emplean arquitecturas Conformer con decodificación TDT (Token-and-Duration Transducer) en el caso de Parakeet, orientadas a ASR de alto rendimiento. Whisper (small, medium, large-v3, large-v3-turbo) usa un transformer encoder-decoder con decodificación autorregresiva. GigaAM v3 es un Conformer entrenado por SberDevices/salute-developers, principalmente para ruso. Silero VAD es una red ligera para detección de voz, WeSpeaker ResNet34-LM produce embeddings de hablante para verificación, y Sortformer realiza diarización en streaming para hasta cuatro hablantes. BGE-M3 aporta embeddings densos multilingües para búsqueda documental.

No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni procesos de RLHF/DPO en la model card proporcionada, ya que esta solo documenta el empaquetado, las licencias y los hashes de integridad. Las innovaciones técnicas destacables son las propias de los modelos upstream (TDT en Parakeet, decodificación turbo en Whisper large-v3-turbo, diarización streaming en Sortformer) y, a nivel de repositorio, la verificación SHA-256 por fichero y el pinning a commit para descargas reproducibles.

## Capacidades

- Reconocimiento automático del habla (ASR) en múltiples variantes y tamaños: desde 180M (Canary Flash) hasta large-v3 de Whisper.
- Transcripción multilingüe con Whisper (small, medium, large-v3, large-v3-turbo).
- ASR especializado en ruso con GigaAM v3.
- Detección de actividad vocal (VAD) con Silero para segmentación de audio.
- Diarización de hablantes en streaming para hasta cuatro hablantes con Sortformer.
- Extracción de embeddings de hablante con WeSpeaker ResNet34-LM (verificación/identificación).
- Embeddings densos de documentos multilingües con BGE-M3 (Q4_K_M) para búsqueda semántica.
- Ejecución local en formatos ONNX y GGML/GGUF, compatible con runtimes de inferencia en CPU/GPU.
- No se documentan capacidades de tool calling, agentes, visión ni audio generativo.

## Casos de uso

- Transcripción local de reuniones: usar Whisper large-v3-turbo o Parakeet TDT para convertir audio a texto en la propia máquina, sin enviar datos a la nube, aprovechando los formatos GGML/ONNX para despliegue en escritorio.
- Subtitulado automático de vídeo: Whisper medium o large-v3 con cuantización q4_1/q5_0 permite generar subtítulos multilingües en equipos sin GPU dedicada, a costa de mayor latencia.
- Asistentes de voz en aplicaciones de escritorio: combinar Silero VAD para detectar segmentos de voz y un modelo ASR ligero (Canary 180M Flash o GigaAM int8) para transcripción en tiempo casi real.
- Análisis de reuniones con múltiples participantes: emplear Sortformer para diarización en streaming y asignar cada segmento transcrito a un hablante, útil en actas automáticas.
- Verificación biométrica de voz: WeSpeaker ResNet34-LM genera embeddings de hablante que permiten comparar muestras y autenticar usuarios en flujos de acceso local.
- Búsqueda semántica en documentación interna: BGE-M3 Q4_K_M produce embeddings densos multilingües para indexar y recuperar documentos en una app de escritorio con recursos limitados.
- Transcripción específica para ruso: GigaAM v3 int8 ONNX es adecuado para aplicaciones dirigidas a usuarios rusohablantes donde Whisper no rinde de forma óptima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: depende del fichero. Los modelos ligeros (Canary 180M, GigaAM int8, Silero VAD) caben en menos de 1 GB; Whisper large-v3 en q5_0 ronda 1,1 GB en disco y puede ejecutarse en CPU; Parakeet int8 requiere alrededor de 0,5 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con 4-8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente para los modelos ASR incluidos; para diarización y embeddings basta con CPU en muchos casos.
- Cabe en GPU consumer: sí, todos los ficheros individuales son de tamaño reducido (el mayor, Whisper large-v3-turbo, ocupa 1,6 GB).
- Opciones de despliegue: ONNX Runtime (ficheros .onnx), llama.cpp/whisper.cpp (ficheros GGML/GGUF), y los runtimes propios de cada upstream. No se documenta compatibilidad con vLLM ni TGI, ya que no son modelos de lenguaje generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TalkBar/voice-models (conjunto) | 566,7 M (total repo) | no disponible | mixed-per-file | Hugging Face |
| openai/whisper-large-v3 | 1,55 B | 30 s de audio por ventana | MIT | Hugging Face, GitHub |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | no disponible | CC-BY-4.0 | Hugging Face |
| nvidia/canary-1b-v2 | 1 B | no disponible | CC-BY-4.0 | Hugging Face |

La comparativa se limita a los modelos upstream incluidos; TalkBar no aporta un modelo propio con el que comparar rendimiento. Para evaluar calidad ASR conviene consultar los benchmarks publicados por NVIDIA y OpenAI en sus respectivas model cards.

## Limitaciones y advertencias

- No es un modelo entrenado por TalkBar: cualquier evaluación de calidad debe hacerse sobre los modelos upstream, no sobre este repositorio.
- Licencia mixta por fichero: es imprescindible revisar la licencia de cada archivo antes de uso comercial (MIT, CC-BY-4.0, Apache-2.0 y NVIDIA Open Model License tienen condiciones distintas).
- La NVIDIA Open Model License impone restricciones adicionales que deben verificarse para el fichero de diarización.
- Idiomas soportados no documentados de forma agregada; GigaAM está orientado a ruso y Whisper es multilingüe, pero no se detalla la cobertura exacta.
- Riesgo de alucinación en transcripciones ASR (especialmente Whisper en audio con ruido o silencios), con posibilidad de generar texto no presente en el audio.
- Sesgos acústicos y lingüísticos heredados de los datasets de entrenamiento upstream (posible peor rendimiento en acentos no representados).
- No se documentan requisitos de contexto, latencia ni throughput, lo que dificulta el dimensionamiento en producción.
- El repositorio incluye un fichero de embeddings (BGE-M3) que no es un modelo de voz; conviene no confundir su rol en la aplicación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TalkBar/voice-models
- NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- OpenAI Whisper (código y licencia): https://github.com/openai/whisper
- GigaAM (salute-developers): https://github.com/salute-developers/GigaAM
- NVIDIA Canary 180M Flash: https://huggingface.co/nvidia/canary-180m-flash
- NVIDIA Canary 1B v2: https://huggingface.co/nvidia/canary-1b-v2
- Silero VAD: https://github.com/snakers4/silero-vad
- WeSpeaker: https://github.com/wenet-e2e/wespeaker
- NVIDIA Sortformer diarización: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1
- BGE-M3 (BAAI): https://huggingface.co/BAAI/bge-m3
- Cuantización BGE-M3 Q4_K_M (groonga): https://huggingface.co/groonga/bge-m3-Q4_K_M-GGUF
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
