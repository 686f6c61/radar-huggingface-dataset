# tahamajs/qwen-2.5-0.5b-moba-attention-wikitext2

## Resumen

Este repositorio contiene un checkpoint de Qwen2.5-0.5B al que se le ha sustituido quirúrgicamente el mecanismo de atención de la mayoría de sus capas por `moba_attention` (Mixture of Block Attention), una variante de atención subcuadrática orientada a modelado de contexto largo. El modelo lo publica el usuario tahamajs como parte de su proyecto NeuralOps, un "Attention Zoo" que experimenta con el reemplazo de operadores de atención en transformers preentrenados. No es un modelo nuevo entrenado desde cero, sino un experimento de post-entrenamiento sobre el modelo base de Alibaba (Qwen2.5-0.5B).

El objetivo del artefacto es demostrar que es posible transplantar atención subcuadrática en un modelo denso pequeño y recuperar buena parte de su calidad mediante destilación de conocimiento en dos etapas, usando únicamente WikiText-2 como corpus de ajuste. Tras la cirugía, la perplejidad de validación se dispara a 151,45 y, después de 240 pasos de destilación (unos 180 segundos de cómputo), baja hasta 32,15. Es, por tanto, un modelo de investigación más que un modelo listo para producción.

Su relevancia es metodológica: ilustra un patrón de sustitución de atención híbrido (3:1, con capas de atención cuadrática completa intercaladas como anclas), un adaptador que resuelve la expansión de cabezas KV para GQA y una receta de destilación por capas reproducible. El tamaño es mínimo (0,5 mil millones de parámetros, 944 MB en safetensors) y la licencia MIT, lo que facilita replicar el experimento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `moba_attention` (subcuadrática) y 6/24 capas con atención cuadrática completa |
| Parámetros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó `seq_len=512`; el modelo base Qwen2.5-0.5B soporta hasta 32 768 tokens, pero no se declara para este checkpoint) |
| Tipos de cuantización | no disponible (pesos publicados en FP16/BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en` declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 944,45 MB, `attention_weights.safetensors` 86,24 MB) + `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, 14 cabezas de consulta, 2 cabezas KV, `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica un patrón de cirugía `hybrid_3_1`: se sustituye la atención en 18 de las 24 capas por `MoBAAttention`, mientras que las capas en los índices `[3, 7, 11, 15, 19, 23]` conservan la atención cuadrática completa como anclas. El `QwenAttentionAdapter` gestiona la conversión de proyecciones, incluyendo una expansión de cabezas KV de 7x cuando es necesario, y respeta el contrato de una única `o_proj`.

`MoBAAttention` (Mixture of Block Attention) divide la secuencia en bloques; para cada bloque de consultas calcula puntuaciones de centroide a nivel de bloque, selecciona los `top-k` bloques de claves más relevantes y ejecuta atención densa dentro de los bloques seleccionados más el bloque diagonal visible causalmente. Soporta modo causal, bidireccional, cross-attention y GQA nativa.

El ajuste se hace con destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`): una primera etapa de alineación con backbone congelado (73 pasos, 54,3 s, `lm_head` saltado, pérdida MSE + coseno por capas con peso 0,25) y una segunda de destilación de representaciones multicapa (167 pasos, 125,9 s, peso coseno 0,50). En total, 240 pasos en 180,6 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando 16 049 MB de VRAM pico en FP16 con parámetros maestros en FP32. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva causal (pipeline `text-generation`).
- Modelado de lenguaje y cálculo de perplejidad sobre corpus en inglés.
- Soporte de atención causal y bidireccional a nivel de módulo (según la capability profile del módulo `moba_attention`).
- Soporte nativo de GQA en el módulo de atención transplantado.
- Soporte de cross-attention a nivel de operador.
- Capacidades conversacionales heredadas del modelo base Qwen2.5-0.5B (el modelo base está afinado para chat, aunque este checkpoint solo se ha destilado sobre WikiText-2).
- No se documenta soporte de tool calling, agentes, visión, audio ni modo "thinking" específico para este checkpoint.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Investigación en atención subcuadrática: servir como banco de pruebas reproducible para comparar `moba_attention` frente a atención cuadrática completa en un modelo pequeño, con métricas de perplejidad antes y después de la destilación.
- Validación de recetas de destilación: el par de etapas (alineación con backbone congelado + destilación multicapa) puede replicarse sobre otros modelos base o corpus para estudiar la recuperación de calidad tras una cirugía de atención.
- Experimentos de eficiencia en contexto largo: al ser un modelo de 0,5B con atención por bloques, permite medir empíricamente el coste computacional y la calidad en secuencias largas sin necesidad de GPUs de gama alta.
- Prototipado educativo: útil para cursos o tutoriales sobre sustitución de operadores de atención, adaptadores de proyecciones y GQA, dado su tamaño reducido y su licencia permisiva.
- Generación de texto en inglés de bajo coste en entornos de laboratorio: con 944 MB en safetensors, cabe en cualquier GPU consumer y permite iterar rápidamente en pipelines de evaluación.
- Base para ablaciones controladas: comparar el patrón `hybrid_3_1` con otras configuraciones (por ejemplo, sustituir más o menos capas) manteniendo el mismo corpus y presupuesto de destilación.
- Referencia para integración en frameworks: el código de `apply_qwen_attention_surgery` y el registro `ATTENTION_REGISTRY` de NeuralOps sirven como ejemplo de cómo inyectar operadores personalizados en modelos de Hugging Face.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 32,15 |
| WikiText-2, baseline post-cirugía (Stage 0) | Perplejidad | 151,45 |
| Delta de perplejidad tras destilación | Δ | -119,30 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 1 GB para los pesos (944 MB de `model.safetensors` más 86 MB de `attention_weights.safetensors`); con overhead de activaciones y KV cache, del orden de 1,5-2 GB para secuencias moderadas.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, así como A100/H100 para experimentos a mayor escala o con lotes grandes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM en FP16.
- Opciones de despliegue: el modelo se publica con `library_name: neuralops` y requiere el código de NeuralOps (`apply_qwen_attention_surgery`) para reconstruir la arquitectura; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles. El entrenamiento de destilación usó 16 049 MB de VRAM pico en FP16 con parámetros maestros en FP32, pero no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-moba-attention-wikitext2 (este) | 0,5B | no disponible | 32,15 | MIT | Hugging Face, requiere NeuralOps |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | 32 768 tokens | no disponible en la información | Apache 2.0 (modelo base) | Hugging Face, transformers |
| Otros modelos de 0,5B con atención subcuadrática | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de atención subcuadrática no está disponible en la información proporcionada; el propio autor solo reporta el baseline post-cirugía (151,45) frente al resultado destilado (32,15), sin comparar contra el modelo base original.

## Limitaciones y advertencias

- Modelo de investigación: el checkpoint se ha destilado únicamente sobre WikiText-2 y no se ha evaluado en tareas downstream (razonamiento, código, matemáticas, diálogo).
- La perplejidad de 32,15 es sustancialmente peor que la de un modelo de 0,5B bien entrenado en su dominio; no debe interpretarse como calidad equiparable al modelo base original.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: el entrenamiento usó `seq_len=512`; no se documenta el comportamiento en secuencias largas pese a que el módulo `moba_attention` está diseñado para contexto largo.
- Riesgo de alucinación: alto en un modelo de 0,5B destilado sobre un corpus enciclopédico limitado; no apto para producción sin evaluación exhaustiva.
- Dependencia de código externo: la carga requiere el paquete NeuralOps y la función `apply_qwen_attention_surgery`; no es un checkpoint plug-and-play con `transformers` estándar.
- Licencia MIT en el checkpoint, pero conviene verificar la licencia del modelo base Qwen2.5-0.5B (Apache 2.0) para uso comercial combinado.
- Sin verificación independiente: los resultados de perplejidad están marcados como `verified: false` en el model-index.
- Sin datos de sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-moba-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
