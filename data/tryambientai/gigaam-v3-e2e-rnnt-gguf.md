# tryambientai/gigaam-v3-e2e-rnnt-gguf

## Resumen

GigaAM-v3-e2e-rnnt-gguf es una conversión a formato GGUF del modelo ai-sage/GigaAM-v3, un sistema de reconocimiento automático del habla (ASR) para ruso desarrollado por el equipo de SaluteDevices (ai-sage). La conversión, mantenida por tryambientai y validada contra el paquete de referencia del autor original, empaqueta la variante `e2e_rnnt` —la versión end-to-end con puntuación y normalización de texto— para su uso con el motor transcribe.cpp, una implementación en C++ centrada en inferencia local eficiente.

El modelo subyacente es un Conformer de 16 capas con 222,5 millones de parámetros, combinado con una cabeza transducer RNN-T para decodificación greedy. Está entrenado sobre datos de habla rusa que incluyen conversaciones de call center, habla natural, audio con música de fondo y habla con características atípicas, lo que le permite cubrir dominios que los sistemas genéricos multilingües tratan con mucha mayor tasa de error. El resultado es un ASR especializado, offline y de huella reducida: la cuantización Q4_K_M ocupa 175 MB y mantiene un WER del 5,36 % en FLEURS ru.

Su relevancia práctica radica en la combinación de especialización lingüística, licencia MIT y despliegue en hardware modesto. Frente a alternativas multilingües de mayor tamaño, ofrece una precisión muy superior en ruso a un coste computacional mínimo, con velocidades de inferencia que superan ampliamente el tiempo real tanto en CPU (factor 8-25) como en GPU integrada vía Vulkan o Metal (factor 22-88).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (16 capas de encoder) + cabeza transducer RNN-T |
| Parametros totales | 222.518.657 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (utterances de hasta 25 s; formato corto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF (transcribe.cpp) |
| Muestreo de audio | 16 kHz mono WAV |
| Tokenizer | SentencePiece, 1024 piezas |
| Decodificacion | RNN-T greedy, sin LM externo |
| Streaming | no |
| Traduccion | no |
| Deteccion de idioma | no |
| Timestamps | a nivel de token |
| Modelo base | ai-sage/GigaAM-v3 (commit ec1dc1f, fijado 2026-05-12) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Conformer: un encoder de 16 capas que combina convoluciones locales con self-attention para capturar dependencias acústicas a corto y largo plazo. Sobre el encoder se sitúa una cabeza RNN-T (transducer) que modela conjuntamente la alineación y la predicción de tokens, lo que permite decodificación greedy sin necesidad de un modelo de lenguaje externo. La variante `e2e_rnnt` añade puntuación y normalización de texto directamente en la salida, de modo que el resultado es ruso con mayúsculas y signos de puntuación, sin postprocesado adicional.

El preentrenamiento del modelo base emplea el objetivo HuBERT-CTC sobre 700.000 horas de habla rusa, seguido de un ajuste fino supervisado para la cabeza CTC y, en esta variante, RNN-T. Los datos de entrenamiento incorporan conjuntos internos nuevos respecto a generaciones anteriores: conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas. Según el autor original, el rendimiento en estos dominios nuevos mejora en torno a un 30 % de media sin degradar los benchmarks públicos. No se especifica en la información disponible si hubo fases de RLHF o DPO; el pipeline descrito es puramente supervisado sobre transcripciones.

La conversión GGUF no introduce cambios arquitectónicos: replica los pesos del modelo base y valida numéricamente contra el paquete de referencia del autor en el commit 42b96d9 de transcribe.cpp. La decodificación es greedy y determinista, sin LM externo, lo que simplifica la reproducibilidad pero limita la corrección de errores contextuales.

## Capacidades

- Transcripción de voz a texto en ruso con salida en minúsculas/mayúsculas y puntuación correctas, sin postprocesado.
- Normalización de texto integrada (variante end-to-end): cifras, abreviaturas y formato conversacional.
- Timestamps a nivel de token, útiles para alineación y subtitulado.
- Robusto en dominios difíciles: call center, habla natural, audio con música de fondo y habla con características atípicas.
- Inferencia offline completa, sin dependencias de red ni servicios externos.
- Ejecución en CPU, Vulkan y Metal mediante transcribe.cpp.
- No soporta streaming: requiere audio completo por utterance.
- No traduce y no detecta idioma; asume ruso en la entrada.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso (es un modelo puramente ASR).

## Casos de uso

- Transcripción de reuniones y llamadas de call center en ruso: el modelo está entrenado específicamente con conversaciones de call center y logra un WER del 9,5 % en ese dominio (frente al 23,9 % de Whisper), por lo que es adecuado para generar actas y analítica de calidad sin intervención manual.
- Subtitulado de vídeo y podcasts en ruso: los timestamps a nivel de token permiten segmentar la salida y alinear subtítulos; el procesamiento offline con factor de tiempo real de 8-88 hace viable procesar horas de audio en minutos.
- Asistentes de voz locales y privados: al ejecutarse íntegramente en el dispositivo con 175-431 MB de pesos, permite dictado y comandos de voz sin enviar audio a la nube, relevante para cumplimiento de privacidad.
- Transcripción de audio con ruido o música de fondo: el entrenamiento incluye habla con música, lo que lo hace apropiado para entornos reales donde los ASR genéricos degradan notablemente.
- Accesibilidad para habla atípica: el modelo reporta un WER del 19,2 % en habla con trastornos (frente al 59,3 % de Whisper), útil en aplicaciones de accesibilidad y logopedia.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: con cuantización Q8_0 (261 MB) y factor de tiempo real de 8 en CPU Ryzen, se pueden transcribir grandes volúmenes en hardware convencional.
- Integración en pipelines de datos: la salida GGUF y la CLI de transcribe.cpp facilitan el encadenamiento con herramientas de extracción de texto, indexación o análisis posterior.

## Benchmarks y rendimiento

WER medido por el conversor sobre el split de test completo de FLEURS ru (775 utterances), decodificación greedy y sin LM externo:

| Cuantizacion | Tamano | WER FLEURS ru |
|---|---:|---:|
| F32 | 849 MB | 5,35 % |
| F16 | 431 MB | 5,35 % |
| Q8_0 | 261 MB | 5,36 % |
| Q6_K | 217 MB | 5,37 % |
| Q5_K_M | 197 MB | 5,42 % |
| Q4_K_M | 175 MB | 5,36 % |

El paquete de referencia del autor original mide 6,78 % en el mismo manifiesto; la diferencia de 1,4 puntos porcentuales se debe a que el paquete upstream rechaza 5 utterances de más de 25 s (contabilizadas como errores de deleción del 100 %). En el subconjunto de 770 utterances que ambos decodifican, transcribe.cpp coincide exactamente con upstream. ai-sage no publica un WER de FLEURS ru; esta cifra es una medición del conversor.

Rendimiento comparativo por dominio del modelo base (WER %):

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| Media | 9,2 | 8,4 | 19,4 | 25,1 |

Factor de tiempo real (RTF) medido por el conversor:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 88 |
| Apple M4 Max | CPU | 25 |
| AMD Ryzen 4750U | Vulkan | 22 |
| AMD Ryzen 4750U | CPU | 8 |

En comparaciones end-to-end de `e2e_ctc` y `e2e_rnnt` frente a Whisper-large-v3, con Gemini 2.5 Pro como juez LLM, los modelos GigaAM-v3 ganan por un margen medio de 70:30, según el autor original.

## Requisitos de hardware

- VRAM estimada: entre 175 MB (Q4_K_M) y 849 MB (F32) para los pesos; el consumo real es ligeramente superior por buffers de activación, pero en ningún caso supera unos pocos cientos de MB adicionales.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente; no requiere A100 ni H100. En M4 Max con Metal se alcanza RTF 88.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna; también funciona exclusivamente en CPU.
- Despliegue: transcribe.cpp (compilación desde fuente con CMake); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo ASR y no un LLM.
- Latencia y throughput: en Ryzen 4750U con CPU, RTF 8 (8 veces más rápido que tiempo real); con Vulkan, RTF 22. En M4 Max, RTF 25 en CPU y 88 en Metal. La cuantización Q8_0 mantiene el WER prácticamente idéntico al F32.
- Preprocesado obligatorio: audio de entrada a 16 kHz mono WAV; conversión con ffmpeg si es necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER ruso (media) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| GigaAM-v3 e2e_rnnt (este) | 222 M | ≤25 s por utterance | 8,4 % | MIT | GGUF, transcribe.cpp |
| GigaAM-v3 ctc (variante) | 220-240 M | ≤25 s por utterance | 9,2 % | MIT | pesos originales |
| T-One + LM | no disponible | no disponible | 19,4 % | no disponible | no disponible |
| Whisper (large-v3) | 1.550 M | 30 s | 25,1 % | MIT | múltiples formatos |

La comparativa se basa en la tabla de dominios publicada por el autor original. GigaAM-v3 e2e_rnnt supera a T-One + LM y a Whisper en todos los dominios evaluados, con una diferencia especialmente marcada en habla con trastornos (19,2 % frente a 51,0 % y 59,3 %) y en call center (9,5 % frente a 13,5 % y 23,9 %). Frente a la variante CTC del mismo modelo, la RNN-T mejora entre 0,4 y 1,4 puntos porcentuales según el conjunto. No se dispone de datos comparativos frente a otros ASR especializados en ruso en la información proporcionada.

## Limitaciones y advertencias

- Solo ruso: no detecta idioma ni traduce; audio en otras lenguas producirá salidas incorrectas o vacías.
- Sin streaming: requiere el utterance completo antes de decodificar; no apto para reconocimiento en tiempo real continuo.
- Límite de 25 s por utterance: los audios más largos deben segmentarse; el paquete upstream rechaza estos casos y transcribe.cpp los maneja según su implementación de longform, no validada en esta ficha.
- Riesgo de alucinación y errores en audio ruidoso, con acentos no rusos o con solapamiento de hablantes; no hay LM externo que corrija contexto.
- Sin diarización de hablantes ni detección de eventos acústicos.
- La licencia MIT se hereda del modelo base; conviene verificar los términos del modelo original ai-sage/GigaAM-v3 para uso comercial, aunque MIT es permisiva.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema pequeño, menor probabilidad de soporte comunitario.
- Validación numérica realizada únicamente contra el paquete de referencia en un commit concreto; cambios en transcribe.cpp pueden alterar resultados.
- Los benchmarks de FLEURS ru son mediciones del conversor, no cifras oficiales del autor original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tryambientai/gigaam-v3-e2e-rnnt-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v3
- Commit del modelo base: https://huggingface.co/ai-sage/GigaAM-v3/commit/ec1dc1f
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/42b96d9
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/gigaam-v3-e2e-rnnt.md
- Repositorio GigaAM (SaluteDevices): https://github.com/salute-developers/GigaAM
- Métricas del modelo original: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Paper referenciado: arXiv:2506.01192
