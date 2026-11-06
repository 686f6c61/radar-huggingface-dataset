# tryambientai/gigaam-v3-e2e-ctc-gguf

## Resumen

GigaAM-v3-e2e-ctc-gguf es una conversión al formato GGUF del modelo `ai-sage/GigaAM-v3` en su variante `e2e_ctc`, un sistema de reconocimiento automático del habla (ASR) especializado en ruso. El modelo original lo desarrolla el equipo de Salute (Sber) y se distribuye bajo licencia MIT. Esta conversión concreta la publica el usuario `tryambientai` para su uso con la librería `transcribe.cpp`, una implementación en C++ pensada para inferencia local y offline.

El modelo resuelve el problema de transcripción de audio a texto en ruso con salida directa en minúsculas y mayúsculas, con puntuación y normalización de texto, sin necesidad de un modelo de lenguaje externo. Con 220.889.985 parámetros, es un modelo compacto que cabe en cualquier equipo moderno, incluso en CPU, y está optimizado para despliegues donde no se dispone de GPU o donde se prioriza la privacidad y el funcionamiento sin conexión.

Su relevancia actual radica en dos factores: por un lado, la familia GigaAM-v3 declara mejoras de aproximadamente un 30% en dominios difíciles (conversaciones de call center, habla natural, habla con música de fondo y habla atípica) frente a generaciones anteriores; por otro, la disponibilidad en GGUF con cuantizaciones agresivas (hasta Q4_K_M con 174 MB) permite ejecutar ASR de calidad competitiva en hardware muy modesto, algo poco habitual en modelos de reconocimiento de voz con soporte de puntuación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 16 capas) con cabeza CTC Conv1d 1×1 |
| Parámetros totales | 220.889.985 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de audio; el modelo base rechaza utterances de más de 25 s en el paquete del autor) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Tokenizador | SentencePiece de 256 piezas |
| Entrada de audio | WAV mono a 16 kHz |
| Decodificación | CTC greedy |
| Librería | transcribe.cpp |
| Tamaño del repo | 0.3 GB |

## Arquitectura y entrenamiento

El modelo es un encoder Conformer de 16 capas con una cabeza CTC basada en una convolución 1×1 (`Conv1d`) que proyecta las representaciones del encoder al vocabulario de 256 piezas del tokenizador SentencePiece. La decodificación es CTC greedy, sin modelo de lenguaje externo ni beam search, lo que simplifica el despliegue y reduce la latencia. La variante `e2e_ctc` del modelo base está entrenada para producir directamente texto con puntuación y normalización, a diferencia de las variantes `ctc` y `rnnt` puras.

El modelo base GigaAM-v3 se preentrena con el objetivo HuBERT-CTC sobre 700.000 horas de habla rusa (variante `ssl`) y después se afina para ASR. El entrenamiento incorpora conjuntos de datos internos nuevos: conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas. Según la model card original, estas incorporaciones mejoran el rendimiento un 30% de media en esos dominios manteniendo la calidad en benchmarks públicos. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO; el modelo es un ASR, por lo que esas técnicas no son el mecanismo habitual de ajuste.

La conversión a GGUF se realizó desde el commit `cec030b` del modelo base, fijado el 2026-05-12, y se validó contra el paquete de referencia del autor en el commit `42b96d9` de `transcribe.cpp` en la misma fecha.

## Capacidades

- Transcripción de voz a texto en ruso, offline, con decodificación CTC greedy.
- Salida con mayúsculas, minúsculas, puntuación y normalización de texto de forma nativa (variante end-to-end).
- Manejo de audio mono a 16 kHz; requiere conversión previa con `ffmpeg` si el audio no cumple ese formato.
- Timestamps a nivel de token (`timestamps: token` según los metadatos de la model card).
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No es un modelo multimodal ni de texto generativo: su única tarea es ASR.
- No dispone de tool calling, function calling ni capacidades de agente.

## Casos de uso

- Transcripción de reuniones y entrevistas en ruso: el modelo procesa audio de 16 kHz mono y devuelve texto punteado y normalizado, adecuado para actas automáticas en entornos donde no se puede enviar audio a la nube. Su tamaño reducido permite ejecutarlo en el propio portátil del usuario.
- Subtitulado de contenido audiovisual en ruso: con timestamps a nivel de token, se pueden generar subtítulos alineados con el audio. La cuantización Q8_0 (260 MB) mantiene el WER en 5,50% y es una opción práctica para pipelines de postproducción.
- Análisis de llamadas de call center: el modelo base declara un WER de 10,3% en el dominio de callcenter (variante V3_CTC), muy por debajo de Whisper (23,9%) y de T-One + LM (13,5%). La conversión GGUF permite desplegar la transcripción en servidores sin GPU dedicada.
- Dictado por voz en aplicaciones de escritorio: con Q4_K_M (174 MB) y un factor de tiempo real (RTF) de 112 en Metal sobre un M4 Max y de 27 en CPU, la latencia es compatible con dictado interactivo en equipos de consumo.
- Indexación y búsqueda de archivos de audio en ruso: transcripción por lotes en un servidor con CPU para construir un índice de texto searchable sobre archivos históricos, sin coste de API y con plena privacidad.
- Investigación en ASR para ruso: el modelo sirve como línea base reproducible con WER medido sobre FLEURS ru (775 utterances) y comparaciones documentadas frente a Whisper y T-One, útil para experimentos académicos con recursos limitados.
- Transcripción en entornos aislados o air-gapped: al ser un binario C++ con pesos GGUF, se puede desplegar en sistemas sin acceso a internet ni dependencias de Python, algo relevante en entornos industriales o de defensa.

## Benchmarks y rendimiento

WER medido sobre el split de test completo de FLEURS ru (775 utterances), decodificación greedy y sin modelo de lenguaje externo. La referencia F32 es 5,50%.

| Cuantización | Tamaño | WER FLEURS ru |
|---|---:|---:|
| F32 | 843 MB | 5,50% |
| F16 | 428 MB | 5,50% |
| Q8_0 | 260 MB | 5,50% |
| Q6_K | 216 MB | 5,56% |
| Q5_K_M | 195 MB | 5,58% |
| Q4_K_M | 174 MB | 5,57% |

Comparación del paquete del autor sobre el mismo manifiesto: 6,93% de WER. La diferencia de 1,4 puntos porcentuales se debe a que el paquete del autor rechaza 5 utterances largas (más de 25 s) con el mensaje `Too long wav file, use 'transcribe_longform' method.`, contabilizadas como errores de borrado al 100%. Sobre el subconjunto de 770 utterances que ambos decodifican, `transcribe.cpp` coincide exactamente con el paquete del autor. ai-sage no publica un WER de FLEURS ru; esta cifra la mide el conversor.

Rendimiento (factor de tiempo real, RTF):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 112 |
| Apple M4 Max | CPU | 27 |
| Ryzen 4750U | Vulkan | 30 |
| Ryzen 4750U | CPU | 9 |

WER por dominio del modelo base GigaAM-v3 (variante V3_CTC, no directamente la conversión GGUF):

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| **Media** | **9,2** | **8,4** | **19,4** | **25,1** |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones. F32 ocupa 843 MB, F16 428 MB, Q8_0 260 MB y Q4_K_M 174 MB. No requiere GPU para funcionar.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente. No se necesita A100 ni H100; el modelo está pensado para hardware de consumo.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU integrada. También funciona en CPU.
- Opciones de despliegue: `transcribe.cpp` (compilación con CMake, binario `transcribe-cli`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 112 con Metal en M4 Max, 27 con CPU en M4 Max, 30 con Vulkan en Ryzen 4750U y 9 con CPU en Ryzen 4750U. Un RTF de 112 implica procesar unas 112 veces más rápido que tiempo real en ese hardware.
- Conversión de audio previa necesaria: `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | Formato | WER ruso (referencia) |
|---|---|---|---|---|---|---|
| GigaAM-v3-e2e-ctc (esta conversión) | 220,9 M | utterances; rechaza >25 s en paquete del autor | ru | MIT | GGUF | 5,50% FLEURS ru (medido aquí) |
| Whisper large-v3 | 1.550 M | 30 s por ventana | multilingüe | MIT | safetensors, GGUF, etc. | 12,0% Open Datasets; 25,1% media por dominio (según tabla de ai-sage) |
| T-One + LM | No disponible | No disponible | ru | No disponible | No disponible | 19,4% media por dominio (según tabla de ai-sage) |
| GigaAM-v3 V3_RNNT (modelo base, otra variante) | 220–240 M | utterances | ru | MIT | safetensors (formato del modelo base) | 8,4% media por dominio |

La comparación directa con Whisper large-v3 debe tomarse con cautela: la tabla de dominios la publica ai-sage y compara la variante V3_CTC con Whisper, no esta conversión GGUF concreta. En FLEURS ru, el único dato medido de forma independiente en esta ficha es el 5,50% de la conversión GGUF.

## Limitaciones y advertencias

- Solo ruso: no detecta idioma ni traduce. Introducir audio en otro idioma producirá transcripciones incorrectas sin aviso.
- Sin streaming: el modelo procesa el audio completo de una vez. No es adecuado para transcripción en tiempo real continua sin segmentación previa.
- Límite de duración: el paquete del autor rechaza utterances de más de 25 s; en `transcribe.cpp` se necesita `transcribe_longform` para audio largo. La conversión no documenta el comportamiento exacto con audios muy largos.
- Riesgo de alucinación y errores en dominios difíciles: el WER sube al 20,6% en habla con características atípicas (Disordered Speech) y al 10,3% en call center según la tabla del modelo base. No es un modelo de propósito general para audio ruidoso sin evaluación previa.
- Sin modelo de lenguaje externo: la decodificación greedy CTC puede producir errores de puntuación y normalización en casos límite; la variante e2e mitiga esto pero no lo elimina.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero se hereda del modelo base y conviene revisar la model card original de `ai-sage/GigaAM-v3` para los términos completos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: la conversión es reciente y no tiene validación comunitaria amplia. La validación numérica se hizo contra el paquete del autor en una fecha concreta (2026-05-12), pero no hay garantía de mantenimiento.
- Dependencia de `transcribe.cpp`: no es un modelo utilizable directamente con `transformers` ni con llama.cpp; requiere compilar la librería desde el código fuente.
- Sin soporte de tool calling, agentes ni generación de texto: no debe confundirse con un LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tryambientai/gigaam-v3-e2e-ctc-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v3
- Commit del modelo base usado: https://huggingface.co/ai-sage/GigaAM-v3/commit/cec030b
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42b96d9
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/gigaam-v3-e2e-ctc.md
- Repositorio GigaAM de Salute: https://github.com/salute-developers/GigaAM
- Métricas de evaluación de GigaAM: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Paper referenciado (arXiv:2506.01192): https://arxiv.org/abs/2506.01192
- Descarga F32: https://huggingface.co/handy-computer/gigaam-v3-e2e-ctc-gguf/resolve/main/gigaam-v3-e2e-ctc-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/gigaam-v3-e2e-ctc-gguf/resolve/main/gigaam-v3-e2e-ctc-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/gigaam-v3-e2e-ctc-gguf/resolve/main/gigaam-v3-e2e-ctc-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/handy-computer/gigaam-v3-e2e-ctc-gguf/resolve/main/gigaam-v3-e2e-ctc-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/handy-computer/gigaam-v3-e2e-ctc-gguf/resolve/main/gigaam-v3-e2e-ctc-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/handy-computer/gigaam-v3-e2e-ctc-gguf/resolve/main/gigaam-v3-e2e-ctc-Q4_K_M.gguf
