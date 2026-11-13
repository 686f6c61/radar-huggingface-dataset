# xix3r/voxix-whisper-large-v3-gguf

## Resumen

voxix-whisper-large-v3-gguf es una conversión a formato GGUF del modelo openai/whisper-large-v3, publicada por el usuario xix3r para su uso con transcribe.cpp, una implementación en C++ del pipeline de inferencia de Whisper. No se trata de un modelo nuevo: es una cuantización del checkpoint oficial de OpenAI (commit 06f233f, fijado el 2026-04-25) validada contra la referencia de transformers en la versión 5.6.1 de transcribe.cpp. El modelo base es un transformer encoder-decoder de 1.543.516.688 parámetros (aproximadamente 1.54 mil millones) entrenado por OpenAI para reconocimiento automático de voz y traducción de voz.

La relevancia de esta ficha radica en que permite ejecutar un modelo ASR de referencia en hardware modesto: las cuantizaciones Q4_K_M (951 MB) y Q5_K_M (1.08 GB) reducen el peso a menos de la mitad del F16 (2.88 GB) con una degradación de WER inferior a 0.05 puntos porcentuales en LibriSpeech test-clean. Soporta 99 idiomas, detección de idioma, marcas de tiempo por segmento y traducción de voz a texto en inglés, todo bajo licencia Apache-2.0.

El modelo procesa audio en ventanas de 30 segundos con decodificación por trozos para audio largo, y en esta conversión concreta no soporta streaming (según los metadatos de transcribe.cpp). Es una opción práctica para transcripción por lotes, subtitulado y pipelines de ASR autoalojados donde el coste por hora de audio o la privacidad de los datos son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3); entrada mel de 128 bins |
| Parametros totales | 1.543.516.688 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s con decodificación por trozos para audio largo |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su, yue) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es Whisper large-v3, un transformer encoder-decoder con atención completa estándar, sin mecanismos de atención lineal ni arquitecturas híbridas. La innovación respecto a large-v2 es doble: la entrada de espectrograma pasa de 80 a 128 bins mel, y se añade un token de idioma específico para cantonés (yue). El modelo se entrenó sobre 1 millón de horas de audio débilmente etiquetado y 4 millones de horas de audio pseudo-etiquelado generado con Whisper large-v2, durante 2.0 épocas sobre esa mezcla. Según OpenAI, large-v3 reduce errores entre un 10 % y un 20 % frente a large-v2 en una amplia variedad de idiomas.

Esta conversión concreta no reentrena ni modifica los pesos: aplica cuantización GGUF (bloques de cuantización k-quant para Q4_K_M, Q5_K_M y Q6_K; cuantización de 8 bits para Q8_0) y valida numéricamente contra la implementación de referencia de transformers. El pipeline de transcribe.cpp usa decodificación greedy con suppress_tokens, fallback de temperatura y marcas de tiempo por segmento activadas por defecto, lo que explica parte de la diferencia de WER frente al número autoinformado por OpenAI (2.01 %), que probablemente se midió con `<|notimestamps|>`.

## Capacidades

- Transcripción de voz a texto multilingüe en 99 idiomas, incluido el cantonés en la familia v3.
- Detección automática de idioma (`lang_detect: true`).
- Traducción de voz a texto en inglés desde cualquier idioma soportado (`translate: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Manejo de audio largo mediante decodificación por trozos sobre ventanas de 30 segundos.
- Salida de texto plano; no genera diarización de hablantes ni etiquetas de hablante.
- No soporta streaming en esta conversión (`streaming: false`).
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo puramente ASR.
- No procesa vídeo, imágenes ni audio en tiempo real; requiere audio de entrada en WAV mono a 16 kHz (o conversión previa con ffmpeg).

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas: el modelo procesa audio largo mediante ventanas de 30 s con decodificación por trozos, y las cuantizaciones Q4_K_M/Q5_K_M permiten ejecutarlo en servidores sin GPU dedicada con un coste de memoria inferior a 1.1 GB.
- Subtitulado automático de vídeo: la salida con marcas de tiempo por segmento se puede convertir directamente a formato SRT/VTT, y la detección de idioma evita configurar manualmente el idioma de origen en catálogos multilingües.
- Generación de actas y notas de voz: transcripción de grabaciones de móvil o reuniones en castellano, catalán, euskera, gallego y otros idiomas del catálogo, con la ventaja de que el modelo es Apache-2.0 y puede desplegarse on-premise sin enviar audio a terceros.
- Traducción de contenido audiovisual al inglés: la tarea `translate` convierte audio en cualquier idioma soportado a texto en inglés, útil para indexar o publicar material en mercados anglófonos sin un pipeline separado de traducción.
- Investigación en ASR y evaluación de cuantizaciones: al incluir cinco niveles de cuantización con WER medido sobre el mismo split (LibriSpeech test-clean, 2620 utterances), sirve como banco de pruebas reproducible para estudiar el impacto de la cuantización en calidad.
- Integración en aplicaciones de escritorio o edge: con 951 MB en Q4_K_M y soporte de Metal y Vulkan en transcribe.cpp, cabe en portátiles y equipos con GPU integrada para dictado o transcripción local sin conexión.
- Cumplimiento y archivado de llamadas: transcripción de grabaciones de atención al cliente en entornos regulados donde el audio no puede salir de la infraestructura propia, gracias a la licencia permisiva y al despliegue local.

## Benchmarks y rendimiento

Datos publicados en la model card de esta conversión, medidos sobre el split completo de LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, fallback de temperatura, timestamps por segmento):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F16 | 2.88 GB | 1.81 % |
| Q8_0 | 1.55 GB | 1.82 % |
| Q6_K | 1.21 GB | 1.83 % |
| Q5_K_M | 1.08 GB | 1.84 % |
| Q4_K_M | 951 MB | 1.86 % |
| Referencia OpenAI (large-v3) | — | 2.01 % (autoinformado) |

Rendimiento en tiempo real (RTF, del inglés *real-time factor*; valores mayores indican más rápido que tiempo real):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 23.6 |
| AMD Ryzen 7 4750U | Vulkan | 2.1 |
| Apple M4 Max | CPU | 1.5 |
| AMD Ryzen 7 4750U | CPU | 0.6 |

Nota del autor: los números provienen de una única ejecución con backend Metal; las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0.1 pp entre ejecuciones, principalmente por resultados de alucinación en clips cortos cerca del suelo de ruido. No se han publicado resultados de MMLU, HumanEval ni GSM8K porque el modelo no es un LLM.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más overhead. Q4_K_M ~1 GB, Q5_K_M ~1.1 GB, Q6_K ~1.2 GB, Q8_0 ~1.6 GB, F16 ~2.9 GB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente; el modelo no requiere A100 ni H100. En CPU funciona, pero con RTF de 0.6 en un Ryzen 7 4750U, es decir, más lento que tiempo real en ese hardware.
- Cabe en GPU de consumo: sí, en cualquier GPU con 2-4 GB de memoria libre, incluidas integradas con Vulkan. En Apple Silicon se recomienda el backend Metal, que alcanza RTF 23.6 en M4 Max.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y librería), compilado con CMake. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que esos ecosistemas están orientados a LLM y no a Whisper.
- Latencia y throughput: según los RTF anteriores, en M4 Max con Metal se procesa audio unas 23.6 veces más rápido que tiempo real; en Ryzen 7 4750U con Vulkan, 2.1 veces; en CPU de ese mismo equipo, 0.6 veces (más lento que tiempo real). El throughput absoluto depende de la duración del audio y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| voxix-whisper-large-v3-gguf (esta ficha) | 1.54 B | 99 | GGUF (transcribe.cpp) | Apache-2.0 | Cuantizaciones de 951 MB a 2.88 GB; WER 1.81-1.86 % en LibriSpeech test-clean |
| openai/whisper-large-v3 (original) | 1.54 B | 99 | safetensors (transformers) | Apache-2.0 | Referencia; WER autoinformado 2.01 % en el mismo split; requiere PyTorch |
| openai/whisper-large-v2 | 1.55 B | 99 (sin cantonés) | safetensors | Apache-2.0 | Entrada mel de 80 bins; large-v3 reduce errores un 10-20 % según OpenAI |
| whisper.cpp (conversiones GGUF de Whisper) | 1.54 B | 99 | GGUF (whisper.cpp) | Apache-2.0 | Ecosistema alternativo de inferencia en C++; no compatible directamente con transcribe.cpp |

No se dispone de datos de benchmarks comparativos directos entre esta conversión y whisper.cpp en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: la calidad depende del checkpoint base y del nivel de cuantización elegido; Q4_K_M introduce una degradación medible aunque pequeña (1.86 % frente a 1.81 % en F16).
- Riesgo de alucinación en clips cortos o con ruido de fondo, documentado por el propio autor como causa principal de la variación de WER entre ejecuciones.
- No soporta streaming: no es apto para transcripción en tiempo real con esta conversión; requiere audio completo o troceado manual.
- Marcas de tiempo solo a nivel de segmento, no a nivel de palabra; insuficiente para aplicaciones que necesiten alineación fina.
- Sin diarización de hablantes: no distingue quién habla en una conversación multi-participante.
- Requiere audio de entrada en WAV mono a 16 kHz; cualquier otro formato necesita conversión previa con ffmpeg u otra herramienta.
- El rendimiento en CPU puede ser inferior al tiempo real en equipos modestos (RTF 0.6 en Ryzen 7 4750U), lo que limita su uso en servidores sin GPU.
- Sesgos: al ser un modelo entrenado con datos web a gran escala, puede presentar sesgos de dominio y peor rendimiento en acentos, dialectos o jerga poco representados, y en audio con ruido o solapamiento de voces.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card original de OpenAI para términos completos y citar adecuadamente el modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción ni de mantenimiento continuado por parte del autor de la conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xix3r/voxix-whisper-large-v3-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Commit del modelo base referenciado: https://huggingface.co/openai/whisper-large-v3/commit/06f233f
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Versión validada de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página de modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v3.md
- Paper de Whisper: https://huggingface.co/papers/2212.04356
- Conversión de referencia en handy-computer: https://huggingface.co/handy-computer/whisper-large-v3-gguf
