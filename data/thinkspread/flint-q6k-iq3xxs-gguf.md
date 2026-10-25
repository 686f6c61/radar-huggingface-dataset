# thinkspread/Flint-Q6K-IQ3XXS-GGUF

## Resumen

Flint-Q6K-IQ3XXS-GGUF es una cuantización en formato GGUF, en un único fichero, del modelo Flint desarrollado por RecursiveSI, publicada por el usuario thinkspread. Se trata de un modelo de generación de texto con arquitectura MoE (mezcla de expertos) y 39.785.287.456 parámetros totales, orientado a razonamiento: según el autor, Flint siempre razona antes de responder, abriendo un bloque `<think>…</think>` y cerrando el turno con la apertura del siguiente. La ficha no publica el número de parámetros activos ni la longitud de contexto soportada.

El objetivo del fichero es práctico: comprimir el modelo hasta 18,0 GB (16,8 GiB) para que quepa en el working set de GPU de un Mac Apple Silicon de 24 GB, algo que los builds INT4 oficiales no consiguen (22,6 GB en MLX y 26,0 GB en GGUF). Para ello combina capas densas en Q6_K con expertos enrutados en IQ3_XXS (gate/up) e IQ4_XS (down), lo que arroja 3,63 bits por peso de media. El resultado se queda a medio camino entre el INT4 oficial (26,0 GB, con entrenamiento consciente de cuantización) y una densidad Q5_K que, según el autor, Flint no admite sin pérdida apreciable.

Su interés actual es doble: por un lado, permite ejecutar un MoE de ~40 B en hardware de consumo con memoria unificada; por otro, documenta de forma inusualmente detallada el coste de la cuantización mixta (divergencia KL, ratio de perplexity y coincidencia de token top-1 frente a una referencia Q8_0), además de curvas de concurrencia medidas en un solo equipo. La licencia es Apache 2.0, la misma que el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con capas densas y expertos enrutados; router MoE en F32, attention sinks y normas sin cuantizar; arquitectura `flint` en ggml/llama.cpp |
| Parámetros totales | 39.785.287.456 (~39,8 B) |
| Parámetros activos | no disponible (el autor no publica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Variante única `Q6K_IQ3XXS`: capas densas Q6_K, expertos enrutados gate/up en IQ3_XXS y down en IQ4_XS; 3,63 bits por peso; embeddings de tokens en Q6_K |
| Idiomas soportados | no disponible (la evaluación de calidad usa markdown técnico en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único `Flint-Q6K_IQ3XXS.gguf`) |
| Tamaño del fichero | 18,0 GB (16,8 GiB) |
| Checksum | sha256 `efc33d5f57c7544cfc95c1a0eef58982d55a6745af39d701b788784207ddece4` |
| Modelo base | RecursiveSI/flint; requantizado desde bartowski/RecursiveSI_flint-GGUF (Q8_0) |
| Motores compatibles | llama.cpp (build con arquitectura `flint`, master `edc3538` o posterior), tempo9, rec (con parches) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos: capas densas combinadas con expertos enrutados y un router MoE que se mantiene en F32. La model card menciona explícitamente que los attention sinks, las normas y el router no se han tocado durante la cuantización, lo que indica que el modelo original incorpora attention sinks, un detalle propio de arquitecturas recientes orientadas a contextos largos. No se publican datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o una fase de razonamiento supervisado; esa información corresponde al modelo base RecursiveSI/flint y no está disponible en la información proporcionada.

Esta ficha es una derivada de cuantización, no un modelo entrenado. El autor la generó a partir del Q8_0 de bartowski usando su importance matrix y `llama-quantize` con tipado por tensor: `ffn_gate_exps=iq3_xxs`, `ffn_up_exps=iq3_xxs`, `ffn_down_exps=iq4_xs`, capas densas y embeddings en Q6_K. La elección de Q6_K en las capas densas (en lugar de Q5_K) es deliberada: según el autor, Flint no tolera Q5_K en densas sin degradar, a diferencia de Qwen3.5-35B-A3B. No hay innovaciones de decodificación especulativa ni de atención lineal documentadas; la innovación aquí es la política de cuantización mixta y su evaluación.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` describen su uso previsto.
- Razonamiento explícito: el modelo abre siempre un bloque `<think>…</think>` antes de la respuesta final, de modo que el proceso de razonamiento es inspeccionable.
- Estructura de turnos con tokens especiales `<|user|>`, `<|developer|>`, `<|observation|>` y `<|end_of_text|>`; el autor recomienda tratarlos como stop tokens, tal y como hace el `config.json` del modelo base. La presencia de `<|observation|>` sugiere bucles de observación tipo agente, aunque no se publica ninguna evaluación de tool calling.
- Servicio concurrente: en tempo9 el modelo procesa peticiones simultáneas con batching, hasta 16 peticiones medidas con un rendimiento agregado de 337 tok/s.
- Despliegue local en memoria unificada: pensado para Macs Apple Silicon de 24 GB con el límite de memoria cableada ajustado.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` aparece en el repositorio.
- Visión, audio, tool calling formal y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de razonamiento totalmente local en un Mac de 24 GB: con 18,0 GB de pesos y el límite `iogpu.wired_limit_mb=20480`, el modelo cabe en un M5 Pro de 24 GB y permite trabajar con datos que no deben salir del equipo, sin depender de API externa.
- Revisión y análisis de documentación técnica: el autor evalúa la calidad sobre markdown técnico en inglés, de modo que el escenario natural es el resumen, la extracción y la verificación de documentación y código, con el razonamiento visible en `<think>` para auditar las conclusiones.
- Servicio multiusuario modesto con batching: en tempo9 el rendimiento agregado crece de 100 tok/s con una petición a 337 tok/s con 16, y la petición más lenta termina en 12,2 s frente a 29,0 s en rec. Es adecuado para un pequeño equipo interno con peticiones de 256 tokens.
- Prototipado de agentes con bucle de observación: los tokens `<|observation|>` y `<|developer|>` permiten estructurar turnos de herramienta y de instrucciones de sistema, aunque la calidad de tool calling debe validarse empíricamente porque no hay benchmarks publicados.
- Evaluación de técnicas de cuantización: el repositorio sirve como caso de estudio reproducible de cuantización mixta con importance matrix, con comandos exactos, KLD y ratio de perplexity frente a Q8_0, útil para investigadores que comparan esquemas de compresión.
- Procesamiento por lotes offline de textos largos: al ser un único GGUF y funcionar sobre llama.cpp en CPU/GPU sin infraestructura adicional, encaja en pipelines de extracción y clasificación por lotes donde la latencia no es crítica.
- Desarrollo y pruebas de motores de inferencia: el autor publica curvas de concurrencia y comparativas entre tempo9, llama.cpp y rec, lo que lo convierte en un banco de pruebas para validar kernels MoE y gestión de memoria en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son de calidad de cuantización y de velocidad.

Calidad frente a la referencia Q8_0 de bartowski, medida con `llama-perplexity` sobre 16 fragmentos de 512 tokens de markdown técnico en inglés, todos los ficheros sobre la misma ruta de CPU:

| Fichero | Tamaño | Ratio PPL vs Q8_0 | KLD media | Mismo token top-1 |
|---|---|---|---|---|
| RecursiveSI `flint-int4-q4_1.gguf` (INT4 oficial) | 26,0 GB | 1,015 | 0,219 | 85,1 % |
| Denso Q8_0 + estos expertos | ~18,7 GB | 1,034 | 0,226 | 86,8 % |
| **Este fichero (denso Q6_K)** | **18,0 GB** | **1,048** | **0,247** | **85,3 %** |
| Denso Q5_K + estos expertos | 17,8 GB | 1,072 | 0,284 | 83,1 % |

Velocidad en Apple M5 Pro de 24 GB, monoflujo, decodificación greedy, `iogpu.wired_limit_mb=20480`, medida tras reiniciar:

| Motor | Pesos | 128 tokens | 512 tokens |
|---|---|---|---|
| tempo9 (reportado por el motor) | este fichero | 98,2–102,0 tok/s | 99,0–99,4 tok/s |
| llama.cpp `llama-bench` tg128 / tg512 | este fichero | 85,7 tok/s | 85,1 tok/s |
| rec (parcheado para 24 GB) | MLX INT4 denso + expertos INT3 | 150–159 tok/s | 149–158 tok/s |

Rendimiento agregado con peticiones concurrentes de 256 tokens greedy y prompts distintos (media de 2 rondas):

| Motor | 1 | 2 | 4 | 8 | 16 |
|---|---|---|---|---|---|
| rec | 159 | 145 | 134 | 138 | 141 |
| tempo9 | 100 | 154 | 228 | 274 | 337 |

## Requisitos de hardware

- Pesos: 18,0 GB (16,8 GiB) en un único fichero GGUF.
- Working set validado: Mac Apple Silicon de 24 GB con `iogpu.wired_limit_mb=20480`; el equipo de referencia es un M5 Pro de 24 GB. Los builds INT4 oficiales (22,6 GB MLX y 26,0 GB GGUF) no caben en ese perfil.
- VRAM estimada para inferencia: aproximadamente 18 GB solo para pesos, más caché KV y buffers; con contexto largo el consumo se acerca al límite de 24 GB. Es una estimación a partir del tamaño del fichero: el autor no publica consumo de memoria por contexto.
- GPU recomendadas: el autor solo aporta mediciones en Apple Silicon (M5 Pro, 24 GB). Para CUDA no hay datos publicados; por capacidad, encajaría en GPUs de 24 GB (RTX 3090, RTX 4090) o superiores (A100 40/80 GB, H100), pero el rendimiento en esas plataformas no está medido.
- ¿Cabe en GPU de consumo? Sí, en el escenario validado de memoria unificada de 24 GB. En GPUs discretas de 24 GB el margen es muy ajustado y no hay cifras que lo confirmen.
- Opciones de despliegue: `llama-server -hf thinkspread/Flint-Q6K-IQ3XXS-GGUF:Q6K_IQ3XXS -ngl 99` con llama.cpp master `edc3538` o posterior (la arquitectura `flint` no está en versiones antiguas); `tempo9 --hf thinkspread/Flint-Q6K-IQ3XXS-GGUF`, que a fecha 2026-10-23 aún no tiene release con soporte Flint; y rec, que requiere eliminar su comprobación de 48 GiB, aceptar expertos enrutados de 3 bits y subir el límite de memoria cableada (con el límite por defecto bloqueó la GPU).
- Latencia y throughput: 98–102 tok/s en tempo9 y 85,1–85,7 tok/s en llama.cpp a monoflujo; con 16 peticiones concurrentes, 337 tok/s agregados en tempo9 y 12,2 s para la petición más lenta. Los números de tempo9 con 12 o más peticiones concurrentes requieren un build con el arreglo de batching MoE (kzjeef/dash-infer#1258); builds anteriores caen a ~180 tok/s con 16.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables de otros autores. La comparación disponible es entre variantes de cuantización del mismo Flint, todas bajo licencia Apache 2.0:

| Modelo | Parámetros | Contexto | Tamaño | Ratio PPL vs Q8_0 | KLD media | Licencia |
|---|---|---|---|---|---|---|
| Este fichero (Q6_K denso + IQ3_XXS/IQ4_XS) | 39,8 B totales (activos no disponibles) | no disponible | 18,0 GB | 1,048 | 0,247 | Apache 2.0 |
| RecursiveSI `flint-int4-q4_1.gguf` (INT4 oficial) | 39,8 B | no disponible | 26,0 GB | 1,015 | 0,219 | Apache 2.0 |
| Denso Q8_0 + estos expertos | 39,8 B | no disponible | ~18,7 GB | 1,034 | 0,226 | Apache 2.0 |
| Denso Q5_K + estos expertos | 39,8 B | no disponible | 17,8 GB | 1,072 | 0,284 | Apache 2.0 |
| bartowski `RecursiveSI_flint-Q8_0.gguf` (referencia) | 39,8 B | no disponible | no indicado | 1,000 (referencia) | — | Apache 2.0 |

El INT4 oficial ofrece mejor KLD (0,219 frente a 0,247) y mejor ratio de perplexity, pero ocupa 8 GB más. Este fichero mejora en KLD al denso Q5_K (0,247 frente a 0,284) con solo 0,2 GB más y mejor coincidencia de token top-1. El modelo base menciona a Qwen3.5-35B-A3B como referencia de comportamiento frente a Q5_K en capas densas, pero no se aportan cifras de rendimiento de ese modelo en la información disponible, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La cuantización no es lossless: los expertos en 3 bits concentran la mayor parte del coste y la KLD es un 13 % superior a la del INT4 oficial (0,247 frente a 0,219).
- La comparación contra el INT4 oficial no mide solo error de cuantización: ese build procede de entrenamiento consciente de cuantización, de modo que su distancia respecto al Q8_0 derivado de bf16 no es equivalente.
- La evaluación de calidad es limitada: 16 fragmentos de 512 tokens de markdown técnico en inglés, con decodificación greedy. No cubre otros idiomas, código, matemáticas ni diálogo multi-turno.
- Riesgo de alucinación: no hay benchmarks de veracidad ni de razonamiento publicados para este modelo; el modo `<think>` siempre activo no garantiza corrección y puede aumentar los tokens generados y la latencia.
- Idiomas soportados no documentados. No hay evidencia de cobertura del castellano; conviene validar antes de usarlo en producción en español.
- Longitud de contexto no disponible: no se puede planificar el uso en documentos largos sin probarlo empíricamente.
- Dependencia de builds concretos: llama.cpp necesita master `edc3538` o posterior, y tempo9 no tenía release con soporte Flint a fecha 2026-10-23. El rendimiento concurrente alto exige además un build con el arreglo kzjeef/dash-infer#1258.
- Tool calling y capacidades de agente no evaluadas: los tokens de rol existen, pero no hay métricas de fiabilidad en bucles de herramientas.
- Licencia Apache 2.0, permisiva para uso comercial y modificación, con las obligaciones habituales de atribución y aviso de cambios; el autor remite a la licencia publicada por RecursiveSI para Flint.
- Adopción muy baja en el momento de la ficha: 3 descargas y 0 likes, sin validación independiente de las mediciones del autor.
- Las cifras de velocidad proceden de un único equipo (M5 Pro, 24 GB) y de una sola configuración de memoria; no son extrapolables a otras plataformas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/thinkspread/Flint-Q6K-IQ3XXS-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Referencia Q8_0 e importance matrix: https://huggingface.co/bartowski/RecursiveSI_flint-GGUF
- Licencia del modelo base: https://huggingface.co/RecursiveSI/flint
- Motor tempo9: https://github.com/thinkspread/tempo9
- Motor rec: https://github.com/recursive-oss/rec
- Repositorio con el arreglo de batching MoE (issue #1258): https://github.com/kzjeef/dash-infer
- llama.cpp (se requiere un build con arquitectura `flint`, master `edc3538` o posterior): https://github.com/ggml-org/llama.cpp

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (los resultados obtenidos correspondían a modelos 3D de estatuas y fueron descartados).
