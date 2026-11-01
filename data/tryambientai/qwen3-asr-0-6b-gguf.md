# tryambientai/Qwen3-ASR-0.6B-gguf

## Resumen

Qwen3-ASR-0.6B es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el equipo Qwen de Alibaba, publicado originalmente como parte de la familia Qwen3-ASR junto con una variante de 1.7B. Este repositorio concreto, `tryambientai/Qwen3-ASR-0.6B-gguf`, es una conversion a formato GGUF del modelo base `Qwen/Qwen3-ASR-0.6B`, empaquetada para su uso con el runtime `transcribe.cpp`. El modelo resuelve el problema de transcripcion de voz a texto multilingue en modo offline, con deteccion automatica del idioma de entrada.

La arquitectura combina un codificador de audio bidireccional de 18 capas con un modelo de lenguaje causal Qwen3 de 28 capas, unidos mediante inyeccion de tokens de audio en una secuencia fusionada (sin atencion cruzada). El modelo total declarado en safetensors es de 782.452.240 parametros, con un repositorio de 0,9 GB. Soporta 30 idiomas y dialectos, y esta licenciado bajo Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que ofrece una relacion precision/eficiencia muy competitiva para un modelo de menos de 1.000 millones de parametros: alcanza un WER del 2,11 % en LibriSpeech test-clean y mantiene la precision incluso en cuantizaciones agresivas como Q6_K y Q8_0, con un rendimiento en tiempo real (RTF) muy alto en hardware de consumo. La conversion a GGUF y el soporte de `transcribe.cpp` lo hacen desplegable en CPU, GPU consumer y Apple Silicon sin necesidad de infraestructura especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio bidireccional de 18 capas + LM causal Qwen3 de 28 capas con inyeccion de tokens de audio (secuencia fusionada, sin atencion cruzada) |
| Parametros totales | 782.452.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 30 idiomas y dialectos: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue un diseno de dos torres fusionadas: un codificador de audio bidireccional de 18 capas procesa la senal de entrada y proyecta los tokens de audio dentro de la secuencia de texto, que es consumida por un LM causal Qwen3 de 28 capas. No emplea atencion cruzada; en su lugar, los tokens de audio se inyectan directamente en la secuencia fusionada de audio y texto. El modelo base Qwen3-ASR se entreno sobre datos de habla a gran escala y hereda la capacidad de comprension de audio de su modelo fundacional Qwen3-Omni. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset, ni confirma el uso de RLHF o DPO.

Una innovacion destacable de la familia es el soporte de inferencia unificada en streaming y offline con un unico modelo, asi como la transcripcion de audio largo. La variante de 1.7B alcanza, segun el autor, 2000 veces de throughput con concurrencia 128. Esta conversion GGUF concreta esta portada desde el commit upstream `5eb144179a02acc5e5ba31e748d22b0cf3e303b0` (fijado el 2026-04-19) y validada contra la referencia `qwen_asr 0.0.6` en el commit `3f61df7` de transcribe.cpp el 2026-04-20. El modelo toma WAV mono a 16 kHz y no soporta pistas de idioma explicitas en esta version.

## Capacidades

- Transcripcion de voz a texto (speech-to-text) offline y multilingue.
- Deteccion automatica del idioma del audio de entrada entre 30 idiomas y dialectos.
- Emision de la transcripcion en el mismo idioma detectado (no traduccion).
- Reconocimiento robusto en entornos acusticos complejos y patrones de texto dificiles, segun el autor.
- Soporte de audio largo (la familia soporta transcripcion de audio extenso).
- No soporta streaming en esta conversion (`streaming: false`).
- No soporta traduccion (`translate: false`).
- No genera timestamps (`timestamps: none`); para alineacion temporal existe un modelo separado, Qwen3-ForcedAligner-0.6B.
- No soporta tool calling ni function calling (es un modelo ASR, no un LLM conversacional).
- No soporta pistas de idioma explicitas en esta version.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo convierte grabaciones de audio en texto en el idioma de la reunion de forma automatica, sin configurar el idioma manualmente, gracias a la deteccion automatica entre 30 idiomas.
- Subtitulado offline de contenido audiovisual: al procesar WAV mono a 16 kHz, puede integrarse en pipelines de postproduccion para generar transcripciones base; requiere un paso posterior de alineacion si se necesitan timestamps.
- Atencion al cliente y centros de llamadas: transcripcion de grabaciones de llamadas multilingues para analisis de calidad y cumplimiento, con la ventaja de que el modelo es pequeno (782 M parametros) y desplegable en CPU.
- Notas de voz y dictado en aplicaciones: integracion en apps de escritorio o moviles mediante transcribe.cpp, con cuantizaciones de 654 MB (Q4_K_M) que caben en dispositivos con poca memoria.
- Investigacion en ASR multilingue: modelo de referencia ligero y de licencia permisiva (Apache-2.0) para experimentos de reconocimiento en 30 idiomas, incluidos idiomas de bajos recursos como fil, mk o yue.
- Archivado y busqueda de contenido hablado: transcripcion masiva de archivos de audio para indexacion y busqueda textual, aprovechando el alto throughput (RTF 65 en Metal sobre M4 Max).
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenido hablado multilingue, con despliegue local que evita enviar audio a servicios en la nube.

## Benchmarks y rendimiento

Resultados de WER en LibriSpeech `test-clean` (2620 enunciados en ingles, normalizador de texto estilo Whisper, jiwer 3.x, backend Metal en Apple M4):

| Cuantizacion | Tamano | WER (LibriSpeech test-clean) |
|---|---:|---:|
| BF16 | 1,46 GB | 2,11 % |
| F16 | 1,47 GB | 2,12 % |
| Q8_0 | 811 MB | 2,11 % |
| Q6_K | 763 MB | 2,10 % |
| Q5_K_M | 707 MB | 2,21 % |
| Q4_K_M | 654 MB | 2,26 % |

Segun el autor, BF16, F16, Q8_0 y Q6_K estan dentro del intervalo de confianza bootstrap entre si; Q5_K_M y Q4_K_M muestran una regresion pequena pero real atribuida al embedding de tokens y cabeza compartidos (tied). El WER caracteriza solo el caso ingles; el modelo es multilingue.

Rendimiento en tiempo real (RTF, mayor es mejor):

| Hardware / backend | RTF |
|---|---:|
| Apple M4 Max, Metal | 65 |
| Apple M4 Max, CPU | 16,5 |
| AMD Ryzen 4750U, Vulkan | 8 |
| AMD Ryzen 4750U, CPU | 4,3 |

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: entre 654 MB (Q4_K_M) y 1,47 GB (F16) segun cuantizacion.
- Cabe en GPU consumer practicamente cualesquiera (RTX 3060, RTX 4090, etc.) e incluso en equipos sin GPU dedicada, al ejecutarse en CPU.
- Funciona en Apple Silicon (backend Metal) con RTF 65 en M4 Max.
- Funciona en CPU x86 (RTF 16,5 en M4 Max CPU; RTF 4,3 en Ryzen 4750U CPU) y con backend Vulkan (RTF 8 en Ryzen 4750U).
- Opciones de despliegue: `transcribe.cpp` (runtime principal para estos GGUF). No se indica soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: RTF de 65 en Metal (M4 Max) implica procesar audio aproximadamente 65 veces mas rapido que tiempo real; en CPU de portatil (Ryzen 4750U) el RTF es de 4,3, aun por encima de tiempo real.
- Requiere audio de entrada en WAV mono a 16 kHz; es necesario convertir con ffmpeg si el formato es distinto.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Qwen3-ASR-0.6B (este) | 782 M | 30 | Apache-2.0 | GGUF | WER 2,11 % en LibriSpeech test-clean; deteccion automatica de idioma; sin timestamps |
| Qwen3-ASR-1.7B | 1,7 B | 52 (30 idiomas + 22 dialectos chinos) | Apache-2.0 | no disponible en esta ficha | Variante mayor de la misma familia; el autor la situa como SOTA entre ASR open source |
| Whisper (variantes de OpenAI) | no disponible | no disponible | no disponible | no disponible | Referencia habitual en ASR; no se aportan datos comparativos en la informacion disponible |

No se dispone de datos de benchmarks comparativos directos con otros modelos en la informacion proporcionada, salvo la referencia cualitativa del autor de que la variante 1.7B es competitiva con APIs comerciales.

## Limitaciones y advertencias

- No soporta streaming en esta conversion (`streaming: false`).
- No soporta traduccion: transcribe en el idioma detectado, no traduce (`translate: false`).
- No genera timestamps (`timestamps: none`); para marcas temporales se necesita Qwen3-ForcedAligner-0.6B, un modelo separado.
- No admite pistas de idioma explicitas en esta version; la deteccion es automatica y puede fallar en audios cortos, ruidosos o con mezcla de idiomas.
- Requiere WAV mono a 16 kHz; otros formatos deben convertirse previamente.
- El WER publicado (2,11 %) corresponde solo al caso ingles en LibriSpeech test-clean; no hay datos de WER para el resto de los 30 idiomas en la informacion disponible.
- La cuantizacion Q5_K_M y Q4_K_M degradan ligeramente la precision (2,21 % y 2,26 % de WER) por el embedding y cabeza compartidos.
- Riesgo de alucinacion y errores en audio con ruido, acentos no vistos o vocabulario tecnico; no se documentan sesgos especificos en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene consultar la model card upstream para los terminos completos.
- Esta conversion GGUF esta validada contra una version concreta (`qwen_asr 0.0.6` y commit `3f61df7` de transcribe.cpp); cambios en el runtime pueden afectar a la compatibilidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una conversion reciente y poco contrastada por la comunidad.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/tryambientai/Qwen3-ASR-0.6B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Commit upstream fijado: https://huggingface.co/Qwen/Qwen3-ASR-0.6B/commit/5eb144179a02acc5e5ba31e748d22b0cf3e303b0
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3f61df7
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/qwen3-asr-0.6b.md
- Paper referenciado (arXiv): https://arxiv.org/abs/2601.21337
- Pesos GGUF (repositorio handy-computer): https://huggingface.co/handy-computer/Qwen3-ASR-0.6B-gguf
