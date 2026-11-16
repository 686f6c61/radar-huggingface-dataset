# webmp3/Sakura-FocusCoder-27B-GGUF

## Resumen

FocusCoder-27B es un ajuste fino (fine-tune) del modelo Qwen3.8-27B, orientado a tareas de programacion y razonamiento algoritmico, publicado por el usuario webmp3 en Hugging Face. Su proposito declarado es que el modelo termine sus cadenas de razonamiento en lugar de agotar el limite de tokens de salida, un problema frecuente en modelos con modo "thinking" cuando se enfrentan a problemas de codigo de dificultad alta. Se distribuye unicamente en formato GGUF cuantizado, pensado para inferencia local con llama.cpp.

El modelo conserva el tamano del modelo base: 27.320.697.856 parametros (unos 27,3 mil millones) y una arquitectura que el autor identifica con la etiqueta `qwen3.8`. El unico archivo publicado es una cuantizacion mixta K-quant de 17,3 GB que incluye tensores MTP (multi-token prediction), con un contexto probado de 32.768 tokens. La licencia es Apache-2.0, heredada de la familia Qwen3.8-27B.

Su relevancia es acotada pero concreta: no es un modelo nuevo entrenado desde cero, sino una variante optimizada para un comportamiento especifico (finalizar el razonamiento dentro del presupuesto de tokens) y evaluada con un conjunto propio de seis tareas de codigo. El autor aporta una comparativa con otras variantes comunitarias del mismo modelo base, lo que permite situarlo frente a alternativas de la misma categoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.8 (etiqueta `qwen3.8`; compatible con la arquitectura `qwen35` de llama.cpp); incluye tensores MTP |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (probado) |
| Tipos de cuantizacion | Una sola publicada: K-quant mixta tipo Q3_K_M (Q4_K 27 %, Q5_K 24 %, Q3_K 17 %, Q8_0 16 %, Q6_K 14 %, otros 2 %); ~5,1 bits por peso de media |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `FocusCoder-27B-Q3_K_M-MTP.gguf`, 17,3 GB / 16,1 GiB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer de 27,3 mil millones de parametros con modo de razonamiento explicito ("thinking"). El autor no detalla el proceso de ajuste fino: no se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas como RLHF, DPO o SFT. Tampoco se describe la innovacion concreta que consigue que el modelo "termine su razonamiento" en lugar de agotar el limite de tokens, mas alla de la afirmacion de la model card.

El archivo publicado incorpora tensores MTP (multi-token prediction), lo que sugiere soporte para decodificacion especulativa o prediccion de multiples tokens por paso. En las pruebas el autor empleo un modelo draft DFlash junto con llama.cpp para decodificacion especulativa, lo que indica que la infraestructura de inferencia esta pensada para acelerar la generacion. La cuantizacion es mixta: las capas de embedding y la proyeccion de salida se mantienen en Q8_0 (16 % del archivo), mientras que el resto de matrices usan mezclas de Q3_K, Q4_K, Q5_K y Q6_K.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento con modo thinking activado por defecto, segun la plantilla de chat embebida en el archivo.
- Generacion de codigo, especialmente en problemas algoritmicos tipo LeetCode/AtCoder con tests ocultos.
- Finalizacion del razonamiento dentro del presupuesto de tokens: el modelo tiende a cerrar su cadena de pensamiento y entregar solucion, en lugar de truncarse por limite.
- Soporte de plantilla de chat propia, con thinking habilitado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente; el razonamiento algoritmico es el caso mas cercano descrito.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Resolucion de problemas algoritmicos en local: el modelo esta optimizado para tareas de codigo con tests ocultos y un limite de salida de 16.384 tokens; es adecuado para practicar o generar soluciones a problemas tipo competicion sin depender de la nube, gracias a su unico archivo GGUF de 17,3 GB.
- Asistente de programacion en estaciones de trabajo con GPU de 24-48 GB: con offload completo en una L40S o parcial en tarjetas de 24 GB, se puede integrar en editores o CLIs mediante llama.cpp para autocompletado y generacion de funciones con razonamiento previo.
- Generacion de codigo con razonamiento verificable: al priorizar que el modelo cierre su cadena de pensamiento, resulta util en pipelines donde se necesita una respuesta completa y no un truncamiento, por ejemplo en generacion de scripts de automatizacion o utilidades de sistema.
- Evaluacion y benchmarking interno de modelos de codigo: el conjunto de seis tareas y el protocolo descritos por el autor (temperatura 0,6, top-p 0,95, top-k 20, 16.384 tokens de salida) sirven como base reproducible para comparar variantes del mismo modelo base en hardware propio.
- Despliegue en equipos con memoria unificada (Strix Halo, 64 GB): el autor lo probo en una Radeon 8060S con Vulkan, por lo que es viable en mini-PC y portatiles con GPU integrada de gran capacidad de memoria compartida.
- Prototipado de agentes de codigo con decodificacion especulativa: la inclusion de tensores MTP y el uso de un draft model DFlash en las pruebas permiten montar un servidor llama.cpp con aceleracion especulativa para reducir latencia en tareas de generacion larga.
- Educacion y analisis de cadenas de razonamiento: al estar disponible el modo thinking, se puede estudiar como el modelo estructura la resolucion de problemas y donde falla (por ejemplo, la tarea 15 no fue resuelta por ningun modelo de la comparativa).

## Benchmarks y rendimiento

Los datos provienen de la model card del autor: seis tareas algoritmicas dificiles (estilo LeetCode/AtCoder, conjunto local congelado, tests ocultos), una ejecucion por tarea y semilla, con temperatura 0,6, top-p 0,95, top-k 20, min-p 0, maximo 16.384 tokens de salida, thinking activado y contexto de 32.768. Runtime: llama.cpp b12189 (CUDA) en una NVIDIA L40S con un draft model DFlash para decodificacion especulativa. Cada modelo se probo con su propio archivo publicado, por lo que la cuantizacion difiere entre filas.

| Modelo | Archivo probado | Semilla 42: resueltas | Tokens de salida (42) | Semilla 43: resueltas | Tokens de salida (43) | Total ambas semillas |
|---|---|---|---|---|---|---|
| FocusCoder-27B (este modelo) | Q3_K_M-MTP | 5 / 6 | 63.990 | 5 / 6 | 58.886 | 10 / 12 |
| Qwen3.8-27B | Q4_K_M (ggml-org) | 1 / 6 | 83.151 | - | - | - |
| Coder390-EfficientThink | Q3LynnStyle-MTP (nerkyor) | 4 / 6 | 70.007 | 3 / 6 | 62.218 | 7 / 12 |
| qwen-concept-27b | Q4_K_M (ConceptCountry) | 4 / 6 | 54.102 | 4 / 6 | 64.119 | 8 / 12 |
| Swift-1.5-Qwen3.8-27B | Q5_K_M (ukisai) | 4 / 6 | 76.848 | - | - | - |
| Thinklite-27B | Q4_K_M (Sparset) | 4 / 6 | 69.314 | - | - | - |

Resultados por tarea, semilla 42 (pass = resuelta y con tests superados; limit = agoto los 16.384 tokens sin solucion valida; pass at limit = agoto el limite pero el codigo encontrado en la salida paso los tests, no contabilizado como resuelta):

| Modelo | Tarea 27 | Tarea 15 | Tarea 10 | Tarea 8 | Tarea 9 | Tarea 11 |
|---|---|---|---|---|---|---|
| FocusCoder-27B | pass 10.778 | limit 16.384 | pass 15.548 | pass 10.935 | pass 9.205 | pass 1.140 |
| Qwen3.8-27B | pass at limit 16.384 | limit 16.384 | pass at limit 16.384 | pass at limit 16.384 | limit 16.384 | pass 1.231 |
| Coder390-EfficientThink | pass 14.610 | limit 16.384 | limit 16.384 | pass 8.054 | pass 12.307 | pass 2.268 |
| qwen-concept-27b | fail 10.772 | limit 16.384 | pass 10.474 | pass 5.779 | pass 9.914 | pass 779 |
| Swift-1.5-Qwen3.8-27B | pass 16.132 | limit 16.384 | pass 13.212 | pass 13.676 | limit 16.384 | pass 1.060 |
| Thinklite-27B | pass 13.366 | limit 16.384 | limit 16.384 | pass 10.556 | pass 12.129 | pass 495 |

Resultados por tarea, semilla 43:

| Modelo | Tarea 27 | Tarea 15 | Tarea 10 | Tarea 8 | Tarea 9 | Tarea 11 |
|---|---|---|---|---|---|---|
| FocusCoder-27B | pass 10.416 | limit 16.384 | pass 12.524 | pass 5.760 | pass 12.841 | pass 961 |
| Coder390-EfficientThink | fail 10.134 | limit 16.384 | pass 13.687 | pass 4.384 | limit 16.384 | pass 1.245 |
| qwen-concept-27b | pass 9.911 | limit 16.384 | limit 16.384 | pass 8.840 | pass 11.569 | pass 1.031 |

Advertencias del propio autor: seis tareas y una o dos semillas constituyen una muestra pequena, no una clasificacion estadisticamente fiable; la tarea 15 no la resolvio ningun modelo en ninguna ejecucion; los resultados dependen del hardware y del runtime y no son directamente comparables con otras configuraciones. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 17,3 GB; con contexto de 32.768 tokens el autor estima unos 21-22 GB de memoria libre de GPU (o memoria unificada) para offload completo. Es una estimacion a partir del tamano del archivo mas buffers de contexto y computo, no una medida.
- GPU recomendadas: NVIDIA L40S (48 GB), probada por el autor con llama.cpp b12189 (CUDA) y offload completo. Tarjetas de 32 GB o mas son comodas; 24 GB es ajustado.
- Cabe en consumer GPU: si, en tarjetas de 24 GB (p. ej. RTX 4090) de forma ajustada y con posible offload parcial; en 32 GB o mas (p. ej. RTX 5090, si dispone de esa memoria) con holgura. El autor no probo GPUs de menos de 24 GB.
- Memoria unificada: probado tambien en AMD Radeon 8060S (Strix Halo, 64 GB) con una build Vulkan de llama.cpp.
- Opciones de despliegue: llama.cpp (build reciente con soporte de la arquitectura `qwen35`; probado con b12189). No se mencionan otras opciones (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles como cifras medidas. El autor uso decodificacion especulativa con un draft model DFlash, lo que indica que la generacion directa sin aceleracion seria mas lenta.
- CPU-only, Apple Silicon y GPUs de menos de 24 GB: no probados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado en el conjunto del autor | Licencia | Formato |
|---|---|---|---|---|---|
| FocusCoder-27B | 27,3 B | 32.768 (probado) | 10 / 12 (ambas semillas) | Apache-2.0 | GGUF Q3_K_M mixta |
| Qwen3.8-27B (base) | 27,3 B | no disponible | 1 / 6 (semilla 42) | Apache-2.0 | GGUF Q4_K_M |
| Coder390-EfficientThink | mismo base (27 B) | no disponible | 7 / 12 | no disponible | GGUF Q3LynnStyle-MTP |
| qwen-concept-27b | mismo base (27 B) | no disponible | 8 / 12 | no disponible | GGUF Q4_K_M |
| Swift-1.5-Qwen3.8-27B | mismo base (27 B) | no disponible | 4 / 6 (solo semilla 42) | no disponible | GGUF Q5_K_M |
| Thinklite-27B | mismo base (27 B) | no disponible | 4 / 6 (solo semilla 42) | no disponible | GGUF Q4_K_M |

Todas las alternativas son variantes comunitarias del mismo Qwen3.8-27B y se probaron con cuantizaciones distintas, por lo que la comparacion mezcla efectos de ajuste fino y de cuantizacion. El conjunto de evaluacion es propio del autor y de muestra reducida.

## Limitaciones y advertencias

- Evaluacion muy limitada: seis tareas y una o dos semillas; el propio autor advierte que no es una clasificacion estadisticamente fiable.
- La tarea 15 no fue resuelta por ningun modelo de la comparativa, lo que sugiere un limite del modelo base en cierto tipo de problema.
- Diferencias de cuantizacion entre modelos comparados: FocusCoder se probo en Q3_K_M mixta, mientras que otros se probaron en Q4_K_M o Q5_K_M, lo que introduce sesgo en la comparativa.
- Resultados dependientes de hardware y runtime: obtenidos en una L40S con llama.cpp b12189 y decodificacion especulativa; no directamente extrapolables a otras configuraciones.
- Un solo archivo publicado (Q3_K_M mixta): no hay opciones de mayor precision (Q5, Q6, Q8) ni de menor tamano, lo que limita el equilibrio calidad/memoria.
- Idiomas soportados no declarados: no hay garantia documentada de comportamiento multilingue.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo de codigo con modo thinking, puede generar APIs o funciones inexistentes en problemas fuera de su dominio.
- Licencia Apache-2.0 permisiva para uso comercial, pero el modelo deriva de pesos de la familia Qwen3.8-27B; deben revisarse los avisos de licencia de los modelos upstream.
- Sin datos de sesgos, seguridad o filtrado de contenido.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (15 de noviembre de 2026): trazabilidad y mantenimiento no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/webmp3/Sakura-FocusCoder-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp (runtime recomendado, build con soporte `qwen35`): https://github.com/ggml-org/llama.cpp
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
