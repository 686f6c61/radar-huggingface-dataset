# turintech/Qwen3-ASR-1.7B-Artemis-GGUF

## Resumen

Qwen3-ASR-1.7B-Artemis-GGUF es una cuantizacion optimizada del modelo de reconocimiento automatico del habla Qwen3-ASR-1.7B de Alibaba Qwen, publicada por TurinTech bajo el nombre comercial Artemis. El modelo original resuelve la transcripcion de audio a texto en ingles, y esta version lo empaqueta en formato GGUF para su ejecucion con transcribe.cpp, una implementacion en C++ pensada para inferencia local eficiente. El resultado es un fichero de 1,51 GB (Q5_K_M) que cabe en hardware de consumo y mantiene una tasa de error de palabra (WER) del 7,91 % en el conjunto de evaluacion del autor.

La relevancia de esta ficha radica en que demuestra que es posible comprimir un modelo ASR de 2.038 millones de parametros hasta un tercio de su tamano en punto flotante sin degradar la precision, e incluso mejorando ligeramente el WER respecto a la cuantizacion estandar equivalente. TurinTech reporta una reduccion notable de las alucinaciones en silencios y ruido (de 12 a 4 clips con texto inventado en el caso Q5_K_M), lo que ataca uno de los problemas mas persistentes en produccion de sistemas ASR.

El modelo esta pensado para transcripcion de audio en ingles, integracion en aplicaciones de escritorio (como la app Handy) y despliegue en entornos sin GPU dedicada. Su licencia Apache 2.0 y su compatibilidad con transcribe.cpp lo hacen adecuado para uso comercial, aunque con la limitacion importante de que solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para reconocimiento automatico del habla (ASR), derivada de Qwen3-ASR-1.7B |
| Parametros totales | 2.038.078.608 (2,04 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (1,32 GB), Q5_K_M (1,51 GB), Q8_0 (2,19 GB, referencia de 8 bits) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos de tensor Q4_K, Q5_K, Q6_K y Q8_0) |
| Libreria de inferencia | transcribe.cpp |
| Tamano del repositorio | 5,7 GB |
| Modelo base | Qwen/Qwen3-ASR-1.7B |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen3-ASR-1.7B original, que emplea una arquitectura transformer adaptada a la transcripcion de audio a texto. TurinTech no detalla en la informacion disponible la composicion del dataset de entrenamiento del modelo base ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden a la model card original de Qwen, no incluida aqui.

La innovacion tecnica de esta publicacion es el proceso de compresion Artemis, que genera ficheros GGUF con tipos de tensor estandar (Q4_K, Q5_K, Q6_K, Q8_0) cargables por transcribe.cpp sin parches. Segun el autor, los ficheros Artemis ocupan practicamente lo mismo que los stock (unos pocos MB menos) pero obtienen un WER inferior, y la mejora es mayor en Q4_K_M que en Q5_K_M. La evaluacion se realizo sobre un conjunto held-out de aproximadamente 27,5 horas de audio en ingles distribuido en 8 dominios (LibriSpeech, FLEURS, VoxPopuli, AMI, Earnings-22 y ruido MUSAN), probado con transcribe.cpp en el commit adfc502.

## Capacidades

- Transcripcion de audio a texto en ingles a partir de ficheros WAV de 16 kHz mono.
- Reconocimiento robusto en multiples dominios: lectura de libros (LibriSpeech), habla multilingue (FLEURS), discurso parlamentario (VoxPopuli), reuniones (AMI) y llamadas de resultados financieros (Earnings-22).
- Resistencia al ruido de fondo, incluido ruido musical y de fondo (MUSAN).
- Menor tendencia a generar texto en fragmentos de silencio o ruido en comparacion con las cuantizaciones estandar.
- Ejecucion en CPU, GPU NVIDIA (CUDA), Apple Silicon (Metal), Vulkan y ROCm mediante transcribe.cpp.
- Integracion con la aplicacion de escritorio Handy para dictado y transcripcion local.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- **Transcripcion local de reuniones**: el modelo procesa audio de reuniones (dominio AMI en la evaluacion) en hardware de consumo, lo que permite transcribir conversaciones sin enviar datos a la nube y cumplir requisitos de privacidad.
- **Dictado por voz en aplicaciones de escritorio**: la integracion con la app Handy permite usar el modelo como motor de dictado local, con un fichero de 1,51 GB que cabe en cualquier portatil moderno.
- **Generacion de subtitulos para contenido en ingles**: con un WER del 7,91 % en dominios diversos, es adecuado para subtitulado automatico de videos, podcasts y clases, con revision humana posterior.
- **Analisis de llamadas de atencion al cliente**: el modelo rinde bien en el dominio Earnings-22 (llamadas de resultados financieros), lo que lo hace util para transcribir y analizar conversaciones telefonicas de negocios en ingles.
- **Transcripcion de archivos historicos o de archivo parlamentario**: el buen comportamiento en VoxPopuli sugiere su uso para digitalizar discursos y actas parlamentarias en ingles.
- **Procesamiento por lotes sin GPU**: al poder ejecutarse en CPU con transcribe.cpp, permite transcribir grandes volumenes de audio en servidores sin acelerador dedicado, con un coste por hora bajo.
- **Aplicaciones de accesibilidad**: transcripcion en tiempo real o diferida de audio para personas con dificultades auditivas, ejecutandose localmente en el dispositivo del usuario.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto held-out de aproximadamente 27,5 horas de audio en ingles en 8 dominios (LibriSpeech, FLEURS, VoxPopuli, AMI, Earnings-22 y ruido MUSAN). El WER es menor cuanto mejor.

| Fichero | Tamano | WER (%) | Clips con texto en silencio/ruido (de 100) | Transcripciones rotas |
|---|---|---|---|---|
| TurinTech Q5_K_M | 1,51 GB | 7,91 | 4 | 2 |
| Stock Q5_K_M | 1,52 GB | 8,05 | 12 | 6 |
| TurinTech Q4_K_M | 1,32 GB | 8,06 | 4 | 3 |
| Stock Q4_K_M | 1,32 GB | 8,44 | 23 | 16 |
| Q8_0 (referencia 8 bits) | 2,19 GB | 7,87 | 2 | 0 (por definicion) |

Los resultados no estan verificados de forma independiente (`verified: false` en el model-index). El autor indica que la mejora de WER es mayor en Q4_K_M que en Q5_K_M, y que la reduccion de alucinaciones en silencio es especialmente significativa en Q4_K_M (de 23 a 4 clips).

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explicita; por el tamano de los ficheros, Q4_K_M requiere en torno a 1,3-1,5 GB y Q5_K_M en torno a 1,5-1,8 GB de memoria para pesos, mas overhead de activaciones y audio.
- **GPU recomendadas**: cualquier GPU NVIDIA con CUDA toolkit para la build `TRANSCRIBE_CUDA=ON`; tambien soporta Metal en Apple Silicon, Vulkan y ROCm.
- **Consumer GPU**: si, cabe holgadamente en GPUs de consumo con 4 GB o mas de VRAM (RTX 3050, RTX 4060, etc.) e incluso en iGPU con memoria compartida.
- **CPU**: la build estandar `cmake -B build` funciona sin GPU; el modelo es lo bastante pequeno para transcripcion en CPU.
- **Opciones de despliegue**: transcribe.cpp (CLI `transcribe-cli`), app Handy. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el modelo es especifico de ASR y usa la libreria transcribe.cpp.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (ingles, held-out) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Artemis Q5_K_M | 2,04 B | no disponible | 7,91 % | Apache 2.0 | GGUF |
| Qwen3-ASR-1.7B stock Q5_K_M | 2,04 B | no disponible | 8,05 % | Apache 2.0 | GGUF |
| Qwen3-ASR-1.7B Q8_0 | 2,04 B | no disponible | 7,87 % | Apache 2.0 | GGUF |
| Whisper large-v3 | no disponible en la informacion | no disponible | no disponible | MIT (segun conocimiento general, no verificado aqui) | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks de otros modelos ASR comparables (Whisper, Wav2Vec2, etc.) medidos sobre el mismo conjunto held-out, por lo que la comparativa externa queda como no disponible.

## Limitaciones y advertencias

- **Solo ingles**: el modelo esta entrenado y evaluado unicamente en ingles; no es adecuado para transcripcion en castellano ni en otros idiomas.
- **Resultados no verificados**: los benchmarks del model-index tienen `verified: false`; proceden del propio autor y no han sido replicados de forma independiente.
- **Riesgo de alucinacion**: aunque reducido respecto a las cuantizaciones stock, el modelo sigue generando texto en 4 de cada 100 clips de silencio o ruido en Q5_K_M y Q4_K_M; en produccion conviene filtrar segmentos sin voz.
- **Cuantizacion con perdida**: Q4_K_M y Q5_K_M introducen perdida de precision; para maxima calidad debe usarse Q8_0 (2,19 GB, WER 7,87 %).
- **Dependencia de transcribe.cpp**: el modelo esta empaquetado para esa libreria concreta y no es directamente cargable por otros runners; la integracion con Handy no fue probada por el autor.
- **Formato de audio**: requiere WAV de 16 kHz mono; otros formatos deben convertirse previamente con ffmpeg.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-ASR-1.7B por si impone restricciones adicionales.
- **Sin datos de contexto ni de composicion del dataset de entrenamiento**: no es posible evaluar sesgos especificos ni cobertura dialectal mas alla de los dominios del conjunto de prueba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/Qwen3-ASR-1.7B-Artemis-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de transcribe.cpp probado: https://github.com/handy-computer/transcribe.cpp/tree/adfc502
- Aplicacion Handy: https://github.com/cjpais/Handy
- Web de TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
