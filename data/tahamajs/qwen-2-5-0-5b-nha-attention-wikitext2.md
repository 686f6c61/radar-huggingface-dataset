# tahamajs/qwen-2.5-0.5b-nha-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-nha-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps (Qwen Attention Zoo). No es un modelo entrenado desde cero, sino una cirugía sobre el modelo base Qwen/Qwen2.5-0.5B: se sustituyen 18 de las 24 capas de atención del decoder por un operador propio denominado `nha_attention` (Native Hybrid Attention), implementado en la clase `NativeHybridAttention`, y se conservan 6 capas con atención cuadrática completa como anclas.

El objetivo declarado es explorar atención subcuadrática mediante reemplazo quirúrgico de módulos de atención y destilación de conocimiento en dos etapas, usando WikiText-2 (`wikitext-2-raw-v1`) como corpus de ajuste y evaluación. El modelo se distribuye únicamente como pesos de atención (`attention_weights.safetensors`, 87 MB) que deben cargarse sobre el Qwen2.5-0.5B original aplicando previamente la cirugía con el script del repositorio NeuralOps.

La relevancia práctica es limitada: el propio autor reporta una perplejidad de validación en WikiText-2 de `inf` (tanto antes como después de la destilación), lo que indica que el checkpoint no ha recuperado un comportamiento de modelado de lenguaje funcional. Debe tratarse como un artefacto de investigación sobre topologías de atención, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con atencion hibrida: 18/24 capas con `nha_attention` (`NativeHybridAttention`) y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 0,5 mil millones (heredados del base Qwen2.5-0.5B; no se especifica recuento exacto del checkpoint) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Qwen2.5-0.5B soporta 32 768 tokens, pero la model card no declara contexto para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin GGUF ni variantes cuantizadas) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 87,00 MB) mas `config.json`, `tokenizer.json` y `training_metrics.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder con 24 capas, `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV (GQA) y `head_dim=64`. Sobre esa base se aplica un patrón de cirugía `hybrid_3_1`: se intercalan bloques de tres capas con `nha_attention` por cada capa de atención cuadrática preservada, dejando las capas en los índices `[3, 7, 11, 15, 19, 23]` como anclas cuadráticas. El `QwenAttentionAdapter` mapea las proyecciones originales con una expansión automática de cabezas KV de 7x cuando es necesario y fuerza un contrato de `o_proj` único.

El operador `NativeHybridAttention` declara soporte para modo causal autorregresivo, bidireccional, cross-attention, GQA nativo y RoPE, además de ser un operador de atención personalizado. El ajuste se realizó con destilación de conocimiento en dos etapas sobre WikiText-2: una primera etapa de alineación con backbone congelado (118 pasos, 54,3 s, MSE y coseno por capa con peso 0,25 sobre estados ocultos, `lm_head` eludido) y una segunda de destilación multi-capa (271 pasos, 125,5 s, peso 0,50). En total, 389 pasos y 180,1 s con `seq_len=512`, `grad_accum=4`, `topk=64` y un pico de VRAM de 18 046 MB en FP16 con parámetros maestros en FP32.

## Capacidades

- Generación de texto autoregresiva en inglés, condicionada a que el checkpoint funcione, algo que la telemetría publicada no respalda.
- Atención causal con soporte declarado de GQA y RoPE en el operador `nha_attention`.
- Soporte declarado de atención bidireccional y cross-attention a nivel de módulo (no verificado en este checkpoint).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación sobre atención subcuadrática: servir como punto de partida reproducible para estudiar el efecto de sustituir capas de atención en un transformer pequeño, aplicando la cirugía con `apply_qwen_attention_surgery` y comparando perplejidad frente al base.
- Experimentación con topologías híbridas: el patrón `hybrid_3_1` con anclas cuadráticas permite analizar el equilibrio entre coste computacional y estabilidad del entrenamiento en modelos de 0,5B.
- Reproducción de pipelines de destilación: la telemetría de las dos etapas (pasos, tiempos, pesos de las pérdidas) sirve como referencia para diseñar recetas de KD con backbone congelado.
- Pruebas de integración de la librería `neuralops`: validar la carga de pesos con `strict=False`, el adaptador `QwenAttentionAdapter` y el registro `ATTENTION_REGISTRY` en entornos de desarrollo.
- Docencia y divulgación: ilustrar de forma práctica qué implica reemplazar módulos de atención y por qué una cirugía sin recuperación suficiente colapsa la perplejidad.
- No se recomienda su uso en aplicaciones de usuario final, generación de código, atención al cliente ni ningún escenario de producción, dado que la perplejidad reportada es `inf`.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` y en la model card:

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| Perplejidad causal (Stage 0, pre-KD) | wikitext-2-raw-v1 | validation | `inf` |
| Perplejidad causal (post-KD) | wikitext-2-raw-v1 | validation | `inf` |
| Delta de perplejidad | wikitext-2-raw-v1 | validation | `+nan` |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento consumió 18 046 MB en FP16 con estados de optimizador en FP32; la inferencia en FP16 del modelo de 0,5B requiere aproximadamente 1-2 GB, aunque no se ha validado que el checkpoint funcione.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16; para reproducir el entrenamiento se necesitó una GPU de 24 GB (clase RTX 3090/4090 o A10G).
- Cabe en GPU de consumo: sí, en términos de tamaño (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090), aunque la utilidad del checkpoint es dudosa.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI, ya que requiere la librería `neuralops` y el script de cirugía `apply_qwen_attention_surgery` del repositorio NeuralOps antes de cargar los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-nha-attention-wikitext2` | 0,5B | no disponible | `inf` (declarada) | MIT | Pesos de atención únicamente, requiere cirugía |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | 32 768 tokens | no disponible en esta ficha | Apache 2.0 | Pesos completos en safetensors, integrable en transformers/vLLM |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32 768 tokens | no disponible en esta ficha | Apache 2.0 | Pesos completos, ajustado por instrucciones |
| SmolLM2-360M | 0,36B | 8 192 tokens | no disponible en esta ficha | Apache 2.0 | Pesos completos, orientado a edge |

La comparación relevante es con el propio base Qwen2.5-0.5B: el checkpoint quirúrgico no iguala su comportamiento de modelado de lenguaje según la métrica publicada, y su licencia MIT es más permisiva que la Apache 2.0 del base, aunque la falta de pesos completos y de soporte en runtimes estándar limita su uso.

## Limitaciones y advertencias

- Perplejidad de validación en WikiText-2 reportada como `inf`: el modelo no produce una distribución de probabilidad utilizable sobre texto, lo que invalida su uso generativo.
- El delta de perplejidad es `+nan`, señal de que la comparación pre/post destilación no es calculable con los datos publicados.
- Solo se distribuyen pesos de atención (87 MB); es imprescindible descargar Qwen2.5-0.5B y aplicar la cirugía con el script del repositorio NeuralOps, lo que añade dependencias frágiles.
- La carga se hace con `strict=False`, por lo que claves no coincidentes se ignoran silenciosamente sin aviso.
- Solo se declara inglés; no hay evidencia de capacidades multilingües.
- No hay información sobre sesgos, alucinación o robustez, más allá de que el modelo no es funcional para generación.
- Aunque la licencia es MIT, el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0) cuyos términos pueden aplicar al uso derivado.
- Sin descargas ni likes en el momento de la consulta; no hay validación comunitaria independiente.
- No apto para producción en ningún escenario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-nha-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del repositorio NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
