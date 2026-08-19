# YTan2000/Qwen3.8-27B-TQ3_4S

## Resumen

Qwen3.8-27B-TQ3_4S es una cuantización GGUF del modelo Qwen3.8-27B, desarrollada por YTan2000 sobre la versión BF16 publicada por unsloth. Emplea el esquema TurboQuant TQ3_4S, que combina cuantización de 3 y 4 bits con capas de salida y embeddings en q6_K, logrando un tamaño de 13,8 GB (4,24 BPW). El modelo base presenta una arquitectura híbrida con 64 capas: 48 de Gated DeltaNet (atención lineal) y 16 de Gated Attention, más cabezas entrenadas de predicción multi-token (MTP) que permiten decodificación especulativa.

La relevancia de este modelo radica en su capacidad para ejecutar un LLM de 27.300 millones de parámetros en una GPU de consumo como la RTX 3090 de 24 GB, manteniendo una velocidad de decodificación de 64,78 tokens por segundo gracias a la aceptación del draft-MTP (0,849). Está pensado para desarrolladores que necesitan un modelo de razonamiento y código con contexto largo (262.144 tokens nativos) en hardware asequible, aunque requiere un runtime específico (turbo-tan/llama.cpp-tq3) que no es compatible con las builds estándar de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5: 64 capas (48 Gated DeltaNet + 16 Gated Attention) con cabezas MTP |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | TQ3_4S (TurboQuant, 4,24 BPW) con capas de salida y embeddings en q6_K |
| Idiomas soportados | inglés (declarado) |
| Licencia | Apache 2.0 (sujeta a la licencia del modelo base Qwen3.8) |
| Formato de pesos | GGUF (requiere runtime fork turbo-tan/llama.cpp-tq3) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-27B combina dos mecanismos de atención: 48 capas de Gated DeltaNet, una variante de atención lineal con compuertas, y 16 capas de Gated Attention tradicional. Esta hibridación busca reducir el coste computacional del contexto largo manteniendo la calidad en tareas de razonamiento. Además, el modelo incorpora cabezas de predicción multi-token (MTP) entrenadas, que permiten generar varios tokens por paso de decodificación mediante draft-MTP speculative decoding.

No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada. La cuantización TQ3_4S es un esquema propietario de TurboQuant que asigna 3 y 4 bits a distintas capas, reservando q6_K para las capas de salida y los embeddings, lo que preserva la calidad en las partes críticas del modelo.

## Capacidades

- Generación de texto y razonamiento multi-step, con soporte de modo thinking (activable mediante `--reasoning-format deepseek --reasoning-budget N`).
- Generación de código ejecutable: 92,7 en HumanEval (pass@1) y 90,5 en MBPP.
- Razonamiento matemático: 86,7 en la suite Reason-math.
- Tool calling / function calling: 81,7 en la suite Tool-call.
- Extracción de datos estructurados: 80,2 en la suite Data-extract.
- Seguimiento de instrucciones: 62,2 en la suite Instruction-follow.
- Decodificación especulativa draft-MTP con aceptación de 0,849, que acelera la generación en ~2,7 tokens por paso.
- Contexto largo nativo de 262.144 tokens, adecuado para documentos extensos o conversaciones multi-turno.

## Casos de uso

- Generación de código en producción: con HumanEval 92,7 y soporte de tool calling, el modelo puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o documentar APIs, ejecutándose en GPU de consumo.
- Razonamiento matemático y resolución de problemas: la suite Reason-math (86,7) lo hace adecuado para asistentes de cálculo simbólico, tutoría STEM o verificación de demostraciones.
- Agentes autónomos con tool calling: su capacidad de invocar funciones (81,7) permite construir agentes que consultan APIs, bases de datos o ejecutan comandos, con contexto largo para mantener el estado de la conversación.
- Extracción de datos de documentos: con 80,2 en Data-extract, puede procesar contratos, informes o correos para extraer entidades y estructurarlas en JSON.
- Asistentes de atención al cliente: la ventana de 262K tokens permite gestionar historiales completos de conversación, aunque el modelo solo declara inglés.
- Despliegue en hardware de consumo: con 13,8 GB y 64,78 tok/s en RTX 3090, es viable para prototipos y aplicaciones locales sin necesidad de clústeres.

## Benchmarks y rendimiento

Resultados declarados por el autor (primera pasada, con `reasoning-off` y evalplus con budget-256):

| Benchmark | Resultado |
|---|---|
| Hard86 (código ejecutable) | 74/86 (86,0%) |
| HumanEval (pass@1) | 92,7 |
| HumanEval+ (pass@1) | 88,4 |
| MBPP (pass@1) | 90,5 |
| MBPP+ (pass@1) | 77,2 |
| Coding suite | 93,8 |
| Reason-math suite | 86,7 |
| Tool-call suite | 81,7 |
| Data-extract suite | 80,2 |
| Instruction-follow suite | 62,2 |

Velocidad de decodificación (RTX 3090, 24 GB, contexto 32768, single stream, draft-MTP con `--spec-draft-n-max 2`):

| Metrica | Valor |
|---|---|
| Decodificación larga (1024 in / 4096 out) | 64,78 tok/s (media de 2 ejecuciones) |
| Aceptación draft-MTP | 0,849 |

Comparación con Qwen3.6-27B-MTP-TQ3_4S (misma receta TQ3_4S):

| Metrica | Qwen3.6-27B | Qwen3.8-27B |
|---|---|---|
| Tamaño | 13,39 GiB | 13,8 GB |
| Decodificación larga | 59,0 tok/s | 64,78 tok/s |
| Hard86 | 76/86 (88,4%) | 74/86 (86,0%) |
| Coding suite | 100% | 93,8% |
| Tool-call suite | 96,67% | 81,7% |
| Data-extract suite | 90,97% | 80,2% |
| Instruction-follow suite | 76,67% | 62,2% |
| Reason-math suite | 73,33% | 86,7% |
| Aceptación draft-MTP | 0,796 | 0,849 |

Nota: la columna de Qwen3.6 corresponde a números publicados con su configuración de servicio ajustada; la de Qwen3.8 es una primera pasada sin re-ajuste fino de la configuración.

## Requisitos de hardware

- GPU validada: NVIDIA RTX 3090 (24 GB) para todas las métricas publicadas.
- VRAM estimada: el archivo GGUF ocupa 13,8 GB; con contexto de 32.768 tokens y caché KV cuantizada (q8_0 para K, tq3_0 para V) cabe en 24 GB.
- Compatibilidad: requiere el runtime fork `turbo-tan/llama.cpp-tq3`; las builds estándar de llama.cpp no pueden cargar el tipo de tensor TQ3_4S.
- Opciones de despliegue: llama-server del fork, con flags específicos para draft-MTP (`--spec-type draft-mtp`, `--spec-draft-n-max 2`).
- Latencia/throughput: 64,78 tok/s en decodificación larga con RTX 3090, single stream.
- No se han probado otras GPUs; se espera que funcione en GPUs con ≥24 GB de VRAM, pero no hay datos.

## Comparativa con modelos similares

La única comparación disponible es con Qwen3.6-27B-MTP-TQ3_4S, que usa la misma receta de cuantización. No se proporcionan datos de otros modelos de 27B cuantizados (p. ej., Llama 3.3 70B o Qwen2.5 32B) en la documentación.

| Modelo | Parametros | Contexto | Tamano GGUF | Decodificacion | HumanEval | Reason-math |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-TQ3_4S | 27,3B | 262K | 13,8 GB | 64,78 tok/s | 92,7 | 86,7 |
| Qwen3.6-27B-MTP-TQ3_4S | ~27B | no disponible | 13,39 GiB | 59,0 tok/s | no disponible | 73,33 |

## Limitaciones y advertencias

- Requiere un runtime específico (turbo-tan/llama.cpp-tq3); no es compatible con llama.cpp estándar, lo que limita su portabilidad.
- Solo declara soporte de inglés; no hay garantías de rendimiento en otros idiomas.
- Los benchmarks son una primera pasada sin re-ajuste de configuración; los números de las suites de tareas pueden mejorar con tuning, pero también podrían empeorar en otros escenarios.
- La licencia Apache 2.0 del GGUF está sujeta a la licencia del modelo base Qwen3.8-27B; hay que verificar los términos de uso comercial de ese modelo.
- No se han publicado datos sobre sesgos, alucinaciones o robustez en dominios específicos.
- El modo thinking requiere activación explícita y puede aumentar la latencia; el autor recomienda desactivarlo para tareas agénticas.
- La cuantización TQ3_4S es propietaria; no hay garantía de que otros frameworks (vLLM, TGI, Ollama) puedan cargar el formato.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YTan2000/Qwen3.8-27B-TQ3_4S
- Runtime requerido (fork de llama.cpp): https://github.com/turbo-tan/llama.cpp-tq3
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Licencia del modelo base Qwen3.8: https://huggingface.co/Qwen/Qwen3.8-27B
