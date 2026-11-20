# VertexAGI/quartz-micro-preview-v3

## Resumen

Quartz Micro Preview V3 es un modelo de lenguaje de tipo decoder denso con arquitectura Llama, desarrollado desde cero por Vertex AGI. Con 100.092.672 parámetros (aproximadamente 100,09 M), se posiciona como un modelo de investigación de muy pequeño tamaño, entrenado íntegramente en una única GPU GTX 1660 Ti. Esta versión es el modelo ajustado por instrucciones (instruction-tuned) sobre el modelo base `VertexAGI/quartz-micro-preview-v3-base`, y está orientado a generación de texto conversacional en inglés.

El modelo emplea una arquitectura transformer densa con 12 capas, dimensión oculta de 768, 12 cabezas de atención y 4 cabezas KV (atención con grouped-query), FFN SwiGLU de 2048, RoPE y embeddings atados con un tokenizador BPE byte-level de 32K. Su ventana de contexto es de solo 1.024 tokens, lo que lo limita a conversaciones cortas y tareas de generación breve.

La relevancia de este modelo es fundamentalmente educativa y de investigación: demuestra que es posible entrenar un LM desde cero en hardware de consumo muy modesto y publicar artefactos reproducibles en múltiples formatos (safetensors, MLX y GGUF). El autor es explícito sobre sus limitaciones: el modelo alucina hechos, falla en matemáticas y código, e ignora límites de longitud. No debe considerarse una fuente fiable de información ni un modelo apto para producción crítica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso tipo Llama (12 capas, hidden 768, 12 heads / 4 KV heads, SwiGLU 2048, RoPE, embeddings atados) |
| Parámetros totales | 100.092.672 (~100,09 M) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | fp32 (safetensors), fp16 (MLX), 8-bit y 4-bit (MLX, group size 64), F16, Q8_0 y Q4_K_M (GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32), MLX (fp16, q8, q4), GGUF (f16, q8_0, q4_k_m) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder densa con el diseño estándar de Llama: 12 capas, dimensión oculta de 768, 12 cabezas de atención con 4 cabezas KV (grouped-query attention), capa FFN SwiGLU con dimensión intermedia de 2048, codificación posicional rotatoria (RoPE) y matriz de embeddings atada a la cabeza de salida. El tokenizador es un BPE byte-level con vocabulario de 32K. El modelo se entrenó desde cero (from-scratch) en una única GPU GTX 1660 Ti, lo que condiciona tanto el tamaño como la cantidad de datos de entrenamiento, aunque la model card no especifica el número de tokens ni la composición del dataset utilizado.

La versión V3 es el resultado de un ajuste por instrucciones sobre el modelo base `quartz-micro-preview-v3-base`. La model card no detalla si se emplearon técnicas de RLHF o DPO, ni el volumen de datos de ajuste. El autor publica una comparación frente a la generación anterior (V2) evaluada sobre los mismos 156 prompts con decodificación greedy idéntica, usando como juez a `nvidia/nemotron-3-ultra-550b-a55b` en comparaciones pairwise en ambos órdenes. Los formatos publicados (fp32, MLX fp16/q8/q4 y GGUF f16/q8_0/q4_k_m) fueron validados contra el código original de entrenamiento mediante perplejidad sobre texto held-out, con diferencias que van del 0,001 % al 6,205 % (este último para MLX 4-bit).

## Capacidades

- Generación de texto conversacional corto y fluido en inglés.
- Respuestas de identidad y presentación del propio modelo (mejoradas sustancialmente en V3: 71/100 en prompts held-out frente a 3/100 en V2).
- Respuesta a preguntas factuales simples, con una tasa de acierto limitada (20/26 en el conjunto de pruebas del autor).
- Generación con plantilla de chat (`apply_chat_template`) compatible con el ecosistema Transformers.
- Finalización autónoma de respuestas con token `<eos>` en la mayoría de casos (31/33 en las pruebas del autor).
- Menor tendencia a la repetición que V2 (distinct-4-gram de 0,97 frente a 0,801).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación educativa sobre entrenamiento de LLM desde cero: el modelo sirve como referencia reproducible para estudiar el pipeline completo (tokenización, preentrenamiento, ajuste por instrucciones, cuantización y validación de perplejidad) en hardware de consumo.
- Experimentación con cuantización en Apple Silicon: los formatos MLX fp16/q8/q4 permiten comparar el impacto de la cuantización en perplejidad (13,875 en fp16 frente a 14,739 en 4-bit) usando `mlx-lm` en un Mac.
- Pruebas de integración con llama.cpp y Ollama: los GGUF F16/Q8_0/Q4_K_M permiten validar pipelines de despliegue local con `llama-cli -cnv` y LM Studio en equipos sin GPU dedicada.
- Generación de texto breve para demos y prototipos de interfaz conversacional: con contexto de 1.024 tokens y respuestas medias de ~51 palabras, encaja en chatbots de demostración donde la latencia y el coste son críticos.
- Evaluación de técnicas de alineación e identidad: el modelo permite estudiar cómo el ajuste por instrucciones mejora la coherencia de identidad (de 3/100 a 71/100) y la pérdida sobre respuestas de identidad (de 4,298 a 1,304).
- Benchmarking de metodologías de evaluación con juez LLM: la model card documenta un protocolo pairwise en ambos órdenes con un juez externo, útil como caso práctico para diseñar evaluaciones reproducibles de modelos pequeños.
- Base para experimentos de destilación o fine-tuning ligero: al ser un modelo Apache 2.0 de ~100 M de parámetros y 400 MB en fp32, se puede ajustar en GPUs de consumo para tareas muy acotadas.

## Benchmarks y rendimiento

Resultados publicados por el autor comparando V3 con V2 sobre los mismos 156 prompts, decodificación greedy con repetition penalty 1.1, juez `nvidia/nemotron-3-ultra-550b-a55b` a temperatura 0 y comparaciones pairwise en ambos órdenes:

| Prueba | V2 | V3 |
|---|---|---|
| Identidad, 100 prompts held-out | 3/100 (3 %) | 71/100 (71 %) |
| Identidad, 24 prompts escritos a mano | 5/24 (21 %) | 23/24 (96 %) |
| Hechos, 15 prompts originales de V2 | 5/15 | 11/15 |
| Hechos, 11 prompts nuevos | 4/11 | 9/11 |
| Hechos, total 26 | 9/26 | 20/26 |
| Head-to-head en 33 prompts generales | 4 victorias | 25 victorias (4 empates) |
| Respuestas que terminan con `<eos>` | 23/33 | 31/33 |
| Repetición (distinct-4-gram, mayor = menos repetitivo) | 0,801 | 0,97 |
| Longitud media de respuesta (palabras) | 126,8 | 51,5 |
| Pérdida en tokens de asistente, validación general | 2,383 | 1,719 |
| Pérdida en respuestas de identidad held-out | 4,298 | 1,304 |

Perplejidad por formato sobre texto held-out (menor es mejor):

| Formato | Perplejidad | Diferencia respecto al original |
|---|---:|---:|
| Transformers fp32 | 13,878 | 0,000 % |
| MLX fp16 | 13,875 | 0,020 % |
| MLX 8-bit | 13,878 | 0,001 % |
| MLX 4-bit | 14,739 | 6,205 % |
| GGUF F16 | 13,878 | 0,001 % |
| GGUF Q8_0 | 13,877 | 0,009 % |
| GGUF Q4_K_M | 13,955 | 0,557 % |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~400 MB en fp32, ~200 MB en fp16, ~113 MB en MLX 8-bit, ~108 MB en GGUF Q8_0, ~67 MB en GGUF Q4_K_M y ~63 MB en MLX 4-bit.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo se entrenó en una GTX 1660 Ti (6 GB), por lo que GPUs de gama baja como GTX 1650, RTX 3050 o superiores son más que suficientes.
- Cabe holgadamente en cualquier GPU de consumo, e incluso en CPU y en Apple Silicon mediante MLX.
- Opciones de despliegue: Transformers (`LlamaForCausalLM` estándar, sin `trust_remote_code`), `mlx-lm` en Apple Silicon, llama.cpp, Ollama y LM Studio mediante los GGUF; también es compatible con text-generation-inference según los tags del repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño (~100 M de parámetros) y el contexto máximo de 1.024 tokens, se espera una latencia muy baja y un throughput alto en hardware moderno, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Quartz Micro Preview V3 | ~100,09 M | 1.024 | Apache 2.0 | en | HF (safetensors, MLX, GGUF) |
| Quartz Micro Preview V2 | no disponible | no disponible | Apache 2.0 (según repo) | en | HF |
| Quartz Micro Preview V3 Base | ~100,09 M (modelo base) | no disponible | Apache 2.0 (según repo) | en | HF |

No se dispone de información sobre otros modelos comparables de la misma categoría (modelos from-scratch de ~100 M parámetros) en la documentación proporcionada. La comparación directa publicada por el autor se limita a las generaciones V1 y V2 de la propia familia Quartz.

## Limitaciones y advertencias

- Alucinación factual: el propio autor advierte que el modelo "afirma hechos incorrectos e inventa detalles"; solo acierta 20 de 26 prompts factuales en sus propias pruebas.
- Debilidad en matemáticas, razonamiento y código: no es adecuado para tareas que requieran cómputo simbólico, lógica compleja o generación de código fiable.
- Contexto muy limitado: 1.024 tokens impiden conversaciones multi-turno largas, resumen de documentos extensos o RAG con contexto amplio.
- Ignora límites de longitud: el autor señala que el modelo no respeta las restricciones de longitud solicitadas en el prompt.
- Solo inglés: no se documenta soporte de otros idiomas, por lo que su uso en castellano u otras lenguas no está garantizado.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse con un dataset no especificado, pueden aparecer sesgos propios de los datos de preentrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero dada la calidad del modelo, no se recomienda para producción crítica ni como fuente de verdad.
- Reproducibilidad: la model card no detalla el dataset de entrenamiento, el número de tokens ni el proceso de ajuste (RLHF/DPO), lo que dificulta la replicación.
- Modelo de investigación/hobby: el autor lo describe explícitamente como "small research / hobby model", no apto como fuente de información fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/quartz-micro-preview-v3
- Modelo base: https://huggingface.co/VertexAGI/quartz-micro-preview-v3-base
- Generación anterior (V2): https://huggingface.co/VertexAGI/quartz-micro-preview-v2
- Space de chat comparativo: https://huggingface.co/spaces/VertexAIco/quartz-micro-preview-chat
