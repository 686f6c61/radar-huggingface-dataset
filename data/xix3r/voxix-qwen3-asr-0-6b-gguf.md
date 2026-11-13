# xix3r/voxix-Qwen3-ASR-0.6B-gguf

## Resumen

voxix-Qwen3-ASR-0.6B-gguf es una conversión a formato GGUF del modelo Qwen3-ASR-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba. Se trata de un sistema de reconocimiento automático del habla (ASR) multilingüe que combina un codificador de audio bidireccional de 18 capas con un modelo de lenguaje causal Qwen3 de 28 capas, mediante inyección de tokens de audio en la secuencia de texto (sin atención cruzada). El modelo detecta automáticamente el idioma del audio y emite la transcripción en ese mismo idioma.

La conversión la firma el usuario xix3r y está empaquetada para la librería transcribe.cpp, una implementación en C++ orientada a inferencia local eficiente. El modelo base cuenta con 782.452.240 parámetros reales (etiquetado comercialmente como "0.6B") y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Su relevancia radica en ofrecer ASR multilingüe de alta calidad (WER del 2,11 % en LibriSpeech test-clean con cuantización Q8_0) en un paquete de menos de 1 GB que puede ejecutarse en CPU y GPU de consumo.

El repositorio ocupa 5,9 GB e incluye múltiples cuantizaciones (BF16, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M). El modelo está validado contra la referencia qwen_asr 0.0.6 y el commit 3f61df7 de transcribe.cpp, con el commit upstream 5eb1441 fijado el 2026-04-19. Soporta 30 idiomas según los metadatos del repositorio, aunque la model card original del modelo base menciona 52 idiomas y dialectos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de audio bidireccional (18 capas) + LM causal Qwen3 (28 capas) con inyección de tokens de audio; sin atención cruzada |
| Parámetros totales | 782.452.240 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 30 según metadatos del repo (zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk); la model card upstream menciona 52 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida audio-texto: un codificador de audio bidireccional de 18 capas procesa la señal acústica y genera representaciones que se inyectan como tokens en la secuencia de entrada de un LM causal Qwen3 de 28 capas. A diferencia de los enfoques clásicos tipo Whisper, no emplea atención cruzada entre modalidades, sino una secuencia fusionada de audio y texto. El modelo base Qwen3-ASR se entrenó con datos de habla a gran escala aprovechando la capacidad de comprensión auditiva de Qwen3-Omni, según la model card upstream.

La conversión a GGUF está fijada al commit upstream 5eb1441 (2026-04-19) y validada contra la referencia qwen_asr 0.0.6 en el commit 3f61df7 de transcribe.cpp (2026-04-20). El proceso de cuantización mantiene una degradación mínima: BF16, F16, Q8_0 y Q6_K quedan dentro del intervalo de confianza bootstrap entre sí, mientras que Q5_K_M y Q4_K_M muestran una regresión pequeña pero real atribuida al embedding de tokens y la cabeza de salida compartidos (tied token-embedding / head). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) offline multilingüe sobre audio de 16 kHz mono WAV.
- Detección automática del idioma del audio (`lang_detect: true`) entre los 30 idiomas declarados en el repositorio.
- Transcripción en el mismo idioma detectado (no traducción: `translate: false`).
- Soporte de caracteres chinos, cantonés, japonés, coreano, tailandés y otros sistemas de escritura no latinos, evaluados con CER en lugar de WER.
- Inferencia local en CPU y GPU mediante transcribe.cpp (backend Metal y Vulkan disponibles).
- No soporta streaming (`streaming: false`) ni generación de marcas de tiempo (`timestamps: none`).
- No dispone de tool calling, function calling ni capacidades de agente; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio de 16 kHz mono y genera transcripciones en el idioma detectado, adecuado para actas automáticas en entornos multilingües donde los participantes alternan idiomas.
- Subtitulado de contenido audiovisual: conversión previa con ffmpeg a WAV 16 kHz mono y transcripción por segmentos; la ausencia de timestamps obliga a segmentar el audio externamente.
- Dictado y accesibilidad: integración en aplicaciones de escritorio que convierten voz a texto en local, sin enviar audio a servicios en la nube, gracias al tamaño reducido (590 MB en Q4_K_M) y a la licencia Apache-2.0.
- Procesamiento por lotes en servidores sin GPU: con un RTF de 5,29 en CPU (Ryzen 4750U) y 18,66 en CPU (M4 Max), el modelo puede transcribir archivos en pipelines batch en hardware modesto.
- Investigación en ASR multilingüe: modelo de referencia ligero para comparar WER/CER entre idiomas (por ejemplo, WER del 4,23 % en inglés frente al 56,24 % en húngaro en FLEURS), útil para estudiar el sesgo lingüístico.
- Transcripción en dispositivos edge: el formato GGUF y la inferencia en C++ permiten desplegarlo en equipos con aceleración Metal (RTF 69,26 en M4 Max) o Vulkan (RTF 9,71 en Ryzen 4750U) sin dependencias de Python.
- Análisis de llamadas de atención al cliente: transcripción local de grabaciones para su posterior análisis de sentimiento o extracción de entidades, con cumplimiento de privacidad al no salir el audio del sistema.

## Benchmarks y rendimiento

WER en LibriSpeech test-clean (2.620 utterances, batch size 1, sin timestamps, normalizador de texto inglés estilo Whisper, jiwer 3.x, Apple M4):

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 1,57 GB | 2,12 % |
| F16 | 1,58 GB | 2,12 % |
| Q8_0 | 850 MB | 2,11 % |
| Q6_K | 690 MB | 2,11 % |
| Q5_K_M | 645 MB | 2,21 % |
| Q4_K_M | 590 MB | 2,26 % |

WER/CER en FLEURS con cuantización Q8_0:

| Idioma | Métrica | Valor |
|---|---|---:|
| en | WER | 4,23 % |
| es | WER | 4,88 % |
| it | WER | 5,19 % |
| pt | WER | 6,57 % |
| de | WER | 6,80 % |
| fr | WER | 7,76 % |
| id | WER | 8,49 % |
| vi | WER | 9,32 % |
| ru | WER | 10,30 % |
| hi | WER | 12,68 % |
| nl | WER | 13,90 % |
| tr | WER | 16,74 % |
| ms | WER | 17,18 % |
| ar | WER | 24,51 % |
| pl | WER | 25,06 % |
| mk | WER | 35,09 % |
| fil | WER | 35,43 % |
| sv | WER | 35,72 % |
| da | WER | 36,07 % |
| ro | WER | 40,65 % |
| cs | WER | 44,50 % |
| fi | WER | 46,49 % |
| el | WER | 49,12 % |
| fa | WER | 50,30 % |
| hu | WER | 56,24 % |
| zh | CER | 7,57 % |
| yue | CER | 7,91 % |
| ja | CER | 8,61 % |
| th | CER | 8,81 % |
| ko | CER | 5,82 % |

Rendimiento (RTF, real-time factor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | CPU | 18,66 |
| Apple M4 Max | Metal | 69,26 |
| AMD Ryzen 4750U | CPU | 5,29 |
| AMD Ryzen 4750U | Vulkan | 9,71 |

No se han publicado resultados comparativos con otros modelos ASR en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,6-1,7 GB según cuantización (Q4_K_M 590 MB, Q8_0 850 MB, BF16 1,57 GB).
- Cabe en cualquier GPU de consumo moderna: RTX 3060, RTX 4060, RTX 4090, así como en GPUs integradas con soporte Vulkan.
- Funciona en CPU sin GPU: RTF de 5,29 en un Ryzen 4750U y 18,66 en un Apple M4 Max (CPU).
- Aceleración en Apple Silicon vía Metal (RTF 69,26 en M4 Max) y en GPUs AMD/Intel vía Vulkan (RTF 9,71 en Ryzen 4750U).
- Despliegue mediante transcribe.cpp (compilación con CMake y binario `transcribe-cli`); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Requiere audio de entrada en WAV mono a 16 kHz; conversión previa con ffmpeg si es necesario.
- No soporta streaming, por lo que la latencia se mide por archivo completo, no por fragmentos en tiempo real.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos (Whisper, otros ASR de tamaño similar) para establecer una comparativa cuantitativa. A continuación se indican los datos conocidos del modelo frente a referencias genéricas de la categoría, marcando como no disponible lo que no se ha podido verificar:

| Modelo | Parámetros | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---|---:|---|---|---:|
| voxix-Qwen3-ASR-0.6B-gguf | 782 M | 30 (repo) / 52 (upstream) | Apache-2.0 | GGUF | 2,11 % (Q8_0) |
| Whisper large-v3 | no disponible en la información | no disponible | MIT (según conocimiento general, no verificado aquí) | no disponible | no disponible |
| Whisper small | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Otros ASR ligeros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han podido verificar en la información proporcionada los datos de los modelos alternativos; se recomienda consultar las fichas oficiales de cada modelo antes de tomar una decisión.

## Limitaciones y advertencias

- El modelo no soporta streaming ni marcas de tiempo; para subtitulado o transcripción en tiempo real se requiere segmentación externa y post-procesado.
- No realiza traducción: solo transcribe en el idioma detectado.
- Rendimiento muy desigual entre idiomas: WER del 4,23 % en inglés frente al 56,24 % en húngaro, 50,30 % en persa o 49,12 % en griego en FLEURS (Q8_0). Los idiomas con escritura no latina se evalúan con CER, no directamente comparable con WER.
- El repositorio declara 30 idiomas, mientras que la model card upstream menciona 52; la cobertura real puede ser menor que la anunciada por el modelo base.
- Las cuantizaciones Q5_K_M y Q4_K_M presentan una regresión medible en WER (2,21 % y 2,26 % frente a 2,11 % en Q8_0) por el embedding y la cabeza compartidos; para máxima precisión conviene usar Q8_0 o superior.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes; no se documentan métricas en condiciones adversas.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar los términos upstream y el archivo NOTICE del repositorio.
- El modelo está validado contra una versión concreta de transcribe.cpp (commit 3f61df7); cambios posteriores en la librería podrían alterar los resultados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación limitado y sin comunidad que reporte incidencias.
- No se dispone de información sobre sesgos demográficos o lingüísticos específicos más allá de las diferencias de WER entre idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-Qwen3-ASR-0.6B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Commit upstream fijado: https://huggingface.co/Qwen/Qwen3-ASR-0.6B/commit/5eb1441
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3f61df7
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/qwen3-asr-0.6b.md
- Repositorio de conversiones de referencia: https://huggingface.co/handy-computer/Qwen3-ASR-0.6B-gguf
- Licencia en el repositorio: https://huggingface.co/handy-computer/Qwen3-ASR-0.6B-gguf/blob/main/LICENSE
- NOTICE del repositorio: https://huggingface.co/handy-computer/Qwen3-ASR-0.6B-gguf/blob/main/NOTICE
- Paper referenciado en tags: arxiv:2601.21337 (no verificado en la información disponible)
