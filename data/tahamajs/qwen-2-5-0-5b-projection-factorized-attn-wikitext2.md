# tahamajs/qwen-2.5-0.5b-projection-factorized-attn-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-projection-factorized-attn-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder por un módulo de atención subcuadrática denominado `ProjectionFactorizedAttention` (factorización SVD de las proyecciones lineales). El modelo forma parte del proyecto NeuralOps Attention Zoo, un banco de pruebas de variantes de atención alternativas a la atención cuadrática estándar.

El objetivo no es producir un modelo de uso general, sino medir la viabilidad de reemplazar la atención de un transformer preentrenado y recuperar su capacidad predictiva mediante destilación de conocimiento en dos etapas. Tras la cirugía, la perplejidad en WikiText-2 se dispara a 1.657.112,85; tras 421 pasos de destilación (180,2 segundos de entrenamiento) se reduce hasta 3.099,36. Sigue siendo un valor muy alto en términos absolutos, lo que refleja que el proceso de recuperación está incompleto.

El interés del artefacto es metodológico: documenta con telemetría detallada el coste de sustituir atención cuadrática por atención lineal factorizada en un modelo pequeño (0,5B parámetros, contexto nativo de Qwen2.5) y publica únicamente los pesos de atención (76,62 MB) que deben aplicarse sobre el modelo base. No está pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de Qwen2.5 con 18/24 capas de atención sustituidas por `ProjectionFactorizedAttention` (patrón híbrido 3:1); 6 capas conservan atención cuadrática completa |
| Parametros totales | 0,5B (heredados de Qwen/Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens; el checkpoint se entrena con `seq_len=512`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 76,62 MB) |
| Cabezas de atención | 14 query heads, 2 KV heads, `head_dim=64`, `hidden_size=896` |
| Patrón de cirugía | `hybrid_3_1`; capas ancla cuadráticas en índices [3, 7, 11, 15, 19, 23] |
| Librería | neuralops |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder causal con GQA (14 cabezas de query, 2 de KV, dimensión de cabeza 64 y tamaño oculto 896). Sobre esa base se aplica un `QwenAttentionAdapter` que reemplaza las proyecciones de atención en 18 de las 24 capas por `ProjectionFactorizedAttention`, una atención lineal basada en factorización SVD de las matrices de proyección. El patrón es híbrido 3:1: por cada tres capas factorizadas se conserva una capa de atención cuadrática completa como ancla, en los índices 3, 7, 11, 15, 19 y 23. El módulo declara soporte para atención causal, bidireccional, cross-attention y GQA nativa.

El entrenamiento consiste en destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineación con backbone congelado, `lm_head` puenteado) ejecuta 127 pasos en 54,1 segundos con pérdida MSE y coseno a nivel de capa (peso 0,25). La etapa 2 (destilación de representaciones multicapa) ejecuta 294 pasos en 125,8 segundos con peso 0,50. En total, 421 pasos y 180,2 segundos, con un pico de VRAM de 16.847 MB en FP16 con autocast y parámetros maestros FP32. La perplejidad causal pasa de 1.657.112,85 (post-cirugía, zero-shot) a 3.099,36 tras la destilación.

## Capacidades

- Generación de texto causal autoregresiva, heredada de la arquitectura Qwen2.5.
- Atención lineal factorizada vía SVD en 18 capas, con soporte declarado de atención bidireccional y cross-attention a nivel de módulo.
- Soporte de GQA nativa (14:2) con expansión automática 7x de cabezas KV donde es necesario.
- Contrato de bypass con `o_proj` único.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés según los metadatos del modelo.

## Casos de uso

- Investigación en atención subcuadrática: banco de pruebas para comparar `projection_factorized_attn` frente a atención cuadrática estándar en un modelo de 0,5B con telemetría de perplejidad reproducible.
- Estudio de destilación post-cirugía: permite analizar cuánta capacidad se recupera con 421 pasos de KD en dos etapas y qué delta de perplejidad se obtiene, sirviendo de línea base para experimentos con más pasos o datasets mayores.
- Validación de adaptadores de atención: el `QwenAttentionAdapter` y el patrón `hybrid_3_1` pueden reutilizarse para probar otras variantes del registro NeuralOps sobre Qwen2.5.
- Reproducción de experimentos de eficiencia: útil para medir el coste real (VRAM, tiempo, pasos) de sustituir atención en un transformer preentrenado pequeño.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención y destilación de conocimiento con métricas intermedias publicadas.
- Prototipado de pipelines de evaluación de perplejidad: el checkpoint y sus scripts permiten montar comparativas de PPL en WikiText-2 entre variantes de atención.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 3.099,36 | No |
| WikiText-2 (post-cirugía, stage 0) | Perplejidad | 1.657.112,85 | No |
| Delta de perplejidad (KD) | Δ PPL | -1.654.013,49 | No |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible. Los valores anteriores son los declarados por el autor en el model-index y en la model card, sin verificación independiente.

## Requisitos de hardware

- VRAM para inferencia: el modelo base es de 0,5B parámetros; en FP16 requiere aproximadamente 1 GB de pesos, más overhead de activaciones y caché KV. No se publican cifras de inferencia.
- VRAM de entrenamiento (destilación): pico de 16.847 MB en FP16 con autocast y parámetros maestros FP32, según la model card.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM para inferencia en FP16; para reproducir el entrenamiento se necesita al menos una GPU con ~17 GB (RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, para inferencia; el entrenamiento completo requiere GPUs de gama alta o profesional.
- Opciones de despliegue: la librería es `neuralops` y requiere aplicar la cirugía con `apply_qwen_attention_surgery` y cargar `attention_weights.safetensors` sobre `Qwen/Qwen2.5-0.5B`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-projection-factorized-attn-wikitext2` | 0,5B | no disponible | 3.099,36 (declarado) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens | no disponible en esta ficha | Apache 2.0 (Qwen) | Hugging Face |
| Otras variantes del NeuralOps Attention Zoo | 0,5B | no disponible | no disponible | MIT | Hugging Face (proyecto tahamajs) |

No se dispone de datos de perplejidad del modelo base Qwen2.5-0.5B en la información proporcionada, por lo que no es posible cuantificar la brecha respecto al original. La comparativa con otras variantes del Attention Zoo tampoco está disponible en los datos facilitados.

## Limitaciones y advertencias

- Perplejidad muy elevada (3.099,36) frente a lo esperable en un modelo de 0,5B bien entrenado; el proceso de destilación está incompleto y el modelo no es apto para generación de calidad.
- El checkpoint contiene únicamente pesos de atención (76,62 MB); requiere el modelo base Qwen2.5-0.5B y los scripts de NeuralOps para funcionar.
- Entrenado exclusivamente sobre WikiText-2 en inglés; no hay evidencia de capacidades multilingües ni de generalización fuera de ese dominio.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinación; se desconoce el comportamiento en esos ejes.
- Riesgo alto de generación incoherente o repetitiva dado el nivel de perplejidad declarado.
- La licencia MIT aplica al checkpoint publicado, pero el uso del modelo base Qwen2.5-0.5B está sujeto a su propia licencia (Apache 2.0 en Qwen2.5).
- No hay soporte documentado de tool calling, agentes ni despliegue estándar (vLLM, TGI, llama.cpp); la integración depende de la librería `neuralops`.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`).
- Fecha de creación del repositorio: 2026-11-10; 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-projection-factorized-attn-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
