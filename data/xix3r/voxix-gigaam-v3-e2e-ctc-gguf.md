# xix3r/voxix-gigaam-v3-e2e-ctc-gguf

## Resumen

Voxix GigaAM-v3 e2e CTC GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `ai-sage/GigaAM-v3` en su variante `e2e_ctc`, publicada por el usuario `xix3r` para su uso con el motor de inferencia `transcribe.cpp`. El modelo original lo desarrolla el equipo de Sber (ai-sage) y está especializado exclusivamente en ruso, ofreciendo transcripción offline con mayúsculas, puntuación y normalización de texto directamente desde la salida del decoder CTC.

Técnicamente se trata de un encoder Conformer de 16 capas con 220.889.985 parámetros (aproximadamente 220 M) y una cabeza CTC implementada como una convolución 1×1 sobre un tokenizador SentencePiece de 256 piezas. La conversión GGUF permite ejecutar el modelo en CPU y GPU de consumo con un peso que va desde los 174 MB en Q4_K_M hasta los 843 MB en F32, algo relevante para despliegues de transcripción en local, edge o entornos sin GPU dedicada.

Su relevancia actual radica en que ofrece un WER de 5,50 % sobre el split completo de FLEURS ru (775 utterances) con decodificación greedy y sin modelo de lenguaje externo, un resultado que supera al paquete de referencia del autor original (6,93 %) en el mismo manifiesto. La licencia MIT heredada del modelo base facilita su integración comercial, y el ecosistema `transcribe.cpp` aporta backends Metal, Vulkan y CPU con factores de tiempo real (RTF) muy bajos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 16 capas) con cabeza CTC Conv1d 1×1 |
| Parametros totales | 220.889.985 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; el paquete upstream rechaza utterances de más de 25 s sin `transcribe_longform`) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp) |
| Tamano del repo | 0,3 GB |
| Tokenizador | SentencePiece de 256 piezas |
| Entrada de audio | WAV mono a 16 kHz |
| Decodificacion | CTC greedy |
| Timestamps | a nivel de token |
| Streaming | no |
| Traduccion | no |
| Deteccion de idioma | no |

## Arquitectura y entrenamiento

El modelo base GigaAM-v3 es un foundation model basado en Conformer con entre 220 y 240 M de parámetros, preentrenado con el objetivo HuBERT-CTC sobre 700.000 horas de habla rusa. La variante `e2e_ctc` aquí convertida es un modelo ASR afinado con decoder CTC y entrenado de extremo a extremo para producir texto con puntuación y normalización directamente, sin necesidad de un modelo de lenguaje externo ni de post-procesado. La conversión GGUF preserva únicamente la variante `e2e_ctc` del commit upstream `cec030b` (fijado el 2026-05-12), validada contra el paquete de referencia del autor en el commit `42b96d9` de transcribe.cpp.

El entrenamiento de GigaAM-v3 incorpora nuevos datasets internos: conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas. Según el autor original, los modelos rinden de media un 30 % mejor en estos dominios nuevos manteniendo la misma calidad en benchmarks públicos. La familia incluye variantes `ssl`, `ctc`, `rnnt`, `e2e_ctc` y `e2e_rnnt`; esta conversión cubre solo `e2e_ctc`. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de audio ni si hubo etapas de RLHF o DPO (poco habituales en ASR).

## Capacidades

- Transcripción de voz a texto en ruso con mayúsculas, puntuación y normalización de texto de extremo a extremo.
- Decodificación CTC greedy, sin modelo de lenguaje externo.
- Timestamps a nivel de token.
- Inferencia offline, sin dependencia de red.
- Ejecución en CPU y GPU mediante transcribe.cpp con backends Metal, Vulkan y CPU.
- Cuantizaciones agresivas (hasta Q4_K_M, 174 MB) con degradación mínima de WER.
- No soporta streaming.
- No soporta traducción.
- No soporta detección de idioma.
- No soporta tool calling ni function calling (es un modelo ASR, no un LLM).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al ruso.

## Casos de uso

- Transcripción de reuniones y llamadas en ruso: el modelo genera texto con puntuación y mayúsculas directamente, por lo que puede alimentar actas o resúmenes sin post-procesado adicional; su WER de 10,3 % en dominio callcenter lo hace adecuado para conversaciones telefónicas.
- Subtitulado offline de vídeo en ruso: con timestamps a nivel de token y un peso de 174-260 MB, se puede ejecutar en un portátil o en un servidor modesto para generar subtítulos sin enviar audio a la nube.
- Procesamiento por lotes en pipelines de datos: la baja huella de memoria permite transcribir grandes volúmenes de audio en paralelo en CPU, con un RTF de 9 en Ryzen 4750U (CPU) y 30 en Vulkan.
- Asistentes de voz locales en ruso: al ser offline y ligero, encaja en aplicaciones de escritorio o edge donde la privacidad impide usar servicios cloud.
- Accesibilidad y dictado: transcripción de voz a texto para usuarios con movilidad reducida o para herramientas de dictado en ruso, con ejecución en GPU de consumo vía Metal (RTF 112 en M4 Max).
- Archivado y búsqueda de audio: transcripción masiva de grabaciones históricas en ruso para indexación y búsqueda textual, aprovechando la cuantización Q4_K_M para reducir almacenamiento y cómputo.
- Investigación en ASR: como baseline reproducible con WER publicado en FLEURS ru y comparación directa contra el paquete upstream y Whisper.

## Benchmarks y rendimiento

WER sobre FLEURS ru (split completo de 775 utterances, decodificación greedy, sin LM externo):

| Cuantizacion | Tamano | WER FLEURS ru |
|---|---:|---:|
| F32 | 843 MB | 5,50 % |
| F16 | 428 MB | 5,50 % |
| Q8_0 | 260 MB | 5,50 % |
| Q6_K | 216 MB | 5,56 % |
| Q5_K_M | 195 MB | 5,58 % |
| Q4_K_M | 174 MB | 5,57 % |

Comparación con el paquete de referencia del autor original sobre el mismo manifiesto: 6,93 % (la diferencia de 1,4 pp se debe a que upstream rechaza 5 utterances de más de 25 s con `Too long wav file, use 'transcribe_longform' method.`, contabilizadas como errores de deleción al 100 %). En el subconjunto de 770 utterances que ambos decodifican, transcribe.cpp coincide exactamente con upstream. ai-sage no publica WER de FLEURS ru; este número se mide en la conversión.

WER por dominio del modelo base GigaAM-v3 (tabla del autor original):

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| **Media** | **9,2** | **8,4** | **19,4** | **25,1** |

Rendimiento de inferencia (RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 112 |
| Apple M4 Max | CPU | 27 |
| AMD Ryzen 4750U | Vulkan | 30 |
| AMD Ryzen 4750U | CPU | 9 |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en todas las cuantizaciones; F32 requiere ~843 MB de pesos, Q8_0 ~260 MB y Q4_K_M ~174 MB, más overhead mínimo del runtime.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU integrada o dedicada moderna, e incluso en CPU sola.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 112 en M4 Max con Metal, 30 en Ryzen 4750U con Vulkan, 27 en M4 Max con CPU y 9 en Ryzen 4750U con CPU.
- Requisito de entrada: audio WAV mono a 16 kHz; para otras fuentes se recomienda convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | WER ruso (referencia) | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Voxix GigaAM-v3 e2e CTC GGUF | 220,9 M | audio, utterances ≤25 s (sin longform) | 5,50 % FLEURS ru (medido aquí) | MIT | GGUF en HF |
| ai-sage/GigaAM-v3 e2e_ctc (original) | 220-240 M | audio | 6,93 % en el mismo manifiesto (paquete autor) | MIT | PyTorch en HF |
| GigaAM-v3 ctc / rnnt (otras variantes) | 220-240 M | audio | 9,2 % / 8,4 % media multi-dominio (sin puntuación e2e) | MIT | PyTorch en HF |
| Whisper (large-v3, referencia del autor) | no disponible en la información | audio | 25,1 % media multi-dominio | MIT | múltiples formatos |

La comparación directa con Whisper en ruso favorece claramente a GigaAM-v3 en los dominios evaluados por el autor original; en la comparación end-to-end con Whisper-large-v3 usando Gemini 2.5 Pro como juez LLM, los modelos GigaAM-v3 ganan por un margen medio de 70:30.

## Limitaciones y advertencias

- Solo soporta ruso; no es multilingüe ni detecta idioma.
- No soporta streaming: requiere audio completo por utterance.
- El paquete upstream rechaza utterances de más de 25 s sin usar `transcribe_longform`; la conversión GGUF hereda esa restricción de facto en el flujo estándar.
- No traduce: transcribe en ruso, no a otros idiomas.
- Riesgo de alucinación inherente a los modelos CTC en audio con ruido extremo o dominios no vistos; el WER sube a 20,6 % en habla con características atípicas (Disordered Speech).
- No se han publicado análisis de sesgos en la información disponible; al ser un modelo entrenado sobre habla rusa, puede tener peor rendimiento en acentos regionales o hablantes no nativos.
- Licencia MIT heredada del modelo base, lo que permite uso comercial, pero conviene revisar la model card upstream para términos completos.
- El repositorio tiene muy pocas descargas (23) y ningún like, por lo que la validación comunitaria es escasa; la validación numérica se limita a la reportada por el autor de la conversión.
- La fecha de creación indicada (2026-11-13) es futura respecto a la información de referencia; conviene verificar la vigencia del commit upstream fijado.
- No es un LLM: no soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Hugging Face (conversión GGUF): https://huggingface.co/xix3r/voxix-gigaam-v3-e2e-ctc-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v3
- Commit upstream fijado: https://huggingface.co/ai-sage/GigaAM-v3/commit/cec030b
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42b96d9
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/gigaam-v3-e2e-ctc.md
- Repositorio GigaAM (métricas): https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Paper referenciado (arXiv:2506.01192): https://arxiv.org/abs/2506.01192
- Descarga F32: https://huggingface.co/handy-computer/gigaam-v3-e2e-ctc-gguf/resolve/main/gigaam-v3-e2e-ctc-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/gigaam-v3-e2e-ctc-gguf/resolve/main/gigaam-v3-e2e-ctc-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/gigaam-v3-e2e-ctc-gguf/resolve/main/gigaam-v3-e2e-ctc-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/handy-computer/gigaam-v3-e2e-ctc-gguf/resolve/main/gigaam-v3-e2e-ctc-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/handy-computer/gigaam-v3-e2e-ctc-gguf/resolve/main/gigaam-v3-e2e-ctc-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/handy-computer/gigaam-v3-e2e-ctc-gguf/resolve/main/gigaam-v3-e2e-ctc-Q4_K_M.gguf
