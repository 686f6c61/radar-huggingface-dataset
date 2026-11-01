# tryambientai/moss-transcribe-diarize-gguf

## Resumen

MOSS-Transcribe-Diarize es un modelo de reconocimiento automático del habla (ASR) de tipo audio-LLM desarrollado por OpenMOSS-Team, distribuido en este repositorio como conversión GGUF para su uso con transcribe.cpp. Resuelve la transcripción offline de audio multihablante en inglés y chino en una sola pasada, generando etiquetas de hablante anónimas (`[S01]`, `[S02]`, etc.) y marcas temporales a nivel de segmento, sin necesidad de un pipeline separado de diarización.

La arquitectura combina un encoder Whisper-Medium (24 capas, `d_model=1024`) con un puente VQAdaptor que aplica una fusión temporal 4x, inyectando los tokens de audio en un decoder Qwen3-0.6B de 28 capas. El conjunto suma 908.529.760 parámetros, lo que lo sitúa en la categoría de 0,9B, un tamaño que permite ejecución en CPU y GPU de consumo con cuantizaciones de 4 a 8 bits.

Su relevancia actual radica en que ofrece diarización end-to-end con un WER de 2,08 % en LibriSpeech test-clean (BF16) y un rendimiento en tiempo real (RTF) de 28,1 en Metal sobre un Apple M4 Max, lo que lo hace viable para transcripción local de reuniones y material audiovisual sin depender de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Audio-LLM híbrido: encoder Whisper-Medium (24 capas, d_model=1024) + fusión temporal 4x + puente VQAdaptor + decoder Qwen3-0.6B (28 capas) con inyección de tokens de audio |
| Parámetros totales | 908.529.760 (0,9B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (librería transcribe.cpp); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue un esquema de audio-LLM con encoder acústico y decoder lingüístico. El encoder es un Whisper-Medium de 24 capas con `d_model=1024`; su salida pasa por una fusión temporal de factor 4 y un puente VQAdaptor que proyecta las representaciones acústicas al espacio de tokens del decoder. El decoder es un Qwen3-0.6B de 28 capas que recibe los tokens de audio inyectados en la secuencia y genera texto autoregresivamente. Las etiquetas de hablante y las marcas temporales se emiten como texto generado en el formato canónico `[start][Sxx]text[end]`, no como tokens especiales, lo que simplifica el postprocesado.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card original tampoco detalla innovaciones como decodificación especulativa o atención lineal. La conversión GGUF está anclada al commit `d7231bb` del modelo base (fijado el 2026-07-12) y validada contra el runner de referencia del repositorio del autor en el commit `3f5e15c` de transcribe.cpp. El modelo no soporta streaming, traducción ni detección de idioma; las marcas temporales son únicamente a nivel de segmento.

## Capacidades

- Transcripción de voz a texto offline en inglés y chino.
- Diarización de hablantes end-to-end con etiquetas anónimas `[S01]`, `[S02]`, etc.
- Generación de marcas temporales a nivel de segmento en el formato `[start][Sxx]text[end]`.
- Procesamiento de audio largo multihablante en una sola pasada.
- Conciencia de eventos acústicos según la model card original.
- Entrada de audio o vídeo (el audio debe convertirse a WAV mono a 16 kHz).
- No soporta tool calling ni function calling.
- No soporta modo agente ni razonamiento multi-paso.
- No soporta streaming.
- No soporta traducción entre idiomas.
- No soporta detección automática de idioma.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio multihablante y devuelve un transcript con etiquetas de hablante y timestamps por segmento, lo que permite generar actas atribuidas a cada participante sin un paso separado de diarización.
- Subtitulado de material audiovisual: a partir de la conversión a WAV mono 16 kHz con ffmpeg, se obtienen segmentos con marcas temporales directamente utilizables para generar ficheros de subtítulos.
- Investigación cualitativa con entrevistas: la diarización automática permite separar entrevistador y entrevistado en grabaciones largas, reduciendo el trabajo manual de anotación.
- Transcripción local con privacidad: al ejecutarse sobre GGUF en CPU o GPU de consumo con transcribe.cpp, el audio no sale del equipo, lo que encaja en entornos con requisitos de confidencialidad.
- Documentación de soporte y atención al cliente: la transcripción de llamadas grabadas con separación de hablantes facilita la revisión posterior y el análisis de conversaciones.
- Archivado y búsqueda de contenido en inglés y chino: la salida con timestamps permite indexar y localizar fragmentos concretos dentro de grabaciones extensas.
- Procesamiento por lotes en servidores modestos: las cuantizaciones Q5_K_M (700 MB) y Q6_K (768 MB) permiten desplegar el modelo en máquinas sin GPU dedicada, con un RTF de 1,6 en CPU Ryzen 4750U.

## Benchmarks y rendimiento

WER medido sobre la partición completa LibriSpeech `test-clean` (2620 enunciados en inglés) con normalizador de texto estilo Whisper y jiwer 3.x. Las marcas de diarización se eliminan antes de puntuar.

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 1,83 GB | 2,08 % |
| F16 | 1,83 GB | 2,07 % |
| Q8_0 | 987 MB | 1,93 % |
| Q6_K | 768 MB | 1,96 % |
| Q5_K_M | 700 MB | 1,99 % |
| Q4_K_M | 617 MB | 2,59 % |

Referencia del repositorio del autor (bf16, greedy): 2,07 % con intervalo de confianza bootstrap del 95 % de [1,82 %, 2,40 %]. El exceso de Q4_K_M se atribuye a fallos puntuales de cola: 6 salidas vacías, 5 enunciados con deriva de inglés a chino y 1 bucle de repetición de tokens de timestamp.

Rendimiento en tiempo real (RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 28,1 |
| Apple M4 Max | CPU | 5,8 |
| AMD Ryzen 4750U | Vulkan | 3,0 |
| AMD Ryzen 4750U | CPU | 1,6 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,6 GB para Q4_K_M, 0,7 GB para Q5_K_M, 0,8 GB para Q6_K, 1,0 GB para Q8_0 y 1,9 GB para BF16/F16, sin contar overhead del runtime.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; no se especifican requisitos de A100 o H100 porque el modelo está pensado para ejecución local.
- Cabe en GPU de consumo: sí, con cuantizaciones de 4 a 8 bits en tarjetas con 2 GB o más de VRAM; también en CPU.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake y binario `transcribe-cli`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 28,1 en Metal sobre M4 Max, 5,8 en CPU sobre M4 Max, 3,0 en Vulkan sobre Ryzen 4750U y 1,6 en CPU sobre Ryzen 4750U.
- Requisito de entrada: WAV mono a 16 kHz; conversión previa con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Diarización | Licencia | Formato |
|---|---|---|---|---|---|
| MOSS-Transcribe-Diarize (este) | 0,9B | en, zh | Sí, end-to-end | Apache-2.0 | GGUF, safetensors |
| Whisper Medium | 769M | multilingüe | No nativa | MIT | safetensors, GGUF vía terceros |
| Whisper Large-v3 | 1,55B | multilingüe | No nativa | MIT | safetensors, GGUF vía terceros |
| Qwen3-ASR | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada. La ventaja diferencial de MOSS-Transcribe-Diarize frente a Whisper es la diarización integrada en una sola pasada; su limitación es la cobertura de solo dos idiomas frente al carácter multilingüe de Whisper.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no hay soporte para castellano ni otros idiomas.
- No es un modelo de streaming: requiere el audio completo o segmentos cerrados.
- No realiza traducción ni detección automática de idioma.
- Las marcas temporales son únicamente a nivel de segmento, no a nivel de palabra.
- La cuantización Q4_K_M presenta fallos de cola documentados (salidas vacías, deriva de idioma y bucles de repetición); se recomienda Q5_K_M o superior en producción.
- Riesgo de alucinación y de deriva de idioma en audio ruidoso o con solapamiento de hablantes, aunque no se cuantifica en la información disponible.
- No se documentan sesgos específicos del modelo.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar los términos upstream.
- La conversión GGUF está anclada a un commit concreto del modelo base; cambios posteriores en upstream no están reflejados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.
- Requiere compilar transcribe.cpp desde fuente; no hay integración documentada con runtimes ASR convencionales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tryambientai/moss-transcribe-diarize-gguf
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Commit del modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize/commit/d7231bb
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3f5e15c
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moss-transcribe-diarize.md
- Repositorio del autor original: https://github.com/OpenMOSS/MOSS-Transcribe-Diarize
- Paper: https://arxiv.org/abs/2601.01554
