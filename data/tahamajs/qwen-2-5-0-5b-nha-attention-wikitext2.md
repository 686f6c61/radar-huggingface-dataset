# tahamajs/qwen-2.5-0.5b-nha-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-nha-attention-wikitext2` es un checkpoint experimental publicado por el autor independiente tahamajs dentro del proyecto NeuralOps Qwen Attention Zoo. No es un modelo entrenado desde cero, sino una intervención quirúrgica sobre el modelo base `Qwen/Qwen2.5-0.5B`: se sustituyen bloques de atención del decoder por el operador `nha_attention` (Native Hybrid Attention) del registro `ATTENTION_REGISTRY` de NeuralOps, y se aplica destilación de conocimiento en dos etapas para intentar recuperar el comportamiento del modelo original.

El objetivo del experimento es evaluar si un mecanismo de atención subcuadrática híbrido puede sustituir la atención cuadrática estándar de Qwen2 en un transformer pequeño (0,5 mil millones de parámetros, 24 capas) sin degradar la modelización del lenguaje. El patrón de sustitución es `hybrid_3_1`: 18 de las 24 capas usan `nha_attention` y 6 capas conservan atención cuadrática completa como anclas.

La relevancia es metodológica más que práctica: el modelo se distribuye únicamente como pesos de atención (`attention_weights.safetensors`, 87 MB) que requieren aplicar la cirugía sobre el modelo base antes de cargarlos. Además, la perplejidad declarada en WikiText-2 es `inf`, lo que indica que el proceso de destilación no logró recuperar un modelo funcional para generación de texto. Debe considerarse un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `nha_attention` (Native Hybrid Attention, subcuadrática) y 6/24 capas con atención cuadrática completa en índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-0.5B soporta 32 768 tokens, pero la ficha no confirma que se preserve tras la cirugía) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 87 MB) + `config.json` + `tokenizer.json`; requiere el modelo base `Qwen/Qwen2.5-0.5B` para funcionar |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only con 14 cabezas de consulta, 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica el `QwenAttentionAdapter` de NeuralOps, que sustituye la atención en 18 de las 24 capas por `nha_attention` (clase `NativeHybridAttention`), con expansión automática de cabezas KV (7x) donde es necesario y un contrato de `o_proj` único. Las 6 capas restantes conservan atención cuadrática completa como anclas, siguiendo el patrón `hybrid_3_1`.

El operador `nha_attention` declara soporte para causal, bidireccional, cross-attention, GQA y RoPE, y se registra como atención personalizada. El entrenamiento consiste en destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`): una primera etapa de alineación con backbone congelado (118 pasos, 54,3 s, pérdida MSE + coseno por capa con peso 0,25) y una segunda de destilación multi-capa (271 pasos, 125,5 s, peso 0,50). En total, 389 pasos en 180,1 s con `seq_len=512`, `grad_accum=4` y `topk=64`, usando autocast FP16 con parámetros maestros FP32 y un pico de VRAM de 18 046 MB. No se documenta el número total de tokens de entrenamiento ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto causal autoregresiva (declarada, aunque la perplejidad `inf` sugiere que la generación no es funcional en la práctica).
- Soporte de atención causal, bidireccional y cross-attention a nivel de operador (según la tabla de capacidades del módulo).
- Soporte nativo de GQA y RoPE en el operador `nha_attention`.
- Capacidad multilingüe limitada: solo se declara inglés (`en`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta soporte de decodificación especulativa ni de cuantización.

## Casos de uso

- Investigación sobre atención subcuadrática: el modelo sirve como banco de pruebas para medir el impacto de sustituir atención cuadrática por `nha_attention` en un transformer pequeño, comparando perplejidad antes y después de la cirugía.
- Reproducción de experimentos de destilación: los scripts y telemetría permiten replicar el pipeline de dos etapas de NeuralOps sobre WikiText-2 y analizar la recuperación de representaciones internas.
- Desarrollo de operadores de atención: útil para validar la integración del `QwenAttentionAdapter` y del contrato de `o_proj` único en nuevas variantes de atención.
- Estudio de patrones híbridos: permite evaluar configuraciones `hybrid_3_1` frente a alternativas (por ejemplo, más o menos capas ancla) en modelos de 0,5 B.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención y destilación de conocimiento capa a capa en un modelo abierto.
- Integración en pipelines de NeuralOps: como caso de prueba del API `neuralops.hub.load_surgeried_model` para carga modular de pesos quirúrgicos.

No se recomienda su uso en aplicaciones de producción, atención al cliente, generación de código ni tareas de razonamiento, dado que la perplejidad declarada es infinita.

## Benchmarks y rendimiento

| Modelo | Tarea | Dataset | Métrica | Valor |
|---|---|---|---|---|
| qwen-2.5-0.5b-nha-attention-wikitext2 | Causal Language Modeling | wikitext-2-raw-v1 (validation) | Perplejidad | `inf` (no verificado) |

El autor declara una perplejidad de validación infinita (`inf`) tanto antes como después de la destilación, con un delta `+nan`. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento reportó un pico de 18 046 MB en FP16 con parámetros maestros FP32; para inferencia en FP16 se estima un consumo notablemente menor, pero no se proporciona una cifra concreta.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo base (0,5 B) cabría en GPUs consumer, pero la cirugía y el adaptador requieren el stack NeuralOps.
- Cabe en GPU consumer: previsiblemente sí (modelo de 0,5 B), aunque no se confirma en la ficha.
- Opciones de despliegue: el modelo no se distribuye como checkpoint completo, sino como pesos de atención que requieren aplicar `apply_qwen_attention_surgery` sobre `Qwen/Qwen2.5-0.5B` o usar `neuralops.hub.load_surgeried_model`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-nha-attention-wikitext2 | 0,5 B | no disponible | MIT | safetensors (pesos de atención) | Experimental, PPL `inf` |
| Qwen/Qwen2.5-0.5B | 0,5 B | 32 768 tokens (según el modelo base) | Apache 2.0 (modelo base) | safetensors, GGUF | Modelo funcional de referencia |
| Qwen/Qwen2.5-1.5B | 1,5 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Modelo funcional de mayor tamaño |
| SmolLM2-360M | 0,36 B | 8 192 tokens | Apache 2.0 | safetensors, GGUF | Modelo funcional pequeño |

La comparación relevante es con el propio `Qwen/Qwen2.5-0.5B`, del que este checkpoint hereda arquitectura y tokenizador pero sustituye la atención. No se dispone de datos de rendimiento comparables porque la perplejidad declarada es `inf`.

## Limitaciones y advertencias

- Perplejidad de validación infinita (`inf`) en WikiText-2: el modelo no parece haber recuperado la capacidad de modelizar lenguaje tras la destilación.
- Delta de perplejidad `+nan`: la telemetría de entrenamiento no permite evaluar la recuperación de forma fiable.
- Solo se distribuyen pesos de atención (87 MB); es imprescindible descargar el modelo base `Qwen/Qwen2.5-0.5B` y aplicar la cirugía con el stack NeuralOps, lo que añade dependencias frágiles.
- Idioma limitado al inglés; no se declara soporte multilingüe.
- No se documentan sesgos conocidos, pero al derivar de Qwen2.5-0.5B y entrenarse sobre WikiText-2, hereda los sesgos del corpus y del modelo base.
- Riesgo elevado de alucinación y salidas incoherentes dado el estado del checkpoint.
- Licencia MIT para los pesos de atención, pero el uso del modelo base Qwen2.5-0.5B está sujeto a su propia licencia (Apache 2.0); conviene verificar la compatibilidad en uso comercial.
- No apto para producción: sin benchmarks funcionales, sin soporte de tool calling, sin cuantizaciones publicadas y sin integración documentada con servidores de inferencia estándar.
- El repositorio tiene 346 descargas y 0 likes, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-nha-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
