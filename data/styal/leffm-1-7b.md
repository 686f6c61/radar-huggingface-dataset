# styal/leffm-1.7b

## Resumen

leffm-1.7b es una variante del modelo LiquidAI/LFM3-1.7B desarrollada por el usuario styal que introduce dos modificaciones entrenadas: una FFN en cascada que reduce un 30% los FLOPs por token y un recorte de vocabulario de 128.000 a 65.536 tokens que elimina un 7,4% de los parámetros. El modelo parte de la arquitectura LFM3 de Liquid AI y se distribuye tanto en formato GGUF (Q8_0, 1,7 GB) como en safetensors bf16 (3,2 GB), con un total de 1.601.059.584 parámetros reales según los pesos publicados.

La relevancia de esta ficha es acotada: no es un modelo nuevo de propósito general, sino un experimento de eficiencia sobre un modelo base existente. Su interés técnico reside en la técnica de cascade FFN, que selecciona dinámicamente las unidades activas de las proyecciones up y down mediante top-k exacto sobre el patrón de bits del float, manteniendo el router completo. El resultado medido es una mejora de velocidad de 1,19x en CUDA y 1,22x en Metal frente al modelo denso original en decodificación batch-1, a costa de un empeoramiento de perplejidad de +0,069 nats (+6,8% bits/byte).

El modelo requiere un fork específico de llama.cpp (styalai/leffm-llamacpp) para ejecutarse, ya que la cascade FFN no está implementada en llama.cpp upstream. La licencia es lfm1.0, heredada del modelo base, con restricciones que deben revisarse antes de cualquier uso comercial. El repositorio es privado y requiere autenticación en Hugging Face para su descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de LFM3 con FFN en cascada (sparse-FFN dinámica) |
| Parametros totales | 1.601.059.584 |
| Parametros activos | No es MoE; la FFN activa 5.120 de 7.680 unidades en la primera etapa y 2.304 en la segunda (30,9M MACs/token frente a 47,2M densos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (recomendado, 1,7 GB); safetensors bf16 (3,2 GB) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (other), enlazada a la licencia de LiquidAI/LFM3-1.7B |
| Formato de pesos | safetensors (bf16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LFM3 de Liquid AI y añade una cascade FFN sobre la FFN con compuerta (gated FFN) estándar. La FFN original calcula `FFN(x) = (silu(xW_gate^T) ⊙ (xW_up^T)) W_down` con F = 7.680 unidades. En la cascade, la proyección gate se calcula completa (es el router), pero las proyecciones up y down se aplican solo sobre subconjuntos seleccionados: primero se conservan las top c = 5.120 unidades por |silu(gate)|, y después las top k = 2.304 por |silu(gate) · u|. Ambas selecciones son top-k exactos mediante radix select sobre el patrón de bits del float, no umbrales, por lo que el número de unidades es fijo en cada token. El resultado son 30,9M MACs por token frente a 47,2M del modelo denso (65,6%).

El recorte de vocabulario reduce la tabla de embeddings de 128.000 a 65.536 filas, de las cuales 125.033 eran reales en el modelo original. El entrenamiento consistió en una ejecución de continued-pretraining de 2,67M tokens y 163 pasos, idéntica para el modelo denso de control y para leffm, sobre datos de `styal/calib-data`. No se especifica la composición completa del dataset ni si hubo RLHF o DPO. La cascade FFN es una ruta de decodificación de un solo token: el procesamiento de prompt permanece denso, y la selección top-k no está implementada en llama.cpp upstream, sino en un fork propio.

## Capacidades

- Generación de texto conversacional, heredada del modelo base LFM3-1.7B.
- Ejecución en llama.cpp mediante el fork styalai/leffm-llamacpp, con soporte de modo chat (`-cnv`) y completación simple.
- Decodificación batch-1 optimizada: la cascade FFN actúa únicamente en la ruta de decodificación token a token.
- Verificación de identidad aritmética: con `LLAMA_CASCADE=7680,7680` reproduce exactamente la FFN densa (salida greedy idéntica a `LLAMA_CASCADE=0,0`).
- Conmutación en tiempo de ejecución entre cascade y FFN densa mediante la variable de entorno `LLAMA_CASCADE`.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de eficiencia en FFN: el modelo sirve como banco de pruebas reproducible para medir el impacto de la cascade FFN en velocidad y perplejidad, con controles densos emparejados y scripts de benchmark incluidos (`llama-bench`).
- Despliegue en GPUs de gama media con requisitos de memoria ajustados: el archivo Q8_0 de 1,7 GB cabe en GPUs consumer y permite decodificación en batch-1 con una mejora de 1,19x en CUDA (L4) frente al denso, útil en escenarios de un solo usuario o baja concurrencia.
- Inferencia en Apple Silicon: con Metal se mide 12,47 ms/token frente a 15,16 ms/token del denso (1,22x), adecuado para aplicaciones locales en Mac con M5.
- Investigación sobre vocabularios reducidos: el recorte a 65.536 tokens con un coste medido de 1,0043x tokens adicionales por el mismo texto permite estudiar el equilibrio entre tamaño de embedding y calidad en modelos pequeños.
- Prototipado de asistentes conversacionales locales: el modo `-cnv` de llama-cli permite levantar un chat sin infraestructura adicional, aunque sin garantías de calidad propias más allá del modelo base.
- Comparación de backends CPU vs GPU: el modelo documenta que en CPU la cascade es más lenta (25,4 ms/token frente a 22,8 ms/token, 0,90x) porque ggml ya opera al límite del matvec int8, lo que lo hace útil para estudiar dónde la reducción de FLOPs no se traduce en mejora.

## Benchmarks y rendimiento

Rendimiento de decodificación batch-1, Q8_0, greedy, mejor de cinco ejecuciones:

| Backend | LFM3-1.7B | leffm | Aceleración |
|---|---:|---:|---:|
| CUDA (NVIDIA L4) | 9,01 ms/token | 7,54 ms/token | 1,19x |
| Metal (Apple M5) | 15,16 ms/token | 12,47 ms/token | 1,22x |
| CPU (M5, `-t 4`) | 22,8 ms/token | 25,4 ms/token | 0,90x |

Calidad, perplejidad sobre una porción reservada de `styal/calib-data` (64 secuencias, 115.159 bytes) tras un continued-pretraining emparejado de 2,67M tokens y 163 pasos:

| Modelo | Vocabulario | FFN | PPL/token | bits/byte |
|---|---:|---|---:|---:|
| LFM3-1.7B original | 128.000 | densa | 3,392 | 0,4270 |
| Denso tras CPT | 128.000 | densa | 2,832 | 0,3639 |
| leffm | 65.536 | cascade | 3,035 | 0,3885 |

Frente al denso entrenado de la misma forma, leffm cuesta +0,069 nats (+6,8% bits/byte). En llama.cpp, sobre los mismos pesos, el archivo mide PPL 3,450 con cascade y 3,174 con la FFN forzada a densa (batch-1, Q8_0). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,7 GB para el archivo GGUF Q8_0 y 3,2 GB para safetensors bf16, más overhead de contexto y KV cache.
- GPU recomendadas: NVIDIA L4 (medida), L40S, RTX 40xx (arquitectura Ada, `89`), A100 (`80`), A10 y RTX 30xx (`86`), H100 (`90`). Apple Silicon con Metal (M5 medido).
- Cabe en GPU consumer: sí, con 1,7 GB en Q8_0 es viable en GPUs con 4 GB o más de VRAM; `-ngl 999` fuerza todas las capas a GPU.
- Opciones de despliegue: exclusivamente el fork styalai/leffm-llamacpp (llama-cli, llama-bench). No se documenta soporte en vLLM, TGI, Ollama ni llama.cpp upstream.
- Requisitos de compilación: git, CMake 3.14 o superior, compilador C++17; para CUDA, toolkit 12.x o 13.x con `nvcc` en PATH. En macOS el build por defecto usa Metal.
- Latencia y throughput: 7,54 ms/token en CUDA (L4) y 12,47 ms/token en Metal (M5) en batch-1; en CPU 25,4 ms/token con `-t 4`. No se documenta throughput en batch mayor.
- El repositorio es privado: requiere `hf auth login` antes de la descarga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | FFN | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| leffm-1.7b | 1.601.059.584 | no disponible | Cascade (5.120/2.304 de 7.680) | lfm1.0 | Repo privado, fork propio de llama.cpp |
| LiquidAI/LFM3-1.7B | no disponible en la información | no disponible | Densa (7.680) | lfm1.0 | Público en Hugging Face, llama.cpp estándar |
| Denso tras CPT (control) | no disponible | no disponible | Densa | no disponible | Solo como referencia experimental en la model card |

La comparativa se limita al modelo base y al control denso entrenado de forma emparejada, únicos datos publicados. No se proporcionan comparaciones con otras familias de modelos del mismo tamaño (por ejemplo, Qwen, Llama o Gemma de ~1,5-2B) en la información disponible.

## Limitaciones y advertencias

- La cascade FFN solo opera en decodificación batch-1; el procesamiento de prompt permanece denso, por lo que la aceleración no se traslada a cargas con prompts largos o alta concurrencia.
- En CPU el modelo es más lento que el denso (0,90x): la reducción de bytes leídos no aporta beneficio porque ggml ya satura el matvec int8.
- Pérdida de calidad medible: +0,069 nats (+6,8% bits/byte) frente al denso entrenado de la misma forma, y PPL 3,450 frente a 3,174 con la FFN forzada a densa en llama.cpp.
- El recorte de vocabulario exige 1,0043x más tokens para el mismo texto, lo que incrementa ligeramente el coste de tokenización en contextos largos.
- Requiere un fork no estándar de llama.cpp (styalai/leffm-llamacpp); no funciona en llama.cpp upstream, vLLM, TGI ni Ollama.
- El repositorio es privado y exige autenticación; las descargas y likes registrados son cero, sin evidencia de adopción externa.
- Licencia lfm1.0 con posibles restricciones de uso comercial; debe revisarse el enlace de licencia del modelo base antes de cualquier despliegue en producción.
- No se documentan idiomas soportados, longitud de contexto ni evaluación de sesgos o alucinación; el entrenamiento de continued-pretraining fue muy corto (2,67M tokens, 163 pasos), por lo que el ajuste es limitado.
- El modelo base es LFM3-1.7B, con las limitaciones y sesgos propios de ese modelo, no evaluados en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/styal/leffm-1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Fork de llama.cpp: https://github.com/styalai/leffm-llamacpp
- Dataset de calibración: `styal/calib-data` (referenciado en la model card, sin URL directa en la información disponible)
