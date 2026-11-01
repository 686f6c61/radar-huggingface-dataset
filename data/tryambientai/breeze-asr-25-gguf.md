# tryambientai/Breeze-ASR-25-gguf

## Resumen

Breeze-ASR-25-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla MediaTek-Research/Breeze-ASR-25, publicada por el usuario tryambientai para su uso con el runtime transcribe.cpp. El modelo original es un fine-tune de OpenAI Whisper large-v2 desarrollado por MediaTek Research, orientado específicamente al mandarín de Taiwán (con salida en chino tradicional) y al inglés, incluyendo soporte explícito para code-switching mandarín-inglés tanto intra como inter-oracional.

La relevancia de esta conversión radica en que permite ejecutar un modelo ASR de 1.540 millones de parámetros en hardware de consumo mediante cuantización, con pérdidas de precisión prácticamente nulas: todas las variantes hasta Q4_K_M (1,0 GB) se mantienen dentro del ruido entre ejecuciones respecto a la referencia BF16. Esto abre el despliegue local de transcripción bilingüe de calidad sin depender de servicios en la nube.

Arquitectónicamente es idéntico a Whisper large-v2: transformer encoder-decoder con ventanas de 30 segundos y decodificación fragmentada para audio largo. El repositorio ocupa 1,7 GB y se distribuye bajo licencia Apache-2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v2) |
| Parametros totales | 1.543.321.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos con decodificacion fragmentada para audio largo |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Chino (mandarin de Taiwan, salida en tradicional) e ingles; tokenizer de Whisper con 99 idiomas pero solo zh/en optimizados y validados |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Whisper large-v2, un transformer encoder-decoder con ventanas de 30 segundos y decodificación por fragmentos para audio de larga duración. Conserva el tokenizer multilingüe de Whisper (99 idiomas), aunque el ajuste fino se centró exclusivamente en mandarín de Taiwán e inglés. El entrenamiento del modelo original utilizó aproximadamente 11.749 horas de audio: 10.000 horas de mandarín sintético (ODC Synth), 1.738 horas de inglés (CommonVoice17) y 11 horas de code-switching real (NTUML2021).

La innovación principal del modelo original es la mejora en escenarios de mezcla mandarín-inglés (intra e inter-oracional) y una alineación temporal reforzada, adecuada para generación automática de subtítulos. La conversión GGUF se realizó desde el commit `cffe7ccb404d025296a00758d0a33468bec3a9d0` del modelo original (fijado el 2026-06-29) y se validó numéricamente contra la referencia de transformers en el commit `3848875` de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en mandarín de Taiwán (salida en chino tradicional) e inglés.
- Reconocimiento de code-switching mandarín-inglés, tanto dentro de una misma frase como entre frases.
- Detección automática de idioma (lang_detect: true).
- Traducción de voz (translate: true).
- Generación de marcas de tiempo a nivel de segmento (timestamps: segment).
- Alineación temporal mejorada, orientada a subtitulado automático.
- Procesamiento de audio en ventanas de 30 segundos con decodificación fragmentada para grabaciones largas.
- No soporta streaming (streaming: false).

## Casos de uso

- Subtitulado automático de vídeo en mandarín de Taiwán: el modelo genera marcas de tiempo por segmento y salida en chino tradicional, lo que permite producir archivos de subtítulos alineados directamente sin post-procesado de conversión de escritura.
- Transcripción de reuniones bilingües mandarín-inglés: el soporte de code-switching intra e inter-oracional evita los errores típicos de modelos monolingües cuando los hablantes alternan idiomas dentro de la misma intervención.
- Despliegue local en portátiles: la variante Q4_K_M ocupa 1,0 GB y mantiene un CER de 8,08 % en FLEURS zh, lo que permite transcripción offline en equipos sin GPU dedicada mediante transcribe.cpp.
- Generación de actas y notas de voz en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, el audio no sale del dispositivo, algo relevante para sectores sanitarios, legales o corporativos.
- Procesamiento por lotes de archivos de audio: la CLI de transcribe.cpp acepta WAV mono a 16 kHz y permite automatizar la transcripción de grandes volúmenes de grabaciones con un coste de infraestructura mínimo.
- Investigación en ASR multilingüe: el modelo sirve como referencia para estudiar code-switching y para comparar el impacto de la cuantización en la precisión de reconocimiento, dado que el autor publica métricas por cada variante.
- Integración en aplicaciones de accesibilidad: transcripción en tiempo casi real de contenido audiovisual en mandarín para personas con discapacidad auditiva, con marcas de tiempo que facilitan la sincronización.

## Benchmarks y rendimiento

Datos publicados por el autor de la conversión, evaluados sobre las particiones de test completas y decodificados en una Modal L40S con la receta por defecto de transcribe.cpp (greedy con temperature fallback, suppress_tokens, timestamps por segmento, batch 1).

| Cuantizacion | Tamano | WER LibriSpeech test-clean (en) | CER FLEURS zh |
|---|---:|---:|---:|
| BF16 | 3,10 GB | 2,29 % | 8,12 % |
| F16 | 3,11 GB | 2,29 % | 8,11 % |
| Q8_0 | 1,67 GB | 2,27 % | 8,10 % |
| Q6_K | 1,30 GB | 2,29 % | 8,12 % |
| Q5_K_M | 1,16 GB | 2,25 % | 8,12 % |
| Q4_K_M | 1,00 GB | 2,26 % | 8,08 % |

El CER en chino se calcula tras normalizar hipótesis y referencia a chino simplificado con OpenCC (`t2s`), ya que Breeze emite caracteres tradicionales y FLEURS no dispone de partición en tradicional; sin esa normalización el CER bruto ronda el 35 % y carece de significado.

Rendimiento en tiempo real (RTF, menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 23,7 |
| Apple M4 Max | CPU | 1,5 |
| AMD Ryzen 4750U | Vulkan | 2,1 |
| AMD Ryzen 4750U | CPU | 0,6 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,0 GB para Q4_K_M, 1,16 GB para Q5_K_M, 1,30 GB para Q6_K, 1,67 GB para Q8_0 y 3,1 GB para BF16/F16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria para las cuantizaciones pequeñas; el autor validó en una NVIDIA L40S para los benchmarks.
- Cabe en GPU de consumo: sí, todas las cuantizaciones desde Q4_K_M hasta Q8_0 caben en tarjetas con 2-4 GB de VRAM, y las variantes BF16/F16 en GPUs de 4 GB o más.
- Despliegue: transcribe.cpp (runtime específico, compilado con CMake); no se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Backends soportados: Metal (Apple Silicon), Vulkan y CPU.
- Latencia y throughput: RTF de 23,7 en Metal sobre M4 Max, 1,5 en CPU sobre M4 Max, 2,1 en Vulkan sobre Ryzen 4750U y 0,6 en CPU sobre Ryzen 4750U; estos valores indican que la inferencia en CPU puede ser más rápida que en tiempo real según la plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Breeze-ASR-25 (esta ficha) | 1.543 M | Ventanas de 30 s | zh (tradicional), en | Apache-2.0 | GGUF |
| Whisper large-v2 (original) | 1.550 M | Ventanas de 30 s | 99 idiomas | MIT | safetensors, GGUF |
| Whisper large-v3 | no disponible en la informacion | Ventanas de 30 s | 99 idiomas | MIT | safetensors, GGUF |

No se dispone de datos de benchmarks comparativos entre Breeze-ASR-25 y otros modelos ASR en la información proporcionada; los únicos resultados publicados son los del propio modelo frente a su referencia BF16.

## Limitaciones y advertencias

- El modelo está optimizado únicamente para mandarín de Taiwán e inglés; otros idiomas del tokenizer de Whisper son técnicamente accesibles pero quedan fuera del alcance validado y su calidad no está garantizada.
- La salida en chino es siempre en caracteres tradicionales; los flujos que esperen chino simplificado requieren una conversión posterior (por ejemplo, con OpenCC).
- No soporta transcripción en streaming; el procesamiento es por lotes sobre archivos completos.
- El CER en chino (alrededor del 8 %) es notablemente superior al WER en inglés (alrededor del 2,3 %), por lo que la precisión en mandarín es menor.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con silencio, ruido o audio musical.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar la model card original para los términos completos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad.
- El runtime transcribe.cpp debe compilarse desde el código fuente; no se distribuyen binarios precompilados en la información disponible.
- El audio de entrada debe convertirse previamente a WAV mono a 16 kHz.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tryambientai/Breeze-ASR-25-gguf
- Modelo base: https://huggingface.co/MediaTek-Research/Breeze-ASR-25
- Commit del modelo base utilizado: https://huggingface.co/MediaTek-Research/Breeze-ASR-25/commit/cffe7ccb404d025296a00758d0a33468bec3a9d0
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3848875
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v2.md
- Repositorio GitHub del modelo original: https://github.com/mtkresearch/Breeze-ASR-25
- Paper: https://arxiv.org/pdf/2506.11130
- Repositorio de Whisper: https://github.com/openai/whisper
- Ejemplo de code-switching (MediaTek's 24th Anniversary): https://www.youtube.com/watch?v=YkUv5qyhVhw&t=261s
