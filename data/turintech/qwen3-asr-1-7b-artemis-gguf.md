# turintech/Qwen3-ASR-1.7B-Artemis-GGUF

## Resumen

Qwen3-ASR-1.7B-Artemis-GGUF es una cuantizacion en formato GGUF del modelo de reconocimiento automatico del habla Qwen/Qwen3-ASR-1.7B, publicada por TurinTech bajo su pipeline de compresion Artemis. El modelo base, desarrollado por el equipo Qwen de Alibaba, resuelve la transcripcion de audio a texto (speech-to-text) y aqui se redistribuye optimizado para `transcribe.cpp`, una implementacion de inferencia especifica para modelos ASR. El repositorio ocupa 2,8 GB e incluye variantes cuantizadas como Q5_K_M (1,51 GB) y Q4_K_M (1,32 GB).

La relevancia de esta ficha radica en que TurinTech no se limita a reempaquetar: aplica su tecnica Artemis para reducir el error de transcripcion (WER) respecto a las cuantizaciones estandar del mismo modelo base. Segun los datos declarados por el autor, la variante Q5_K_M baja del 8,05% al 7,91% de WER, y la Q4_K_M del 8,44% al 8,06%, manteniendo practicamente el mismo tamano de fichero. Ademas, reduce de forma notable la generacion de texto espurio en clips de silencio o ruido.

El modelo cuenta con 2.038.078.608 parametros (aproximadamente 2,04 mil millones) y esta orientado exclusivamente al ingles. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales. No es un modelo de chat general: es un ASR puro que debe ejecutarse con la libreria `transcribe.cpp`, no con llama.cpp, Ollama ni LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR, orientado a ASR; detalles de arquitectura interna no especificados en la informacion) |
| Parametros totales | 2.038.078.608 (aprox. 2,04 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y Q5_K_M (publicadas); referencia Q8_0 (2,19 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para `transcribe.cpp`) |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo base Qwen3-ASR-1.7B (tipo de transformer, atencion, encoder de audio, etc.). Lo que si se documenta es el proceso de compresion aplicado por TurinTech mediante su pipeline Artemis, que produce cuantizaciones GGUF con tipos de tensor Q4_K, Q5_K, Q6_K y Q8_0, todos ellos cargables por una build estandar de `transcribe.cpp` en el commit adfc502.

El modelo se evalua sobre un conjunto de test retenido de habla inglesa (`turintech-heldout-english-asr`) y sobre un conjunto de 100 clips de silencio, tono de sala, ruido, musica y babble para medir la tendencia a escribir texto donde no lo hay. No se especifican en la informacion el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles.

## Capacidades

- Transcripcion de voz a texto en ingles (automatic speech recognition) a partir de audio WAV de 16 kHz mono.
- Generacion de transcripciones robustas frente a silencios y ruido: solo 4 de 100 clips de silencio/ruido producen texto, frente a 12 (Q5_K_M estandar) y 23 (Q4_K_M estandar).
- Reduccion de transcripciones rotas: 2 con Q5_K_M Artemis frente a 6 con la version estandar.
- Ejecucion en CPU, GPU NVIDIA (CUDA), Apple Silicon (Metal), Vulkan y ROCm a traves de `transcribe.cpp`.
- Integracion con la aplicacion Handy, que detecta los GGUF de `transcribe.cpp` en la cache compartida de Hugging Face.
- No soporta tool calling, agentes, vision ni audio mas alla del propio ASR; es un modelo especializado y no conversacional.
- Capacidad multilingue: no, unicamente ingles.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo convierte grabaciones en ingles a texto con un WER declarado del 7,91% (Q5_K_M), suficiente para actas y resumenes posteriores, y con bajo riesgo de insertar texto en tramos de silencio.
- Subtitulado de contenido audiovisual en ingles: al ejecutarse en `transcribe.cpp` sobre CPU o GPU, puede integrarse en un pipeline por lotes que convierta audio con `ffmpeg` a WAV 16 kHz mono y genere subtitulos.
- Dictado en aplicaciones de escritorio: la integracion con la app Handy permite usar el modelo como motor de dictado local, sin enviar audio a servicios en la nube.
- Procesamiento de llamadas de atencion al cliente: la baja tasa de texto espurio en ruido (4 de 100 clips) lo hace adecuado para transcribir conversaciones telefonicas con musica de espera o silencios.
- Investigacion en ASR y evaluacion de cuantizaciones: sirve como referencia para comparar el efecto de Artemis frente a cuantizaciones estandar sobre el mismo modelo base, con metricas de WER y de alucinacion en silencio.
- Despliegue en entornos con recursos limitados: la variante Q4_K_M de 1,32 GB cabe en equipos modestos y mantiene un WER del 8,06%, lo que permite transcripcion local en portatiles sin GPU dedicada.
- Archivado y busqueda de audio: transcripcion masiva de archivos de audio en ingles para indexar y buscar por contenido textual.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados, `verified: false`) sobre el conjunto `turintech-heldout-english-asr`, split test:

| Fichero | Tamano | WER (%) | Clips con texto en silencio/ruido (de 100) | Transcripciones rotas |
|---|---|---|---|---|
| TurinTech Q5_K_M | 1,51 GB | 7,91 | 4 | 2 |
| Stock Q5_K_M | 1,52 GB | 8,05 | 12 | 6 |
| TurinTech Q4_K_M | 1,32 GB | 8,06 | 4 | 3 |
| Stock Q4_K_M | 1,32 GB | 8,44 | 23 | 16 |
| Q8_0 (referencia 8 bits) | 2,19 GB | 7,87 | 2 | 0 (por definicion) |

La mejora de Artemis es mas acusada en Q4_K_M (de 8,44% a 8,06%) que en Q5_K_M (de 8,05% a 7,91%), y en ambos casos se acerca al rendimiento de la referencia Q8_0 con menos de la mitad del tamano en el caso de Q4_K_M.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por tamano de fichero, Q4_K_M (1,32 GB) y Q5_K_M (1,51 GB) requieren memoria en el orden de 2 GB para pesos mas overhead de inferencia.
- GPU recomendadas: cualquier GPU NVIDIA con toolkit CUDA para la build `-DTRANSCRIBE_CUDA=ON`; tambien soporta ROCm (AMD) y Vulkan.
- Cabe en GPU de consumo: si, dado el tamano reducido de los ficheros; tambien puede ejecutarse en CPU pura o en Apple Silicon con Metal.
- Opciones de despliegue: `transcribe.cpp` (build CUDA, CPU, Metal, Vulkan o ROCm) y la app Handy. No es compatible con llama.cpp, Ollama ni LM Studio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (ingles, test TurinTech) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Artemis Q5_K_M | 2,04 mil millones | no disponible | 7,91% | Apache 2.0 | GGUF |
| Qwen3-ASR-1.7B stock Q5_K_M | 2,04 mil millones | no disponible | 8,05% | Apache 2.0 | GGUF |
| Qwen3-ASR-1.7B Q8_0 (referencia) | 2,04 mil millones | no disponible | 7,87% | Apache 2.0 | GGUF |

No se dispone en la informacion proporcionada de datos de otros modelos ASR comparables (por ejemplo Whisper) para establecer una comparativa cruzada; esos datos deben considerarse no disponibles.

## Limitaciones y advertencias

- Solo soporta ingles; no se debe usar para otros idiomas sin validacion previa.
- Los resultados de WER y de alucinacion en silencio son declarados por el autor y estan marcados como no verificados (`verified: false`).
- Requiere `transcribe.cpp`; no funciona con llama.cpp, Ollama ni LM Studio, lo que limita las opciones de despliegue.
- El audio debe convertirse previamente a WAV de 16 kHz mono (por ejemplo con `ffmpeg`); otros formatos no se procesan directamente.
- Riesgo de alucinacion: aunque reducido, persiste; en la variante Q5_K_M Artemis 4 de 100 clips de silencio o ruido generaron texto.
- La integracion con la app Handy no ha sido probada por el autor segun la model card.
- No se documentan sesgos especificos ni limitaciones de contexto; esa informacion no esta disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3-ASR-1.7B.
- El modelo es especializado en ASR y no ofrece capacidades conversacionales, de razonamiento general ni de codigo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/turintech/Qwen3-ASR-1.7B-Artemis-GGUF
- Seccion de resultados del autor: https://huggingface.co/turintech/Qwen3-ASR-1.7B-Artemis-GGUF#results
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- transcribe.cpp (repositorio): https://github.com/handy-computer/transcribe.cpp
- Commit de referencia de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/adfc502
- Aplicacion Handy: https://github.com/cjpais/Handy
- Web de TurinTech: https://www.turintech.ai
- Modelos de TurinTech en Hugging Face: https://huggingface.co/turintech
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
