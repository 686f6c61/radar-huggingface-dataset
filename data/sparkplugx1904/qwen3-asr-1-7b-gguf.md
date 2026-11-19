# Sparkplugx1904/Qwen3-ASR-1.7B-gguf

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automatico del habla (ASR) de la familia Qwen3, desarrollado por el equipo Qwen de Alibaba. Este repositorio concreto, publicado por el usuario Sparkplugx1904, contiene conversiones a formato GGUF del modelo original para su uso con transcribe.cpp, una implementacion en C++ orientada a inferencia local y sin dependencias de Python. El modelo resuelve el problema de transcripcion multilingue offline: recibe audio WAV mono a 16 kHz y emite la transcripcion en el idioma detectado, sin necesidad de conexion a servicios en la nube.

La arquitectura es de tipo audio-LLM: un codificador de audio bidireccional que alimenta un modelo de lenguaje causal Qwen3 con inyeccion de tokens de audio. Con 2.038.078.608 parametros totales, el modelo ofrece un margen de cuantizacion mayor que la variante de 0.6B de la misma familia. Detecta automaticamente el idioma del audio entre 30 idiomas y transcribe en ese mismo idioma. La licencia Apache-2.0, heredada del modelo base, permite uso comercial sin restricciones adicionales.

La relevancia de esta publicacion reside en que permite ejecutar un modelo ASR multilingue de calidad en hardware de consumo, sin GPU dedicada, mediante cuantizaciones que van desde BF16 (4,08 GB) hasta Q4_K_M (1,32 GB), con una degradacion minima en la tasa de error de palabras (WER) en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador de audio bidireccional + LM causal Qwen3 con inyeccion de tokens de audio |
| Parametros totales | 2.038.078.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 30: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura audio-LLM compuesta por dos modulos: un codificador de audio bidireccional con `d_model=1024` y 16 cabezas de atencion, y un modelo de lenguaje causal Qwen3 con `hidden_size=2048` e `intermediate_size=6144`. Los tokens de audio se inyectan en el LM, que genera la transcripcion de forma autorregresiva. Esta estructura es la misma que la de la variante de 0.6B, pero con dimensiones mayores en ambos componentes.

Segun la model card del modelo base, el entrenamiento se realizo con datos de habla a gran escala y se apoya en la capacidad de comprension de audio de la familia Qwen3. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo soporta deteccion automatica de idioma (`lang_detect: true`), pero no soporta streaming ni traduccion (`streaming: false`, `translate: false`). Esta version GGUF fue portada desde el commit upstream 7278e1e (fijado el 2026-04-19) y validada contra la referencia qwen_asr 0.0.6 en el commit 3f61df7 de transcribe.cpp el 2026-04-20.

## Capacidades

- Transcripcion automatica del habla multilingue en 30 idiomas, con deteccion automatica del idioma del audio.
- Generacion de transcripciones en el mismo idioma detectado, sin traduccion a otro idioma.
- Procesamiento offline: no requiere conexion a servicios externos ni APIs.
- Entrada de audio en formato WAV mono a 16 kHz (se requiere conversion previa con ffmpeg para otros formatos).
- Cuantizaciones multiples que permiten ajustar el equilibrio entre precision y footprint de memoria.
- No soporta streaming: procesa el audio completo de una vez.
- No soporta marcas de tiempo (timestamps: none).
- No soporta traduccion automatica.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso, al tratarse de un modelo especializado en ASR.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo procesa grabaciones completas en WAV mono a 16 kHz y genera la transcripcion en el idioma de la reunion, con deteccion automatica si participan hablantes de distintos idiomas. Adecuado para entornos sin conexion o con requisitos de privacidad.
- Subtitulado de contenido audiovisual: integrado en un pipeline que extrae el audio con ffmpeg y lo convierte a 16 kHz mono, permite generar subtitulos en 30 idiomas sin depender de servicios cloud, con la salvedad de que no genera marcas de tiempo.
- Atencion al cliente y centros de llamadas: transcripcion de llamadas grabadas para su posterior analisis, cumplimiento normativo o generacion de resumenes, ejecutable en servidores locales con CPU o GPU de gama media.
- Investigacion en linguistica y procesamiento del habla: el soporte de 30 idiomas, incluidos idiomas de bajos recursos como el yue, fil, mk o el, lo hace util para crear corpus transcritos y estudiar variacion linguistica.
- Asistentes de voz en dispositivos edge: la cuantizacion Q4_K_M (1,32 GB) permite desplegar el modelo en dispositivos con memoria limitada, como mini-PC o sistemas embebidos con CPU, manteniendo un WER competitivo en ingles (1,81% en LibriSpeech test-clean).
- Accesibilidad: generacion de transcripciones en tiempo no real para personas con discapacidad auditiva en entornos presenciales o grabaciones, con la ventaja de funcionar sin conexion y en multiples idiomas.
- Archivado y busqueda de contenido hablado: transcripcion masiva de archivos de audio historicos o corporativos para indexacion y busqueda textual posterior, aprovechando el procesamiento por lotes en CPU.

## Benchmarks y rendimiento

Resultados de WER y CER sobre FLEURS con cuantizacion Q8_0 (salvo donde se indica):

| Benchmark | Metrica | Resultado |
|---|---|---|
| LibriSpeech test-clean (BF16) | WER | 1,62% |
| LibriSpeech test-clean (F16) | WER | 1,62% |
| LibriSpeech test-clean (Q8_0) | WER | 1,62% |
| LibriSpeech test-clean (Q6_K) | WER | 1,65% |
| LibriSpeech test-clean (Q5_K_M) | WER | 1,65% |
| LibriSpeech test-clean (Q4_K_M) | WER | 1,81% |
| FLEURS en | WER | 3,23% |
| FLEURS es | WER | 3,31% |
| FLEURS it | WER | 2,68% |
| FLEURS de | WER | 4,25% |
| FLEURS fr | WER | 4,52% |
| FLEURS pt | WER | 4,37% |
| FLEURS ru | WER | 6,25% |
| FLEURS hi | WER | 7,84% |
| FLEURS id | WER | 5,37% |
| FLEURS vi | WER | 6,15% |
| FLEURS tr | WER | 9,46% |
| FLEURS nl | WER | 7,43% |
| FLEURS ms | WER | 10,42% |
| FLEURS pl | WER | 12,50% |
| FLEURS ar | WER | 14,91% |
| FLEURS mk | WER | 18,22% |
| FLEURS sv | WER | 19,68% |
| FLEURS ro | WER | 20,46% |
| FLEURS da | WER | 21,23% |
| FLEURS cs | WER | 22,97% |
| FLEURS fil | WER | 24,29% |
| FLEURS fi | WER | 25,48% |
| FLEURS fa | WER | 28,29% |
| FLEURS el | WER | 29,22% |
| FLEURS hu | WER | 32,84% |
| FLEURS zh | CER | 7,14% |
| FLEURS ja | CER | 5,29% |
| FLEURS ko | CER | 4,60% |
| FLEURS th | CER | 6,89% |
| FLEURS yue | CER | 6,13% |

Rendimiento de inferencia (factor de tiempo real, RTF):

| Plataforma | Aceleracion | RTF |
|---|---|---|
| Apple M4 Max | CPU | 9,59 |
| Apple M4 Max | Metal | 41,08 |
| AMD Ryzen 7 4750U | CPU | 2,47 |
| AMD Ryzen 7 4750U | Vulkan | 4,08 |

Los valores de RTF indican cuantas veces mas rapido que el tiempo real procesa el audio (mayor es mejor). El WER en LibriSpeech se calculo con el normalizador de texto ingles estilo Whisper y jiwer 3.x sobre el split completo test-clean (2.620 enunciados), con batch size 1 y sin marcas de tiempo.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 1,5 GB con Q4_K_M hasta unos 4,5 GB con BF16/F16, incluyendo overhead de contexto y buffers.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; para BF16 se recomienda 6 GB o mas. Funciona con aceleracion Metal en Apple Silicon y Vulkan en GPUs AMD/Intel.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3050 (4 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) y en Apple Silicon con Metal.
- Tambien funciona en CPU pura: el RTF de 2,47 en un Ryzen 7 4750U indica que procesa audio mas rapido que el tiempo real sin GPU.
- Opciones de despliegue: transcribe.cpp (unica libreria soportada oficialmente para estos GGUF); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el RTF de 9,59 en CPU de M4 Max y 41,08 con Metal implica que una hora de audio se procesa en aproximadamente 6,2 minutos en CPU y 1,5 minutos con Metal. En Ryzen 7 4750U, una hora de audio tarda unos 24 minutos en CPU y unos 14,7 minutos con Vulkan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---|---|---|---|---|---|
| Qwen3-ASR-1.7B (este) | 2,04 B | no disponible | 30 | Apache-2.0 | GGUF | 1,62% (BF16) |
| Qwen3-ASR-0.6B | no disponible en la informacion | no disponible | no disponible | Apache-2.0 (heredada) | safetensors / GGUF | no disponible |
| Whisper large-v3 | no disponible en la informacion | no disponible | no disponible | MIT (segun conocimiento general, no verificado en la informacion) | safetensors / GGUF | no disponible |

La informacion proporcionada solo permite comparar con la variante de 0.6B de la misma familia, de la que se menciona que tiene la misma arquitectura pero dimensiones menores y menos margen de cuantizacion. No se dispone de datos de benchmarks de modelos alternativos en la informacion consultada, por lo que la comparativa cuantitativa con Whisper u otros sistemas ASR no esta disponible.

## Limitaciones y advertencias

- No soporta streaming: debe procesarse el audio completo, lo que impide su uso en transcripcion en tiempo real.
- No genera marcas de tiempo, lo que limita su uso directo para subtitulado sincronizado.
- No soporta traduccion: transcribe en el idioma detectado, pero no traduce a otro idioma.
- El rendimiento es muy desigual entre idiomas: el WER en FLEURS varia desde 2,68% en italiano hasta 32,84% en hungaro, pasando por 29,22% en griego o 28,29% en persa. Los idiomas con escritura no latina se evaluan con CER, no con WER.
- Riesgo de alucinacion: como todo modelo generativo, puede producir texto plausible que no corresponde al audio, especialmente en segmentos con ruido, silencios largos o audio de baja calidad.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al entrenarse con datos a gran escala, es probable que herede sesgos de los corpus utilizados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y el NOTICE. No se imponen restricciones adicionales conocidas.
- Dependencia de transcribe.cpp: estos GGUF no son compatibles con llama.cpp ni con otras herramientas estandar; el ecosistema de despliegue es limitado.
- Requiere audio en WAV mono a 16 kHz: otros formatos necesitan conversion previa con ffmpeg.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente y poco validada por la comunidad.
- La fecha de creacion (2026-11-19) y la referencia al paper arXiv:2601.21337 deben tratarse con cautela; no se ha verificado la existencia de dicho paper en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sparkplugx1904/Qwen3-ASR-1.7B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Commit upstream del modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B/commit/7278e1e
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3f61df7
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/qwen3-asr-1.7b.md
- Repositorio GGUF alternativo (handy-computer): https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf
- Licencia: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf/blob/main/LICENSE
- NOTICE: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf/blob/main/NOTICE
- Paper referenciado en los tags: arXiv:2601.21337 (no verificado en la informacion disponible)
