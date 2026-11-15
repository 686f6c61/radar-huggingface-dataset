# TassP0lar/Qwen3.6-35B-A3B-Loop64

## Resumen

Qwen3.6-35B-A3B-Loop64 es un experimento de investigación desarrollado por el usuario TassP0lar que consiste en un retrofit arquitectónico sobre el modelo base Qwen/Qwen3.6-35B-A3B. El autor transforma el transformer MoE original de 40 capas físicas en un transformer con bucle de 64 capas virtuales mediante una estructura encode-think-decode (prelude, núcleo recurrente y coda), manteniendo los 35B parámetros totales del modelo base pero ampliando la profundidad efectiva de cómputo por token.

La propuesta técnica combina varias innovaciones: re-enrutamiento dinámico de expertos entre pasadas del bucle (que expande los parámetros únicos consultados de ~3.0B hasta ~4.5B-5.9B por token sin añadir memoria de pesos), un puente Manifold-Constrained Hyper-Connection (mHC), la actualización de las 30 capas de atención lineal Gated DeltaNet al esquema GDN-2 con compuertas por canal, y atención dispersa latente destilada (D-LSA) para contexto de 1M tokens. La licencia es Apache 2.0.

Es relevante ahora porque explora si el cómputo recurrente con profundidad virtual y el enrutamiento de expertos dependiente de la pasada pueden superar las limitaciones de los MoE de una sola pasada, un área activa de investigación en eficiencia de inferencia. No obstante, el modelo se encuentra en una fase muy temprana de entrenamiento: el estado publicado es `s0_probe` en el paso 0, sin métricas de pérdida ni benchmarks disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle (encode-think-decode), híbrido de atención lineal Gated DeltaNet-2 y atención completa con Gated Full Attention, atención dispersa latente D-LSA |
| Parametros totales | 35B (32.2B en el pool MoE congelado) |
| Parametros activos | ~3.0B base; hasta ~4.5B-5.9B únicos consultados por token con re-enrutamiento entre pasadas |
| Longitud de contexto | 1M tokens (mediante YaRN y D-LSA) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería transformers; carga vía `qloop.hub`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un MoE de 40 capas físicas con 256 expertos enrutados por capa y 35B parámetros totales. El retrofit introduce un bucle de profundidad virtual de 64 capas estructurado en tres tramos: prelude `[0, 8)` ejecutado una vez, núcleo recurrente `[8, 32)` ejecutado dos veces y coda `[32, 40)` ejecutado una vez. Sobre esta estructura se añaden adaptadores de enrutamiento por pasada (`PassRouterAdapters`) que permiten que la segunda pasada active expertos Top-8 distintos de los de la primera, con repulsión entre expertos entre pasadas, incrementando los parámetros únicos consultados por token sin aumentar la memoria de pesos base.

La arquitectura incorpora además un puente Manifold-Constrained Hyper-Connection (mHC) con mezcla doblemente estocástica Birkhoff-Sinkhorn, inyección de anclaje desde el prelude e identidad bit-exacta en el paso 0. Las 30 capas de Gated DeltaNet se actualizan al esquema GDN-2 (arXiv:2605.22791), con compuertas de borrado, escritura y decaimiento por canal y paralelización chunkwise WY en Tensor Cores, manteniendo equivalencia bit a bit en el paso 0. El aislamiento de estado híbrido asigna ranuras recurrentes y de convolución independientes por `(capa, pasada)` en las 18 capas GDN-2 del núcleo, y comparte KV de la pasada 1 más buckets D-LSA en las 6 capas de atención completa del núcleo, evitando la multiplicación de memoria KV a 1M de contexto. El entrenamiento está planteado en varias fases (s0_probe, s1_loop_heal, s1_rescan, s2_sft, s3_long_lsa, s4_rl, eval); según la model card, únicamente `s0_probe` está en progreso en el paso 0 y el resto pendientes. No se especifican datos de composición del dataset, número de tokens ni detalles de RLHF/DPO más allá de la etiqueta `grpo`.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos mediante profundidad virtual de 64 capas, con control explícito del número de pasadas vía `gen.depth(n)`.
- Razonamiento matemático y resolución de problemas formales (el ejemplo de la model card aborda una ecuación diofántica).
- Enrutamiento dinámico de expertos entre pasadas, que activa subconjuntos de expertos distintos en cada iteración del núcleo recurrente.
- Soporte de contexto largo de hasta 1M tokens mediante YaRN y atención dispersa latente destilada.
- Capacidades de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Modo thinking: la estructura encode-think-decode sugiere un tramo de cómputo recurrente asimilable a un modo de pensamiento, aunque no se documenta una interfaz de thinking mode explícita.

## Casos de uso

- Investigación sobre profundidad recurrente: el modelo sirve como banco de pruebas para medir si el bucle de 64 capas virtuales mejora la pérdida frente a la profundidad física de 40 capas, usando la métrica `Depth Gain` que el autor define en la model card.
- Análisis de enrutamiento de expertos: permite estudiar la tasa de re-enrutamiento en la pasada 2 (`Pass-2 Reroute Rate`) y su efecto sobre los parámetros únicos consultados por token, un experimento relevante para diseñar MoE más eficientes.
- Evaluación de atención lineal híbrida: las 30 capas GDN-2 actualizadas con compuertas por canal permiten comparar fidelidad y throughput frente a la implementación original de Gated DeltaNet en tareas de contexto largo.
- Procesamiento de documentos extensos: con 1M de contexto y D-LSA, es adecuado para tareas experimentales de recuperación y resumen sobre corpus muy largos, siempre que el entrenamiento se complete.
- Reproducción de experimentos académicos: la carga vía `qloop.hub` y el control de profundidad facilitan replicar los experimentos de la arquitectura en entornos de investigación.
- Exploración de compartición de KV: el esquema de aislamiento de estado y compartición de KV entre pasadas es un caso de estudio para reducir memoria en inferencia de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta el estado de las fases de entrenamiento, con `s0_probe` en el paso 0 y sin valores de pérdida ni de `Depth Gain` ni de `Pass-2 Reroute Rate`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 35B parámetros en fp16 requiere aproximadamente 70 GB de pesos, y en cuantización de 4 bits alrededor de 18-20 GB, aunque no se confirman formatos de cuantización soportados.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, un modelo de 35B en precisión completa requeriría GPUs de clase A100 80GB o H100 80GB, y en cuantización podría caber en RTX 4090 (24 GB) o RTX 3090 (24 GB), sin confirmación del autor.
- Despliegue: la model card indica carga mediante la librería `transformers` y el paquete propio `qloop` (`load_qloop_from_hub`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el bucle de 64 capas virtuales implica más cómputo por token que una pasada única, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Loop64 | 35B | ~3.0B (hasta ~5.9B únicos) | 1M | Apache 2.0 | Experimental, paso 0 |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | ~3B | no disponible | no disponible | Modelo base publicado |
| Alternativas de bucle recurrente (p. ej. family de modelos con profundidad recurrente) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo se encuentra en el paso 0 de la fase `s0_probe`; el resto de fases de entrenamiento están pendientes, por lo que no es apto para uso en producción.
- No se han publicado benchmarks, métricas de pérdida ni evaluaciones de calidad; cualquier uso práctico carece de validación empírica.
- La carga requiere el paquete `qloop`, no incluido en la librería estándar de transformers, lo que limita la portabilidad.
- No se especifican idiomas soportados, sesgos conocidos ni comportamiento multilingüe.
- Riesgo de alucinación: no evaluado; al ser un modelo en entrenamiento temprano, la generación puede ser incoherente.
- El contexto de 1M tokens depende de YaRN y D-LSA; su efectividad real no está verificada en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el estado experimental del modelo desaconseja cualquier despliegue productivo.
- El re-enrutamiento de expertos entre pasadas incrementa el cómputo efectivo por token, con impacto en latencia no cuantificado.

## Enlaces

- Hugging Face: https://huggingface.co/TassP0lar/Qwen3.6-35B-A3B-Loop64
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper Gated DeltaNet-2: arXiv:2605.22791 (referenciado en la model card)
