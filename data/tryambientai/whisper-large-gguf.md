# tryambientai/whisper-large-gguf

## Resumen

whisper-large-gguf es una conversión al formato GGUF del modelo openai/whisper-large, publicada por el usuario tryambientai para su uso con transcribe.cpp, una implementación en C++ del pipeline de Whisper. El modelo base es el sistema de reconocimiento automático del habla (ASR) y traducción de voz de OpenAI presentado en el paper "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022), entrenado sobre 680.000 horas de audio etiquetado de forma débil.

La relevancia de esta ficha concreta no está en el modelo en sí, sino en el empaquetado: ofrece seis niveles de cuantización (de F32 a Q4_K_M) con pesos listos para ejecutarse sin Python, sobre CPU, Metal o Vulkan, manteniendo un WER en LibriSpeech test-clean entre 2,62 % y 2,74 %, prácticamente idéntico al 2,73 % reportado por OpenAI para el modelo original. El binario cuantizado a Q4_K_M ocupa 950 MB, lo que permite desplegar ASR multilingüe en hardware modesto.

Arquitectónicamente es un transformer encoder-decoder con ventanas de 30 segundos y decodificación por trozos para audio largo. Soporta transcripción multilingüe, detección de idioma y traducción de voz a texto en inglés desde cualquiera de los idiomas soportados. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 1.543.321.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s con decodificacion por trozos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder de tipo sequence-to-sequence. El encoder procesa espectrogramas mel de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para marcas de tiempo, detección de idioma y tarea (transcripción o traducción). El entrenamiento original de OpenAI se realizó sobre 680.000 horas de audio débilmente supervisado, sin fine-tuning específico por dominio, lo que le confiere una capacidad de generalización notable a acentos, ruido y dominios no vistos.

Esta conversión concreta no modifica la arquitectura: se limita a serializar los pesos del checkpoint openai/whisper-large (commit 4ef9b41, fijado el 2026-04-25) en GGUF. La validación numérica se hizo contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp, el 2026-04-26. No hay información sobre RLHF, DPO ni datos adicionales de entrenamiento en esta conversión.

## Capacidades

- Transcripción de voz a texto multilingüe en 99 idiomas, con detección automática de idioma.
- Traducción de voz a texto en inglés desde cualquiera de los idiomas soportados.
- Marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante decodificación por trozos sobre ventanas de 30 s.
- No soporta streaming (`streaming: false` según la model card).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No soporta visión ni audio como entrada más allá del propio audio de voz.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio largo mediante decodificación por trozos y genera marcas de tiempo por segmento, lo que facilita la alineación con notas o actas. Adecuado por su WER bajo (2,6–2,7 % en LibriSpeech test-clean) y su robustez sin fine-tuning.
- Subtitulado automático de vídeo: las marcas de tiempo por segmento permiten generar ficheros de subtítulos sincronizados; el pipeline acepta WAV mono a 16 kHz, convertible desde cualquier formato con ffmpeg.
- Traducción de voz a inglés en atención al cliente internacional: la tarea de traducción integrada convierte audio en cualquier idioma soportado a texto en inglés, útil para centralizar tickets de soporte en un solo idioma.
- Despliegue en dispositivos de borde: la cuantización Q4_K_M ocupa 950 MB y el modelo corre sobre CPU o Vulkan, lo que permite integrarlo en portátiles o mini-PC sin GPU dedicada.
- Archivado y búsqueda de grabaciones: transcripción masiva por lotes con el CLI de transcribe.cpp para indexar audio histórico y habilitar búsqueda por texto.
- Investigación en ASR multilingüe: al ser una conversión fiel del checkpoint original con validación numérica documentada, sirve como referencia reproducible para comparar implementaciones en C++ frente a PyTorch/transformers.
- Generación de actas para accesibilidad: transcripción de clases o charlas con detección automática de idioma, útil en entornos con ponentes en lenguas distintas.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2.620 enunciados), decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback, timestamps de segmento activados):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 5,75 GB | 2,72 % |
| F16 | 2,89 GB | 2,74 % |
| Q8_0 | 1,55 GB | 2,74 % |
| Q6_K | 1,21 GB | 2,62 % |
| Q5_K_M | 1,08 GB | 2,70 % |
| Q4_K_M | 950 MB | 2,67 % |
| Referencia OpenAI (modelo original) | — | 2,73 % |

Rendimiento en tiempo real (RTF, factor de tiempo real; menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 24,9 |
| Apple M4 Max | CPU | 1,5 |
| AMD Ryzen 4750U | Vulkan | 2,1 |
| AMD Ryzen 4750U | CPU | 0,5 |

Nota del autor: las cifras provienen de una única ejecución sobre Metal y las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 pp entre ejecuciones, principalmente por resultados de alucinación en clips cortos cerca del suelo de ruido. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: entre 950 MB (Q4_K_M) y 5,75 GB (F32) para los pesos; el consumo real añade overhead del runtime y buffers de audio.
- GPU recomendadas: cualquier GPU compatible con Metal (Apple Silicon) o Vulkan; no requiere GPU dedicada de gama alta.
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben en GPUs con 2 GB o más de memoria; Q4_K_M y Q5_K_M caben incluso en iGPU con memoria compartida.
- Despliegue: transcribe.cpp (compilación con CMake, binario `transcribe-cli`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: según los RTF medidos, en M4 Max con Metal el RTF es 24,9 y en Ryzen 4750U con Vulkan 2,1; en CPU los RTF son 1,5 y 0,5 respectivamente. La entrada debe ser WAV mono a 16 kHz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---:|---|---|---|
| whisper-large-gguf (esta ficha) | 1.543 M | ventanas de 30 s | 99 | Apache-2.0 | GGUF |
| openai/whisper-large (base) | 1.543 M | ventanas de 30 s | 99 | Apache-2.0 | safetensors / PyTorch |
| openai/whisper-large-v2 | 1.543 M | ventanas de 30 s | 99 | Apache-2.0 | safetensors / PyTorch |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativos entre estas variantes más allá del WER de LibriSpeech test-clean del modelo base (2,73 %). La diferencia principal de esta conversión frente al modelo original es el formato GGUF y la ejecución en C++ sin dependencias de Python, con pérdida de precisión despreciable en las cuantizaciones Q6_K, Q5_K_M y Q4_K_M.

## Limitaciones y advertencias

- Riesgo de alucinación en clips cortos o con ruido de fondo: el propio autor señala que las variaciones de WER entre ejecuciones se deben principalmente a alucinaciones cerca del suelo de ruido.
- No soporta streaming: la model card indica `streaming: false`, por lo que no es adecuado para transcripción en tiempo real continua sin trocear el audio.
- Ventana fija de 30 s: el audio largo requiere decodificación por trozos, lo que puede introducir errores en las fronteras entre trozos.
- Solo acepta WAV mono a 16 kHz como entrada directa; es necesario convertir con ffmpeg u otra herramienta.
- Sesgos: no se documentan análisis de sesgo específicos en la información disponible; al entrenarse con datos débilmente supervisados de internet, puede heredar sesgos de acentos, variedades dialectales y dominios subrepresentados.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base en openai/whisper-large.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los enlaces de descarga de la model card apuntan al repositorio handy-computer/whisper-large-gguf, no al de tryambientai; conviene verificar la procedencia de los ficheros antes de usarlos en producción.
- No se documenta soporte para otros runtimes (llama.cpp, Ollama, vLLM, TGI); el único runtime validado es transcribe.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tryambientai/whisper-large-gguf
- Modelo base: https://huggingface.co/openai/whisper-large
- Commit del modelo base usado: https://huggingface.co/openai/whisper-large/commit/4ef9b41
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación de transcribe.cpp para whisper-large: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large.md
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
- Repositorio handy-computer/whisper-large-gguf (destino de los enlaces de descarga): https://huggingface.co/handy-computer/whisper-large-gguf
