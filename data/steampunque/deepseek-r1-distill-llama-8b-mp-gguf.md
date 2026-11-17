# steampunque/DeepSeek-R1-Distill-Llama-8B-MP-GGUF

## Resumen

DeepSeek-R1-Distill-Llama-8B-MP-GGUF es una cuantizacion GGUF de precision mixta del modelo deepseek-ai/DeepSeek-R1-Distill-Llama-8B, publicada por el usuario steampunque. El modelo base es un destilado de razonamiento de DeepSeek-R1 sobre la arquitectura Llama 3.1 de 8B, disenado para generar cadenas de razonamiento largas antes de responder. Esta version concreta aplica distintos niveles de cuantizacion K por capa para reducir el tamano del archivo manteniendo la calidad.

El problema que resuelve esta variante es el equilibrio entre tamano y rendimiento en inferencia local: el archivo resultante ocupa aproximadamente 6,5 GB, frente a los 6,6 GB de un Q6_K convencional, con una perplejidad equivalente (13,1 en ambos casos segun el autor). Al usar exclusivamente cuantizaciones K se evita la penalizacion de velocidad de los cuantizados IQ en CPU y GPUs antiguas.

La relevancia actual radica en que permite ejecutar un modelo de razonamiento de 8B en hardware de consumo con una calidad cercana a la del original en FP16, y ademas el autor documenta su uso combinado con el proyector multimodal de Ultravox para entrada de audio, asi como decodificacion especulativa con modelos pequenos para acelerar la generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), destilado de razonamiento de DeepSeek-R1 |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF K-quant de precision mixta por capa (Q5_K_S, Q5_K_M, Q5_K_L, Q6_K_S, Q6_K_M, Q6_K_L), embeddings y tensor de salida en Q6_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo unico de ~6,5e9 bytes) |
| Tamano del repositorio | 18,8 GB |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Llama-8B |

## Arquitectura y entrenamiento

El modelo base es un destilado de DeepSeek-R1 sobre Llama 3.1 8B Instruct: DeepSeek genero trazas de razonamiento con su modelo R1 y ajusto el Llama 3.1 8B sobre ellas, de modo que el modelo pequeno aprende a producir cadenas de pensamiento paso a paso antes de la respuesta final. La arquitectura subyacente es un transformer decoder-only clasico de Llama 3.1 con 8.030 millones de parametros. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base.

La innovacion de esta publicacion es la cuantizacion de precision mixta por capa: las 32 capas reciben niveles distintos segun su sensibilidad, con capas tempranas en Q5_K_M, alternancia de Q5_K_L y Q6_K_S en capas medias y Q6_K_M/Q6_K_L en las finales, mientras que los tensores de atencion V, atencion O y FFN down se elevan a q8_0 o q6_k segun la variante. Los embeddings y el tensor de salida se mantienen en Q6_K. El autor reporta que esta configuracion iguala la perplejidad del Q6_K estandar (13,1) con un archivo ligeramente menor.

## Capacidades

- Generacion de texto conversacional multi-turno en formato instruct.
- Razonamiento paso a paso con cadenas de pensamiento extensas, herencia directa de DeepSeek-R1.
- Generacion de codigo, incluyendo la resolucion de problemas tipo HumanEval a partir de cabeceras de funcion.
- Razonamiento matematico y aritmetico de varios pasos (el autor valida con un problema de conteo tipo BBH object counting).
- Capacidad multimodal de audio cuando se combina con el proyector `ultravox-v0_5-llama-3_1-8b.mmproj.gguf` (entrada de audio .mp3 y .wav, salida de texto).
- Compatibilidad con decodificacion especulativa usando modelos pequenos como Qwen3 0.6B o Qwen 2.5 Coder 0.5B como draft.
- Soporte de modo "think" activable y desactivable (el autor documenta desactivarlo para generacion pura de codigo).
- Tool calling y function calling: no documentado en la informacion proporcionada.
- Capacidades de agente multi-paso: no documentadas explicitamente en la informacion proporcionada.

## Casos de uso

- Razonamiento local en estaciones de trabajo sin GPU dedicada: el archivo de 6,5 GB cabe en RAM de sistemas modestos y usa solo cuantizaciones K, evitando la lentitud de los IQ quants en CPU.
- Generacion de codigo asistida en IDE: con decodificacion especulativa y el modo think desactivado, el autor reporta 132 tokens por segundo en una RTX 4070, adecuado para autocompletado interactivo.
- Resolucion de problemas aritmeticos y logicos con traza explicita: util en herramientas educativas o de verificacion donde se necesita ver el razonamiento intermedio, no solo la respuesta.
- Transcripcion y analisis de audio local: combinado con el proyector Ultravox, permite procesar notas de voz o reuniones en .wav/.mp3 y generar resumenes o respuestas sin salir del equipo.
- Prototipado de pipelines de razonamiento en investigacion: al ser un destilado de R1 en 8B, sirve para estudiar comportamiento de cadenas de pensamiento con coste computacional bajo.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT del artefacto GGUF facilita su integracion en productos comerciales, sujeto a las condiciones del modelo base.
- Aceleracion de inferencia con draft models: el uso de Qwen3 0.6B o Qwen 2.5 Coder 0.5B como especuladores permite incrementar el throughput entre un 25 % y un 94 % segun el caso reportado por el autor.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta cuantizacion. Solo se reportan datos de perplejidad y de velocidad de generacion.

| Metrica | Q6_K estandar | Q6_K_H (esta version) |
|---|---|---|
| Tamano (bytes) | 6,6e9 | 6,5e9 |
| Perplejidad | 13,1 | 13,1 |

Rendimiento de generacion en RTX 4070 (contexto y pesos en VRAM, especulacion greedy):

| Prompt | Longitud de bloque especulativo | Tokens por segundo | Comentario |
|---|---|---|---|
| goldcoin | 0 | 68 | texto no-codigo, sin especulacion |
| goldcoin | 3 | 85 | texto no-codigo, con especulacion |
| humaneval | 0 | 68 | codigo, sin especulacion |
| humaneval | 4 | 103 | codigo, con especulacion |
| humaneval | 4 | 132 | especulacion con Qwen 2.5 Coder 0.5B, modo think desactivado |

El autor indica que el conjunto completo de benchmarks se publicara en https://huggingface.co/spaces/steampunque/benchlm, pero no esta disponible en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6,5 GB solo para los pesos; con contexto adicional se recomienda reservar entre 8 y 10 GB para ventanas moderadas.
- GPU recomendadas: RTX 4070 (validada por el autor), RTX 4080, RTX 4090, A100, H100. Cualquier GPU con 8 GB o mas de VRAM puede alojar los pesos.
- Cabe en GPUs de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. En GPUs de 8 GB requiere contexto reducido o descarga parcial de capas a CPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, y servidores compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estandar.
- Latencia y throughput: 68 tokens/s sin especulacion en RTX 4070; hasta 132 tokens/s con especulacion y modo think desactivado en tareas de codigo.
- Para multimodal de audio se requiere ademas el proyector `ultravox-v0_5-llama-3_1-8b.mmproj.gguf` (1,38e9 bytes en F16) y el soporte `mtmd` de llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Llama-8B-MP-GGUF (esta version) | 8,03B | no disponible | GGUF mixto K, ~6,5 GB | MIT | Perplejidad 13,1, 68-132 tok/s en RTX 4070 |
| DeepSeek-R1-Distill-Llama-8B (original) | 8,03B | no disponible | safetensors FP16/BF16 | MIT (modelo base) | Pesos completos, requiere ~16 GB en FP16 |
| Q6_K estandar del mismo modelo | 8,03B | no disponible | GGUF Q6_K, ~6,6 GB | MIT | Perplejidad 13,1, referencia de comparacion del autor |

No se dispone en la informacion proporcionada de comparaciones con otros modelos de la misma categoria (por ejemplo, otros destilados de 7-8B) en terminos de benchmarks estandar.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, evaluaciones de seguridad ni filtros de contenido; el modelo base puede reproducir sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion inherente a los modelos de razonamiento destilados: las cadenas de pensamiento largas pueden contener pasos plausibles pero incorrectos que conduzcan a respuestas erroneas con aparente confianza.
- Idiomas soportados no documentados; el modelo base esta orientado principalmente al ingles, por lo que el rendimiento en castellano no esta garantizado.
- Longitud de contexto no especificada en la informacion proporcionada; conviene verificar la configuracion del modelo base antes de desplegar con ventanas largas.
- La licencia MIT se aplica al artefacto GGUF publicado por steampunque; el uso comercial debe verificar tambien las condiciones del modelo base deepseek-ai/DeepSeek-R1-Distill-Llama-8B.
- El repositorio tiene un tamano de 18,8 GB, muy superior al archivo GGUF individual, lo que sugiere la presencia de otros artefactos o versiones; conviene descargar solo el archivo necesario.
- El rendimiento de la especulacion depende de un "downstream greedy speculator" personalizado del autor, no incluido en el repositorio; los 132 tok/s no son reproducibles sin esa infraestructura.
- El modelo esta pensado para modo conversacional; no se documenta soporte de tool calling ni de agentes, por lo que su uso en pipelines automatizados con llamadas a funciones requiere validacion adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/steampunque/DeepSeek-R1-Distill-Llama-8B-MP-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Proyector multimodal Ultravox: https://huggingface.co/steampunque/ultravox-v0_5-llama-3_1-8b-Hybrid-GGUF
- Documentacion mtmd de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/tools/mtmd/README.md
- Hilo de discusion sobre cuantizacion hibrida por capas: https://github.com/ggml-org/llama.cpp/discussions/13040
- Espacio de benchmarks del autor: https://huggingface.co/spaces/steampunque/benchlm
- Archivo GGUF directo: https://huggingface.co/steampunque/Deepseek-R1-Distill-Llama-8B-Instruct-MP-GGUF/resolve/main/Deepseek-R1-Distill-Llama-8B-Instruct.Q6_K_H.gguf
