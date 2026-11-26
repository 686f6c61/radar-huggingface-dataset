# Ttimms/Bible-Assistant-Qwen3.5-4B-v3.2-GGUF

## Resumen

Bible Assistant Qwen3.5-4B v3.2 GGUF es una cuantizacion en formato GGUF del modelo `Ttimms/Bible-Assistant-Qwen3.5-4B-v3.2`, un ajuste fino por continuacion (continued fine-tune) sobre `Qwen/Qwen3.5-4B` orientado a pregunta-respuesta biblica fundamentada en recuperacion (RAG). Lo desarrolla el usuario Ttimms y esta pensado para asistentes que deben citar versiculos de forma literal y minimizar la fabricacion de referencias. Segun la model card, es el primer checkpoint de la linea del proyecto que supera todas las puertas de aceptacion: 80,3% de recuerdo literal de versiculos, 98,9% de citacion y 1,9% de alucinacion.

El modelo base es Qwen3.5-4B, una arquitectura hibrida de tipo `qwen35` que combina capas Gated-DeltaNet con atencion, con 4.205.751.296 parametros totales. El repositorio GGUF ofrece seis variantes de cuantizacion (Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 y una NVFP4 nativa para Blackwell), con tamanos que van de 2,45 GB a 8,4 GB. Esta pensado para ejecutarse en llama.cpp, LM Studio, koboldcpp, Jan, text-generation-webui u Ollama, siempre que la version incluya el arquetipo hibrido `qwen35`.

Su relevancia actual reside en dos aspectos: por un lado, demuestra un flujo de ajuste fino especializado con metricas de fidelidad explicita (recuerdo literal, tasa de citacion, alucinacion) en lugar de benchmarks genericos; por otro, incluye una comparacion medida entre NVFP4 y Q4_K_M con perplejidad y divergencia KL, lo que resulta util para decidir que cuantizacion desplegar en produccion. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida `qwen35` (Gated-DeltaNet + atencion), derivada de Qwen3.5-4B |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16, NVFP4 (mixta, nativa Blackwell) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo GGUF); safetensors en el repo base |
| Tamano del repo | 24,6 GB (incluye todas las variantes) |
| Tamanos por archivo | Q4_K_M 2,7 GB; NVFP4 2,45 GB; Q5_K_M 3,1 GB; Q6_K 3,5 GB; Q8_0 4,5 GB; F16 8,4 GB |
| Modelo base | Qwen/Qwen3.5-4B; ajuste sobre Ttimms/Bible-Assistant-Qwen3.5-4B-v3.2 |
| Descargas / likes | 254 / 1 |
| Fecha de creacion | 2026-09-05 |

## Arquitectura y entrenamiento

El pipeline descrito en la model card parte de `Qwen/Qwen3.5-4B`, sobre el que se aplica el adaptador v3.1 (SFT de sintesis tematica) y despues un ajuste fino por continuacion de estilo DMT sobre un conjunto `thematic_qa` corregido con RAFT mas datos de rehearsal, con tasa de aprendizaje 5e-5. El adaptador se fusiona a bf16, se convierte con `convert_hf_to_gguf --no-mtp` y se cuantiza con `llama-quantize`. El modelo base Qwen3.5-4B emplea una arquitectura hibrida que mezcla capas Gated-DeltaNet (atencion lineal con estado recurrente) y capas de atencion clasica; por ello el GGUF requiere un llama.cpp reciente que incluya el arquetipo `qwen35` (commit `3173a56` o posterior).

La variante NVFP4 se genero con `advanced-gguf-quantizer` (rama `mxfp6-cuda` del fork de llama.cpp), con busqueda de tensores en modo profundo, ranking de sensibilidad `allow_diagnostic` y una puerta dura sobre la cola de KLD. Esta pensada para los tensor cores FP4 nativos de Blackwell (`BLACKWELL_NATIVE_FP4=1`, verificado en una RTX 5070 Ti / SM120). No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de la mencion a `thematic_qa` y datos de rehearsal. El flujo de inferencia recomendado por el autor es un RAG hibrido con recuperacion densa (nomic), BM25, fusion RRF y reranking con bge-reranker-v2-m3.

## Capacidades

- Generacion de texto conversacional orientada a pregunta-respuesta biblica.
- Respuesta fundamentada en recuperacion (RAG): el modelo esta ajustado para trabajar sobre pasajes recuperados y citar versiculos de forma literal.
- Recuerdo literal de versiculos: 80,3% segun la evaluacion del autor.
- Citacion verificable: 98,9% de tasa de citacion declarada.
- Baja tasa de alucinacion declarada: 1,9%.
- Sintesis tematica: el adaptador v3.1 se entreno sobre SFT de sintesis tematica, lo que sugiere capacidad de agrupar pasajes por tema.
- Integracion con pipelines RAG hibridos (denso + BM25 + RRF + reranker).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente biblico de consulta: el modelo responde preguntas sobre pasajes concretos apoyandose en un pipeline RAG que recupera versiculos y los pasa como contexto; su entrenamiento especifico en citacion literal (98,9%) lo hace adecuado para respuestas que deben incluir la referencia exacta.
- Estudio tematico guiado: gracias al SFT de sintesis tematica del adaptador v3.1, puede agrupar versiculos por temas (gracia, covenant, escatologia) a partir de los pasajes recuperados, util para materiales de estudio o guias de grupo.
- Verificacion de citas en contenidos existentes: con una tasa de alucinacion declarada del 1,9%, sirve como segundo revisor de sermones, articulos o notas que citan escrituras, senalando referencias que no coinciden con el texto recuperado.
- Despliegue local en equipos de consumo: la variante Q4_K_M (2,7 GB) cabe en GPUs consumer y permite ejecutar el asistente sin conexion mediante llama.cpp, LM Studio u Ollama, algo relevante para entornos con requisitos de privacidad.
- Backend de un chatbot de iglesia o comunidad: al ser un modelo de 4B con licencia Apache 2.0, se puede servir en una unica GPU para atender conversaciones multi-turno de usuarios, combinado con el RAG hibrido recomendado por el autor.
- Evaluacion de cuantizaciones en produccion: los datos medidos de PPL y KLD entre NVFP4 y Q4_K_M permiten elegir la variante segun el compromiso entre tamano y fidelidad de distribucion, util para equipos que despliegan en Blackwell y quieren aprovechar FP4 nativo.
- Prototipado de asistentes RAG especializados: el flujo completo (continued fine-tune, correccion RAFT, rehearsal, conversion GGUF) documentado en la model card sirve de plantilla para adaptar Qwen3.5-4B a otros dominios documentales con requisitos de citacion estricta.

## Benchmarks y rendimiento

Metricas de fidelidad declaradas por el autor para este checkpoint:

| Metrica | Resultado |
|---|---|
| Recuerdo literal de versiculos | 80,3% |
| Tasa de citacion | 98,9% |
| Tasa de alucinacion | 1,9% |
| Metrica semantica cross-encoder | mejor resultado en su clase de tamano (~4B) frente a otros modelos biblia ajustados probados |

Comparacion de cuantizaciones medida con `llama-perplexity --kl-divergence` contra referencia bf16, mismo corpus de calibracion y evaluacion:

| Variante | Tamano | bpw | Ratio PPL medio vs bf16 | KLD media vs bf16 |
|---|--:|--:|--:|--:|
| NVFP4 | 2,45 GB | 4,66 | 1,1130 ± 0,0008 | 0,1109 ± 0,0003 |
| Q4_K_M | 2,71 GB | 5,15 | 1,1228 ± 0,0008 | 0,0929 ± 0,0003 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB para Q4_K_M (2,7 GB de pesos mas overhead de contexto y KV cache); unos 3 GB para NVFP4 (2,45 GB); 4-5 GB para Q5_K_M; 4-5 GB para Q6_K; 5-6 GB para Q8_0; 9-10 GB para F16.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para las variantes k-quant; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 son suficientes con holgura.
- Cabe en GPU consumer: si, todas las variantes k-quant y NVFP4 caben en GPUs consumer de 8 GB o mas; F16 requiere alrededor de 10 GB.
- NVFP4 requiere hardware Blackwell con soporte de FP4 nativo (verificado en RTX 5070 Ti / SM120 con `BLACKWELL_NATIVE_FP4=1`).
- Opciones de despliegue: llama.cpp (`llama-server -m <file>.gguf -ngl 99`), LM Studio, koboldcpp, Jan, text-generation-webui y Ollama (cuando su llama.cpp incluya el arquetipo `qwen35`).
- Requisito de version: llama.cpp con soporte del arquetipo hibrido `qwen35` (commit `3173a56` o posterior).
- Throughput medido: 175 tok/s en una RTX 5070 Ti con `llama-cli`/`llama-server` compilados desde fuente, con salida coherente y cita correcta de Juan 3:16.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bible Assistant Qwen3.5-4B v3.2 GGUF | 4,2B | no disponible | QA biblica con RAG y citacion literal | Apache 2.0 | GGUF en HF; safetensors en repo base |
| Otros modelos biblia ajustados de ~4B | ~4B | no disponible | QA biblica | no disponible | probados por el autor; sin nombres ni resultados publicos en la informacion disponible |
| Qwen3.5-4B (base) | 4,2B | no disponible | proposito general | Apache 2.0 | safetensors y GGUF de la comunidad |
| Modelos de proposito general de 4B (por ejemplo, familias Llama o Gemma) | ~4B | no disponible | proposito general | licencias variables | amplia disponibilidad |

La model card afirma que este checkpoint obtiene el mejor resultado en su clase de tamano en una metrica semantica cross-encoder frente a todos los demas modelos biblia de ~4B probados, pero no se publican los nombres ni las cifras de esos competidores en la informacion disponible.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste esta orientado a QA biblica; su rendimiento en tareas generales puede degradarse respecto a Qwen3.5-4B original.
- Dependencia del RAG: las metricas de citacion y alucinacion se obtuvieron con el pipeline de recuperacion del autor; sin ese contexto recuperado el comportamiento puede empeorar notablemente.
- Solo ingles declarado; no hay soporte multilingue documentado.
- Riesgo de alucinacion residual del 1,9% declarado; en produccion conviene verificar las citas contra el texto fuente.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; un corpus religioso puede introducir sesgos interpretativos.
- La variante NVFP4 tiene mayor KLD que Q4_K_M; el propio autor recomienda Q4_K_M para un asistente que cita versiculos literalmente.
- La NVFP4 se declara como candidata actual, no como resultado final: hay una ejecucion `nvfp4_mxfp6` pendiente que podria cambiar la recomendacion.
- Requiere un llama.cpp reciente con el arquetipo `qwen35`; versiones antiguas o el llama.cpp empaquetado en algunas distribuciones pueden fallar.
- Longitud de contexto no documentada; conviene validarla antes de disenar prompts largos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia enlazada en la model card; revisar ambas antes de desplegar.
- El repositorio pesa 24,6 GB por incluir todas las variantes; descargar un unico archivo, no el repo completo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Ttimms/Bible-Assistant-Qwen3.5-4B-v3.2-GGUF
- Repo base (safetensors): https://huggingface.co/Ttimms/Bible-Assistant-Qwen3.5-4B-v3.2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- advanced-gguf-quantizer (rama mxfp6-cuda): https://github.com/michaelw9999/llama.cpp/tree/mxfp6-cuda
- LM Studio: https://lmstudio.ai/
- koboldcpp: https://github.com/LostRuins/koboldcpp
- Jan: https://jan.ai/
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
